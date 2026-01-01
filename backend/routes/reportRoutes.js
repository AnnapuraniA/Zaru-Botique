import express from 'express'
import { Op } from 'sequelize'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { adminProtect } from '../middleware/adminAuth.js'

const router = express.Router()

// Helper to format date for CSV
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN')
}

// Helper to convert array to CSV
const arrayToCSV = (data, headers) => {
  const csvRows = []
  csvRows.push(headers.join(','))
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || ''
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    csvRows.push(values.join(','))
  })
  
  return csvRows.join('\n')
}

// @route   GET /api/reports/sales
// @desc    Generate sales report
// @access  Admin
router.get('/sales', adminProtect, async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query
    
    let where = {
      status: { [Op.ne]: 'Cancelled' }
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    }

    const orders = await Order.findAll({
      where,
      include: [{
        association: 'user',
        attributes: ['name', 'email', 'mobile']
      }],
      order: [['createdAt', 'DESC']]
    })

    if (format === 'csv') {
      const reportData = orders.map(order => ({
        'Order ID': order.orderId,
        'Date': formatDate(order.createdAt),
        'Customer': order.user?.name || 'Guest',
        'Email': order.user?.email || '',
        'Mobile': order.user?.mobile || '',
        'Status': order.status,
        'Subtotal': order.subtotal,
        'Shipping': order.shippingCost,
        'Tax': order.tax,
        'Total': order.total,
        'Tracking': order.tracking || ''
      }))

      const csv = arrayToCSV(reportData, [
        'Order ID', 'Date', 'Customer', 'Email', 'Mobile', 
        'Status', 'Subtotal', 'Shipping', 'Tax', 'Total', 'Tracking'
      ])

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=sales-report-${Date.now()}.csv`)
      res.send(csv)
    } else {
      res.json({
        orders,
        total: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)
      })
    }
  } catch (error) {
    console.error('Generate sales report error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/reports/customers
// @desc    Generate customer report
// @access  Admin
router.get('/customers', adminProtect, async (req, res) => {
  try {
    const { format = 'json' } = req.query

    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'mobile', 'createdAt'],
      order: [['createdAt', 'DESC']]
    })

    // Get order counts and totals for each user
    const customersWithOrders = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.findAll({
          where: { userId: user.id }
        })
        const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          joined: formatDate(user.createdAt),
          orders: orders.length,
          totalSpent: totalSpent.toFixed(2)
        }
      })
    )

    if (format === 'csv') {
      const csv = arrayToCSV(customersWithOrders, [
        'id', 'name', 'email', 'mobile', 'joined', 'orders', 'totalSpent'
      ])

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=customers-report-${Date.now()}.csv`)
      res.send(csv)
    } else {
      res.json({
        customers: customersWithOrders,
        total: customersWithOrders.length
      })
    }
  } catch (error) {
    console.error('Generate customer report error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/reports/products
// @desc    Generate product report
// @access  Admin
router.get('/products', adminProtect, async (req, res) => {
  try {
    const { format = 'json' } = req.query

    const products = await Product.findAll({
      order: [['name', 'ASC']]
    })

    // Get sales data for each product
    const orders = await Order.findAll({
      where: { status: { [Op.ne]: 'Cancelled' } }
    })

    const productSales = {}
    orders.forEach(order => {
      const items = order.items || []
      items.forEach(item => {
        const productId = item.product
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              sales: 0,
              revenue: 0
            }
          }
          productSales[productId].sales += item.quantity || 0
          productSales[productId].revenue += parseFloat(item.price || 0) * (item.quantity || 0)
        }
      })
    })

    const productReport = products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price,
      stock: product.stockCount,
      status: product.isActive ? 'Active' : 'Inactive',
      sales: productSales[product.id]?.sales || 0,
      revenue: (productSales[product.id]?.revenue || 0).toFixed(2)
    }))

    if (format === 'csv') {
      const csv = arrayToCSV(productReport, [
        'id', 'name', 'category', 'subcategory', 'price', 'stock', 'status', 'sales', 'revenue'
      ])

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=products-report-${Date.now()}.csv`)
      res.send(csv)
    } else {
      res.json({
        products: productReport,
        total: productReport.length
      })
    }
  } catch (error) {
    console.error('Generate product report error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/reports/orders
// @desc    Generate orders report
// @access  Admin
router.get('/orders', adminProtect, async (req, res) => {
  try {
    const { startDate, endDate, status, format = 'json' } = req.query

    let where = {}
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    }
    if (status) {
      where.status = status
    }

    const orders = await Order.findAll({
      where,
      include: [{
        association: 'user',
        attributes: ['name', 'email', 'mobile']
      }],
      order: [['createdAt', 'DESC']]
    })

    if (format === 'csv') {
      const reportData = orders.map(order => ({
        'Order ID': order.orderId,
        'Date': formatDate(order.createdAt),
        'Customer': order.user?.name || 'Guest',
        'Status': order.status,
        'Items': order.items?.length || 0,
        'Total': order.total,
        'Tracking': order.tracking || ''
      }))

      const csv = arrayToCSV(reportData, [
        'Order ID', 'Date', 'Customer', 'Status', 'Items', 'Total', 'Tracking'
      ])

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=orders-report-${Date.now()}.csv`)
      res.send(csv)
    } else {
      res.json({
        orders,
        total: orders.length
      })
    }
  } catch (error) {
    console.error('Generate orders report error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/reports/inventory
// @desc    Generate inventory report
// @access  Admin
router.get('/inventory', adminProtect, async (req, res) => {
  try {
    const { format = 'json' } = req.query

    const products = await Product.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    })

    const inventoryReport = products.map(product => {
      let status = 'In Stock'
      if (product.stockCount === 0) {
        status = 'Out of Stock'
      } else if (product.stockCount < 20) {
        status = 'Low Stock'
      }

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        stock: product.stockCount,
        status: status
      }
    })

    if (format === 'csv') {
      const csv = arrayToCSV(inventoryReport, [
        'id', 'name', 'category', 'subcategory', 'stock', 'status'
      ])

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=inventory-report-${Date.now()}.csv`)
      res.send(csv)
    } else {
      res.json({
        inventory: inventoryReport,
        total: inventoryReport.length
      })
    }
  } catch (error) {
    console.error('Generate inventory report error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router


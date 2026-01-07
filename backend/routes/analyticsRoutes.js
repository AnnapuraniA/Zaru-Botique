import express from 'express'
import { Op } from 'sequelize'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { adminProtect } from '../middleware/adminAuth.js'

const router = express.Router()

// Helper to get date range based on period
const getDateRange = (period) => {
  const now = new Date()
  let startDate = new Date()

  switch (period) {
    case '7days':
      startDate.setDate(now.getDate() - 7)
      break
    case '30days':
      startDate.setDate(now.getDate() - 30)
      break
    case '90days':
      startDate.setDate(now.getDate() - 90)
      break
    case '1year':
      startDate.setFullYear(now.getFullYear() - 1)
      break
    default:
      startDate.setDate(now.getDate() - 30)
  }

  return { startDate, endDate: now }
}

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics
// @access  Admin
router.get('/revenue', adminProtect, async (req, res) => {
  try {
    const { period = '30days' } = req.query
    const { startDate, endDate } = getDateRange(period)

    const orders = await Order.findAll({
      where: {
        status: { [Op.ne]: 'Cancelled' },
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    })

    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)
    
    // Previous period for comparison
    const periodDays = period === '7days' ? 7 : period === '30days' ? 30 : period === '90days' ? 90 : 365
    const prevStartDate = new Date(startDate)
    prevStartDate.setDate(prevStartDate.getDate() - periodDays)
    const prevEndDate = new Date(startDate)

    const prevOrders = await Order.findAll({
      where: {
        status: { [Op.ne]: 'Cancelled' },
        createdAt: {
          [Op.between]: [prevStartDate, prevEndDate]
        }
      }
    })

    const prevRevenue = prevOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)
    const change = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

    res.json({
      totalRevenue,
      previousRevenue: prevRevenue,
      change: parseFloat(change.toFixed(2)),
      period
    })
  } catch (error) {
    console.error('Get revenue analytics error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/analytics/sales
// @desc    Get sales analytics
// @access  Admin
router.get('/sales', adminProtect, async (req, res) => {
  try {
    const { period = '30days' } = req.query
    const { startDate, endDate } = getDateRange(period)

    const orders = await Order.findAll({
      where: {
        status: { [Op.ne]: 'Cancelled' },
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    })

    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Previous period
    const periodDays = period === '7days' ? 7 : period === '30days' ? 30 : period === '90days' ? 90 : 365
    const prevStartDate = new Date(startDate)
    prevStartDate.setDate(prevStartDate.getDate() - periodDays)
    const prevEndDate = new Date(startDate)

    const prevOrders = await Order.findAll({
      where: {
        status: { [Op.ne]: 'Cancelled' },
        createdAt: {
          [Op.between]: [prevStartDate, prevEndDate]
        }
      }
    })

    const prevTotalOrders = prevOrders.length
    const change = prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0

    res.json({
      totalOrders,
      totalRevenue,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      previousOrders: prevTotalOrders,
      change: parseFloat(change.toFixed(2)),
      period
    })
  } catch (error) {
    console.error('Get sales analytics error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/analytics/customers
// @desc    Get customer analytics
// @access  Admin
router.get('/customers', adminProtect, async (req, res) => {
  try {
    const { period = '30days' } = req.query
    const { startDate, endDate } = getDateRange(period)

    const totalCustomers = await User.count()
    
    const newCustomers = await User.count({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    })

    // Previous period
    const periodDays = period === '7days' ? 7 : period === '30days' ? 30 : period === '90days' ? 90 : 365
    const prevStartDate = new Date(startDate)
    prevStartDate.setDate(prevStartDate.getDate() - periodDays)
    const prevEndDate = new Date(startDate)

    const prevNewCustomers = await User.count({
      where: {
        createdAt: {
          [Op.between]: [prevStartDate, prevEndDate]
        }
      }
    })

    const change = prevNewCustomers > 0 ? ((newCustomers - prevNewCustomers) / prevNewCustomers) * 100 : 0

    res.json({
      totalCustomers,
      newCustomers,
      previousNewCustomers: prevNewCustomers,
      change: parseFloat(change.toFixed(2)),
      period
    })
  } catch (error) {
    console.error('Get customer analytics error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/analytics/products
// @desc    Get product performance analytics
// @access  Admin
router.get('/products', adminProtect, async (req, res) => {
  try {
    const { period = '30days' } = req.query
    const { startDate, endDate } = getDateRange(period)

    const orders = await Order.findAll({
      where: {
        status: { [Op.ne]: 'Cancelled' },
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    })

    // Aggregate product sales
    const productSales = {}
    
    orders.forEach(order => {
      const items = order.items || []
      items.forEach(item => {
        const productId = item.product
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              productId,
              sales: 0,
              revenue: 0
            }
          }
          productSales[productId].sales += item.quantity || 0
          productSales[productId].revenue += parseFloat(item.price || 0) * (item.quantity || 0)
        }
      })
    })

    // Get product details
    const productIds = Object.keys(productSales)
    const products = productIds.length > 0 ? await Product.findAll({
      where: { id: { [Op.in]: productIds } }
    }) : []

    const productMap = {}
    products.forEach(p => {
      productMap[p.id] = p
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10)
      .map(item => ({
        id: item.productId,
        name: productMap[item.productId]?.name || 'Unknown',
        sales: item.sales,
        revenue: item.revenue
      }))

    res.json({
      topProducts,
      period
    })
  } catch (error) {
    console.error('Get product analytics error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/analytics/categories
// @desc    Get category performance
// @access  Admin
router.get('/categories', adminProtect, async (req, res) => {
  try {
    const { period = '30days' } = req.query
    const { startDate, endDate } = getDateRange(period)

    const orders = await Order.findAll({
      where: {
        status: { [Op.ne]: 'Cancelled' },
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      }
    })

    // Aggregate by category
    const categoryStats = {}
    
    orders.forEach(order => {
      const items = order.items || []
      items.forEach(item => {
        // Extract category from product (assuming it's stored in item)
        // This is a simplified version - you may need to join with products table
        const category = item.category || 'Unknown'
        if (!categoryStats[category]) {
          categoryStats[category] = {
            category,
            orders: 0,
            revenue: 0
          }
        }
        categoryStats[category].orders += 1
        categoryStats[category].revenue += parseFloat(item.price || 0) * (item.quantity || 0)
      })
    })

    const categories = Object.values(categoryStats)
      .sort((a, b) => b.revenue - a.revenue)

    const totalRevenue = categories.reduce((sum, cat) => sum + cat.revenue, 0)
    const categoriesWithPercentage = categories.map(cat => ({
      ...cat,
      percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0
    }))

    res.json({
      categories: categoriesWithPercentage,
      period
    })
  } catch (error) {
    console.error('Get category analytics error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router


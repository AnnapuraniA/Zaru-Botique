import express from 'express'
import { Op } from 'sequelize'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import User from '../models/User.js'
import InventoryLog from '../models/InventoryLog.js'
import { adminProtect } from '../middleware/adminAuth.js'

const router = express.Router()

// All admin routes require admin authentication
router.use(adminProtect)

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await Product.count({ where: { isActive: true } })
    const totalOrders = await Order.count()
    const totalCustomers = await User.count()
    
    // Calculate total revenue
    const orders = await Order.findAll({ 
      where: { status: { [Op.ne]: 'Cancelled' } } 
    })
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)
    
    // Calculate recent changes (mock for now - can be enhanced with date comparisons)
    const revenueChange = 12.5 // Can calculate from previous period
    const ordersChange = 8.3

    res.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      revenueChange,
      ordersChange
    })
  } catch (error) {
    console.error('Get admin stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/recent-orders
// @desc    Get recent orders
// @access  Admin
router.get('/recent-orders', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const orders = await Order.findAll({
      include: [{
        association: 'user',
        attributes: ['name', 'mobile', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit
    })

    const formattedOrders = orders.map(order => ({
      id: order.orderId,
      customer: order.user?.name || order.shippingAddress?.name || 'Guest',
      email: order.user?.email || order.shippingAddress?.email || '',
      mobile: order.user?.mobile || order.shippingAddress?.mobile || '',
      amount: order.total,
      status: order.status,
      date: order.createdAt,
      items: order.items?.length || 0
    }))

    res.json(formattedOrders)
  } catch (error) {
    console.error('Get recent orders error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/top-products
// @desc    Get top selling products
// @access  Admin
router.get('/top-products', async (req, res) => {
  try {
    // Aggregate products by sales (from orders)
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
        name: productMap[item.productId]?.name || 'Unknown',
        sales: item.sales,
        revenue: item.revenue
      }))

    res.json(topProducts)
  } catch (error) {
    console.error('Get top products error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/products
// @desc    Get all products (admin view)
// @access  Admin
router.get('/products', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query
    const where = {}

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } }
      ]
    }

    if (status === 'active') where.isActive = true
    if (status === 'inactive') where.isActive = false

    const offset = (page - 1) * limit
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          association: 'category',
          required: false
        },
        {
          association: 'subcategory',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    })

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(count / limit),
      total: count
    })
  } catch (error) {
    console.error('Get admin products error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/admin/products
// @desc    Create new product
// @access  Admin
router.post('/products', async (req, res) => {
  try {
    const productData = req.body
    console.log('Creating product with data:', productData)
    
    // Validate required fields
    if (!productData.name) {
      return res.status(400).json({ message: 'Product name is required' })
    }
    if (!productData.categoryId) {
      return res.status(400).json({ message: 'Category is required' })
    }
    if (!productData.subcategoryId) {
      return res.status(400).json({ message: 'Subcategory is required' })
    }
    if (!productData.images || productData.images.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required' })
    }
    if (!productData.price) {
      return res.status(400).json({ message: 'Product price is required' })
    }

    const product = await Product.create(productData)
    await product.reload({
      include: [
        {
          association: 'category',
          required: false
        },
        {
          association: 'subcategory',
          required: false
        }
      ]
    })
    
    // Create inventory log entry for initial stock
    try {
      await InventoryLog.create({
        productId: product.id,
        quantity: product.stockCount || 0,
        type: product.stockCount > 0 ? 'in' : 'adjustment',
        reason: product.stockCount > 0 ? 'Initial stock - Product created' : 'Product created with zero stock',
        createdBy: req.admin?.id
      })
      console.log('Inventory log created for new product:', product.id, 'Stock:', product.stockCount)
    } catch (logError) {
      // Log error but don't fail product creation
      console.error('Failed to create inventory log:', logError)
    }
    
    console.log('Product created successfully:', {
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      isActive: product.isActive,
      category: product.category?.name,
      subcategory: product.subcategory?.name,
      stockCount: product.stockCount
    })
    res.status(201).json(product)
  } catch (error) {
    console.error('Create product error:', error)
    // Return more specific error messages
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message).join(', ')
      return res.status(400).json({ message: `Validation error: ${messages}` })
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Invalid category or subcategory selected' })
    }
    res.status(500).json({ message: error.message || 'Server error' })
  }
})

// @route   GET /api/admin/products/:id
// @desc    Get single product (admin)
// @access  Admin
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          association: 'category',
          required: false
        },
        {
          association: 'subcategory',
          required: false
        }
      ]
    })

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json(product)
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Admin
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await product.update(req.body)
    await product.reload({
      include: [
        {
          association: 'category',
          required: false
        },
        {
          association: 'subcategory',
          required: false
        }
      ]
    })

    res.json(product)
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
// @access  Admin
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await product.destroy()

    res.json({ message: 'Product deleted' })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/admin/products/:id/status
// @desc    Toggle product status
// @access  Admin
router.put('/products/:id/status', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    product.isActive = !product.isActive
    await product.save()

    res.json(product)
  } catch (error) {
    console.error('Toggle product status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/orders
// @desc    Get all orders (admin view)
// @access  Admin
router.get('/orders', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query
    const where = {}

    if (search) {
      where[Op.or] = [
        { orderId: { [Op.iLike]: `%${search}%` } },
        { tracking: { [Op.iLike]: `%${search}%` } }
      ]
    }

    if (status) {
      where.status = status
    }

    const offset = (page - 1) * limit
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [{
        association: 'user',
        attributes: ['name', 'mobile', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    })

    const formattedOrders = orders.map(order => ({
      id: order.orderId,
      customer: order.user?.name || order.shippingAddress?.name || 'Guest',
      email: order.user?.email || order.shippingAddress?.email || '',
      mobile: order.user?.mobile || order.shippingAddress?.mobile || '',
      amount: order.total,
      status: order.status,
      date: order.createdAt,
      items: order.items?.length || 0,
      tracking: order.tracking
    }))

    res.json({
      orders: formattedOrders,
      page: Number(page),
      pages: Math.ceil(count / limit),
      total: count
    })
  } catch (error) {
    console.error('Get admin orders error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/orders/:id
// @desc    Get order details
// @access  Admin
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        [Op.or]: [
          { id: req.params.id },
          { orderId: req.params.id },
          { tracking: req.params.id }
        ]
      },
      include: [{
        association: 'user'
      }]
    })

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json(order)
  } catch (error) {
    console.error('Get admin order error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Admin
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const order = await Order.findOne({
      where: {
        [Op.or]: [
          { id: req.params.id },
          { orderId: req.params.id }
        ]
      }
    })

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.status = status
    const statusHistory = order.statusHistory || []
    statusHistory.push({
      status,
      date: new Date(),
      note: `Status updated to ${status}`
    })
    order.statusHistory = statusHistory

    await order.save()

    res.json(order)
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/customers
// @desc    Get all customers
// @access  Admin
router.get('/customers', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query
    const where = {}

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { mobile: { [Op.iLike]: `%${search}%` } }
      ]
    }

    const offset = (page - 1) * limit
    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    })

    // Calculate customer stats
    const customers = await Promise.all(users.map(async (user) => {
      const orders = await Order.findAll({ where: { userId: user.id } })
      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        orders: orders.length,
        totalSpent,
        joined: user.createdAt,
        status: user.status || 'active'
      }
    }))

    res.json({
      customers,
      page: Number(page),
      pages: Math.ceil(count / limit),
      total: count
    })
  } catch (error) {
    console.error('Get admin customers error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/customers/:id
// @desc    Get customer details
// @access  Admin
router.get('/customers/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{
        association: 'orders'
      }]
    })

    if (!user) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    const orders = await Order.findAll({ where: { userId: user.id } })
    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0)

    res.json({
      ...user.toJSON(),
      ordersCount: orders.length,
      totalSpent
    })
  } catch (error) {
    console.error('Get customer details error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/admin/customers/:id/status
// @desc    Toggle customer status
// @access  Admin
router.put('/customers/:id/status', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    user.status = user.status === 'active' ? 'inactive' : 'active'
    await user.save()

    res.json({
      ...user.toJSON(),
      status: user.status
    })
  } catch (error) {
    console.error('Toggle customer status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

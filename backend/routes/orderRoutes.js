import express from 'express'
import { Op } from 'sequelize'
import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { shippingAddress, payment, shippingMethod } = req.body

    // Get user cart
    const cart = await Cart.findOne({ where: { userId: req.user.id } })
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
    let shippingCost = 0
    if (shippingMethod === 'standard') shippingCost = 100
    else if (shippingMethod === 'express') shippingCost = 200
    else if (subtotal < 2000) shippingCost = 100

    const tax = subtotal * 0.18
    const total = subtotal + shippingCost + tax

    // Generate order ID and tracking
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    const tracking = `TRACK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Create order
    const order = await Order.create({
      orderId,
      userId: req.user.id,
      items: cart.items.map(item => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      })),
      shippingAddress,
      payment,
      subtotal,
      shippingCost,
      tax,
      total,
      tracking,
      status: 'Processing',
      statusHistory: [{
        status: 'Processing',
        date: new Date(),
        note: 'Order placed'
      }]
    })

    // Clear cart
    cart.items = []
    await cart.save()

    res.status(201).json(order)
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    })

    res.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        [Op.or]: [
          { id: req.params.id },
          { orderId: req.params.id },
          { tracking: req.params.id }
        ],
        userId: req.user.id
      }
    })

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

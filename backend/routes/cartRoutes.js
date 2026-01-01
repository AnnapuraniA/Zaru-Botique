import express from 'express'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/cart
// @desc    Get user cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id } })

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] })
    }

    res.json(cart)
  } catch (error) {
    console.error('Get cart error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' })
    }

    const product = await Product.findByPk(productId)
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' })
    }

    let cart = await Cart.findOne({ where: { userId: req.user.id } })

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] })
    }

    // Get current items array
    const items = cart.items || []

    // Check if item already exists in cart
    const existingItemIndex = items.findIndex(
      item => item.product === productId && 
              item.size === size && 
              item.color === color
    )

    if (existingItemIndex >= 0) {
      // Update quantity
      items[existingItemIndex].quantity += quantity
    } else {
      // Add new item
      items.push({
        product: productId,
        name: product.name,
        image: product.images[0],
        price: parseFloat(product.price),
        quantity,
        size,
        color
      })
    }

    cart.items = items
    await cart.save()

    res.json(cart)
  } catch (error) {
    console.error('Add to cart error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/cart/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put('/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' })
    }

    const cart = await Cart.findOne({ where: { userId: req.user.id } })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    const items = cart.items || []
    const itemIndex = items.findIndex(item => item.product === req.params.itemId)

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' })
    }

    items[itemIndex].quantity = quantity
    cart.items = items
    await cart.save()

    res.json(cart)
  } catch (error) {
    console.error('Update cart error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    const items = (cart.items || []).filter(item => item.product !== req.params.itemId)
    cart.items = items
    await cart.save()

    res.json(cart)
  } catch (error) {
    console.error('Remove from cart error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    cart.items = []
    await cart.save()

    res.json({ message: 'Cart cleared' })
  } catch (error) {
    console.error('Clear cart error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

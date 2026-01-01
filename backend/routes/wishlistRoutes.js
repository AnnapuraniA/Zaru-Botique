import express from 'express'
import User from '../models/User.js'
import Product from '../models/Product.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    
    if (!user || !user.wishlist || user.wishlist.length === 0) {
      return res.json([])
    }

    const wishlistProducts = await Product.findAll({
      where: { id: user.wishlist }
    })
    
    res.json(wishlistProducts)
  } catch (error) {
    console.error('Get wishlist error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/wishlist
// @desc    Add product to wishlist
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId } = req.body

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' })
    }

    const product = await Product.findByPk(productId)
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const user = await User.findByPk(req.user.id)
    
    // Check if already in wishlist
    const wishlist = user.wishlist || []
    if (wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' })
    }

    wishlist.push(productId)
    user.wishlist = wishlist
    await user.save()

    const wishlistProducts = await Product.findAll({
      where: { id: wishlist }
    })
    
    res.json(wishlistProducts)
  } catch (error) {
    console.error('Add to wishlist error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    
    const wishlist = (user.wishlist || []).filter(
      id => id !== req.params.productId
    )
    
    user.wishlist = wishlist
    await user.save()
    
    const wishlistProducts = await Product.findAll({
      where: { id: wishlist }
    })
    
    res.json(wishlistProducts)
  } catch (error) {
    console.error('Remove from wishlist error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/wishlist/check/:productId
// @desc    Check if product is in wishlist
// @access  Private
router.get('/check/:productId', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    const wishlist = user.wishlist || []
    const isWishlisted = wishlist.includes(req.params.productId)
    res.json({ isWishlisted })
  } catch (error) {
    console.error('Check wishlist error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

import express from 'express'
import { Op } from 'sequelize'
import Product from '../models/Product.js'
import { optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      category,
      subcategory,
      minPrice,
      maxPrice,
      sizes,
      colors,
      onSale,
      featured,
      new: newProducts,
      search,
      page = 1,
      limit = 20
    } = req.query

    // Build filter object
    const where = { isActive: true }

    if (category) {
      where.category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    }

    if (subcategory) {
      where.subcategory = subcategory.charAt(0).toUpperCase() + subcategory.slice(1).toLowerCase()
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price[Op.gte] = Number(minPrice)
      if (maxPrice) where.price[Op.lte] = Number(maxPrice)
    }

    if (sizes) {
      const sizeArray = Array.isArray(sizes) ? sizes : [sizes]
      where.sizes = { [Op.contains]: sizeArray }
    }

    if (colors) {
      const colorArray = Array.isArray(colors) ? colors : [colors]
      where.colors = {
        [Op.contains]: colorArray.map(c => ({ name: c }))
      }
    }

    if (onSale === 'true') {
      where.onSale = true
    }

    if (featured === 'true') {
      // Featured products - can be based on rating, sales, or a featured flag
      // For now, using high rating as featured
      where.rating = { [Op.gte]: 4.0 }
    }

    if (newProducts === 'true') {
      where.new = true
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ]
    }

    const offset = (page - 1) * limit

    const { count, rows: products } = await Product.findAndCountAll({
      where,
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
    console.error('Get products error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json(product)
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/products/:id/related
// @desc    Get related products
// @access  Public
router.get('/:id/related', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Get products from same category and subcategory, excluding current product
    const relatedProducts = await Product.findAll({
      where: {
        category: product.category,
        subcategory: product.subcategory,
        id: { [Op.ne]: product.id },
        isActive: true
      },
      limit: 4,
      order: [['rating', 'DESC'], ['createdAt', 'DESC']]
    })

    res.json(relatedProducts)
  } catch (error) {
    console.error('Get related products error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

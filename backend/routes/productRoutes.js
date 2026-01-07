import express from 'express'
import { Op } from 'sequelize'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Subcategory from '../models/Subcategory.js'
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

    // Handle category filter (by slug)
    if (category) {
      const categoryRecord = await Category.findOne({
        where: { 
          slug: category.toLowerCase(),
          isActive: true 
        }
      })
      if (categoryRecord) {
        where.categoryId = categoryRecord.id
      } else {
        // Return empty if category not found
        return res.json({
          products: [],
          page: Number(page),
          pages: 0,
          total: 0
        })
      }
    }

    // Handle subcategory filter (by slug)
    if (subcategory) {
      const subcategoryRecord = await Subcategory.findOne({
        where: { 
          slug: subcategory.toLowerCase(),
          isActive: true 
        }
      })
      if (subcategoryRecord) {
        where.subcategoryId = subcategoryRecord.id
      } else {
        // Return empty if subcategory not found
        return res.json({
          products: [],
          page: Number(page),
          pages: 0,
          total: 0
        })
      }
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
      // For JSONB array, check if colors array contains any of the specified colors
      const colorConditions = colorArray.map(color => ({
        colors: {
          [Op.contains]: [{ name: color }]
        }
      }))
      
      if (colorConditions.length === 1) {
        where.colors = colorConditions[0].colors
      } else {
        // Multiple colors - use OR to find products with any of these colors
        const existingOr = where[Op.or]
        if (existingOr) {
          // If Op.or already exists, we need to combine with AND
          where[Op.and] = [
            { [Op.or]: existingOr },
            { [Op.or]: colorConditions }
          ]
          delete where[Op.or]
        } else {
          where[Op.or] = colorConditions
        }
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
      const searchConditions = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ]
      
      // If Op.or or Op.and already exists, combine properly
      if (where[Op.or] && !where[Op.and]) {
        // Colors filter created Op.or, combine with AND
        where[Op.and] = [
          { [Op.or]: where[Op.or] },
          { [Op.or]: searchConditions }
        ]
        delete where[Op.or]
      } else if (where[Op.and]) {
        // Already have Op.and, add search to it
        where[Op.and].push({ [Op.or]: searchConditions })
      } else {
        where[Op.or] = searchConditions
      }
    }

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
    console.error('Get products error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
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

    // Get products from same category and subcategory, excluding current product
    const relatedProducts = await Product.findAll({
      where: {
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        id: { [Op.ne]: product.id },
        isActive: true
      },
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

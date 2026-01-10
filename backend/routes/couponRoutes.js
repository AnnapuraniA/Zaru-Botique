import express from 'express'
import { Op } from 'sequelize'
import Coupon from '../models/Coupon.js'
import CouponUsage from '../models/CouponUsage.js'
import { adminProtect } from '../middleware/adminAuth.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/coupons/available
// @desc    Get all available coupons (public)
// @access  Public
router.get('/available', async (req, res) => {
  try {
    const { orderTotal } = req.query
    const now = new Date()
    
    console.log('Fetching available coupons at:', now.toISOString())
    console.log('Order total:', orderTotal)

    // First get all active coupons
    const coupons = await Coupon.findAll({
      where: {
        status: 'active'
      },
      order: [['createdAt', 'DESC']]
    })

    console.log(`Total active coupons in DB: ${coupons.length}`)
    
    // Filter coupons based on date validity, order total and usage limit
    const availableCoupons = coupons
      .filter(coupon => {
        console.log(`Checking coupon: ${coupon.code}`)
        console.log(`  - validFrom: ${coupon.validFrom} (type: ${typeof coupon.validFrom})`)
        console.log(`  - validUntil: ${coupon.validUntil} (type: ${typeof coupon.validUntil})`)
        console.log(`  - used: ${coupon.used}, limit: ${coupon.usageLimit}`)
        console.log(`  - minPurchase: ${coupon.minPurchase}`)
        
        // Check date validity - be more lenient with date comparisons
        if (coupon.validFrom) {
          const validFrom = new Date(coupon.validFrom)
          // Compare dates only (ignore time)
          const validFromDate = new Date(validFrom.getFullYear(), validFrom.getMonth(), validFrom.getDate())
          const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          
          if (validFromDate > nowDate) {
            console.log(`  - Rejected: Coupon hasn't started yet`)
            return false
          }
        }
        
        if (coupon.validUntil) {
          const validUntil = new Date(coupon.validUntil)
          // Compare dates only (ignore time) - set to end of day
          const validUntilDate = new Date(validUntil.getFullYear(), validUntil.getMonth(), validUntil.getDate())
          const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          
          if (validUntilDate < nowDate) {
            console.log(`  - Rejected: Coupon has expired`)
            return false
          }
        }
        
        // Check usage limit
        if (coupon.usageLimit && coupon.used >= coupon.usageLimit) {
          console.log(`  - Rejected: Usage limit reached`)
          return false
        }
        
        // Check minimum purchase if orderTotal is provided
        if (orderTotal && coupon.minPurchase && parseFloat(orderTotal) < parseFloat(coupon.minPurchase)) {
          console.log(`  - Rejected: Order total (${orderTotal}) is less than min purchase (${coupon.minPurchase})`)
          return false
        }
        
        console.log(`  - ✓ Accepted: Coupon is available`)
        return true
      })
      .map(coupon => ({
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount,
        maxDiscount: coupon.maxDiscount,
        description: coupon.description,
        minPurchase: coupon.minPurchase,
        validUntil: coupon.validUntil
      }))

    console.log(`Returning ${availableCoupons.length} available coupons out of ${coupons.length} active coupons`)
    res.json({ coupons: availableCoupons })
  } catch (error) {
    console.error('Get available coupons error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/coupons/validate/:code
// @desc    Validate coupon code (public)
// @access  Public (but can be protected if needed)
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params
    const { orderTotal } = req.query

    const coupon = await Coupon.findOne({
      where: {
        code: code.toUpperCase(),
        status: 'active'
      }
    })

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' })
    }

    const now = new Date()
    if (coupon.validFrom > now || coupon.validUntil < now) {
      return res.status(400).json({ message: 'Coupon has expired' })
    }

    if (coupon.usageLimit && coupon.used >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' })
    }

    if (orderTotal && parseFloat(orderTotal) < parseFloat(coupon.minPurchase)) {
      return res.status(400).json({ 
        message: `Minimum purchase of ₹${coupon.minPurchase} required` 
      })
    }

    // Calculate discount for display purposes
    let calculatedDiscount = 0
    if (coupon.type === 'percentage') {
      calculatedDiscount = (parseFloat(orderTotal || 0) * parseFloat(coupon.discount)) / 100
      if (coupon.maxDiscount && calculatedDiscount > parseFloat(coupon.maxDiscount)) {
        calculatedDiscount = parseFloat(coupon.maxDiscount)
      }
    } else if (coupon.type === 'fixed') {
      calculatedDiscount = parseFloat(coupon.discount)
    } else if (coupon.type === 'free_shipping') {
      calculatedDiscount = 0 // Free shipping handled separately on frontend
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        discount: parseFloat(coupon.discount), // Original discount value (percentage number or fixed amount)
        calculatedDiscount: calculatedDiscount, // Calculated discount amount for reference
        maxDiscount: coupon.maxDiscount ? parseFloat(coupon.maxDiscount) : null,
        description: coupon.description,
        minPurchase: coupon.minPurchase ? parseFloat(coupon.minPurchase) : null
      }
    })
  } catch (error) {
    console.error('Validate coupon error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/coupons
// @desc    Get all coupons (admin)
// @access  Admin
router.get('/all', adminProtect, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query
    const where = {}

    if (search) {
      where[Op.or] = [
        { code: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ]
    }

    if (status) {
      where.status = status
    }

    const offset = (page - 1) * limit
    const { count, rows: coupons } = await Coupon.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    })

    res.json({
      coupons,
      page: Number(page),
      pages: Math.ceil(count / limit),
      total: count
    })
  } catch (error) {
    console.error('Get admin coupons error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/admin/coupons
// @desc    Create coupon
// @access  Admin
router.post('/create', adminProtect, async (req, res) => {
  try {
    // Ensure dates are properly formatted
    const couponData = {
      ...req.body,
      code: req.body.code.toUpperCase()
    }
    
    // Set default dates if not provided
    if (!couponData.validFrom) {
      couponData.validFrom = new Date() // Start from today
    }
    if (!couponData.validUntil) {
      // Default to 1 year from now if not specified
      const oneYearLater = new Date()
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)
      couponData.validUntil = oneYearLater
    }
    
    // Ensure dates are Date objects
    if (couponData.validFrom && typeof couponData.validFrom === 'string') {
      couponData.validFrom = new Date(couponData.validFrom)
    }
    if (couponData.validUntil && typeof couponData.validUntil === 'string') {
      couponData.validUntil = new Date(couponData.validUntil)
    }
    
    const coupon = await Coupon.create(couponData)
    res.status(201).json(coupon)
  } catch (error) {
    console.error('Create coupon error:', error)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Coupon code already exists' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/admin/coupons/:id
// @desc    Update coupon
// @access  Admin
router.put('/update/:id', adminProtect, async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id)
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' })
    }

    const updateData = { ...req.body }
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase()
    }

    await coupon.update(updateData)
    await coupon.reload()

    res.json(coupon)
  } catch (error) {
    console.error('Update coupon error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/admin/coupons/:id
// @desc    Delete coupon
// @access  Admin
router.delete('/delete/:id', adminProtect, async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id)
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' })
    }

    await coupon.destroy()
    res.json({ message: 'Coupon deleted' })
  } catch (error) {
    console.error('Delete coupon error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/admin/coupons/:id/status
// @desc    Toggle coupon status
// @access  Admin
router.put('/status/:id', adminProtect, async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id)
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' })
    }

    coupon.status = coupon.status === 'active' ? 'inactive' : 'active'
    await coupon.save()

    res.json(coupon)
  } catch (error) {
    console.error('Toggle coupon status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router


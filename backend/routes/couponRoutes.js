import express from 'express'
import { Op } from 'sequelize'
import Coupon from '../models/Coupon.js'
import CouponUsage from '../models/CouponUsage.js'
import { adminProtect } from '../middleware/adminAuth.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

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

    // Calculate discount
    let discount = 0
    if (coupon.type === 'percentage') {
      discount = (parseFloat(orderTotal || 0) * parseFloat(coupon.discount)) / 100
      if (coupon.maxDiscount && discount > parseFloat(coupon.maxDiscount)) {
        discount = parseFloat(coupon.maxDiscount)
      }
    } else if (coupon.type === 'fixed') {
      discount = parseFloat(coupon.discount)
    } else if (coupon.type === 'free_shipping') {
      discount = 0 // Free shipping handled separately
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        discount: discount,
        description: coupon.description
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
    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code.toUpperCase()
    })
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


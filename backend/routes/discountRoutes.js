import express from 'express'
import { Op } from 'sequelize'
import Discount from '../models/Discount.js'
import { adminProtect } from '../middleware/adminAuth.js'

const router = express.Router()

// @route   GET /api/discounts
// @desc    Get all discounts (admin)
// @access  Admin
router.get('/all', adminProtect, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query
    const where = {}

    if (search) {
      where[Op.or] = [
        { code: { [Op.iLike]: `%${search}%` } },
        { name: { [Op.iLike]: `%${search}%` } }
      ]
    }

    if (status) {
      where.status = status
    }

    const offset = (page - 1) * limit
    const { count, rows: discounts } = await Discount.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    })

    res.json({
      discounts,
      page: Number(page),
      pages: Math.ceil(count / limit),
      total: count
    })
  } catch (error) {
    console.error('Get admin discounts error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/discounts
// @desc    Create discount
// @access  Admin
router.post('/create', adminProtect, async (req, res) => {
  try {
    const discount = await Discount.create({
      ...req.body,
      code: req.body.code.toUpperCase()
    })
    res.status(201).json(discount)
  } catch (error) {
    console.error('Create discount error:', error)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Discount code already exists' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/discounts/:id
// @desc    Update discount
// @access  Admin
router.put('/update/:id', adminProtect, async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id)
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' })
    }

    const updateData = { ...req.body }
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase()
    }

    await discount.update(updateData)
    await discount.reload()

    res.json(discount)
  } catch (error) {
    console.error('Update discount error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/discounts/:id
// @desc    Delete discount
// @access  Admin
router.delete('/delete/:id', adminProtect, async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id)
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' })
    }

    await discount.destroy()
    res.json({ message: 'Discount deleted' })
  } catch (error) {
    console.error('Delete discount error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/discounts/:id/status
// @desc    Toggle discount status
// @access  Admin
router.put('/status/:id', adminProtect, async (req, res) => {
  try {
    const discount = await Discount.findByPk(req.params.id)
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' })
    }

    discount.status = discount.status === 'active' ? 'inactive' : 'active'
    await discount.save()

    res.json(discount)
  } catch (error) {
    console.error('Toggle discount status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router


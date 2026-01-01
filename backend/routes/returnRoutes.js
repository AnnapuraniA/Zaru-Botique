import express from 'express'
import { Op } from 'sequelize'
import Return from '../models/Return.js'
import Order from '../models/Order.js'
import { adminProtect } from '../middleware/adminAuth.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/returns
// @desc    Get user return requests
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const returns = await Return.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    })

    res.json(returns)
  } catch (error) {
    console.error('Get returns error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/returns
// @desc    Create return request
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { orderId, productId, productName, reason, amount } = req.body

    if (!orderId || !productId || !productName || !reason || !amount) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Verify order belongs to user
    const order = await Order.findOne({
      where: {
        orderId,
        userId: req.user.id
      }
    })

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Generate return ID
    const returnId = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    const returnRequest = await Return.create({
      returnId,
      orderId,
      userId: req.user.id,
      productId,
      productName,
      reason,
      amount: parseFloat(amount),
      status: 'pending'
    })

    res.status(201).json(returnRequest)
  } catch (error) {
    console.error('Create return error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/returns/:id
// @desc    Get return details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const returnRequest = await Return.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    })

    if (!returnRequest) {
      return res.status(404).json({ message: 'Return request not found' })
    }

    res.json(returnRequest)
  } catch (error) {
    console.error('Get return error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/returns
// @desc    Get all returns (admin)
// @access  Admin
router.get('/all', adminProtect, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query
    const where = {}

    if (search) {
      where[Op.or] = [
        { returnId: { [Op.iLike]: `%${search}%` } },
        { orderId: { [Op.iLike]: `%${search}%` } }
      ]
    }

    if (status) {
      where.status = status
    }

    const offset = (page - 1) * limit
    const { count, rows: returns } = await Return.findAndCountAll({
      where,
      include: [{
        association: 'user',
        attributes: ['name', 'email', 'mobile']
      }],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    })

    res.json({
      returns,
      page: Number(page),
      pages: Math.ceil(count / limit),
      total: count
    })
  } catch (error) {
    console.error('Get admin returns error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/admin/returns/details/:id
// @desc    Get return details (admin)
// @access  Admin
router.get('/details/:id', adminProtect, async (req, res) => {
  try {
    const returnRequest = await Return.findByPk(req.params.id, {
      include: [{
        association: 'user'
      }, {
        association: 'product',
        attributes: ['id', 'name', 'images']
      }]
    })

    if (!returnRequest) {
      return res.status(404).json({ message: 'Return request not found' })
    }

    res.json(returnRequest)
  } catch (error) {
    console.error('Get admin return error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/admin/returns/:id/status
// @desc    Update return status (admin)
// @access  Admin
router.put('/status/:id', adminProtect, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'approved', 'rejected', 'refunded']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const returnRequest = await Return.findByPk(req.params.id)
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return request not found' })
    }

    returnRequest.status = status
    
    if (status === 'approved') {
      returnRequest.approvedAt = new Date()
    } else if (status === 'refunded') {
      returnRequest.refundedAt = new Date()
    }

    await returnRequest.save()

    res.json(returnRequest)
  } catch (error) {
    console.error('Update return status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/admin/returns/:id/refund
// @desc    Process refund (admin)
// @access  Admin
router.post('/refund/:id', adminProtect, async (req, res) => {
  try {
    const returnRequest = await Return.findByPk(req.params.id)
    if (!returnRequest) {
      return res.status(404).json({ message: 'Return request not found' })
    }

    if (returnRequest.status !== 'approved') {
      return res.status(400).json({ message: 'Return must be approved before refund' })
    }

    returnRequest.status = 'refunded'
    returnRequest.refundedAt = new Date()
    await returnRequest.save()

    res.json({ 
      message: 'Refund processed successfully',
      return: returnRequest 
    })
  } catch (error) {
    console.error('Process refund error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router


import express from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/payment-methods
// @desc    Get user payment methods
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    res.json(user.paymentMethods || [])
  } catch (error) {
    console.error('Get payment methods error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/payment-methods
// @desc    Add new payment method
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { cardNumber, cardName, expMonth, expYear } = req.body

    if (!cardNumber || !cardName || !expMonth || !expYear) {
      return res.status(400).json({ message: 'Please provide all required fields' })
    }

    const user = await User.findByPk(req.user.id)
    
    // Extract last 4 digits
    const last4 = cardNumber.replace(/\s/g, '').slice(-4)
    
    const paymentMethods = user.paymentMethods || []
    const newPaymentMethod = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      last4,
      expMonth: expMonth.padStart(2, '0'),
      expYear,
      cardName
    }

    paymentMethods.push(newPaymentMethod)
    user.paymentMethods = paymentMethods
    await user.save()

    res.status(201).json(user.paymentMethods)
  } catch (error) {
    console.error('Add payment method error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/payment-methods/:id
// @desc    Delete payment method
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    
    const paymentMethods = (user.paymentMethods || []).filter(
      method => method.id !== req.params.id
    )
    
    user.paymentMethods = paymentMethods
    await user.save()
    
    res.json({ message: 'Payment method deleted', paymentMethods: user.paymentMethods })
  } catch (error) {
    console.error('Delete payment method error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

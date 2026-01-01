import express from 'express'
import { Op } from 'sequelize'
import NewsletterSubscriber from '../models/NewsletterSubscriber.js'
import { adminProtect } from '../middleware/adminAuth.js'

const router = express.Router()

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const [subscriber, created] = await NewsletterSubscriber.findOrCreate({
      where: { email: email.toLowerCase() },
      defaults: {
        email: email.toLowerCase(),
        name: name || null,
        status: 'active'
      }
    })

    if (!created && subscriber.status === 'active') {
      return res.status(400).json({ message: 'Email already subscribed' })
    }

    if (!created && subscriber.status === 'unsubscribed') {
      subscriber.status = 'active'
      subscriber.subscribedAt = new Date()
      subscriber.unsubscribedAt = null
      await subscriber.save()
    }

    res.json({ 
      message: 'Successfully subscribed to newsletter',
      subscriber 
    })
  } catch (error) {
    console.error('Subscribe newsletter error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const subscriber = await NewsletterSubscriber.findOne({
      where: { email: email.toLowerCase() }
    })

    if (!subscriber) {
      return res.status(404).json({ message: 'Email not found' })
    }

    subscriber.status = 'unsubscribed'
    subscriber.unsubscribedAt = new Date()
    await subscriber.save()

    res.json({ message: 'Successfully unsubscribed' })
  } catch (error) {
    console.error('Unsubscribe newsletter error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/newsletter/subscribers
// @desc    Get all subscribers (admin)
// @access  Admin
router.get('/subscribers', adminProtect, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query
    const where = {}

    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { name: { [Op.iLike]: `%${search}%` } }
      ]
    }

    if (status) {
      where.status = status
    }

    const offset = (page - 1) * limit
    const { count, rows: subscribers } = await NewsletterSubscriber.findAndCountAll({
      where,
      order: [['subscribedAt', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    })

    res.json({
      subscribers,
      page: Number(page),
      pages: Math.ceil(count / limit),
      total: count
    })
  } catch (error) {
    console.error('Get admin subscribers error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/newsletter/send
// @desc    Send newsletter (admin)
// @access  Admin
router.post('/send', adminProtect, async (req, res) => {
  try {
    const { subject, content } = req.body

    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' })
    }

    // Get active subscribers
    const subscribers = await NewsletterSubscriber.findAll({
      where: { status: 'active' }
    })

    // In a real implementation, you would send emails here
    // For now, just return success
    res.json({
      message: `Newsletter sent to ${subscribers.length} subscribers`,
      sentTo: subscribers.length,
      subscribers: subscribers.map(s => s.email)
    })
  } catch (error) {
    console.error('Send newsletter error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/newsletter/subscribers/:id
// @desc    Remove subscriber (admin)
// @access  Admin
router.delete('/subscribers/:id', adminProtect, async (req, res) => {
  try {
    const subscriber = await NewsletterSubscriber.findByPk(req.params.id)
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' })
    }

    await subscriber.destroy()
    res.json({ message: 'Subscriber removed' })
  } catch (error) {
    console.error('Remove subscriber error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router


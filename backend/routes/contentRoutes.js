import express from 'express'
import ContentSetting from '../models/ContentSetting.js'
import { adminProtect } from '../middleware/adminAuth.js'

const router = express.Router()

// @route   GET /api/content/hero
// @desc    Get hero content (public)
// @access  Public
router.get('/hero', async (req, res) => {
  try {
    const settings = await ContentSetting.findAll({
      where: { section: 'hero' }
    })

    const heroContent = {}
    settings.forEach(setting => {
      heroContent[setting.key] = setting.value
    })

    res.json(heroContent)
  } catch (error) {
    console.error('Get hero content error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/content
// @desc    Get all content settings (admin)
// @access  Admin
router.get('/all', adminProtect, async (req, res) => {
  try {
    const { section } = req.query
    const where = {}

    if (section) {
      where.section = section
    }

    const settings = await ContentSetting.findAll({
      where,
      order: [['section', 'ASC'], ['key', 'ASC']]
    })

    // Group by section
    const grouped = {}
    settings.forEach(setting => {
      if (!grouped[setting.section]) {
        grouped[setting.section] = {}
      }
      grouped[setting.section][setting.key] = setting.value
    })

    res.json(grouped)
  } catch (error) {
    console.error('Get admin content error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/content
// @desc    Update content settings (admin)
// @access  Admin
router.put('/update', adminProtect, async (req, res) => {
  try {
    const { section, content } = req.body

    if (!section || !content) {
      return res.status(400).json({ message: 'Section and content are required' })
    }

    // Update multiple settings
    const updates = await Promise.all(
      Object.keys(content).map(async (key) => {
        const [setting, created] = await ContentSetting.findOrCreate({
          where: { section, key },
          defaults: {
            section,
            key,
            value: String(content[key])
          }
        })

        if (!created) {
          setting.value = String(content[key])
          await setting.save()
        }

        return setting
      })
    )

    res.json({ message: 'Content updated', settings: updates })
  } catch (error) {
    console.error('Update content error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router


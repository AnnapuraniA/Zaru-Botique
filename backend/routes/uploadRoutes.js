import express from 'express'
import upload from '../middleware/upload.js'
import { adminProtect } from '../middleware/adminAuth.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// @route   POST /api/admin/upload/images
// @desc    Upload product images
// @access  Admin
router.post('/images', adminProtect, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' })
    }

    // Generate URLs for uploaded files
    const imageUrls = req.files.map(file => {
      // Return URL path that will be served statically
      return `/uploads/products/${file.filename}`
    })

    res.json({
      success: true,
      images: imageUrls,
      message: `${req.files.length} image(s) uploaded successfully`
    })
  } catch (error) {
    console.error('Image upload error:', error)
    res.status(500).json({ message: 'Failed to upload images', error: error.message })
  }
})

// @route   DELETE /api/admin/upload/images/:filename
// @desc    Delete uploaded image
// @access  Admin
router.delete('/images/:filename', adminProtect, async (req, res) => {
  try {
    const fs = await import('fs')
    const filePath = path.join(__dirname, '../uploads/products', req.params.filename)
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      res.json({ success: true, message: 'Image deleted successfully' })
    } else {
      res.status(404).json({ message: 'Image not found' })
    }
  } catch (error) {
    console.error('Image delete error:', error)
    res.status(500).json({ message: 'Failed to delete image' })
  }
})

export default router


import express from 'express'
import { Op } from 'sequelize'
import crypto from 'crypto'
import User from '../models/User.js'
import Product from '../models/Product.js'
import { generateToken } from '../utils/generateToken.js'
import { protect } from '../middleware/auth.js'
import { sendPasswordResetEmail } from '../services/emailService.js'
import { sendPasswordResetSMS } from '../services/smsService.js'

const router = express.Router()

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { mobile, password, name, email } = req.body

    // Validation - require at least mobile or email
    if ((!mobile || mobile.trim() === '') && (!email || email.trim() === '')) {
      return res.status(400).json({ message: 'Please provide either mobile number or email address' })
    }

    if (!password || !name) {
      return res.status(400).json({ message: 'Please provide password and name' })
    }

    // Validate mobile if provided
    if (mobile && (mobile.length !== 10 || !/^[0-9]+$/.test(mobile))) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' })
    }

    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    // Check if user exists by mobile
    if (mobile) {
      const userExistsByMobile = await User.findOne({ where: { mobile } })
      if (userExistsByMobile) {
        return res.status(400).json({ message: 'Mobile number already registered' })
      }
    }

    // Check if user exists by email
    if (email) {
      const userExistsByEmail = await User.findOne({ where: { email } })
      if (userExistsByEmail) {
        return res.status(400).json({ message: 'Email address already registered' })
      }
    }

    // Create user
    const user = await User.create({
      mobile: mobile || null,
      password,
      name,
      email: email || null
    })

    if (user) {
      const token = generateToken(user.id)
      res.status(201).json({
        _id: user.id,
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        token
      })
    } else {
      res.status(400).json({ message: 'Invalid user data' })
    }
  } catch (error) {
    console.error('Register error:', error)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Mobile number or email already registered' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { mobile, email, password } = req.body

    if ((!mobile || mobile.trim() === '') && (!email || email.trim() === '')) {
      return res.status(400).json({ message: 'Please provide mobile number or email address' })
    }

    if (!password) {
      return res.status(400).json({ message: 'Please provide password' })
    }

    // Find user by mobile or email
    let user = null
    if (mobile) {
      user = await User.findOne({ where: { mobile } })
    } else if (email) {
      user = await User.findOne({ where: { email } })
    }

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user.id)
      res.json({
        _id: user.id,
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        token
      })
    } else {
      res.status(401).json({ message: 'Invalid credentials' })
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/auth/forgot-password
// @desc    Send password reset instructions
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { emailOrMobile } = req.body

    if (!emailOrMobile || emailOrMobile.trim() === '') {
      return res.status(400).json({ message: 'Please provide email or mobile number' })
    }

    // Determine if it's email or mobile
    const isEmail = emailOrMobile.includes('@')
    const isMobile = /^[0-9]{10}$/.test(emailOrMobile.trim())

    if (!isEmail && !isMobile) {
      return res.status(400).json({ message: 'Please provide a valid email or 10-digit mobile number' })
    }

    // Find user by email or mobile
    let user = null
    if (isEmail) {
      user = await User.findOne({ where: { email: emailOrMobile.trim() } })
    } else {
      user = await User.findOne({ where: { mobile: emailOrMobile.trim() } })
    }

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ 
        message: 'If an account exists with this email/mobile, password reset instructions have been sent.' 
      })
    }

    // Generate a simple reset token (in production, use a secure token stored in DB with expiry)
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    // TODO: In production, store resetToken in database with expiry time
    // For now, we'll send the reset instructions via email or SMS
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`
    
    // Send reset instructions via email or SMS
    let sendResult = null
    if (isEmail && user.email) {
      // Send email with reset link
      sendResult = await sendPasswordResetEmail(user.email, resetToken, user.name)
    } else if (isMobile && user.mobile) {
      // Generate OTP for SMS (6 digits)
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      // For SMS, we'll use OTP instead of token link (more mobile-friendly)
      sendResult = await sendPasswordResetSMS(user.mobile, otp)
      
      // In development, also log the reset link
      if (process.env.NODE_ENV === 'development') {
        console.log(`Password reset OTP sent to mobile: ${user.mobile}`)
        console.log(`Reset OTP (for development): ${otp}`)
        console.log(`Reset link would be: ${resetLink}`)
      }
    }

    // Log for development/debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset requested for ${isEmail ? 'email' : 'mobile'}: ${emailOrMobile}`)
      console.log(`Reset token (for development): ${resetToken}`)
      console.log(`Reset link: ${resetLink}`)
    }

    res.json({ 
      message: 'Password reset instructions have been sent to your email/mobile',
      // In development, include token for testing (remove in production)
      ...(process.env.NODE_ENV === 'development' && { 
        resetToken,
        resetLink
      })
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { mobile, newPassword } = req.body

    if (!mobile || !newPassword) {
      return res.status(400).json({ message: 'Please provide mobile and new password' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    const user = await User.findOne({ where: { mobile } })

    if (!user) {
      return res.status(404).json({ message: 'Mobile number not found' })
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'Password reset successful' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          association: 'orders',
          required: false
        }
      ]
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const userData = user.toJSON()

    // Get wishlist products
    if (userData.wishlist && userData.wishlist.length > 0) {
      const wishlistProducts = await Product.findAll({
        where: { id: { [Op.in]: userData.wishlist } }
      })
      userData.wishlist = wishlistProducts
    }

    res.json(userData)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body

    const user = await User.findByPk(req.user.id)

    if (user) {
      if (name) user.name = name
      if (email) user.email = email
      const updatedUser = await user.save()
      res.json(updatedUser.toJSON())
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/auth/change-password
// @desc    Change password (requires current password)
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new password' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    const user = await User.findByPk(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/auth/preferences
// @desc    Get user preferences
// @access  Private
router.get('/preferences', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    const preferences = user.preferences || {
      emailNotifications: true,
      smsNotifications: false,
      newsletter: false
    }
    
    res.json(preferences)
  } catch (error) {
    console.error('Get preferences error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/auth/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { emailNotifications, smsNotifications, newsletter } = req.body
    
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    
    const currentPreferences = user.preferences || {
      emailNotifications: true,
      smsNotifications: false,
      newsletter: false
    }
    
    const updatedPreferences = {
      ...currentPreferences,
      ...(emailNotifications !== undefined && { emailNotifications }),
      ...(smsNotifications !== undefined && { smsNotifications }),
      ...(newsletter !== undefined && { newsletter })
    }
    
    await user.update(
      { preferences: updatedPreferences },
      { fields: ['preferences'] }
    )
    
    res.json(updatedPreferences)
  } catch (error) {
    console.error('Update preferences error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

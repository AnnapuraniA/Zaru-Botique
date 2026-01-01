import express from 'express'
import { Op } from 'sequelize'
import User from '../models/User.js'
import Product from '../models/Product.js'
import { generateToken } from '../utils/generateToken.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { mobile, password, name, email } = req.body

    // Validation
    if (!mobile || !password || !name) {
      return res.status(400).json({ message: 'Please provide mobile, password, and name' })
    }

    if (mobile.length !== 10 || !/^[0-9]+$/.test(mobile)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    // Check if user exists
    const userExists = await User.findOne({ where: { mobile } })
    if (userExists) {
      return res.status(400).json({ message: 'Mobile number already registered' })
    }

    // Create user
    const user = await User.create({
      mobile,
      password,
      name,
      email: email || ''
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
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { mobile, password } = req.body

    if (!mobile || !password) {
      return res.status(400).json({ message: 'Please provide mobile and password' })
    }

    const user = await User.findOne({ where: { mobile } })

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
      res.status(401).json({ message: 'Invalid mobile number or password' })
    }
  } catch (error) {
    console.error('Login error:', error)
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

export default router

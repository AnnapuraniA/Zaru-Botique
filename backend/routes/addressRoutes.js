import express from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/addresses
// @desc    Get user addresses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    res.json(user.addresses || [])
  } catch (error) {
    console.error('Get addresses error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   POST /api/addresses
// @desc    Add new address
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { type, name, address, city, state, zip, isDefault } = req.body

    if (!name || !address || !city || !state || !zip) {
      return res.status(400).json({ message: 'Please provide all required fields' })
    }

    const user = await User.findByPk(req.user.id)
    
    const addresses = user.addresses || []
    const newAddress = {
      id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type || 'Home',
      name,
      address,
      city,
      state,
      zip,
      isDefault: isDefault || (addresses.length === 0)
    }

    // If this is set as default, unset other defaults
    if (newAddress.isDefault) {
      addresses.forEach(addr => {
        addr.isDefault = false
      })
    }

    addresses.push(newAddress)
    user.addresses = addresses
    await user.save()

    res.status(201).json(user.addresses)
  } catch (error) {
    console.error('Add address error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/addresses/:id
// @desc    Update address
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { type, name, address, city, state, zip, isDefault } = req.body
    const user = await User.findByPk(req.user.id)

    const addresses = user.addresses || []
    const addressIndex = addresses.findIndex(
      addr => addr.id === req.params.id
    )

    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' })
    }

    // Update address fields
    if (type) addresses[addressIndex].type = type
    if (name) addresses[addressIndex].name = name
    if (address) addresses[addressIndex].address = address
    if (city) addresses[addressIndex].city = city
    if (state) addresses[addressIndex].state = state
    if (zip) addresses[addressIndex].zip = zip

    // Handle default address
    if (isDefault !== undefined) {
      if (isDefault) {
        // Unset other defaults
        addresses.forEach((addr, idx) => {
          if (idx !== addressIndex) addr.isDefault = false
        })
      }
      addresses[addressIndex].isDefault = isDefault
    }

    user.addresses = addresses
    await user.save()
    res.json(user.addresses)
  } catch (error) {
    console.error('Update address error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   DELETE /api/addresses/:id
// @desc    Delete address
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    
    const addresses = (user.addresses || []).filter(
      addr => addr.id !== req.params.id
    )
    
    user.addresses = addresses
    await user.save()
    
    res.json({ message: 'Address deleted', addresses: user.addresses })
  } catch (error) {
    console.error('Delete address error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router

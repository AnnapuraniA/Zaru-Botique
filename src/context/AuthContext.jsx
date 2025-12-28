import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize dummy users for testing (only if no users exist)
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    if (users.length === 0) {
      // Create dummy test users
      const dummyUsers = [
        {
          id: 'user_test_001',
          mobile: '9876543210',
          password: 'password123',
          name: 'Test User',
          email: 'test@example.com',
          addresses: [],
          orders: [],
          wishlist: [],
          createdAt: new Date().toISOString()
        },
        {
          id: 'user_test_002',
          mobile: '9876543211',
          password: 'test123',
          name: 'Demo User',
          email: 'demo@example.com',
          addresses: [],
          orders: [],
          wishlist: [],
          createdAt: new Date().toISOString()
        }
      ]
      localStorage.setItem('users', JSON.stringify(dummyUsers))
    }
  }, [])

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  // Generate guest ID
  const getGuestId = () => {
    let guestId = localStorage.getItem('guestId')
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('guestId', guestId)
    }
    return guestId
  }

  // Register new user
  const register = async (mobile, password, name, email = '') => {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const existingUser = users.find(u => u.mobile === mobile)
    
    if (existingUser) {
      throw new Error('Mobile number already registered')
    }

    // Create new user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mobile,
      password, // In production, this should be hashed
      name,
      email,
      addresses: [],
      orders: [],
      wishlist: [],
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    
    // Auto login after registration
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    
    return newUser
  }

  // Login user
  const login = async (mobile, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => u.mobile === mobile && u.password === password)
    
    if (!user) {
      throw new Error('Invalid mobile number or password')
    }

    // Remove password from user object before storing
    const { password: _, ...userWithoutPassword } = user
    
    setUser(userWithoutPassword)
    localStorage.setItem('user', JSON.stringify(userWithoutPassword))
    
    return userWithoutPassword
  }

  // Logout user
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  // Reset password
  const resetPassword = async (mobile, newPassword) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const userIndex = users.findIndex(u => u.mobile === mobile)
    
    if (userIndex === -1) {
      throw new Error('Mobile number not found')
    }

    users[userIndex].password = newPassword // In production, this should be hashed
    localStorage.setItem('users', JSON.stringify(users))
    
    // If current user, update their session
    if (user && user.mobile === mobile) {
      const updatedUser = { ...users[userIndex] }
      const { password: _, ...userWithoutPassword } = updatedUser
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
    }
  }

  // Update user profile
  const updateProfile = (updates) => {
    if (!user) return

    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const userIndex = users.findIndex(u => u.id === user.id)
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      localStorage.setItem('users', JSON.stringify(users))
      
      const { password: _, ...userWithoutPassword } = users[userIndex]
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
    }
  }

  // Add order
  const addOrder = (order) => {
    if (!user) return

    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const userIndex = users.findIndex(u => u.id === user.id)
    
    if (userIndex !== -1) {
      const orderWithId = {
        ...order,
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        date: new Date().toISOString(),
        status: 'Processing'
      }
      
      users[userIndex].orders = [...users[userIndex].orders, orderWithId]
      localStorage.setItem('users', JSON.stringify(users))
      
      const { password: _, ...userWithoutPassword } = users[userIndex]
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
      
      return orderWithId
    }
  }

  // Get orders
  const getOrders = () => {
    if (!user) return []
    return user.orders || []
  }

  // Merge guest cart with user cart
  const mergeCart = (guestCart) => {
    if (!user || !guestCart || guestCart.length === 0) return

    const userCart = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]')
    
    // Merge logic: combine items, update quantities if same product/size/color
    const mergedCart = [...userCart]
    
    guestCart.forEach(guestItem => {
      const existingIndex = mergedCart.findIndex(
        item => item.id === guestItem.id && 
                item.size === guestItem.size && 
                item.color === guestItem.color
      )
      
      if (existingIndex >= 0) {
        mergedCart[existingIndex].quantity += guestItem.quantity
      } else {
        mergedCart.push(guestItem)
      }
    })
    
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(mergedCart))
    localStorage.removeItem(`cart_guest`)
    
    return mergedCart
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    getGuestId,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
    addOrder,
    getOrders,
    mergeCart
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


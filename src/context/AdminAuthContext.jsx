import { createContext, useContext, useState, useEffect } from 'react'

const AdminAuthContext = createContext()

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // Hardcoded admin credentials
  const ADMIN_EMAIL = 'admin@arudhraboutique.com'
  const ADMIN_PASSWORD = 'admin123'

  // Load admin session from localStorage
  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminSession')
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin))
      } catch (error) {
        console.error('Error parsing admin session:', error)
        localStorage.removeItem('adminSession')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminData = {
        id: 'admin_001',
        email: ADMIN_EMAIL,
        name: 'Admin User',
        role: 'Super Admin',
        loginTime: new Date().toISOString()
      }
      setAdmin(adminData)
      localStorage.setItem('adminSession', JSON.stringify(adminData))
      return adminData
    } else {
      throw new Error('Invalid email or password')
    }
  }

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem('adminSession')
  }

  const value = {
    admin,
    loading,
    isAuthenticated: !!admin,
    login,
    logout
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}


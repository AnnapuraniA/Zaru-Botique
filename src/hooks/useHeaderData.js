import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { cartAPI } from '../utils/api'

/**
 * Shared hook for header data (cart count, compare count, etc.)
 * Used by both web and mobile header components
 */
export function useHeaderData() {
  const { isAuthenticated } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [compareCount, setCompareCount] = useState(0)
  const [isSticky, setIsSticky] = useState(false)

  // Load cart count
  useEffect(() => {
    const loadCartCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await cartAPI.get()
          console.log('Header cart response:', response) // Debug log
          
          // Handle different response structures
          let items = []
          if (Array.isArray(response)) {
            items = response
          } else if (response?.items) {
            items = Array.isArray(response.items) ? response.items : []
          } else if (response?.data?.items) {
            items = Array.isArray(response.data.items) ? response.data.items : []
          }
          
          const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0)
          console.log('Cart count calculated:', count, 'from', items.length, 'items')
          setCartCount(count)
        } catch (err) {
          console.error('Failed to load cart count:', err)
        }
      } else {
        // Guest cart
        const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '[]')
        const count = guestCart.reduce((sum, item) => sum + (item.quantity || 1), 0)
        setCartCount(count)
      }
    }
    loadCartCount()
    
    // Listen for cart updates
    const handleStorageChange = () => {
      if (!isAuthenticated) {
        const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '[]')
        const count = guestCart.reduce((sum, item) => sum + (item.quantity || 1), 0)
        setCartCount(count)
      }
    }
    
    const handleCartUpdate = () => {
      loadCartCount()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [isAuthenticated])

  // Load compare count
  useEffect(() => {
    const loadCompareCount = () => {
      const compareIds = JSON.parse(localStorage.getItem('compareItems') || '[]')
      setCompareCount(compareIds.length)
    }
    
    loadCompareCount()
    
    // Listen for compare updates
    const handleCompareUpdate = () => {
      loadCompareCount()
    }
    
    window.addEventListener('storage', handleCompareUpdate)
    window.addEventListener('compareUpdated', handleCompareUpdate)
    
    // Also check periodically for changes (since localStorage events don't fire in same tab)
    const interval = setInterval(loadCompareCount, 1000)
    
    return () => {
      window.removeEventListener('storage', handleCompareUpdate)
      window.removeEventListener('compareUpdated', handleCompareUpdate)
      clearInterval(interval)
    }
  }, [])

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return { cartCount, compareCount, isSticky }
}

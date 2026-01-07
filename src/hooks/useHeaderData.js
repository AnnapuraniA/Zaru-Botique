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
          const count = (response.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0)
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
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cartUpdated', loadCartCount)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', loadCartCount)
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

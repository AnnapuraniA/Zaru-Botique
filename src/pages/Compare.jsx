import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { productsAPI, compareAPI } from '../utils/api'
import { useToast } from '../components/Toast/ToastContainer'
import { useDevice } from '../hooks/useDevice'
import CompareMobile from './Compare.mobile'
import CompareWeb from './Compare.web'

function Compare() {
  const { isAuthenticated } = useAuth()
  const { error: showError } = useToast()
  const isMobile = useDevice()
  const [compareItems, setCompareItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      loadCompareItems()
    } else {
      // For guests, use localStorage as fallback
      loadGuestCompareItems()
    }
  }, [isAuthenticated])

  const loadCompareItems = async () => {
    try {
      setLoading(true)
      const products = await compareAPI.getAll()
      setCompareItems(Array.isArray(products) ? products : [])
    } catch (err) {
      console.error('Failed to load compare items:', err)
      showError('Failed to load compare items')
      setCompareItems([])
    } finally {
      setLoading(false)
    }
  }

  const loadGuestCompareItems = async () => {
    try {
      setLoading(true)
      // Load compare items from localStorage for guests
      const compareIds = JSON.parse(localStorage.getItem('compareItems') || '[]')
      
      if (compareIds.length === 0) {
        setCompareItems([])
        setLoading(false)
        return
      }

      // Fetch product details for each compare item
      const productPromises = compareIds.map(id => 
        productsAPI.getById(id).catch(err => {
          console.error(`Failed to load product ${id}:`, err)
          return null
        })
      )
      
      const products = await Promise.all(productPromises)
      const validProducts = products.filter(p => p !== null)
      setCompareItems(validProducts)
    } catch (err) {
      console.error('Failed to load compare items:', err)
      showError('Failed to load compare items')
    } finally {
      setLoading(false)
    }
  }

  const removeFromCompare = async (id) => {
    if (!isAuthenticated) {
      // For guests, use localStorage
      const compareIds = JSON.parse(localStorage.getItem('compareItems') || '[]')
      const updatedIds = compareIds.filter(itemId => itemId !== id)
      localStorage.setItem('compareItems', JSON.stringify(updatedIds))
      
      // Update state
      setCompareItems(items => items.filter(item => {
        const itemId = item._id || item.id
        return itemId !== id
      }))
      
      // Dispatch event to update header count
      window.dispatchEvent(new Event('compareUpdated'))
      
      success('Removed from compare')
      return
    }

    try {
      // Remove from backend
      await compareAPI.remove(id)
      
      // Update state
      setCompareItems(items => items.filter(item => {
        const itemId = item._id || item.id
        return itemId !== id
      }))
      
      // Dispatch event to update header count
      window.dispatchEvent(new Event('compareUpdated'))
      
      success('Removed from compare')
    } catch (err) {
      console.error('Failed to remove from compare:', err)
      showError('Failed to remove from compare')
    }
  }

  return isMobile ? (
    <CompareMobile
      compareItems={compareItems}
      loading={loading}
      removeFromCompare={removeFromCompare}
      isAuthenticated={isAuthenticated}
    />
  ) : (
    <CompareWeb
      compareItems={compareItems}
      loading={loading}
      removeFromCompare={removeFromCompare}
      isAuthenticated={isAuthenticated}
    />
  )
}

export default Compare


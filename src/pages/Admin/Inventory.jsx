import { useState, useEffect } from 'react'
import { Search, AlertTriangle, Package, Edit, AlertCircle } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'
import { adminInventoryAPI } from '../../utils/adminApi'

function Inventory() {
  const { success, error: showError } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [inventory, setInventory] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [outOfStockItems, setOutOfStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)
  const [stockForm, setStockForm] = useState({ stockCount: '', type: 'adjustment', reason: '' })

  useEffect(() => {
    loadInventory()
    loadLowStock()
    loadOutOfStock()
  }, [stockFilter])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadInventory()
    }, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const loadInventory = async () => {
    try {
      setLoading(true)
      const filters = {}
      if (stockFilter) filters.status = stockFilter
      if (searchQuery) filters.search = searchQuery
      const data = await adminInventoryAPI.getAll(filters)
      setInventory(data.inventory || [])
    } catch (err) {
      console.error('Error loading inventory:', err)
      showError('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }

  const loadLowStock = async () => {
    try {
      const data = await adminInventoryAPI.getLowStock()
      setLowStockItems(data || [])
    } catch (err) {
      console.error('Error loading low stock:', err)
    }
  }

  const loadOutOfStock = async () => {
    try {
      const data = await adminInventoryAPI.getOutOfStock()
      setOutOfStockItems(data || [])
    } catch (err) {
      console.error('Error loading out of stock:', err)
    }
  }

  const handleUpdateStock = async (productId) => {
    if (!stockForm.stockCount && stockForm.type === 'adjustment') {
      showError('Please enter stock count')
      return
    }
    try {
      await adminInventoryAPI.update(productId, parseFloat(stockForm.stockCount) || 0, stockForm.type, stockForm.reason)
      await loadInventory()
      await loadLowStock()
      await loadOutOfStock()
      setEditingItem(null)
      setStockForm({ stockCount: '', type: 'adjustment', reason: '' })
      success('Stock updated successfully')
    } catch (err) {
      showError('Failed to update stock')
    }
  }


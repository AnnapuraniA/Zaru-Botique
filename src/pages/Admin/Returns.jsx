import { useState, useEffect } from 'react'
import { Search, Package, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'
import { adminReturnsAPI } from '../../utils/adminApi'

function Returns() {
  const { success, error: showError } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReturn, setSelectedReturn] = useState(null)

  useEffect(() => {
    loadReturns()
  }, [statusFilter])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadReturns()
    }, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const loadReturns = async () => {
    try {
      setLoading(true)
      const filters = {}
      if (statusFilter) filters.status = statusFilter
      if (searchQuery) filters.search = searchQuery
      const data = await adminReturnsAPI.getAll(filters)
      setReturns(data.returns || [])
    } catch (err) {
      console.error('Error loading returns:', err)
      showError('Failed to load returns')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      await adminReturnsAPI.updateStatus(id, newStatus)
      await loadReturns()
      success('Return status updated')
    } catch (err) {
      showError('Failed to update return status')
    }
  }

  const processRefund = async (id) => {
    try {
      await adminReturnsAPI.processRefund(id)
      await loadReturns()
      success('Refund processed successfully')
    } catch (err) {
      showError('Failed to process refund')
    }
  }


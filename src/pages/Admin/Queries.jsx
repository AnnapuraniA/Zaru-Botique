import { useState, useEffect } from 'react'
import { Search, Mail, Phone, MessageSquare, CheckCircle, Clock, Eye } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'
import { adminQueriesAPI } from '../../utils/adminApi'

function Queries() {
  const { success, error: showError } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedQuery, setSelectedQuery] = useState(null)

  useEffect(() => {
    loadQueries()
  }, [statusFilter])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadQueries()
    }, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const loadQueries = async () => {
    try {
      setLoading(true)
      const filters = {}
      if (statusFilter) filters.status = statusFilter
      if (searchQuery) filters.search = searchQuery
      const data = await adminQueriesAPI.getAll(filters)
      setQueries(data.queries || [])
    } catch (err) {
      console.error('Error loading queries:', err)
      showError('Failed to load queries')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminQueriesAPI.updateStatus(id, status)
      await loadQueries()
      success('Query status updated')
    } catch (err) {
      showError('Failed to update query status')
    }
  }

  const handleReply = async (id, reply) => {
    try {
      await adminQueriesAPI.reply(id, reply)
      await loadQueries()
      setSelectedQuery(null)
      success('Reply sent successfully')
    } catch (err) {
      showError('Failed to send reply')
    }
  }


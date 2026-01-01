import { useState, useEffect } from 'react'
import { Search, Eye, Mail, Phone, Package, Calendar, Users } from 'lucide-react'
import { adminCustomersAPI } from '../../utils/adminApi'
import { useToast } from '../../components/Toast/ToastContainer'

function Customers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const { error: showError } = useToast()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const filters = {}
      if (searchQuery) {
        filters.search = searchQuery
      }
      const data = await adminCustomersAPI.getAll(filters)
      setCustomers(data.customers || [])
    } catch (err) {
      console.error('Error loading customers:', err)
      showError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery !== undefined) {
        loadCustomers()
      }
    }, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const filteredCustomers = customers

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage customer accounts and view customer information</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="customers-stats">
        <div className="stat-mini-card">
          <Users size={24} />
          <div>
            <h3>{customers.length}</h3>
            <p>Total Customers</p>
          </div>
        </div>
        <div className="stat-mini-card">
          <Package size={24} />
          <div>
            <h3>{customers.reduce((sum, c) => sum + (c.orders || 0), 0)}</h3>
            <p>Total Orders</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading customers...
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  No customers found
                </td>
              </tr>
            ) : (
              filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td><strong>{customer.id}</strong></td>
                  <td>{customer.name}</td>
                  <td>
                    <div className="contact-info">
                      <p><Phone size={14} /> {customer.mobile}</p>
                      <p className="text-muted"><Mail size={14} /> {customer.email || 'N/A'}</p>
                    </div>
                  </td>
                  <td>{customer.orders || 0}</td>
                  <td>₹{(customer.totalSpent || 0).toLocaleString()}</td>
                  <td>{new Date(customer.joined).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${customer.status || 'active'}`}>
                      {customer.status || 'active'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" title="View Details" onClick={() => window.location.href = `/admin/customers/${customer.id}`}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Customers


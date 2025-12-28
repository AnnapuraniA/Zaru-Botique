import { useState } from 'react'
import { Search, Mail, Download, Trash2, Send, Users, X } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'

function Newsletter() {
  const { success } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSendModal, setShowSendModal] = useState(false)

  const [subscribers, setSubscribers] = useState([
    { id: 1, email: 'priya@example.com', name: 'Priya Sharma', subscribedAt: '2024-01-10', status: 'active' },
    { id: 2, email: 'ananya@example.com', name: 'Ananya Patel', subscribedAt: '2024-01-12', status: 'active' },
    { id: 3, email: 'kavya@example.com', name: 'Kavya Reddy', subscribedAt: '2024-01-08', status: 'active' },
    { id: 4, email: 'meera@example.com', name: 'Meera Singh', subscribedAt: '2024-01-15', status: 'active' },
    { id: 5, email: 'sneha@example.com', name: 'Sneha Kumar', subscribedAt: '2024-01-05', status: 'unsubscribed' }
  ])

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sub.name && sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleDelete = (id) => {
    if (window.confirm('Remove this subscriber?')) {
      setSubscribers(subscribers.filter(s => s.id !== id))
      success('Subscriber removed')
    }
  }

  const handleExport = () => {
    const csv = [
      ['Email', 'Name', 'Subscribed At', 'Status'],
      ...subscribers.map(s => [s.email, s.name || '', s.subscribedAt, s.status])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    success('Subscribers exported successfully')
  }

  const activeSubscribers = subscribers.filter(s => s.status === 'active').length

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Newsletter Subscribers</h1>
          <p>Manage newsletter subscribers and send campaigns</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={18} />
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowSendModal(true)}>
            <Send size={18} />
            Send Newsletter
          </button>
        </div>
      </div>

      <div className="newsletter-stats">
        <div className="stat-mini-card">
          <Users size={24} />
          <div>
            <h3>{subscribers.length}</h3>
            <p>Total Subscribers</p>
          </div>
        </div>
        <div className="stat-mini-card success">
          <Mail size={24} />
          <div>
            <h3>{activeSubscribers}</h3>
            <p>Active</p>
          </div>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Subscribed At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscribers.map(subscriber => (
              <tr key={subscriber.id}>
                <td>{subscriber.email}</td>
                <td>{subscriber.name || '-'}</td>
                <td>{new Date(subscriber.subscribedAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${subscriber.status === 'active' ? 'active' : 'inactive'}`}>
                    {subscriber.status}
                  </span>
                </td>
                <td>
                  <button className="btn-icon danger" title="Remove" onClick={() => handleDelete(subscriber.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Send Newsletter Modal */}
      {showSendModal && (
        <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Newsletter</h2>
              <button className="modal-close" onClick={() => setShowSendModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Subject *</label>
                <input type="text" placeholder="Newsletter Subject" required />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea rows="10" placeholder="Enter newsletter content..." required></textarea>
              </div>
              <div className="form-group">
                <label>Recipients</label>
                <p className="text-muted">Will be sent to {activeSubscribers} active subscribers</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowSendModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                success('Newsletter sent successfully')
                setShowSendModal(false)
              }}>Send Newsletter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Newsletter


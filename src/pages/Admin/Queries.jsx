import { useState } from 'react'
import { Search, Mail, Phone, MessageSquare, CheckCircle, Clock } from 'lucide-react'

function Queries() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const queries = [
    { id: 'Q-001', name: 'Priya Sharma', email: 'priya@example.com', mobile: '9876543210', subject: 'Order Delivery Query', message: 'When will my order be delivered?', date: '2024-01-15', status: 'new' },
    { id: 'Q-002', name: 'Ananya Patel', email: 'ananya@example.com', mobile: '9876543211', subject: 'Return Request', message: 'I want to return a product', date: '2024-01-14', status: 'in-progress' },
    { id: 'Q-003', name: 'Kavya Reddy', email: 'kavya@example.com', mobile: '9876543212', subject: 'Size Guide Question', message: 'What size should I order?', date: '2024-01-13', status: 'resolved' },
    { id: 'Q-004', name: 'Meera Singh', email: 'meera@example.com', mobile: '9876543213', subject: 'Product Availability', message: 'Is this product available in XL?', date: '2024-01-12', status: 'new' },
    { id: 'Q-005', name: 'Sneha Kumar', email: 'sneha@example.com', mobile: '9876543214', subject: 'Payment Issue', message: 'Payment not processed', date: '2024-01-11', status: 'resolved' }
  ]

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         query.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         query.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || query.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status) => {
    switch(status) {
      case 'new': return <Clock size={16} />
      case 'in-progress': return <MessageSquare size={16} />
      case 'resolved': return <CheckCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Customer Queries</h1>
          <p>Manage and respond to customer inquiries</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search queries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="queries-stats">
        <div className="stat-mini-card">
          <MessageSquare size={24} />
          <div>
            <h3>{queries.length}</h3>
            <p>Total Queries</p>
          </div>
        </div>
        <div className="stat-mini-card">
          <Clock size={24} />
          <div>
            <h3>{queries.filter(q => q.status === 'new').length}</h3>
            <p>New</p>
          </div>
        </div>
        <div className="stat-mini-card">
          <CheckCircle size={24} />
          <div>
            <h3>{queries.filter(q => q.status === 'resolved').length}</h3>
            <p>Resolved</p>
          </div>
        </div>
      </div>

      <div className="queries-list">
        {filteredQueries.map(query => (
          <div key={query.id} className="query-card">
            <div className="query-header">
              <div className="query-id-status">
                <strong>{query.id}</strong>
                <span className={`status-badge status-${query.status}`}>
                  {getStatusIcon(query.status)}
                  {query.status}
                </span>
              </div>
              <span className="query-date">{new Date(query.date).toLocaleDateString()}</span>
            </div>
            <div className="query-customer">
              <h3>{query.name}</h3>
              <div className="contact-info">
                <p><Mail size={14} /> {query.email}</p>
                <p><Phone size={14} /> {query.mobile}</p>
              </div>
            </div>
            <div className="query-content">
              <h4>{query.subject}</h4>
              <p>{query.message}</p>
            </div>
            <div className="query-actions">
              <button className="btn btn-outline btn-small">Reply</button>
              <button className="btn btn-outline btn-small">Mark as Resolved</button>
              <button className="btn btn-primary btn-small">View Full Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Queries


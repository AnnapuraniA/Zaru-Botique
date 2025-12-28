import { useState } from 'react'
import { Search, Package, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

function Returns() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const returns = [
    { 
      id: 'RET-001', 
      orderId: 'ORD-001', 
      customer: 'Priya Sharma', 
      product: 'Elegant Summer Dress', 
      reason: 'Size not fitting', 
      requestedAt: '2024-01-10', 
      status: 'pending',
      amount: 2499
    },
    { 
      id: 'RET-002', 
      orderId: 'ORD-002', 
      customer: 'Ananya Patel', 
      product: 'Designer Handbag', 
      reason: 'Defective item', 
      requestedAt: '2024-01-08', 
      status: 'approved',
      amount: 3499
    },
    { 
      id: 'RET-003', 
      orderId: 'ORD-003', 
      customer: 'Kavya Reddy', 
      product: 'Stylish Jeans', 
      reason: 'Changed mind', 
      requestedAt: '2024-01-12', 
      status: 'rejected',
      amount: 2799
    },
    { 
      id: 'RET-004', 
      orderId: 'ORD-004', 
      customer: 'Meera Singh', 
      product: 'Casual Summer Top', 
      reason: 'Wrong item received', 
      requestedAt: '2024-01-14', 
      status: 'refunded',
      amount: 1499
    }
  ]

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ret.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ret.customer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || ret.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateStatus = (id, newStatus) => {
    console.log(`Updating return ${id} to ${newStatus}`)
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock size={16} />
      case 'approved': return <CheckCircle size={16} />
      case 'rejected': return <XCircle size={16} />
      case 'refunded': return <CheckCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  const pendingCount = returns.filter(r => r.status === 'pending').length
  const approvedCount = returns.filter(r => r.status === 'approved').length

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Return & Refund Requests</h1>
          <p>Manage customer return and refund requests</p>
        </div>
      </div>

      <div className="returns-stats">
        <div className="stat-mini-card">
          <Package size={24} />
          <div>
            <h3>{returns.length}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        <div className="stat-mini-card warning">
          <Clock size={24} />
          <div>
            <h3>{pendingCount}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-mini-card success">
          <CheckCircle size={24} />
          <div>
            <h3>{approvedCount}</h3>
            <p>Approved</p>
          </div>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by Return ID, Order ID, or Customer..."
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
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Return ID</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Reason</th>
              <th>Amount</th>
              <th>Requested At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.map(ret => (
              <tr key={ret.id}>
                <td><strong>{ret.id}</strong></td>
                <td>{ret.orderId}</td>
                <td>{ret.customer}</td>
                <td>{ret.product}</td>
                <td>{ret.reason}</td>
                <td>₹{ret.amount.toLocaleString()}</td>
                <td>{new Date(ret.requestedAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${ret.status}`}>
                    {getStatusIcon(ret.status)}
                    {ret.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="View Details">
                      <Eye size={16} />
                    </button>
                    {ret.status === 'pending' && (
                      <>
                        <button 
                          className="btn-icon success" 
                          title="Approve"
                          onClick={() => updateStatus(ret.id, 'approved')}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          className="btn-icon danger" 
                          title="Reject"
                          onClick={() => updateStatus(ret.id, 'rejected')}
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    {ret.status === 'approved' && (
                      <button 
                        className="btn-icon success" 
                        title="Process Refund"
                        onClick={() => updateStatus(ret.id, 'refunded')}
                      >
                        Process Refund
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Returns


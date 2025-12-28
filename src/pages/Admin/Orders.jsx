import { useState } from 'react'
import { Search, Eye, Package, Truck, CheckCircle } from 'lucide-react'

function Orders() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const orders = [
    { id: 'ORD-001', customer: 'Priya Sharma', email: 'priya@example.com', mobile: '9876543210', amount: 3499, status: 'Processing', date: '2024-01-15', items: 2 },
    { id: 'ORD-002', customer: 'Ananya Patel', email: 'ananya@example.com', mobile: '9876543211', amount: 2499, status: 'Shipped', date: '2024-01-15', items: 1 },
    { id: 'ORD-003', customer: 'Kavya Reddy', email: 'kavya@example.com', mobile: '9876543212', amount: 1899, status: 'Delivered', date: '2024-01-14', items: 3 },
    { id: 'ORD-004', customer: 'Meera Singh', email: 'meera@example.com', mobile: '9876543213', amount: 4599, status: 'Processing', date: '2024-01-14', items: 1 },
    { id: 'ORD-005', customer: 'Sneha Kumar', email: 'sneha@example.com', mobile: '9876543214', amount: 1299, status: 'Shipped', date: '2024-01-13', items: 2 }
  ]

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusOptions = ['Processing', 'Shipped', 'Delivered', 'Cancelled']

  const updateOrderStatus = (orderId, newStatus) => {
    // Mock update
    console.log(`Updating order ${orderId} to ${newStatus}`)
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Orders</h1>
          <p>Manage and track customer orders</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
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
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="orders-stats">
        <div className="stat-mini-card">
          <Package size={24} />
          <div>
            <h3>{orders.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-mini-card">
          <Truck size={24} />
          <div>
            <h3>{orders.filter(o => o.status === 'Shipped').length}</h3>
            <p>Shipped</p>
          </div>
        </div>
        <div className="stat-mini-card">
          <CheckCircle size={24} />
          <div>
            <h3>{orders.filter(o => o.status === 'Delivered').length}</h3>
            <p>Delivered</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td><strong>{order.id}</strong></td>
                <td>{order.customer}</td>
                <td>
                  <div className="contact-info">
                    <p>{order.mobile}</p>
                    <p className="text-muted">{order.email}</p>
                  </div>
                </td>
                <td>{order.items}</td>
                <td>₹{order.amount.toLocaleString()}</td>
                <td>
                  <select
                    className={`status-select status-${order.status.toLowerCase()}`}
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td>{new Date(order.date).toLocaleDateString()}</td>
                <td>
                  <button className="btn-icon" title="View Details">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Orders


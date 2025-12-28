import { useState } from 'react'
import { Search, Eye, Mail, Phone, Package, Calendar, Users } from 'lucide-react'

function Customers() {
  const [searchQuery, setSearchQuery] = useState('')

  const customers = [
    { id: 'CUST-001', name: 'Priya Sharma', email: 'priya@example.com', mobile: '9876543210', orders: 5, totalSpent: 12499, joined: '2023-06-15', status: 'active' },
    { id: 'CUST-002', name: 'Ananya Patel', email: 'ananya@example.com', mobile: '9876543211', orders: 3, totalSpent: 8999, joined: '2023-08-20', status: 'active' },
    { id: 'CUST-003', name: 'Kavya Reddy', email: 'kavya@example.com', mobile: '9876543212', orders: 8, totalSpent: 18999, joined: '2023-05-10', status: 'active' },
    { id: 'CUST-004', name: 'Meera Singh', email: 'meera@example.com', mobile: '9876543213', orders: 2, totalSpent: 4599, joined: '2023-11-05', status: 'active' },
    { id: 'CUST-005', name: 'Sneha Kumar', email: 'sneha@example.com', mobile: '9876543214', orders: 1, totalSpent: 1299, joined: '2024-01-01', status: 'active' }
  ]

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.mobile.includes(searchQuery)
  )

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
            <h3>{customers.reduce((sum, c) => sum + c.orders, 0)}</h3>
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
            {filteredCustomers.map(customer => (
              <tr key={customer.id}>
                <td><strong>{customer.id}</strong></td>
                <td>{customer.name}</td>
                <td>
                  <div className="contact-info">
                    <p><Phone size={14} /> {customer.mobile}</p>
                    <p className="text-muted"><Mail size={14} /> {customer.email}</p>
                  </div>
                </td>
                <td>{customer.orders}</td>
                <td>₹{customer.totalSpent.toLocaleString()}</td>
                <td>{new Date(customer.joined).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${customer.status}`}>
                    {customer.status}
                  </span>
                </td>
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

export default Customers


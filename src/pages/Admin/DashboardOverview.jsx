import { useState, useEffect } from 'react'
import { Package, ShoppingBag, Users, TrendingUp, DollarSign, AlertCircle, ArrowUp, ArrowDown, MessageSquare } from 'lucide-react'

function DashboardOverview() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0
  })

  useEffect(() => {
    // Mock data loading
    setStats({
      totalRevenue: 2456789,
      totalOrders: 1245,
      totalCustomers: 3420,
      totalProducts: 156,
      revenueChange: 12.5,
      ordersChange: 8.3
    })
  }, [])

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${(stats.totalRevenue / 100000).toFixed(2)}L`,
      change: stats.revenueChange,
      icon: DollarSign,
      color: 'success'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: stats.ordersChange,
      icon: ShoppingBag,
      color: 'primary'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      change: 15.2,
      icon: Users,
      color: 'info'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      change: -2.1,
      icon: Package,
      color: 'warning'
    }
  ]

  const recentOrders = [
    { id: 'ORD-001', customer: 'Priya Sharma', amount: 3499, status: 'Processing', date: '2024-01-15' },
    { id: 'ORD-002', customer: 'Ananya Patel', amount: 2499, status: 'Shipped', date: '2024-01-15' },
    { id: 'ORD-003', customer: 'Kavya Reddy', amount: 1899, status: 'Delivered', date: '2024-01-14' },
    { id: 'ORD-004', customer: 'Meera Singh', amount: 4599, status: 'Processing', date: '2024-01-14' },
    { id: 'ORD-005', customer: 'Sneha Kumar', amount: 1299, status: 'Shipped', date: '2024-01-13' }
  ]

  const topProducts = [
    { name: 'Elegant Summer Dress', sales: 245, revenue: 245000 },
    { name: 'Designer Handbag', sales: 189, revenue: 378000 },
    { name: 'Stylish Jeans', sales: 156, revenue: 280800 },
    { name: 'Casual Summer Top', sales: 134, revenue: 120600 },
    { name: 'Trendy Blazer', sales: 98, revenue: 244902 }
  ]

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const isPositive = stat.change > 0
          return (
            <div key={index} className="stat-card">
              <div className="stat-card-header">
                <div className={`stat-icon stat-icon-${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <div className="stat-card-body">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts and Tables Row */}
      <div className="dashboard-content-grid">
        {/* Revenue Chart Placeholder */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Revenue Overview</h2>
            <select className="period-select">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="chart-placeholder">
            <div className="chart-bars">
              {[65, 80, 45, 90, 70, 85, 95].map((height, idx) => (
                <div key={idx} className="chart-bar" style={{ height: `${height}%` }}></div>
              ))}
            </div>
            <div className="chart-labels">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Top Selling Products</h2>
          </div>
          <div className="top-products-list">
            {topProducts.map((product, index) => (
              <div key={index} className="top-product-item">
                <div className="product-rank">#{index + 1}</div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>{product.sales} sales</p>
                </div>
                <div className="product-revenue">₹{product.revenue.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2>Recent Orders</h2>
          <button className="btn btn-outline btn-small">View All</button>
        </div>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong></td>
                  <td>{order.customer}</td>
                  <td>₹{order.amount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-link">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      <div className="dashboard-alerts">
        <div className="alert-card warning">
          <AlertCircle size={20} />
          <div>
            <h4>Low Stock Alert</h4>
            <p>5 products are running low on stock</p>
          </div>
          <button className="btn btn-outline btn-small">View</button>
        </div>
        <div className="alert-card info">
          <MessageSquare size={20} />
          <div>
            <h4>New Queries</h4>
            <p>3 customer queries need attention</p>
          </div>
          <button className="btn btn-outline btn-small">View</button>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview


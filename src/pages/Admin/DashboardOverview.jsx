import { useState, useEffect } from 'react'
import { Package, ShoppingBag, Users, TrendingUp, DollarSign, AlertCircle, ArrowUp, ArrowDown, MessageSquare } from 'lucide-react'
import { adminDashboardAPI } from '../../utils/adminApi'
import { useToast } from '../../components/Toast/ToastContainer'

function DashboardOverview() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { error: showError } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, ordersData, productsData] = await Promise.all([
        adminDashboardAPI.getStats(),
        adminDashboardAPI.getRecentOrders(5),
        adminDashboardAPI.getTopProducts()
      ])

      setStats({
        totalRevenue: statsData.totalRevenue || 0,
        totalOrders: statsData.totalOrders || 0,
        totalCustomers: statsData.totalCustomers || 0,
        totalProducts: statsData.totalProducts || 0,
        revenueChange: statsData.revenueChange || 0,
        ordersChange: statsData.ordersChange || 0
      })
      setRecentOrders(ordersData || [])
      setTopProducts(productsData || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      showError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

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
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : topProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>No sales data yet</div>
            ) : (
              topProducts.map((product, index) => (
                <div key={index} className="top-product-item">
                  <div className="product-rank">#{index + 1}</div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <p>{product.sales} sales</p>
                  </div>
                  <div className="product-revenue">₹{product.revenue.toLocaleString()}</div>
                </div>
              ))
            )}
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
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading...
                  </td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => (
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
                ))
              )}
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


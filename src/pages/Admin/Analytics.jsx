import { useState } from 'react'
import { TrendingUp, DollarSign, ShoppingBag, Users, Download } from 'lucide-react'

function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30days')

  const analytics = {
    revenue: {
      total: 2456789,
      change: 12.5,
      chart: [120000, 150000, 180000, 200000, 220000, 240000, 245678]
    },
    orders: {
      total: 1245,
      change: 8.3,
      chart: [150, 180, 200, 220, 240, 260, 280]
    },
    customers: {
      total: 3420,
      change: 15.2,
      chart: [300, 320, 340, 360, 380, 400, 420]
    },
    averageOrder: {
      value: 1973,
      change: -2.1
    }
  }

  const topProducts = [
    { name: 'Elegant Summer Dress', sales: 245, revenue: 245000, growth: 15.5 },
    { name: 'Designer Handbag', sales: 189, revenue: 378000, growth: 22.3 },
    { name: 'Stylish Jeans', sales: 156, revenue: 280800, growth: 8.7 },
    { name: 'Casual Summer Top', sales: 134, revenue: 120600, growth: -5.2 },
    { name: 'Trendy Blazer', sales: 98, revenue: 244902, growth: 18.9 }
  ]

  const topCategories = [
    { name: 'Dresses', revenue: 856000, orders: 456, percentage: 35 },
    { name: 'Tops', revenue: 642000, orders: 342, percentage: 26 },
    { name: 'Accessories', revenue: 478000, orders: 234, percentage: 19 },
    { name: 'Bottoms', revenue: 312000, orders: 156, percentage: 13 },
    { name: 'Outerwear', revenue: 168000, orders: 84, percentage: 7 }
  ]

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Analytics & Reports</h1>
          <p>View sales performance and business insights</p>
        </div>
        <div className="header-actions">
          <select 
            className="period-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 3 months</option>
            <option value="1year">Last year</option>
          </select>
          <button className="btn btn-outline">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="analytics-metrics">
        <div className="metric-card">
          <div className="metric-header">
            <DollarSign size={24} />
            <span className={`metric-change positive`}>+{analytics.revenue.change}%</span>
          </div>
          <h2>₹{(analytics.revenue.total / 100000).toFixed(2)}L</h2>
          <p>Total Revenue</p>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <ShoppingBag size={24} />
            <span className={`metric-change positive`}>+{analytics.orders.change}%</span>
          </div>
          <h2>{analytics.orders.total.toLocaleString()}</h2>
          <p>Total Orders</p>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <Users size={24} />
            <span className={`metric-change positive`}>+{analytics.customers.change}%</span>
          </div>
          <h2>{analytics.customers.total.toLocaleString()}</h2>
          <p>Total Customers</p>
        </div>
        <div className="metric-card">
          <div className="metric-header">
            <TrendingUp size={24} />
            <span className={`metric-change negative`}>{analytics.averageOrder.change}%</span>
          </div>
          <h2>₹{analytics.averageOrder.value}</h2>
          <p>Average Order Value</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="analytics-charts-grid">
        <div className="chart-card">
          <h3>Revenue Trend</h3>
          <div className="chart-container">
            <div className="line-chart">
              {analytics.revenue.chart.map((value, idx) => (
                <div key={idx} className="chart-point" style={{ bottom: `${(value / 250000) * 100}%` }}></div>
              ))}
            </div>
          </div>
        </div>
        <div className="chart-card">
          <h3>Orders Trend</h3>
          <div className="chart-container">
            <div className="bar-chart">
              {analytics.orders.chart.map((value, idx) => (
                <div key={idx} className="chart-bar" style={{ height: `${(value / 300) * 100}%` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products & Categories */}
      <div className="analytics-tables-grid">
        <div className="analytics-table-card">
          <h3>Top Selling Products</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Sales</th>
                <th>Revenue</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, idx) => (
                <tr key={idx}>
                  <td>{product.name}</td>
                  <td>{product.sales}</td>
                  <td>₹{product.revenue.toLocaleString()}</td>
                  <td>
                    <span className={product.growth > 0 ? 'growth-positive' : 'growth-negative'}>
                      {product.growth > 0 ? '+' : ''}{product.growth}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="analytics-table-card">
          <h3>Category Performance</h3>
          <div className="category-performance">
            {topCategories.map((category, idx) => (
              <div key={idx} className="category-performance-item">
                <div className="category-header-row">
                  <span className="category-name">{category.name}</span>
                  <span className="category-revenue">₹{(category.revenue / 1000).toFixed(0)}K</span>
                </div>
                <div className="category-bar">
                  <div 
                    className="category-bar-fill" 
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <div className="category-stats">
                  <span>{category.orders} orders</span>
                  <span>{category.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics


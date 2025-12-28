import { useState } from 'react'
import { Download, FileText, Calendar, TrendingUp, DollarSign } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'

function Reports() {
  const { success } = useToast()
  const [reportType, setReportType] = useState('orders')
  const [dateRange, setDateRange] = useState('30days')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const reportTypes = [
    { id: 'orders', label: 'Orders Report', icon: FileText },
    { id: 'products', label: 'Products Report', icon: TrendingUp },
    { id: 'customers', label: 'Customers Report', icon: DollarSign },
    { id: 'sales', label: 'Sales Report', icon: DollarSign },
    { id: 'inventory', label: 'Inventory Report', icon: FileText }
  ]

  const handleExport = (format) => {
    const reportName = reportTypes.find(r => r.id === reportType)?.label || 'Report'
    const dateStr = dateRange === 'custom' 
      ? `${startDate}_to_${endDate}` 
      : dateRange
    
    // Simulate export
    setTimeout(() => {
      success(`${reportName} exported as ${format.toUpperCase()} successfully`)
    }, 500)
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Reports & Export</h1>
          <p>Generate and export reports in various formats</p>
        </div>
      </div>

      <div className="reports-container">
        <div className="reports-sidebar">
          <h3>Report Type</h3>
          <div className="report-type-list">
            {reportTypes.map(type => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  className={`report-type-btn ${reportType === type.id ? 'active' : ''}`}
                  onClick={() => setReportType(type.id)}
                >
                  <Icon size={20} />
                  <span>{type.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="reports-content">
          <div className="report-settings-card">
            <h3>Report Settings</h3>
            
            <div className="form-group">
              <label>Date Range</label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="filter-select"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 3 months</option>
                <option value="1year">Last year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateRange === 'custom' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Export Format</label>
              <div className="export-format-buttons">
                <button className="btn btn-outline" onClick={() => handleExport('csv')}>
                  <Download size={18} />
                  Export CSV
                </button>
                <button className="btn btn-outline" onClick={() => handleExport('excel')}>
                  <Download size={18} />
                  Export Excel
                </button>
                <button className="btn btn-outline" onClick={() => handleExport('pdf')}>
                  <Download size={18} />
                  Export PDF
                </button>
              </div>
            </div>

            <div className="report-preview">
              <h4>Report Preview</h4>
              <div className="preview-content">
                <p><strong>Report Type:</strong> {reportTypes.find(r => r.id === reportType)?.label}</p>
                <p><strong>Date Range:</strong> {
                  dateRange === 'custom' 
                    ? `${startDate || 'Start'} to ${endDate || 'End'}`
                    : dateRange.replace('days', ' days').replace('year', ' year')
                }</p>
                <p><strong>Estimated Records:</strong> 1,245</p>
                <p className="text-muted">Click export to generate the report</p>
              </div>
            </div>
          </div>

          <div className="report-info-card">
            <h3>Report Information</h3>
            <div className="info-list">
              <div className="info-item">
                <strong>Orders Report:</strong>
                <p>Includes order details, customer information, payment status, and shipping information.</p>
              </div>
              <div className="info-item">
                <strong>Products Report:</strong>
                <p>Product listings, stock levels, sales performance, and category breakdown.</p>
              </div>
              <div className="info-item">
                <strong>Customers Report:</strong>
                <p>Customer accounts, purchase history, total spending, and registration dates.</p>
              </div>
              <div className="info-item">
                <strong>Sales Report:</strong>
                <p>Revenue breakdown, sales trends, top-selling products, and performance metrics.</p>
              </div>
              <div className="info-item">
                <strong>Inventory Report:</strong>
                <p>Stock levels, low stock alerts, inventory movements, and product availability.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports


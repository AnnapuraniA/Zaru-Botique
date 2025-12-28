import { useState } from 'react'
import { Search, AlertTriangle, Package, Edit } from 'lucide-react'

function Inventory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('')

  const inventory = [
    { id: 1, name: 'Elegant Summer Dress', sku: 'PRD-001', category: 'Women - Dresses', stock: 45, lowStockThreshold: 20, status: 'in-stock' },
    { id: 2, name: 'Designer Handbag', sku: 'PRD-002', category: 'Women - Accessories', stock: 23, lowStockThreshold: 15, status: 'low-stock' },
    { id: 3, name: 'Stylish Jeans', sku: 'PRD-003', category: 'Women - Bottoms', stock: 12, lowStockThreshold: 20, status: 'low-stock' },
    { id: 4, name: 'Casual Summer Top', sku: 'PRD-004', category: 'Teen - Tops', stock: 0, lowStockThreshold: 10, status: 'out-of-stock' },
    { id: 5, name: 'Trendy Blazer', sku: 'PRD-005', category: 'Women - Outerwear', stock: 8, lowStockThreshold: 15, status: 'low-stock' },
    { id: 6, name: 'Floral Print Dress', sku: 'PRD-006', category: 'Girls - Dresses', stock: 67, lowStockThreshold: 25, status: 'in-stock' }
  ]

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStock = !stockFilter || item.status === stockFilter
    return matchesSearch && matchesStock
  })

  const lowStockItems = inventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock')
  const outOfStockItems = inventory.filter(item => item.status === 'out-of-stock')

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Monitor and manage product stock levels</p>
        </div>
      </div>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <div className="inventory-alerts">
          {outOfStockItems.length > 0 && (
            <div className="alert-card danger">
              <AlertTriangle size={20} />
              <div>
                <h4>Out of Stock</h4>
                <p>{outOfStockItems.length} product(s) are out of stock</p>
              </div>
            </div>
          )}
          {inventory.filter(item => item.status === 'low-stock').length > 0 && (
            <div className="alert-card warning">
              <AlertTriangle size={20} />
              <div>
                <h4>Low Stock Alert</h4>
                <p>{inventory.filter(item => item.status === 'low-stock').length} product(s) are running low</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="filter-select"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="">All Stock Status</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      <div className="inventory-stats">
        <div className="stat-mini-card">
          <Package size={24} />
          <div>
            <h3>{inventory.length}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-mini-card success">
          <Package size={24} />
          <div>
            <h3>{inventory.filter(i => i.status === 'in-stock').length}</h3>
            <p>In Stock</p>
          </div>
        </div>
        <div className="stat-mini-card warning">
          <AlertTriangle size={24} />
          <div>
            <h3>{inventory.filter(i => i.status === 'low-stock').length}</h3>
            <p>Low Stock</p>
          </div>
        </div>
        <div className="stat-mini-card danger">
          <AlertTriangle size={24} />
          <div>
            <h3>{inventory.filter(i => i.status === 'out-of-stock').length}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Low Stock Threshold</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => (
              <tr key={item.id}>
                <td><strong>{item.sku}</strong></td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>
                  <span className={item.stock === 0 ? 'stock-zero' : item.stock < item.lowStockThreshold ? 'stock-low' : ''}>
                    {item.stock}
                  </span>
                </td>
                <td>{item.lowStockThreshold}</td>
                <td>
                  <span className={`status-badge status-${item.status}`}>
                    {item.status === 'in-stock' ? 'In Stock' : item.status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td>
                  <button className="btn-icon" title="Update Stock">
                    <Edit size={16} />
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

export default Inventory


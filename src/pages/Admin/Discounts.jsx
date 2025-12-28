import { useState } from 'react'
import { Plus, Search, Edit, Trash2, X } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'

function Discounts() {
  const { success } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState(null)

  const [discounts, setDiscounts] = useState([
    { 
      id: 1, 
      code: 'SUMMER20', 
      name: 'Summer Sale 20%', 
      type: 'percentage', 
      value: 20, 
      minOrder: 1000, 
      maxDiscount: 500, 
      usageLimit: 100, 
      used: 45, 
      startDate: '2024-01-01', 
      endDate: '2024-03-31', 
      status: 'active' 
    },
    { 
      id: 2, 
      code: 'FLAT500', 
      name: 'Flat ₹500 Off', 
      type: 'fixed', 
      value: 500, 
      minOrder: 2000, 
      maxDiscount: 500, 
      usageLimit: 50, 
      used: 12, 
      startDate: '2024-01-15', 
      endDate: '2024-02-15', 
      status: 'active' 
    },
    { 
      id: 3, 
      code: 'NEWUSER', 
      name: 'New User Discount', 
      type: 'percentage', 
      value: 15, 
      minOrder: 500, 
      maxDiscount: null, 
      usageLimit: 1, 
      used: 234, 
      startDate: '2024-01-01', 
      endDate: '2024-12-31', 
      status: 'active' 
    }
  ])

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'percentage',
    value: '',
    minOrder: '',
    maxDiscount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    status: 'active'
  })

  const filteredDiscounts = discounts.filter(discount =>
    discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discount.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    if (!formData.code || !formData.name || !formData.value) {
      alert('Please fill in all required fields')
      return
    }
    const newDiscount = {
      id: discounts.length + 1,
      ...formData,
      value: parseFloat(formData.value),
      minOrder: parseFloat(formData.minOrder) || 0,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      usageLimit: parseFloat(formData.usageLimit) || null,
      used: 0
    }
    setDiscounts([...discounts, newDiscount])
    setShowAddModal(false)
    setFormData({
      code: '',
      name: '',
      type: 'percentage',
      value: '',
      minOrder: '',
      maxDiscount: '',
      usageLimit: '',
      startDate: '',
      endDate: '',
      status: 'active'
    })
    success('Discount added successfully')
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      setDiscounts(discounts.filter(d => d.id !== id))
      success('Discount deleted successfully')
    }
  }

  const handleToggleStatus = (id) => {
    setDiscounts(discounts.map(d => 
      d.id === id ? { ...d, status: d.status === 'active' ? 'inactive' : 'active' } : d
    ))
    success('Discount status updated')
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Discounts & Promotions</h1>
          <p>Manage discount codes and promotional offers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Add Discount
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search discounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Usage</th>
              <th>Validity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDiscounts.map(discount => (
              <tr key={discount.id}>
                <td><strong className="discount-code">{discount.code}</strong></td>
                <td>{discount.name}</td>
                <td>
                  <span className="badge-type">{discount.type === 'percentage' ? 'Percentage' : 'Fixed'}</span>
                </td>
                <td>
                  {discount.type === 'percentage' ? (
                    <span>{discount.value}% {discount.maxDiscount && `(Max ₹${discount.maxDiscount})`}</span>
                  ) : (
                    <span>₹{discount.value}</span>
                  )}
                </td>
                <td>₹{discount.minOrder.toLocaleString()}</td>
                <td>
                  {discount.used} / {discount.usageLimit || '∞'}
                </td>
                <td>
                  <div className="date-range">
                    <p>{new Date(discount.startDate).toLocaleDateString()}</p>
                    <p className="text-muted">to</p>
                    <p>{new Date(discount.endDate).toLocaleDateString()}</p>
                  </div>
                </td>
                <td>
                  <button
                    className={`status-toggle ${discount.status}`}
                    onClick={() => handleToggleStatus(discount.id)}
                  >
                    {discount.status}
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Edit" onClick={() => setEditingDiscount(discount)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(discount.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Discount</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Discount Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER20"
                  required
                />
              </div>
              <div className="form-group">
                <label>Discount Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Summer Sale 20%"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Discount Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'percentage' ? '20' : '500'}
                    required
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Order (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                    placeholder="1000"
                    min="0"
                  />
                </div>
                {formData.type === 'percentage' && (
                  <div className="form-group">
                    <label>Max Discount (₹)</label>
                    <input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      placeholder="500"
                      min="0"
                    />
                  </div>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Discount</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Discounts


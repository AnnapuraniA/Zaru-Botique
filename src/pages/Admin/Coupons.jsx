import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Copy, X } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'

function Coupons() {
  const { success } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const [coupons, setCoupons] = useState([
    { 
      id: 1, 
      code: 'WELCOME10', 
      description: '10% off for new customers', 
      discount: 10, 
      type: 'percentage', 
      minPurchase: 1000, 
      maxDiscount: 200, 
      validFrom: '2024-01-01', 
      validUntil: '2024-12-31', 
      usageLimit: 1000, 
      used: 234, 
      status: 'active' 
    },
    { 
      id: 2, 
      code: 'SAVE500', 
      description: 'Flat ₹500 off on orders above ₹3000', 
      discount: 500, 
      type: 'fixed', 
      minPurchase: 3000, 
      maxDiscount: 500, 
      validFrom: '2024-01-15', 
      validUntil: '2024-02-15', 
      usageLimit: 500, 
      used: 89, 
      status: 'active' 
    },
    { 
      id: 3, 
      code: 'FREESHIP', 
      description: 'Free shipping on all orders', 
      discount: 0, 
      type: 'free_shipping', 
      minPurchase: 0, 
      maxDiscount: null, 
      validFrom: '2024-01-01', 
      validUntil: '2024-06-30', 
      usageLimit: null, 
      used: 456, 
      status: 'active' 
    }
  ])

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    discount: '',
    minPurchase: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    status: 'active'
  })

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    if (!formData.code || !formData.description) {
      alert('Please fill in all required fields')
      return
    }
    const newCoupon = {
      id: coupons.length + 1,
      ...formData,
      discount: parseFloat(formData.discount) || 0,
      minPurchase: parseFloat(formData.minPurchase) || 0,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      usageLimit: formData.usageLimit ? parseFloat(formData.usageLimit) : null,
      used: 0
    }
    setCoupons([...coupons, newCoupon])
    setShowAddModal(false)
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      discount: '',
      minPurchase: '',
      maxDiscount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      status: 'active'
    })
    success('Coupon code added successfully')
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this coupon code?')) {
      setCoupons(coupons.filter(c => c.id !== id))
      success('Coupon deleted successfully')
    }
  }

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
    success('Coupon code copied!')
  }

  const handleToggleStatus = (id) => {
    setCoupons(coupons.map(c => 
      c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
    ))
    success('Coupon status updated')
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Coupon Codes</h1>
          <p>Create and manage discount coupon codes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Add Coupon
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search coupons..."
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
              <th>Coupon Code</th>
              <th>Description</th>
              <th>Type</th>
              <th>Discount</th>
              <th>Min Purchase</th>
              <th>Usage</th>
              <th>Validity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.map(coupon => (
              <tr key={coupon.id}>
                <td>
                  <div className="coupon-code-cell">
                    <strong className="coupon-code">{coupon.code}</strong>
                    <button 
                      className="btn-icon-small" 
                      onClick={() => handleCopy(coupon.code)}
                      title="Copy code"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </td>
                <td>{coupon.description}</td>
                <td>
                  <span className="badge-type">
                    {coupon.type === 'percentage' ? 'Percentage' : 
                     coupon.type === 'fixed' ? 'Fixed' : 'Free Shipping'}
                  </span>
                </td>
                <td>
                  {coupon.type === 'percentage' ? (
                    <span>{coupon.discount}% {coupon.maxDiscount && `(Max ₹${coupon.maxDiscount})`}</span>
                  ) : coupon.type === 'fixed' ? (
                    <span>₹{coupon.discount}</span>
                  ) : (
                    <span>Free Shipping</span>
                  )}
                </td>
                <td>₹{coupon.minPurchase.toLocaleString()}</td>
                <td>
                  {coupon.used} / {coupon.usageLimit || '∞'}
                </td>
                <td>
                  <div className="date-range">
                    <p>{new Date(coupon.validFrom).toLocaleDateString()}</p>
                    <p className="text-muted">to</p>
                    <p>{new Date(coupon.validUntil).toLocaleDateString()}</p>
                  </div>
                </td>
                <td>
                  <button
                    className={`status-toggle ${coupon.status}`}
                    onClick={() => handleToggleStatus(coupon.id)}
                  >
                    {coupon.status}
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(coupon.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Coupon</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="WELCOME10"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="10% off for new customers"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Coupon Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                {formData.type !== 'free_shipping' && (
                  <div className="form-group">
                    <label>Discount Value *</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      placeholder={formData.type === 'percentage' ? '10' : '500'}
                      required
                      min="0"
                    />
                  </div>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Purchase (₹)</label>
                  <input
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
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
                      placeholder="200"
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
                  <label>Valid From</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Valid Until</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Coupon</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Coupons


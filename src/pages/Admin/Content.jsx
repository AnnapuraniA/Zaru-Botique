import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Check, Package, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'
import { adminContentAPI, adminProductsAPI, adminNewArrivalsAPI } from '../../utils/adminApi'
import { getImageUrl } from '../../utils/api'

function Content() {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showProductModal, setShowProductModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // New Arrivals state
  const [newArrivals, setNewArrivals] = useState([])
  const [loadingArrivals, setLoadingArrivals] = useState(true)
  const [showArrivalModal, setShowArrivalModal] = useState(false)
  const [editingArrival, setEditingArrival] = useState(null)
  const [arrivalForm, setArrivalForm] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    link: '',
    image: null,
    imagePreview: null
  })

  useEffect(() => {
    loadFeaturedProducts()
    loadNewArrivals()
  }, [])

  useEffect(() => {
    if (showProductModal) {
      loadAllProducts()
    }
  }, [showProductModal])

  useEffect(() => {
    if (searchQuery) {
      const filtered = allProducts.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(allProducts)
    }
  }, [searchQuery, allProducts])

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true)
      const data = await adminContentAPI.getFeaturedProducts()
      const ids = data.productIds || []
      setSelectedProductIds(ids)
      
      // Load selected product details
      if (ids.length > 0) {
        const productsPromises = ids.map(id => 
          adminProductsAPI.getById(id).catch(() => null)
        )
        const products = await Promise.all(productsPromises)
        setSelectedProducts(products.filter(p => p !== null))
      } else {
        setSelectedProducts([])
      }
    } catch (err) {
      console.error('Error loading featured products:', err)
      showError('Failed to load featured products')
    } finally {
      setLoading(false)
    }
  }

  const loadAllProducts = async () => {
    try {
      const data = await adminProductsAPI.getAll({ limit: 1000 })
      setAllProducts(data.products || [])
      setFilteredProducts(data.products || [])
    } catch (err) {
      console.error('Error loading products:', err)
      showError('Failed to load products')
    }
  }

  const handleProductSelect = (productId) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== productId))
    } else {
      if (selectedProductIds.length >= 4) {
        showError('You can only select up to 4 featured products')
        return
      }
      setSelectedProductIds([...selectedProductIds, productId])
    }
  }


  const handleSave = async () => {
    try {
      setSaving(true)
      await adminContentAPI.updateFeaturedProducts(selectedProductIds)
      success('Featured products saved successfully')
      await loadFeaturedProducts() // Reload to get updated product details
      setShowProductModal(false)
    } catch (err) {
      console.error('Error saving featured products:', err)
      showError('Failed to save featured products')
    } finally {
      setSaving(false)
    }
  }

  // New Arrivals functions
  const loadNewArrivals = async () => {
    try {
      setLoadingArrivals(true)
      const data = await adminNewArrivalsAPI.getAll()
      setNewArrivals(data || [])
    } catch (err) {
      console.error('Error loading new arrivals:', err)
      showError('Failed to load new arrivals')
    } finally {
      setLoadingArrivals(false)
    }
  }

  const handleAddArrival = () => {
    setEditingArrival(null)
    setArrivalForm({
      title: '',
      description: '',
      price: '',
      originalPrice: '',
      link: '',
      image: null,
      imagePreview: null
    })
    setShowArrivalModal(true)
  }

  const handleEditArrival = (arrival) => {
    setEditingArrival(arrival)
    setArrivalForm({
      title: arrival.title || '',
      description: arrival.description || '',
      price: arrival.price || '',
      originalPrice: arrival.originalPrice || '',
      link: arrival.link || '',
      image: null,
      imagePreview: arrival.image ? getImageUrl(arrival.image) : null
    })
    setShowArrivalModal(true)
  }

  const handleDeleteArrival = async (id) => {
    if (!window.confirm('Are you sure you want to delete this new arrival?')) {
      return
    }
    try {
      await adminNewArrivalsAPI.delete(id)
      success('New arrival deleted successfully')
      await loadNewArrivals()
    } catch (err) {
      console.error('Error deleting new arrival:', err)
      showError('Failed to delete new arrival')
    }
  }

  const handleArrivalImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setArrivalForm(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }))
    }
  }

  const handleArrivalImageUrlChange = (e) => {
    const url = e.target.value
    setArrivalForm(prev => ({
      ...prev,
      image: url,
      imagePreview: url || null
    }))
  }

  const handleSaveArrival = async () => {
    try {
      if (!arrivalForm.title || !arrivalForm.price) {
        showError('Title and price are required')
        return
      }

      if (!arrivalForm.image && !arrivalForm.imagePreview) {
        showError('Image is required')
        return
      }

      setSaving(true)
      
      const formData = {
        title: arrivalForm.title,
        description: arrivalForm.description || '',
        price: arrivalForm.price,
        originalPrice: arrivalForm.originalPrice || '',
        link: arrivalForm.link || ''
      }

      // If image is a URL string, include it in formData
      if (typeof arrivalForm.image === 'string') {
        formData.image = arrivalForm.image
      }

      if (editingArrival) {
        await adminNewArrivalsAPI.update(editingArrival.id, formData, arrivalForm.image instanceof File ? arrivalForm.image : null)
        success('New arrival updated successfully')
      } else {
        await adminNewArrivalsAPI.create(formData, arrivalForm.image instanceof File ? arrivalForm.image : null)
        success('New arrival added successfully')
      }

      await loadNewArrivals()
      setShowArrivalModal(false)
      setEditingArrival(null)
      setArrivalForm({
        title: '',
        description: '',
        price: '',
        originalPrice: '',
        link: '',
        image: null,
        imagePreview: null
      })
    } catch (err) {
      console.error('Error saving new arrival:', err)
      showError('Failed to save new arrival')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Home Page Content</h1>
          <p>Manage home page sections and content</p>
        </div>
      </div>

      <div className="content-sections">
        {/* Featured Products Section */}
        <div className="content-section-card">
          <div className="section-header">
            <div>
              <h2>Collections</h2>
              <p className="section-note">Select up to 4 products to display in Collections section on the home page (3-4 cards per row)</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowProductModal(true)}
            >
              <Package size={18} />
              Select Products
            </button>
          </div>
          
          {loading ? (
            <p>Loading...</p>
          ) : selectedProducts.length > 0 ? (
            <div className="selected-products-preview">
              <p><strong>{selectedProducts.length} product(s) selected:</strong></p>
              <div className="selected-products-list">
                {selectedProducts.map(product => (
                  <div key={product.id} className="selected-product-item">
                    <img 
                      src={product.images?.[0] || product.image || '/placeholder.png'} 
                      alt={product.name}
                      className="product-thumb"
                    />
                    <span>{product.name}</span>
                    <button
                      className="btn-icon btn-small"
                      onClick={async () => {
                        const newIds = selectedProductIds.filter(id => id !== product.id)
                        setSelectedProductIds(newIds)
                        setSelectedProducts(selectedProducts.filter(p => p.id !== product.id))
                        // Auto-save when removing
                        try {
                          await adminContentAPI.updateFeaturedProducts(newIds)
                          success('Featured products updated')
                        } catch (err) {
                          console.error('Error updating featured products:', err)
                          showError('Failed to update featured products')
                        }
                      }}
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted">No featured products selected. Click "Select Products" to choose products.</p>
          )}
        </div>

        {/* New Arrivals Section */}
        <div className="content-section-card">
          <div className="section-header">
            <div>
              <h2>New Arrivals</h2>
              <p className="section-note">Add promotional items for the New Arrivals carousel. Minimum 5 items required, maximum unlimited. Items will auto-rotate every 5 seconds on the home page.</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={handleAddArrival}
            >
              <Plus size={18} />
              Add New Arrival
            </button>
          </div>
          
          {loadingArrivals ? (
            <p>Loading...</p>
          ) : newArrivals.length > 0 ? (
            <div className="new-arrivals-list">
              {newArrivals.length < 5 && (
                <div className="alert alert-warning">
                  <strong>Warning:</strong> Minimum 5 items required. Currently have {newArrivals.length} item(s).
                </div>
              )}
              <div className="arrivals-grid">
                {newArrivals.map(arrival => (
                  <div key={arrival.id} className="arrival-card">
                    <div className="arrival-image">
                      <img 
                        src={getImageUrl(arrival.image)} 
                        alt={arrival.title}
                      />
                    </div>
                    <div className="arrival-info">
                      <h4>{arrival.title}</h4>
                      <p className="arrival-price">₹{parseFloat(arrival.price).toLocaleString()}</p>
                      {arrival.visible ? (
                        <span className="badge badge-success">Visible</span>
                      ) : (
                        <span className="badge badge-secondary">Hidden</span>
                      )}
                    </div>
                    <div className="arrival-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleEditArrival(arrival)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => handleDeleteArrival(arrival.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted">No new arrivals added yet. Click "Add New Arrival" to get started.</p>
          )}
        </div>
      </div>

      {/* New Arrival Form Modal */}
      {showArrivalModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowArrivalModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingArrival ? 'Edit New Arrival' : 'Add New Arrival'}</h2>
              <button 
                className="btn-icon" 
                onClick={() => !saving && setShowArrivalModal(false)}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={arrivalForm.title}
                  onChange={(e) => setArrivalForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={arrivalForm.description}
                  onChange={(e) => setArrivalForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={arrivalForm.price}
                    onChange={(e) => setArrivalForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={arrivalForm.originalPrice}
                    onChange={(e) => setArrivalForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Link (Optional)</label>
                <input
                  type="text"
                  value={arrivalForm.link}
                  onChange={(e) => setArrivalForm(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="/products/..."
                />
              </div>

              <div className="form-group">
                <label>Image *</label>
                <div className="image-upload-section">
                  <div className="image-preview">
                    {arrivalForm.imagePreview ? (
                      <img src={arrivalForm.imagePreview} alt="Preview" />
                    ) : (
                      <div className="image-placeholder">
                        <ImageIcon size={48} />
                        <p>No image selected</p>
                      </div>
                    )}
                  </div>
                  <div className="image-upload-options">
                    <div className="form-group">
                      <label>Upload Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleArrivalImageChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Or Enter Image URL</label>
                      <input
                        type="text"
                        value={typeof arrivalForm.image === 'string' ? arrivalForm.image : ''}
                        onChange={handleArrivalImageUrlChange}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={() => setShowArrivalModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveArrival}
                disabled={saving}
              >
                {saving ? 'Saving...' : editingArrival ? 'Update' : 'Add'} New Arrival
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Collections Products (Max 4)</h2>
              <button 
                className="btn-icon" 
                onClick={() => setShowProductModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="search-box" style={{ marginBottom: '1.5rem' }}>
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="selected-count">
                <strong>{selectedProductIds.length} / 4 selected</strong>
              </div>

              <div className="products-selection-grid">
                {filteredProducts.map(product => {
                  const isSelected = selectedProductIds.includes(product.id)
                  return (
                    <div
                      key={product.id}
                      className={`product-selection-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleProductSelect(product.id)}
                    >
                      <div className="product-selection-check">
                        {isSelected && <Check size={20} />}
                      </div>
                      <img 
                        src={product.images?.[0] || product.image || '/placeholder.png'} 
                        alt={product.name}
                        className="product-selection-image"
                      />
                      <div className="product-selection-info">
                        <h4>{product.name}</h4>
                        <p>₹{product.price?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredProducts.length === 0 && (
                <p className="text-center text-muted">No products found</p>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={() => setShowProductModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSave}
                disabled={saving || selectedProductIds.length === 0}
              >
                {saving ? 'Saving...' : 'Save Collections'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Content


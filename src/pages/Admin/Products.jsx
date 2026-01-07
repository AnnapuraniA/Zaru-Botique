import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye, X } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'
import { adminProductsAPI, adminUploadAPI, adminCategoriesAPI } from '../../utils/adminApi'

function Products() {
  const location = useLocation()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [statusFilter])

  const loadCategories = async () => {
    try {
      const cats = await adminCategoriesAPI.getAll()
      setCategories(cats || [])
      
      // Flatten subcategories for easy lookup
      const allSubcats = []
      cats.forEach(cat => {
        if (cat.subcategories) {
          cat.subcategories.forEach(subcat => {
            allSubcats.push({ ...subcat, categoryId: cat.id })
          })
        }
      })
      setSubcategories(allSubcats)
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  // Debounce search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadProducts()
    }, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const filters = {}
      if (statusFilter) {
        filters.status = statusFilter
      }
      if (searchQuery) {
        filters.search = searchQuery
      }
      const data = await adminProductsAPI.getAll(filters)
      setProducts(data.products || [])
    } catch (err) {
      console.error('Error loading products:', err)
      showError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    const nameMatch = product.name?.toLowerCase().includes(searchLower)
    const categoryMatch = product.category?.name?.toLowerCase().includes(searchLower)
    const subcategoryMatch = product.subcategory?.name?.toLowerCase().includes(searchLower)
    
    return nameMatch || categoryMatch || subcategoryMatch
  })

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminProductsAPI.delete(id)
        await loadProducts()
        success('Product deleted successfully')
      } catch (err) {
        showError('Failed to delete product')
      }
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      await adminProductsAPI.toggleStatus(id)
      await loadProducts()
      success('Product status updated')
    } catch (err) {
      showError('Failed to update product status')
    }
  }

  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: '',
    subcategoryId: '',
    brand: 'Arudhra Fashions',
    price: '',
    originalPrice: '',
    stockCount: '',
    description: '',
    fullDescription: '',
    images: [],
    sizes: [],
    colors: [],
    material: '',
    care: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // Handle category change - reset subcategory
    if (name === 'categoryId') {
      setProductForm(prev => ({
        ...prev,
        categoryId: value,
        subcategoryId: '' // Reset subcategory when category changes
      }))
      return
    }
    
    if (type === 'checkbox') {
      if (name === 'sizes') {
        setProductForm(prev => ({
          ...prev,
          sizes: checked 
            ? [...prev.sizes, value]
            : prev.sizes.filter(s => s !== value)
        }))
      }
    } else {
      setProductForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    try {
      setIsSubmitting(true)
      // Upload files to server
      const result = await adminUploadAPI.uploadImages(files)
      
      // Add uploaded image URLs to form
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...result.images]
      }))
      
      success(`${files.length} image(s) uploaded successfully`)
    } catch (err) {
      showError(err.message || 'Failed to upload images')
    } finally {
      setIsSubmitting(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleRemoveImage = (index) => {
    const imageToRemove = productForm.images[index]
    // If it's an uploaded image (starts with /uploads), delete from server
    if (imageToRemove.startsWith('/uploads')) {
      adminUploadAPI.deleteImage(imageToRemove).catch(err => {
        console.error('Failed to delete image from server:', err)
      })
    }
    
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const productData = {
        ...productForm,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        stockCount: Number(productForm.stockCount),
        onSale: productForm.originalPrice && Number(productForm.originalPrice) > Number(productForm.price),
        inStock: Number(productForm.stockCount) > 0,
        isActive: true
      }
      
      if (isEditPage && editProductId) {
        await adminProductsAPI.update(editProductId, productData)
        success('Product updated successfully!')
      } else {
        await adminProductsAPI.create(productData)
        success('Product created successfully!')
      }
      navigate('/admin/products')
    } catch (err) {
      showError(isEditPage ? 'Failed to update product' : 'Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAddPage = location.pathname === '/admin/products/add'
  const isEditPage = location.pathname.startsWith('/admin/products/edit/')
  const editProductId = isEditPage ? location.pathname.split('/').pop() : null

  useEffect(() => {
    if (isEditPage && editProductId && !editingProduct) {
      loadProductForEdit(editProductId)
    }
  }, [isEditPage, editProductId])

  const loadProductForEdit = async (id) => {
    try {
      const product = await adminProductsAPI.getById(id)
      setEditingProduct(product)
      setProductForm({
        name: product.name || '',
        categoryId: product.categoryId || product.category?.id || '',
        subcategoryId: product.subcategoryId || product.subcategory?.id || '',
        brand: product.brand || 'Arudhra Fashions',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        stockCount: product.stockCount || '',
        description: product.description || '',
        fullDescription: product.fullDescription || '',
        images: product.images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        material: product.material || '',
        care: product.care || ''
      })
    } catch (err) {
      showError('Failed to load product for editing')
      navigate('/admin/products')
    }
  }

  if (isAddPage || isEditPage) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <button className="back-button" onClick={() => navigate('/admin/products')}>
            <X size={20} />
            Back
          </button>
          <h1>{isEditPage ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
        <div className="admin-form-container">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={productForm.name}
                    onChange={handleFormChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    name="categoryId"
                    value={productForm.categoryId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Subcategory *</label>
                  <select 
                    name="subcategoryId"
                    value={productForm.subcategoryId}
                    onChange={handleFormChange}
                    required
                    disabled={!productForm.categoryId}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories
                      .filter(sub => sub.categoryId === productForm.categoryId)
                      .map(subcat => (
                        <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input 
                    type="text" 
                    name="brand"
                    value={productForm.brand}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Pricing & Stock</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input 
                    type="number" 
                    name="price"
                    value={productForm.price}
                    onChange={handleFormChange}
                    required 
                    min="0" 
                  />
                </div>
                <div className="form-group">
                  <label>Original Price (₹)</label>
                  <input 
                    type="number" 
                    name="originalPrice"
                    value={productForm.originalPrice}
                    onChange={handleFormChange}
                    min="0" 
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input 
                    type="number" 
                    name="stockCount"
                    value={productForm.stockCount}
                    onChange={handleFormChange}
                    required 
                    min="0" 
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Product Images</h3>
              <div className="image-upload-area">
                <p>Enter image URLs (one per line) or upload files</p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageChange}
                />
                <textarea 
                  rows="3" 
                  placeholder="Or paste image URLs (one per line)"
                  onChange={(e) => {
                    const urls = e.target.value.split('\n').filter(url => url.trim())
                    setProductForm(prev => ({ ...prev, images: urls }))
                  }}
                />
                {productForm.images.length > 0 && (
                  <div className="image-preview">
                    {productForm.images.map((img, idx) => {
                      // Construct full URL for uploaded images
                      const imageUrl = img.startsWith('/uploads') 
                        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${img}`
                        : img
                      return (
                        <div key={idx} style={{ position: 'relative', display: 'inline-block', margin: '5px' }}>
                          <img 
                            src={imageUrl} 
                            alt={`Preview ${idx}`} 
                            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} 
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            style={{
                              position: 'absolute',
                              top: '5px',
                              right: '5px',
                              background: 'rgba(255, 0, 0, 0.7)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Remove image"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>Product Details</h3>
              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  rows="6" 
                  name="description"
                  value={productForm.description}
                  onChange={handleFormChange}
                  placeholder="Enter product description..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Full Description</label>
                <textarea 
                  rows="4" 
                  name="fullDescription"
                  value={productForm.fullDescription}
                  onChange={handleFormChange}
                  placeholder="Enter detailed description..."
                />
              </div>
              <div className="form-group">
                <label>Size Options *</label>
                <div className="checkbox-group">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <label key={size} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="sizes"
                        value={size}
                        checked={productForm.sizes.includes(size)}
                        onChange={handleFormChange}
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Material</label>
                  <input 
                    type="text" 
                    name="material"
                    value={productForm.material}
                    onChange={handleFormChange}
                    placeholder="e.g., 100% Cotton"
                  />
                </div>
                <div className="form-group">
                  <label>Care Instructions</label>
                  <input 
                    type="text" 
                    name="care"
                    value={productForm.care}
                    onChange={handleFormChange}
                    placeholder="e.g., Machine Wash Cold"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => navigate('/admin/products')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your product catalog</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/products/add')}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="filter-select">
          <option value="">All Categories</option>
          <option value="Women">Women</option>
          <option value="Teen">Teen</option>
          <option value="Girls">Girls</option>
        </select>
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading products...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product._id}>
                  <td>
                    <img src={product.images?.[0] || product.image || 'https://via.placeholder.com/50'} alt={product.name} className="table-image" />
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td>
                    {product.category?.name || 'N/A'} - {product.subcategory?.name || 'N/A'}
                  </td>
                  <td>₹{product.price.toLocaleString()}</td>
                  <td>
                    <span className={product.stockCount === 0 ? 'stock-low' : product.stockCount < 20 ? 'stock-warning' : ''}>
                      {product.stockCount || 0}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`status-toggle ${product.isActive ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleStatus(product._id)}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="View" onClick={() => navigate(`/product/${product._id}`)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon" title="Edit" onClick={() => navigate(`/admin/products/edit/${product._id || product.id}`)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(product._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="empty-state">
          <Package size={48} />
          <p>No products found</p>
        </div>
      )}
    </div>
  )
}

export default Products


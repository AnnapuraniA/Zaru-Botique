import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye, X } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'

function Products() {
  const location = useLocation()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // Mock products data
  const [products, setProducts] = useState([
    { id: 1, name: 'Elegant Summer Dress', category: 'Women', subcategory: 'Dresses', price: 2499, stock: 45, status: 'active', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop' },
    { id: 2, name: 'Designer Handbag', category: 'Women', subcategory: 'Accessories', price: 3499, stock: 23, status: 'active', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop' },
    { id: 3, name: 'Stylish Jeans', category: 'Women', subcategory: 'Bottoms', price: 2799, stock: 12, status: 'active', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop' },
    { id: 4, name: 'Casual Summer Top', category: 'Teen', subcategory: 'Tops', price: 1499, stock: 0, status: 'inactive', image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=500&fit=crop' },
    { id: 5, name: 'Trendy Blazer', category: 'Women', subcategory: 'Outerwear', price: 3999, stock: 8, status: 'active', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop' }
  ])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id))
      success('Product deleted successfully')
    }
  }

  const handleToggleStatus = (id) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
    ))
    success('Product status updated')
  }

  const isAddPage = location.pathname === '/admin/products/add'

  if (isAddPage) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <button className="back-button" onClick={() => navigate('/admin/products')}>
            <X size={20} />
            Back
          </button>
          <h1>Add New Product</h1>
        </div>
        <div className="admin-form-container">
          <form className="admin-form">
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input type="text" required />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select required>
                    <option value="">Select Category</option>
                    <option value="Women">Women</option>
                    <option value="Teen">Teen</option>
                    <option value="Girls">Girls</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Subcategory *</label>
                  <select required>
                    <option value="">Select Subcategory</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Tops">Tops</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input type="text" />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Pricing & Stock</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input type="number" required min="0" />
                </div>
                <div className="form-group">
                  <label>Original Price (₹)</label>
                  <input type="number" min="0" />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input type="number" required min="0" />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Product Images</h3>
              <div className="image-upload-area">
                <p>Click to upload or drag and drop</p>
                <input type="file" multiple accept="image/*" />
              </div>
            </div>

            <div className="form-section">
              <h3>Product Details</h3>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="6" placeholder="Enter product description..."></textarea>
              </div>
              <div className="form-group">
                <label>Size Options</label>
                <div className="checkbox-group">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <label key={size} className="checkbox-label">
                      <input type="checkbox" />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/products')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Product
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
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td>
                  <img src={product.image} alt={product.name} className="table-image" />
                </td>
                <td>
                  <strong>{product.name}</strong>
                </td>
                <td>{product.category} - {product.subcategory}</td>
                <td>₹{product.price.toLocaleString()}</td>
                <td>
                  <span className={product.stock === 0 ? 'stock-low' : product.stock < 20 ? 'stock-warning' : ''}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <button
                    className={`status-toggle ${product.status}`}
                    onClick={() => handleToggleStatus(product.id)}
                  >
                    {product.status}
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="View">
                      <Eye size={16} />
                    </button>
                    <button className="btn-icon" title="Edit" onClick={() => setEditingProduct(product)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(product.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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


import { Link, useNavigate } from 'react-router-dom'
import { X, Star, ShoppingCart, GitCompare } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { cartAPI, productsAPI, compareAPI } from '../utils/api'
import { useToast } from '../components/Toast/ToastContainer'

function Compare() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { success, error: showError } = useToast()
  const [compareItems, setCompareItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      loadCompareItems()
    } else {
      // For guests, use localStorage as fallback
      loadGuestCompareItems()
    }
  }, [isAuthenticated])

  const loadCompareItems = async () => {
    try {
      setLoading(true)
      const products = await compareAPI.getAll()
      setCompareItems(Array.isArray(products) ? products : [])
    } catch (err) {
      console.error('Failed to load compare items:', err)
      showError('Failed to load compare items')
      setCompareItems([])
    } finally {
      setLoading(false)
    }
  }

  const loadGuestCompareItems = async () => {
    try {
      setLoading(true)
      // Load compare items from localStorage for guests
      const compareIds = JSON.parse(localStorage.getItem('compareItems') || '[]')
      
      if (compareIds.length === 0) {
        setCompareItems([])
        setLoading(false)
        return
      }

      // Fetch product details for each compare item
      const productPromises = compareIds.map(id => 
        productsAPI.getById(id).catch(err => {
          console.error(`Failed to load product ${id}:`, err)
          return null
        })
      )
      
      const products = await Promise.all(productPromises)
      const validProducts = products.filter(p => p !== null)
      setCompareItems(validProducts)
    } catch (err) {
      console.error('Failed to load compare items:', err)
      showError('Failed to load compare items')
    } finally {
      setLoading(false)
    }
  }

  const removeFromCompare = async (id) => {
    if (!isAuthenticated) {
      // For guests, use localStorage
      const compareIds = JSON.parse(localStorage.getItem('compareItems') || '[]')
      const updatedIds = compareIds.filter(itemId => itemId !== id)
      localStorage.setItem('compareItems', JSON.stringify(updatedIds))
      
      // Update state
      setCompareItems(items => items.filter(item => {
        const itemId = item._id || item.id
        return itemId !== id
      }))
      
      // Dispatch event to update header count
      window.dispatchEvent(new Event('compareUpdated'))
      
      success('Removed from compare')
      return
    }

    try {
      // Remove from backend
      await compareAPI.remove(id)
      
      // Update state
      setCompareItems(items => items.filter(item => {
        const itemId = item._id || item.id
        return itemId !== id
      }))
      
      // Dispatch event to update header count
      window.dispatchEvent(new Event('compareUpdated'))
      
      success('Removed from compare')
    } catch (err) {
      console.error('Failed to remove from compare:', err)
      showError('Failed to remove from compare')
    }
  }

  const comparisonFields = [
    { key: 'price', label: 'Price' },
    { key: 'rating', label: 'Rating' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'brand', label: 'Brand' },
    { key: 'material', label: 'Material' },
    { key: 'care', label: 'Care Instructions' },
    { key: 'sizes', label: 'Available Sizes' },
    { key: 'colors', label: 'Available Colors' },
    { key: 'inStock', label: 'In Stock' }
  ]

  return (
    <div className="compare-products-page">
      <div className="container">
        <div className="compare-header">
          <div className="compare-header-content">
            <h1>Compare Products</h1>
            <p>Compare up to 4 products side by side to make the best choice</p>
            {compareItems.length > 0 && (
              <div className="compare-count-badge">
                {compareItems.length} {compareItems.length === 1 ? 'Product' : 'Products'} Selected
              </div>
            )}
          </div>
        </div>

        {compareItems.length > 0 ? (
          <div className="compare-table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="sticky-column"></th>
                  {compareItems.map(item => {
                    const itemId = item._id || item.id
                    const productPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0
                    const productOriginalPrice = typeof item.originalPrice === 'number' ? item.originalPrice : null
                    return (
                      <th key={itemId} className="product-column">
                        <div className="compare-product-card">
                          <button
                            className="remove-compare-btn"
                            onClick={() => removeFromCompare(itemId)}
                            aria-label="Remove from comparison"
                            title="Remove from comparison"
                          >
                            <X size={18} />
                          </button>
                          <Link to={`/product/${itemId}`} className="compare-product-link">
                            <div className="compare-product-image-wrapper">
                              <img src={item.images?.[0] || item.image || 'https://via.placeholder.com/300x400'} alt={item.name} />
                              {item.onSale && <span className="compare-sale-badge">Sale</span>}
                              {item.new && <span className="compare-new-badge">New</span>}
                            </div>
                            <h3>{item.name}</h3>
                            <div className="compare-product-price">
                              {productOriginalPrice && (
                                <span className="original-price">₹{productOriginalPrice.toFixed(2)}</span>
                              )}
                              <span className="current-price">₹{productPrice.toFixed(2)}</span>
                            </div>
                            {item.rating && (
                              <div className="compare-product-rating">
                                <Star size={14} fill="#C89E7E" color="#C89E7E" />
                                <span>{item.rating}</span>
                                <span className="review-count">({item.reviews?.length || 0})</span>
                              </div>
                            )}
                          </Link>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {comparisonFields.map((field, index) => (
                  <tr key={field.key} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td className="field-label sticky-column">
                      <span className="field-label-text">{field.label}</span>
                    </td>
                    {compareItems.map(item => {
                      const itemId = item._id || item.id
                      return (
                        <td key={itemId} className="field-value">
                          {field.key === 'price' && (
                            <div className="compare-price-display">
                              {item.originalPrice && typeof item.originalPrice === 'number' && (
                                <span className="original-price">₹{item.originalPrice.toFixed(2)}</span>
                              )}
                              <span className="current-price">₹{(typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0).toFixed(2)}</span>
                            </div>
                          )}
                          {field.key === 'rating' && (
                            <div className="compare-rating-display">
                              <div className="stars">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={16}
                                    fill={i < Math.floor(item.rating || 0) ? '#C89E7E' : 'none'}
                                    color="#C89E7E"
                                  />
                                ))}
                              </div>
                              <span className="rating-value">{item.rating || 0}/5</span>
                            </div>
                          )}
                          {field.key === 'reviews' && (
                            <span className="compare-reviews-count">{item.reviews?.length || 0} reviews</span>
                          )}
                          {field.key === 'brand' && (
                            <span className="compare-brand">{item.brand || 'N/A'}</span>
                          )}
                          {field.key === 'material' && (
                            <span className="compare-material">{item.material || 'N/A'}</span>
                          )}
                          {field.key === 'care' && (
                            <span className="compare-care">{item.care || 'N/A'}</span>
                          )}
                          {field.key === 'sizes' && (
                            <div className="compare-sizes-list">
                              {(item.sizes || []).length > 0 ? (
                                (item.sizes || []).map(size => (
                                  <span key={size} className="compare-size-badge">{size}</span>
                                ))
                              ) : (
                                <span className="compare-na">N/A</span>
                              )}
                            </div>
                          )}
                          {field.key === 'colors' && (
                            <div className="compare-colors-list">
                              {(item.colors || []).length > 0 ? (
                                (item.colors || []).map((color, idx) => {
                                  const colorName = typeof color === 'string' ? color : (color.name || color.value || `Color ${idx + 1}`)
                                  const colorValue = typeof color === 'string' ? color : (color.value || color.name || '#000000')
                                  return (
                                    <span key={colorName} className="compare-color-item" title={colorName}>
                                      <span className="compare-color-swatch" style={{ backgroundColor: colorValue }}></span>
                                      <span className="compare-color-name">{colorName}</span>
                                    </span>
                                  )
                                })
                              ) : (
                                <span className="compare-na">N/A</span>
                              )}
                            </div>
                          )}
                          {field.key === 'inStock' && (
                            <span className={`compare-stock-status ${(item.inStock !== false && (item.stockCount || 0) > 0) ? 'in-stock' : 'out-of-stock'}`}>
                              {(item.inStock !== false && (item.stockCount || 0) > 0) ? (
                                <>
                                  <span className="stock-indicator"></span>
                                  In Stock
                                </>
                              ) : (
                                <>
                                  <span className="stock-indicator out"></span>
                                  Out of Stock
                                </>
                              )}
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr className="actions-row">
                  <td className="field-label sticky-column">
                    <span className="field-label-text">Actions</span>
                  </td>
                  {compareItems.map((item, index) => {
                    const itemId = item._id || item.id
                    return (
                      <td key={`action-${itemId}-${index}`} className="field-value actions-cell" style={{ width: '280px', minWidth: '280px', maxWidth: '280px' }}>
                        <Link to={`/product/${itemId}`} className="btn btn-primary btn-compare-action" style={{ width: '100%', marginBottom: '0.75rem', display: 'block' }}>
                          View Details
                        </Link>
                        <button 
                          className="btn btn-outline btn-compare-action"
                          style={{ width: '100%', display: 'block' }}
                          onClick={async () => {
                            if (!isAuthenticated) {
                              showError('Please login to add items to cart')
                              navigate('/dashboard', { state: { tab: 'login', redirectPath: window.location.pathname } })
                              return
                            }
                            try {
                              await cartAPI.addItem(itemId, 1)
                              success('Added to cart!')
                              window.dispatchEvent(new Event('cartUpdated'))
                            } catch (err) {
                              console.error('Failed to add to cart:', err)
                              showError('Failed to add to cart')
                            }
                          }}
                        >
                          <ShoppingCart size={16} />
                          Add to Cart
                        </button>
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-compare">
            {loading ? (
              <div className="empty-compare-content">
                <div className="loading-spinner-compare"></div>
                <h2>Loading...</h2>
                <p>Fetching products to compare</p>
              </div>
            ) : !isAuthenticated ? (
              <div className="empty-compare-content">
                <div className="empty-compare-icon">
                  <GitCompare size={64} />
                </div>
                <h2>Please Login to View Compare List</h2>
                <p>Login to save products to your compare list</p>
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  Login
                </Link>
              </div>
            ) : (
              <div className="empty-compare-content">
                <div className="empty-compare-icon">
                  <GitCompare size={64} />
                </div>
                <h2>No products to compare</h2>
                <p>Add products to compare by clicking the compare button on product pages</p>
                <p className="empty-compare-hint">You can compare up to 4 products at a time</p>
                <Link to="/products/women" className="btn btn-primary btn-large">
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Compare


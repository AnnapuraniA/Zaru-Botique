import { Link, useNavigate } from 'react-router-dom'
import { X, Star, ShoppingCart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { cartAPI, productsAPI } from '../utils/api'
import { useToast } from '../components/Toast/ToastContainer'

function Compare() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { success, error: showError } = useToast()
  const [compareItems, setCompareItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompareItems()
  }, [])

  const loadCompareItems = async () => {
    try {
      setLoading(true)
      // Load compare items from localStorage
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

  const removeFromCompare = (id) => {
    // Remove from localStorage
    const compareIds = JSON.parse(localStorage.getItem('compareItems') || '[]')
    const updatedIds = compareIds.filter(itemId => itemId !== id)
    localStorage.setItem('compareItems', JSON.stringify(updatedIds))
    
    // Update state
    setCompareItems(items => items.filter(item => {
      const itemId = item._id || item.id
      return itemId !== id
    }))
    
    success('Removed from compare')
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
          <h1>Compare Products</h1>
          <p>Compare up to 4 products side by side</p>
        </div>

        {compareItems.length > 0 ? (
          <div className="compare-table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th></th>
                  {compareItems.map(item => {
                    const itemId = item._id || item.id
                    return (
                      <th key={itemId} className="product-column">
                        <button
                          className="remove-compare-btn"
                          onClick={() => removeFromCompare(itemId)}
                          aria-label="Remove from comparison"
                        >
                          <X size={18} />
                        </button>
                        <Link to={`/product/${itemId}`} className="compare-product-link">
                          <img src={item.images?.[0] || item.image || 'https://via.placeholder.com/300x400'} alt={item.name} />
                          <h3>{item.name}</h3>
                        </Link>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {comparisonFields.map(field => (
                  <tr key={field.key}>
                    <td className="field-label">{field.label}</td>
                    {compareItems.map(item => {
                      const itemId = item._id || item.id
                      return (
                        <td key={itemId} className="field-value">
                          {field.key === 'price' && (
                            <div>
                              {item.originalPrice && (
                                <span className="original-price">₹{item.originalPrice.toLocaleString()}</span>
                              )}
                              <span className="current-price">₹{item.price.toLocaleString()}</span>
                            </div>
                          )}
                          {field.key === 'rating' && (
                            <div className="rating-display">
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
                              <span>{item.rating || 0}</span>
                            </div>
                          )}
                          {field.key === 'reviews' && <span>{item.reviews?.length || 0}</span>}
                          {field.key === 'brand' && <span>{item.brand || 'N/A'}</span>}
                          {field.key === 'material' && <span>{item.material || 'N/A'}</span>}
                          {field.key === 'care' && <span>{item.care || 'N/A'}</span>}
                          {field.key === 'sizes' && (
                            <div className="sizes-list">
                              {(item.sizes || []).map(size => (
                                <span key={size} className="size-badge">{size}</span>
                              ))}
                            </div>
                          )}
                          {field.key === 'colors' && (
                            <div className="colors-list">
                              {(item.colors || []).map(color => {
                                const colorName = typeof color === 'string' ? color : (color.name || color.value || color)
                                return (
                                  <span key={colorName} className="color-badge">{colorName}</span>
                                )
                              })}
                            </div>
                          )}
                          {field.key === 'inStock' && (
                            <span className={(item.inStock !== false && (item.stockCount || 0) > 0) ? 'in-stock' : 'out-of-stock'}>
                              {(item.inStock !== false && (item.stockCount || 0) > 0) ? 'Yes' : 'No'}
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr className="actions-row">
                  <td className="field-label">Actions</td>
                  {compareItems.map(item => {
                    const itemId = item._id || item.id
                    return (
                      <td key={itemId} className="field-value">
                        <Link to={`/product/${itemId}`} className="btn btn-primary">
                          View Product
                        </Link>
                        <button 
                          className="btn btn-outline"
                          onClick={async () => {
                            if (!isAuthenticated) {
                              showError('Please login to add items to cart')
                              navigate('/dashboard', { state: { tab: 'login' } })
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
              <>
                <h2>Loading...</h2>
                <p>Fetching products to compare</p>
              </>
            ) : (
              <>
                <h2>No products to compare</h2>
                <p>Add products to compare by clicking the compare button on product pages</p>
                <Link to="/products/women" className="btn btn-primary">
                  Start Shopping
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Compare


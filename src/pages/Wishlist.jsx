import { Link, useNavigate } from 'react-router-dom'
import { X, Heart, Share2, ShoppingCart, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard/ProductCard'
import { wishlistAPI, cartAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast/ToastContainer'

function Wishlist() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const loadWishlist = async () => {
    try {
      setLoading(true)
      const response = await wishlistAPI.getAll()
      // Backend returns array directly, not wrapped in items
      const items = Array.isArray(response) ? response : (response.items || [])
      setWishlistItems(items)
    } catch (err) {
      console.error('Failed to load wishlist:', err)
      showError('Failed to load wishlist')
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) {
      showError('Please login to manage wishlist')
      navigate('/dashboard', { state: { tab: 'login' } })
      return
    }

    try {
      await wishlistAPI.remove(productId)
      setWishlistItems(items => items.filter(item => {
        const itemProductId = item.product?._id || item.productId || item._id
        return itemProductId !== productId
      }))
      success('Removed from wishlist')
    } catch (err) {
      console.error('Failed to remove from wishlist:', err)
      showError('Failed to remove from wishlist')
    }
  }

  const addAllToCart = async () => {
    if (!isAuthenticated) {
      showError('Please login to add items to cart')
      navigate('/dashboard', { state: { tab: 'login' } })
      return
    }

    try {
      for (const item of wishlistItems) {
        const productId = item.product?._id || item.productId || item._id
        await cartAPI.addItem(productId, 1)
      }
      success('All items added to cart!')
    } catch (err) {
      console.error('Failed to add items to cart:', err)
      showError('Failed to add items to cart')
    }
  }

  const addToCart = async (productId) => {
    if (!isAuthenticated) {
      showError('Please login to add items to cart')
      navigate('/dashboard', { state: { tab: 'login' } })
      return
    }

    try {
      await cartAPI.addItem(productId, 1)
      success('Added to cart!')
    } catch (err) {
      console.error('Failed to add to cart:', err)
      showError('Failed to add to cart')
    }
  }

  const shareWishlist = () => {
    // Share wishlist functionality
    if (navigator.share) {
      navigator.share({
        title: 'My Wishlist',
        text: `Check out my wishlist with ${wishlistItems.length} items!`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      success('Wishlist link copied to clipboard!')
    }
  }

  const totalValue = wishlistItems.reduce((sum, item) => {
    const product = item.product || item
    return sum + (product.price || 0)
  }, 0)
  
  const totalSavings = wishlistItems.reduce((sum, item) => {
    const product = item.product || item
    if (product.originalPrice) {
      return sum + (product.originalPrice - product.price)
    }
    return sum
  }, 0)

  if (!isAuthenticated) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="empty-wishlist">
            <div className="empty-wishlist-icon">
              <Heart size={64} />
            </div>
            <h2>Please Login to View Wishlist</h2>
            <p>Login to save items to your wishlist</p>
            <Link to="/dashboard" className="btn btn-primary btn-large">
              Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="loading-spinner">
            <p>Loading wishlist...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        {/* Header Section */}
        <div className="wishlist-header-section">
          <div className="wishlist-header-content">
            <div className="wishlist-title-wrapper">
              <div className="wishlist-icon-wrapper">
                <Heart size={32} fill="currentColor" />
                <Sparkles size={20} className="sparkle-icon" />
              </div>
              <div>
                <h1>My Wishlist</h1>
                <p className="wishlist-subtitle">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
                </p>
              </div>
            </div>
            {wishlistItems.length > 0 && (
              <div className="wishlist-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Value</span>
                  <span className="stat-value">₹{totalValue.toFixed(2)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="stat-item savings">
                    <span className="stat-label">You Save</span>
                    <span className="stat-value">₹{totalSavings.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {wishlistItems.length > 0 ? (
          <>
            {/* Actions Bar */}
            <div className="wishlist-actions-bar">
              <div className="wishlist-actions-left">
                <button className="action-btn primary" onClick={addAllToCart}>
                  <ShoppingCart size={18} />
                  Add All to Cart
                </button>
                <button className="action-btn" onClick={shareWishlist}>
                  <Share2 size={18} />
                  Share Wishlist
                </button>
              </div>
              <div className="wishlist-actions-right">
                <span className="items-count">{wishlistItems.length} items</span>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="wishlist-navigation">
              <Link to="/products/women" className="nav-action-btn">
                Continue Shopping
              </Link>
              <Link to="/cart" className="nav-action-btn primary">
                <ShoppingCart size={18} />
                Go to Cart
              </Link>
            </div>

            {/* Products Grid */}
            <div className="wishlist-grid-container">
              <div className="wishlist-grid">
                {wishlistItems.map((item, index) => {
                  // Backend returns populated products directly
                  const product = item
                  const productId = product._id || product.id
                  const productName = product.name || 'Product'
                  const productImage = product.images?.[0] || product.image
                  const productPrice = product.price || 0
                  const productOriginalPrice = product.originalPrice
                  const productCategory = product.category ? `${product.category}${product.subcategory ? ` - ${product.subcategory}` : ''}` : ''
                  
                  return (
                    <div key={productId || index} className="wishlist-item-card">
                      <div className="wishlist-item-image-wrapper">
                        <Link to={`/product/${productId}`} className="wishlist-item-link">
                          <img src={productImage} alt={productName} />
                          {product.onSale && (
                            <span className="wishlist-sale-badge">Sale</span>
                          )}
                          {product.isNew && (
                            <span className="wishlist-new-badge">New</span>
                          )}
                        </Link>
                        <button
                          className="wishlist-remove-btn"
                          onClick={() => removeFromWishlist(productId)}
                          aria-label="Remove from wishlist"
                          title="Remove from wishlist"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="wishlist-item-info">
                        <Link to={`/product/${productId}`} className="wishlist-item-name">
                          <h3>{productName}</h3>
                        </Link>
                        <p className="wishlist-item-category">{productCategory}</p>
                        <div className="wishlist-item-price-section">
                          {productOriginalPrice && (
                            <span className="original-price">₹{productOriginalPrice.toFixed(2)}</span>
                          )}
                          <span className="current-price">₹{productPrice.toFixed(2)}</span>
                        </div>
                        <div className="wishlist-item-actions">
                          <Link
                            to={`/product/${productId}`}
                            className="btn btn-primary btn-small"
                          >
                            View Details
                          </Link>
                          <button 
                            className="btn btn-outline btn-small"
                            onClick={() => addToCart(productId)}
                          >
                            <ShoppingCart size={16} />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="empty-wishlist">
            <div className="empty-wishlist-icon">
              <Heart size={64} />
            </div>
            <h2>Your Wishlist is Empty</h2>
            <p>Start adding items you love to your wishlist</p>
            <p className="empty-wishlist-hint">
              Click the heart icon on any product to save it here
            </p>
            <Link to="/products/women" className="btn btn-primary btn-large">
              <Sparkles size={20} />
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist


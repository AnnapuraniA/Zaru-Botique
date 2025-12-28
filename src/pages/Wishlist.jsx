import { Link } from 'react-router-dom'
import { X, Heart, Share2, ShoppingCart, Sparkles } from 'lucide-react'
import { useState } from 'react'
import ProductCard from '../components/ProductCard/ProductCard'

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: 'Elegant Summer Dress',
      category: 'Women - Dresses',
      price: 89.99,
      originalPrice: 129.99,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
      onSale: true,
      rating: 4.5,
      reviews: 24
    },
    {
      id: 2,
      name: 'Trendy Teen Jacket',
      category: 'Teen - Outerwear',
      price: 69.99,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
      new: true,
      rating: 4.8,
      reviews: 18
    },
    {
      id: 3,
      name: 'Designer Handbag',
      category: 'Women - Accessories',
      price: 149.99,
      originalPrice: 199.99,
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop',
      onSale: true,
      rating: 4.9,
      reviews: 31
    },
    {
      id: 4,
      name: 'Silk Blouse',
      category: 'Women - Tops',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
      rating: 4.9,
      reviews: 25
    },
    {
      id: 5,
      name: 'Princess Dress',
      category: 'Girls - Dresses',
      price: 49.99,
      originalPrice: 69.99,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
      onSale: true,
      rating: 4.8,
      reviews: 22
    }
  ])

  const removeFromWishlist = (id) => {
    setWishlistItems(items => items.filter(item => item.id !== id))
  }

  const addAllToCart = () => {
    // This would add all items to cart - placeholder for now
    console.log('Add all to cart')
  }

  const shareWishlist = () => {
    // This would share wishlist - placeholder for now
    console.log('Share wishlist')
  }

  const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0)
  const totalSavings = wishlistItems.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price)
    }
    return sum
  }, 0)

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
                {wishlistItems.map(product => (
                  <div key={product.id} className="wishlist-item-card">
                    <div className="wishlist-item-image-wrapper">
                      <Link to={`/product/${product.id}`} className="wishlist-item-link">
                        <img src={product.image} alt={product.name} />
                        {product.onSale && (
                          <span className="wishlist-sale-badge">Sale</span>
                        )}
                        {product.new && (
                          <span className="wishlist-new-badge">New</span>
                        )}
                      </Link>
                      <button
                        className="wishlist-remove-btn"
                        onClick={() => removeFromWishlist(product.id)}
                        aria-label="Remove from wishlist"
                        title="Remove from wishlist"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="wishlist-item-info">
                      <Link to={`/product/${product.id}`} className="wishlist-item-name">
                        <h3>{product.name}</h3>
                      </Link>
                      <p className="wishlist-item-category">{product.category}</p>
                      <div className="wishlist-item-rating">
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`star ${i < Math.floor(product.rating) ? 'filled' : ''}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="rating-text">({product.reviews})</span>
                      </div>
                      <div className="wishlist-item-price-section">
                        {product.originalPrice && (
                          <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
                        )}
                        <span className="current-price">₹{product.price.toFixed(2)}</span>
                      </div>
                      <div className="wishlist-item-actions">
                        <Link
                          to={`/product/${product.id}`}
                          className="btn btn-primary btn-small"
                        >
                          View Details
                        </Link>
                        <button className="btn btn-outline btn-small">
                          <ShoppingCart size={16} />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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


import { useState } from 'react'
import { X, ShoppingCart, Heart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '../Toast/ToastContainer'

function QuickView({ product, isOpen, onClose }) {
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { success } = useToast()

  if (!isOpen || !product) return null

  const handleAddToCart = () => {
    if (!selectedSize) {
      success('Please select a size', 'warning')
      return
    }
    // Add to cart logic
    success('Added to cart!')
    onClose()
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quick-view-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        
        <div className="quick-view-content">
          <div className="quick-view-image">
            <img src={product.image} alt={product.name} />
            {product.onSale && <span className="badge sale-badge">Sale</span>}
            <button className="quick-view-wishlist" onClick={handleWishlist}>
              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="quick-view-info">
            <h2>{product.name}</h2>
            <p className="quick-view-category">{product.category} - {product.subcategory}</p>
            
            <div className="quick-view-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.floor(product.rating) ? '#C89E7E' : 'none'}
                    color="#C89E7E"
                  />
                ))}
              </div>
              <span>({product.reviews} reviews)</span>
            </div>

            <div className="quick-view-price">
              {product.originalPrice && typeof product.originalPrice === 'number' && (
                <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
              )}
              <span className="current-price">₹{(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toFixed(2)}</span>
            </div>

            {product.sizes && (
              <div className="quick-view-options">
                <label>Size *</label>
                <div className="size-options">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`size-option-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && (
              <div className="quick-view-options">
                <label>Color</label>
                <div className="color-options">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      className={`color-option-btn ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      title={color}
                    ></button>
                  ))}
                </div>
              </div>
            )}

            <div className="quick-view-actions">
              <button className="btn btn-primary btn-large" onClick={handleAddToCart}>
                <ShoppingCart size={18} />
                Add to Cart
              </button>
              <Link to={`/product/${product.id}`} className="btn btn-outline btn-large" onClick={onClose}>
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickView


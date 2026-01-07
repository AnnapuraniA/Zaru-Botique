import { useState, useEffect } from 'react'
import { X, ShoppingCart, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '../Toast/ToastContainer'

function QuickView({ product, isOpen, onClose }) {
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const { success } = useToast()

  // Normalize product data
  const productImage = product.images && product.images.length > 0 
    ? product.images[0]
    : product.image || 'https://via.placeholder.com/600x800'
  
  const productColors = product.colors || []
  const productSizes = product.sizes || []

  // Set default size and color
  useEffect(() => {
    if (productSizes.length > 0 && !selectedSize) {
      setSelectedSize(productSizes[0])
    }
    if (productColors.length > 0 && !selectedColor) {
      const firstColor = typeof productColors[0] === 'string' 
        ? productColors[0] 
        : (productColors[0].name || productColors[0].value)
      setSelectedColor(firstColor)
    }
  }, [product, productSizes, productColors, selectedSize, selectedColor])

  if (!isOpen || !product) return null

  const handleAddToCart = () => {
    if (productSizes.length > 0 && !selectedSize) {
      success('Please select a size', 'warning')
      return
    }
    // Add to cart logic
    success('Added to cart!')
    onClose()
  }

  const discountPercent = product.onSale && product.originalPrice && typeof product.originalPrice === 'number'
    ? Math.round(((product.originalPrice - (typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0)) / product.originalPrice) * 100)
    : 0

  return (
    <div className="modal-overlay quick-view-overlay" onClick={onClose}>
      <div className="modal-content quick-view-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close quick-view-close" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
        
        <div className="quick-view-content">
          <div className="quick-view-image-section">
            <div className="quick-view-image">
              <img src={productImage} alt={product.name} />
              {product.onSale && discountPercent > 0 && (
                <span className="quick-view-offer-badge">{discountPercent}% OFF</span>
              )}
            </div>
          </div>

          <div className="quick-view-info">
            <h2 className="quick-view-title">{product.name}</h2>

            <div className="quick-view-price-section">
              <div className="quick-view-price">
                {product.originalPrice && typeof product.originalPrice === 'number' && (
                  <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
                )}
                <span className="current-price">₹{(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toFixed(2)}</span>
              </div>
              {product.inStock && (
                <div className="quick-view-stock">
                  <Check size={16} />
                  <span>In Stock</span>
                </div>
              )}
            </div>

            {productSizes.length > 0 && (
              <div className="quick-view-options">
                <label>Size</label>
                <div className="size-options">
                  {productSizes.map(size => (
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

            {productColors.length > 0 && (
              <div className="quick-view-options">
                <label>Color</label>
                <div className="color-options">
                  {productColors.map((color, idx) => {
                    const colorName = typeof color === 'string' ? color : (color.name || color.value || `Color ${idx + 1}`)
                    const colorValue = typeof color === 'string' ? color : (color.value || color.name || '#000000')
                    const isSelected = selectedColor === colorName
                    
                    return (
                      <button
                        key={colorName}
                        className={`color-option-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedColor(colorName)}
                        title={colorName}
                      >
                        <span 
                          className="color-swatch"
                          style={{ backgroundColor: colorValue }}
                        ></span>
                        {isSelected && <span className="check-mark">✓</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="quick-view-actions">
              <button 
                className="btn btn-primary btn-large quick-view-add-cart" 
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart size={20} />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <Link 
                to={`/product/${product._id || product.id}`} 
                className="quick-view-link" 
                onClick={onClose}
              >
                View Full Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickView


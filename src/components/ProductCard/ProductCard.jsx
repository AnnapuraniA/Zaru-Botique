import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useState } from 'react'

function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleWishlist = (e) => {
    e.preventDefault()
    setIsWishlisted(!isWishlisted)
    // Add to wishlist logic here
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    // Add to cart logic here
  }

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image-wrapper">
          <img src={product.image} alt={product.name} />
          {product.onSale && <span className="badge sale-badge">Sale</span>}
          {product.new && <span className="badge new-badge">New</span>}
          <button 
            className="wishlist-btn"
            onClick={handleWishlist}
            aria-label="Add to wishlist"
          >
            <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-category">{product.category}</p>
          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  fill={i < Math.floor(product.rating) ? '#ffc107' : 'none'}
                  color="#ffc107"
                />
              ))}
            </div>
            <span className="rating-text">({product.reviews})</span>
          </div>
          <div className="product-price">
            {product.originalPrice && (
              <span className="original-price">₹{product.originalPrice}</span>
            )}
            <span className="current-price">₹{product.price}</span>
          </div>
        </div>
      </Link>
      <button className="add-to-cart-btn" onClick={handleAddToCart}>
        <ShoppingCart size={16} />
        Add to Cart
      </button>
    </div>
  )
}

export default ProductCard


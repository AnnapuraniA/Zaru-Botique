import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star, Eye, Share2, Facebook, Twitter, Instagram } from 'lucide-react'
import { useState } from 'react'
import QuickView from '../QuickView/QuickView'
import { useToast } from '../Toast/ToastContainer'

function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const { success } = useToast()

  const handleWishlist = (e) => {
    e.preventDefault()
    setIsWishlisted(!isWishlisted)
    success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    success('Added to cart!')
  }

  const handleShare = (platform, e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = window.location.origin + `/product/${product.id}`
    const text = `Check out ${product.name} at Arudhra Boutique!`
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      instagram: `https://www.instagram.com/`
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
    setShowShareMenu(false)
  }

  const handleCopyLink = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = window.location.origin + `/product/${product.id}`
    navigator.clipboard.writeText(url)
    success('Link copied to clipboard!')
    setShowShareMenu(false)
  }

  return (
    <>
      <div className="product-card">
        <Link to={`/product/${product.id}`} className="product-link">
          <div className="product-image-wrapper">
            <img src={product.image} alt={product.name} />
            {product.onSale && <span className="badge sale-badge">Sale</span>}
            {product.new && <span className="badge new-badge">New</span>}
            <div className="product-card-actions">
              <button 
                className="product-action-btn wishlist-btn"
                onClick={handleWishlist}
                aria-label="Add to wishlist"
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
              <button 
                className="product-action-btn quick-view-btn"
                onClick={(e) => {
                  e.preventDefault()
                  setShowQuickView(true)
                }}
                aria-label="Quick view"
              >
                <Eye size={18} />
              </button>
              <div className="share-menu-wrapper">
                <button 
                  className="product-action-btn share-btn"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowShareMenu(!showShareMenu)
                  }}
                  aria-label="Share"
                >
                  <Share2 size={18} />
                </button>
                {showShareMenu && (
                  <div className="share-menu" onClick={(e) => e.stopPropagation()}>
                    <button onClick={(e) => handleShare('facebook', e)} className="share-option">
                      <Facebook size={16} />
                      Facebook
                    </button>
                    <button onClick={(e) => handleShare('twitter', e)} className="share-option">
                      <Twitter size={16} />
                      Twitter
                    </button>
                    <button onClick={(e) => handleShare('instagram', e)} className="share-option">
                      <Instagram size={16} />
                      Instagram
                    </button>
                    <button onClick={handleCopyLink} className="share-option">
                      <Share2 size={16} />
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
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
      <QuickView product={product} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />
    </>
  )
}

export default ProductCard


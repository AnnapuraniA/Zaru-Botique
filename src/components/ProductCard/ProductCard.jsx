import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Star, Eye, Share2, Instagram, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import QuickView from '../QuickView/QuickView'
import { useToast } from '../Toast/ToastContainer'
import { wishlistAPI, cartAPI } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

function ProductCard({ product, compact = false }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const { success, error: showError } = useToast()

  const productId = product._id || product.id

  // Check if product is in wishlist
  useEffect(() => {
    if (isAuthenticated && productId) {
      wishlistAPI.check(productId)
        .then(result => setIsWishlisted(result.isInWishlist))
        .catch(() => setIsWishlisted(false))
    }
  }, [isAuthenticated, productId])

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      showError('Please login to add items to wishlist')
      navigate('/dashboard', { state: { tab: 'login' } })
      return
    }

    try {
      if (isWishlisted) {
        await wishlistAPI.remove(productId)
        setIsWishlisted(false)
        success('Removed from wishlist')
      } else {
        await wishlistAPI.add(productId)
        setIsWishlisted(true)
        success('Added to wishlist')
      }
    } catch (err) {
      console.error('Failed to update wishlist:', err)
      showError('Failed to update wishlist')
    }
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      showError('Please login to add items to cart')
      navigate('/dashboard', { state: { tab: 'login' } })
      return
    }

    try {
      await cartAPI.addItem(productId, 1)
      success('Added to cart!')
      // Dispatch cart update event
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err) {
      console.error('Failed to add to cart:', err)
      showError('Failed to add to cart')
    }
  }

  const handleShare = (platform, e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = window.location.origin + `/product/${productId}`
    const text = `Check out ${product.name} at Arudhra Fashions!`
    
    if (platform === 'whatsapp') {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
      window.open(whatsappUrl, '_blank')
    } else if (platform === 'instagram') {
      // Instagram doesn't support direct sharing via URL, so we'll copy the link
      navigator.clipboard.writeText(url)
      success('Link copied! Paste it in Instagram')
    }
    setShowShareMenu(false)
  }

  const handleCopyLink = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = window.location.origin + `/product/${productId}`
    navigator.clipboard.writeText(url)
    success('Link copied to clipboard!')
    setShowShareMenu(false)
  }

  return (
    <>
      <div className="product-card">
        <Link to={`/product/${productId}`} className="product-link">
          <div className="product-image-wrapper">
            <img src={product.images?.[0] || product.image} alt={product.name} />
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
                    <button onClick={(e) => handleShare('instagram', e)} className="share-option">
                      <Instagram size={16} />
                      Instagram
                    </button>
                    <button onClick={(e) => handleShare('whatsapp', e)} className="share-option">
                      <MessageCircle size={16} />
                      WhatsApp
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
          <p className="product-category">
            {product.category?.name || product.category}{product.subcategory ? ` - ${product.subcategory?.name || product.subcategory}` : ''}
          </p>
          {product.rating && !compact && (
            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < Math.floor(product.rating || 0) ? '#C89E7E' : 'none'}
                    color="#C89E7E"
                  />
                ))}
              </div>
              <span className="rating-text">({product.reviews || 0})</span>
            </div>
          )}
          {!compact && (
            <div className="product-price">
              {product.originalPrice && typeof product.originalPrice === 'number' && (
                <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
              )}
              <span className="current-price">₹{(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toFixed(2)}</span>
            </div>
          )}
        </div>
      </Link>
        {!compact && (
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            <ShoppingCart size={16} />
            Add to Cart
          </button>
        )}
      </div>
      <QuickView product={product} isOpen={showQuickView} onClose={() => setShowQuickView(false)} />
    </>
  )
}

export default ProductCard


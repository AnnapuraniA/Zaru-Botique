import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Heart, ShoppingCart, Star, Share2, Minus, Plus, ChevronLeft, ChevronRight, Check, Package, Truck, RotateCcw, Shield, Instagram, MessageCircle, GitCompare } from 'lucide-react'
import ProductCard from '../components/ProductCard/ProductCard'
import { useToast } from '../components/Toast/ToastContainer'
import { productsAPI, cartAPI, wishlistAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isInCompare, setIsInCompare] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('details')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const { success, error: showError } = useToast()

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch product
        const productData = await productsAPI.getById(id)
        setProduct(productData)
        
        // Set default color if available
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(typeof productData.colors[0] === 'string' 
            ? productData.colors[0] 
            : productData.colors[0].name || productData.colors[0].value)
        }
        
        // Set default size if available
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0])
        }
        
        // Fetch reviews
        try {
          const reviewsData = await productsAPI.getReviews(id)
          // Backend returns array directly, not wrapped in reviews property
          setReviews(Array.isArray(reviewsData) ? reviewsData : (reviewsData.reviews || []))
        } catch (err) {
          console.error('Failed to fetch reviews:', err)
          setReviews([])
        }
        
        // Fetch related products
        try {
          const relatedData = await productsAPI.getRelated(id)
          // Backend returns array directly, not wrapped in products property
          setRelatedProducts(Array.isArray(relatedData) ? relatedData : (relatedData.products || []))
        } catch (err) {
          console.error('Failed to fetch related products:', err)
          setRelatedProducts([])
        }
        
        // Check if product is in wishlist (if authenticated)
        if (isAuthenticated) {
          try {
            const wishlist = await wishlistAPI.getAll()
            setIsWishlisted(wishlist.some(item => item.product?._id === id || item.productId === id))
          } catch (err) {
            console.error('Failed to check wishlist:', err)
          }
        }
      } catch (err) {
        console.error('Failed to fetch product:', err)
        setError('Failed to load product. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    if (id) {
      fetchProductData()
    }
  }, [id, isAuthenticated])

  const nextImage = () => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showError('Please login to add items to cart')
      navigate('/dashboard', { state: { tab: 'login' } })
      return
    }
    
    try {
      await cartAPI.addItem(id, quantity, selectedSize, selectedColor)
      success('Product added to cart!')
      // Dispatch cart update event
      window.dispatchEvent(new Event('cartUpdated'))
    } catch (err) {
      console.error('Failed to add to cart:', err)
      showError('Failed to add product to cart')
    }
  }

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      showError('Please login to add items to wishlist')
      navigate('/dashboard', { state: { tab: 'login' } })
      return
    }
    
    try {
      if (isWishlisted) {
        await wishlistAPI.remove(id)
        setIsWishlisted(false)
        success('Removed from wishlist')
      } else {
        await wishlistAPI.add(id)
        setIsWishlisted(true)
        success('Added to wishlist')
      }
    } catch (err) {
      console.error('Failed to update wishlist:', err)
      showError('Failed to update wishlist')
    }
  }

  // Check if product is in compare list
  useEffect(() => {
    if (id) {
      const compareIds = JSON.parse(localStorage.getItem('compareItems') || '[]')
      setIsInCompare(compareIds.includes(id))
    }
  }, [id])

  const handleToggleCompare = () => {
    const compareIds = JSON.parse(localStorage.getItem('compareItems') || '[]')
    
    if (isInCompare) {
      // Remove from compare
      const updatedIds = compareIds.filter(itemId => itemId !== id)
      localStorage.setItem('compareItems', JSON.stringify(updatedIds))
      setIsInCompare(false)
      // Dispatch event to update header count
      window.dispatchEvent(new Event('compareUpdated'))
      success('Removed from compare')
    } else {
      // Add to compare (max 4 items)
      if (compareIds.length >= 4) {
        showError('You can compare up to 4 products at a time')
        return
      }
      const updatedIds = [...compareIds, id]
      localStorage.setItem('compareItems', JSON.stringify(updatedIds))
      setIsInCompare(true)
      // Dispatch event to update header count
      window.dispatchEvent(new Event('compareUpdated'))
      success('Added to compare')
    }
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading-spinner">
            <p>Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error-message">
            <p>{error || 'Product not found'}</p>
            <Link to="/products" className="btn btn-primary">Back to Products</Link>
          </div>
        </div>
      </div>
    )
  }

  // Normalize product data for display
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
      ? [product.image] 
      : ['https://via.placeholder.com/600x800']
  
  const productColors = product.colors || []
  const productSizes = product.sizes || []
  
  const shippingInfo = {
    'Free Shipping': 'On orders above ₹2000',
    'Standard Delivery': '5-7 business days',
    'Express Delivery': '2-3 business days (₹200)',
    'Returns': '30 days return policy',
    'Exchange': 'Easy exchange available'
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/products/${product.category.slug || product.category.name?.toLowerCase() || 'category'}`}>
                {product.category.name || product.category}
              </Link>
              <span>/</span>
            </>
          )}
          {product.subcategory && (
            <>
              <Link to={`/products/${product.category?.slug || product.category?.name?.toLowerCase() || 'category'}/${product.subcategory.slug || product.subcategory.name?.toLowerCase() || 'subcategory'}`}>
                {product.subcategory.name || product.subcategory}
              </Link>
              <span>/</span>
            </>
          )}
          <span>{product.name}</span>
        </nav>

        <div className="product-detail">
          <div className="product-images">
            <div className="main-image-wrapper">
              <div className="main-image">
                <img 
                  src={productImages[selectedImageIndex]} 
                  alt={product.name}
                  className="fade-in"
                  key={selectedImageIndex}
                />
                {product.onSale && <span className="sale-badge">Sale</span>}
                {product.new && <span className="new-badge">New</span>}
                {productImages.length > 1 && (
                  <>
                    <button className="image-nav-btn prev-btn" onClick={prevImage} aria-label="Previous image">
                      <ChevronLeft size={24} />
                    </button>
                    <button className="image-nav-btn next-btn" onClick={nextImage} aria-label="Next image">
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            </div>
            {productImages.length > 1 && (
              <div className="thumbnail-images">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail-btn ${selectedImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info-wrapper">
            <div className="product-info">
              <div className="product-header">
                <div className="product-header-top">
                  <div className="product-title-section">
                    <span className="product-brand">{product.brand || 'Arudhra Fashions'}</span>
                    <h1>{product.name}</h1>
                    <div className="product-rating">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            fill={i < Math.floor(product.rating || 0) ? '#C89E7E' : 'none'}
                            color="#C89E7E"
                          />
                        ))}
                      </div>
                      <span className="rating-text">({product.reviews || 0} reviews)</span>
                    </div>
                  </div>
                  <div className="product-share-wrapper">
                    <button 
                      className="product-share-btn"
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      aria-label="Share product"
                    >
                      <Share2 size={20} />
                      Share
                    </button>
                    {showShareMenu && (
                      <div className="product-share-menu">
                        <button onClick={() => {
                          const url = window.location.href
                          navigator.clipboard.writeText(url)
                          setShowShareMenu(false)
                          success('Link copied! Paste it in Instagram')
                        }} className="share-menu-item">
                          <Instagram size={18} />
                          Instagram
                        </button>
                        <button onClick={() => {
                          const url = window.location.href
                          const text = `Check out ${product.name} at Arudhra Fashions!`
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
                          window.open(whatsappUrl, '_blank')
                          setShowShareMenu(false)
                          success('Opening WhatsApp...')
                        }} className="share-menu-item">
                          <MessageCircle size={18} />
                          WhatsApp
                        </button>
                        <button onClick={() => {
                          navigator.clipboard.writeText(window.location.href)
                          setShowShareMenu(false)
                          success('Link copied to clipboard!')
                        }} className="share-menu-item">
                          <Share2 size={18} />
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="product-price-section">
                <div className="product-price">
                  {product.originalPrice && typeof product.originalPrice === 'number' && (
                    <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
                  )}
                  <span className="current-price">₹{(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toFixed(2)}</span>
                  {product.onSale && product.originalPrice && typeof product.originalPrice === 'number' && (
                    <span className="discount-badge">
                      {Math.round(((product.originalPrice - (typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0)) / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
                <div className="stock-info">
                  <span className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {product.inStock ? (
                      <>
                        <Check size={16} />
                        In Stock ({product.stockCount || 0} available)
                      </>
                    ) : (
                      <>
                        <span style={{ marginRight: '0.5rem' }}>⚠️</span>
                        Out of Stock
                      </>
                    )}
                  </span>
                </div>
              </div>

              <p className="product-description">{product.description}</p>

            <div className="product-options">
              {productSizes.length > 0 && (
                <div className="option-group">
                  <label>Size</label>
                  <div className="size-options">
                    {productSizes.map(size => (
                      <button
                        key={size}
                        className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <Link to="/size-guide" className="size-guide-link">
                    Size Guide
                  </Link>
                </div>
              )}

              {productColors.length > 0 && (
                <div className="option-group">
                  <label>Color</label>
                  <div className="color-options">
                    {productColors.map((color, idx) => {
                      const colorName = typeof color === 'string' ? color : (color.name || color.value || `Color ${idx + 1}`)
                      const colorValue = typeof color === 'string' ? color : (color.value || color.name || '#000000')
                      const isSelected = selectedColor === colorName
                      
                      return (
                        <button
                          key={colorName}
                          className={`color-btn ${isSelected ? 'active' : ''}`}
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

              <div className="option-group">
                <label>Quantity</label>
                <div className="quantity-selector">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus size={16} />
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

              <div className="product-actions">
                <button 
                  className="btn btn-primary btn-large add-to-cart-btn-main" 
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart size={20} />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <div className="product-actions-secondary">
                  <button
                    className="btn btn-icon"
                    onClick={handleToggleWishlist}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    className="btn btn-icon"
                    onClick={handleToggleCompare}
                    title={isInCompare ? 'Remove from compare' : 'Add to compare'}
                  >
                    <GitCompare size={20} fill={isInCompare ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              <div className="product-features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <Package size={24} />
                  </div>
                  <div className="feature-content">
                    <strong>Free Shipping</strong>
                    <span>On orders above ₹2000</span>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <RotateCcw size={24} />
                  </div>
                  <div className="feature-content">
                    <strong>Easy Returns</strong>
                    <span>30 days return policy</span>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <Shield size={24} />
                  </div>
                  <div className="feature-content">
                    <strong>Secure Payment</strong>
                    <span>100% secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="product-tabs-section">
          <div className="product-tabs">
            <button
              className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Product Details
            </button>
            <button
              className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping & Returns
            </button>
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'details' && (
              <div className="tab-panel">
                <h3>Product Description</h3>
                <p>{product.fullDescription}</p>
                <div className="detail-list">
                  <div className="detail-item">
                    <strong>Material:</strong> {product.material}
                  </div>
                  <div className="detail-item">
                    <strong>Care Instructions:</strong> {product.care}
                  </div>
                  <div className="detail-item">
                    <strong>Brand:</strong> {product.brand}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="tab-panel">
                <h3>Product Specifications</h3>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <table className="specifications-table">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key}>
                          <td><strong>{key}</strong></td>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No specifications available for this product.</p>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="tab-panel">
                <h3>Shipping & Returns</h3>
                <div className="shipping-info">
                  {Object.entries(shippingInfo).map(([key, value]) => (
                    <div key={key} className="shipping-item">
                      <Truck size={20} />
                      <div>
                        <strong>{key}</strong>
                        <p>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-panel">
                <div className="reviews-header">
                  <h3>Customer Reviews</h3>
                  <div className="average-rating">
                    <div className="rating-display">
                      <span className="rating-number">{product.rating}</span>
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            fill={i < Math.floor(product.rating) ? '#C89E7E' : 'none'}
                            color="#C89E7E"
                          />
                        ))}
                      </div>
                      <span className="review-count">Based on {product.reviews} reviews</span>
                    </div>
                  </div>
                </div>
                <div className="reviews-list">
                  {reviews.length > 0 ? (
                    reviews.map(review => {
                      const reviewId = review._id || review.id
                      const reviewerName = review.userName || review.user?.name || review.name || 'Anonymous'
                      const reviewDate = review.createdAt 
                        ? new Date(review.createdAt).toLocaleDateString() 
                        : review.date || 'N/A'
                      
                      return (
                        <div key={reviewId} className="review-item">
                          <div className="review-header">
                            <div>
                              <strong>{reviewerName}</strong>
                              <div className="review-rating">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    fill={i < (review.rating || 0) ? '#C89E7E' : 'none'}
                                    color="#C89E7E"
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="review-date">{reviewDate}</span>
                          </div>
                          <p className="review-comment">{review.comment || ''}</p>
                        </div>
                      )
                    })
                  ) : (
                    <p>No reviews yet. Be the first to review this product!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="related-products-section">
          <h2>You May Also Like</h2>
          <div className="related-products-grid">
            {relatedProducts.map(product => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail


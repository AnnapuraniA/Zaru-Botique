import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { Heart, ShoppingCart, Star, Share2, Minus, Plus, ChevronLeft, ChevronRight, Check, Package, Truck, RotateCcw, Shield, Facebook, Twitter, Instagram } from 'lucide-react'
import ProductCard from '../components/ProductCard/ProductCard'
import { useToast } from '../components/Toast/ToastContainer'

function ProductDetail() {
  const { id } = useParams()
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('Burgundy')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('details')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const { success } = useToast()

  // Mock product data
  const product = {
    id: 1,
    name: 'Elegant Summer Dress',
    category: 'Women - Dresses',
    price: 89.99,
    originalPrice: 129.99,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1566479179817-1c6d2c05b93e?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1566479179817-1c6d2c05b93e?w=600&h=800&fit=crop'
    ],
    onSale: true,
    rating: 4.5,
    reviews: 24,
    brand: 'Arudhra Boutique',
    material: '100% Premium Cotton',
    care: 'Machine Wash Cold, Tumble Dry Low',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Burgundy', value: '#800020' },
      { name: 'Gold', value: '#D4AF37' },
      { name: 'Deep Burgundy', value: '#5C0018' },
      { name: 'Light Burgundy', value: '#A02040' }
    ],
    inStock: true,
    stockCount: 15,
    description: 'A beautiful summer dress perfect for any occasion. Made from high-quality cotton for comfort and style. This elegant piece features a flattering A-line silhouette with delicate floral patterns that add a touch of sophistication to your wardrobe.',
    fullDescription: 'This elegant summer dress is crafted from premium 100% cotton fabric, ensuring breathability and comfort throughout the day. The A-line silhouette flatters all body types, while the delicate floral print adds a feminine touch. Perfect for brunches, garden parties, or casual outings. The dress features a comfortable fit with adjustable straps and a flared hem that moves beautifully with every step.',
    specifications: {
      'Fabric': '100% Premium Cotton',
      'Fit': 'Regular Fit',
      'Length': 'Knee Length',
      'Sleeve': 'Sleeveless',
      'Pattern': 'Floral Print',
      'Neckline': 'Round Neck',
      'Care Instructions': 'Machine Wash Cold, Tumble Dry Low, Iron on Low Heat'
    },
    shippingInfo: {
      'Free Shipping': 'On orders above ₹2000',
      'Standard Delivery': '5-7 business days',
      'Express Delivery': '2-3 business days (₹200)',
      'Returns': '30 days return policy',
      'Exchange': 'Easy exchange available'
    }
  }

  // Mock reviews
  const reviews = [
    { id: 1, name: 'Priya Sharma', rating: 5, date: '2024-01-15', comment: 'Absolutely love this dress! The fit is perfect and the quality is excellent. Highly recommend!' },
    { id: 2, name: 'Anjali Patel', rating: 4, date: '2024-01-10', comment: 'Beautiful dress, very comfortable. The material is soft and breathable. Only wish it came in more colors.' },
    { id: 3, name: 'Meera Reddy', rating: 5, date: '2024-01-05', comment: 'Perfect for summer! The floral pattern is elegant and the dress is very well made. Great value for money.' }
  ]

  // Mock related products
  const relatedProducts = [
    { id: 2, name: 'Floral Print Maxi Dress', category: 'Women', subcategory: 'Dresses', price: 79.99, image: 'https://images.unsplash.com/photo-1566479179817-1c6d2c05b93e?w=400&h=500&fit=crop', rating: 4.6, reviews: 15 },
    { id: 3, name: 'Classic A-Line Dress', category: 'Women', subcategory: 'Dresses', price: 94.99, originalPrice: 119.99, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop', onSale: true, rating: 4.7, reviews: 32 },
    { id: 4, name: 'Evening Gown', category: 'Women', subcategory: 'Dresses', price: 149.99, image: 'https://images.unsplash.com/photo-1566479179817-1c6d2c05b93e?w=400&h=500&fit=crop', rating: 4.8, reviews: 28 },
    { id: 5, name: 'Casual Midi Dress', category: 'Women', subcategory: 'Dresses', price: 69.99, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop', rating: 4.4, reviews: 19 }
  ]

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  const handleAddToCart = () => {
    console.log('Add to cart:', { id, size: selectedSize, color: selectedColor, quantity })
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products/women">Women</Link>
          <span>/</span>
          <Link to="/products/women/dresses">Dresses</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-detail">
          <div className="product-images">
            <div className="main-image-wrapper">
              <div className="main-image">
                <img src={product.images[selectedImageIndex]} alt={product.name} />
                {product.onSale && <span className="sale-badge">Sale</span>}
                <button className="image-nav-btn prev-btn" onClick={prevImage} aria-label="Previous image">
                  <ChevronLeft size={24} />
                </button>
                <button className="image-nav-btn next-btn" onClick={nextImage} aria-label="Next image">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
            <div className="thumbnail-images">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumbnail-btn ${selectedImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="product-info">
            <div className="product-header">
              <div className="product-header-top">
                <div>
                  <span className="product-brand">{product.brand}</span>
                  <h1>{product.name}</h1>
                  <div className="product-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          fill={i < Math.floor(product.rating) ? '#ffc107' : 'none'}
                          color="#ffc107"
                        />
                      ))}
                    </div>
                    <span>({product.reviews} reviews)</span>
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
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
                        setShowShareMenu(false)
                        success('Sharing on Facebook...')
                      }} className="share-menu-item">
                        <Facebook size={18} />
                        Facebook
                      </button>
                      <button onClick={() => {
                        const url = window.location.href
                        const text = `Check out ${product.name} at Arudhra Boutique!`
                        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
                        setShowShareMenu(false)
                        success('Sharing on Twitter...')
                      }} className="share-menu-item">
                        <Twitter size={18} />
                        Twitter
                      </button>
                      <button onClick={() => {
                        const url = window.location.href
                        window.open(`https://www.instagram.com/`, '_blank')
                        setShowShareMenu(false)
                        success('Opening Instagram...')
                      }} className="share-menu-item">
                        <Instagram size={18} />
                        Instagram
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

            <div className="product-price">
              {product.originalPrice && (
                <span className="original-price">₹{product.originalPrice}</span>
              )}
              <span className="current-price">₹{product.price}</span>
              {product.onSale && (
                <span className="discount-badge">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              )}
            </div>

            <div className="stock-info">
              <span className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                {product.inStock ? (
                  <>
                    <Check size={16} />
                    In Stock ({product.stockCount} available)
                  </>
                ) : (
                  'Out of Stock'
                )}
              </span>
            </div>

            <p className="product-description">{product.description}</p>

            <div className="product-options">
              <div className="option-group">
                <label>Size</label>
                <div className="size-options">
                  {product.sizes.map(size => (
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

              <div className="option-group">
                <label>Color</label>
                <div className="color-options">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      className={`color-btn ${selectedColor === color.name ? 'active' : ''}`}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                    >
                      <span 
                        className="color-swatch"
                        style={{ backgroundColor: color.value }}
                      ></span>
                      {selectedColor === color.name && <span className="check-mark">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

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
              <button className="btn btn-primary btn-large" onClick={handleAddToCart}>
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                Wishlist
              </button>
              <button className="btn btn-outline">
                <Share2 size={20} />
                Share
              </button>
            </div>

            <div className="product-features">
              <div className="feature-item">
                <Package size={20} />
                <div>
                  <strong>Free Shipping</strong>
                  <span>On orders above ₹2000</span>
                </div>
              </div>
              <div className="feature-item">
                <RotateCcw size={20} />
                <div>
                  <strong>Easy Returns</strong>
                  <span>30 days return policy</span>
                </div>
              </div>
              <div className="feature-item">
                <Shield size={20} />
                <div>
                  <strong>Secure Payment</strong>
                  <span>100% secure checkout</span>
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
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="tab-panel">
                <h3>Shipping & Returns</h3>
                <div className="shipping-info">
                  {Object.entries(product.shippingInfo).map(([key, value]) => (
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
                            fill={i < Math.floor(product.rating) ? '#ffc107' : 'none'}
                            color="#ffc107"
                          />
                        ))}
                      </div>
                      <span className="review-count">Based on {product.reviews} reviews</span>
                    </div>
                  </div>
                </div>
                <div className="reviews-list">
                  {reviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div>
                          <strong>{review.name}</strong>
                          <div className="review-rating">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < review.rating ? '#ffc107' : 'none'}
                                color="#ffc107"
                              />
                            ))}
                          </div>
                        </div>
                        <span className="review-date">{review.date}</span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="related-products-section">
          <h2>You May Also Like</h2>
          <div className="related-products-grid grid-4">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail


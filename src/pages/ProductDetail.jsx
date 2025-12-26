import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { Heart, ShoppingCart, Star, Share2, Minus, Plus } from 'lucide-react'

function ProductDetail() {
  const { id } = useParams()
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedColor, setSelectedColor] = useState('Navy Blue')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Mock product data
  const product = {
    id: 1,
    name: 'Elegant Summer Dress',
    category: 'Women - Dresses',
    price: 89.99,
    originalPrice: 129.99,
    image: 'https://via.placeholder.com/600x800/2d5a5a/ffffff?text=Dress',
    images: [
      'https://via.placeholder.com/600x800/2d5a5a/ffffff?text=Dress+1',
      'https://via.placeholder.com/600x800/ff6b6b/ffffff?text=Dress+2',
      'https://via.placeholder.com/600x800/d2691e/ffffff?text=Dress+3'
    ],
    onSale: true,
    rating: 4.5,
    reviews: 24,
    brand: 'FashionCo',
    material: '100% Cotton',
    care: 'Machine Wash',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Navy Blue', value: '#1a1a2e' },
      { name: 'Coral', value: '#ff6b6b' },
      { name: 'Sage Green', value: '#9caf88' }
    ],
    inStock: true,
    description: 'A beautiful summer dress perfect for any occasion. Made from high-quality cotton for comfort and style.'
  }

  const handleAddToCart = () => {
    console.log('Add to cart:', { id, size: selectedSize, color: selectedColor, quantity })
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="product-detail">
          <div className="product-images">
            <div className="main-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="thumbnail-images">
              {product.images.map((img, idx) => (
                <img key={idx} src={img} alt={`${product.name} ${idx + 1}`} />
              ))}
            </div>
          </div>

          <div className="product-info">
            <div className="product-header">
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

            <div className="product-price">
              {product.originalPrice && (
                <span className="original-price">₹{product.originalPrice}</span>
              )}
              <span className="current-price">₹{product.price}</span>
              {product.onSale && <span className="sale-badge">Sale</span>}
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

            <div className="product-details">
              <div className="detail-item">
                <strong>Material:</strong> {product.material}
              </div>
              <div className="detail-item">
                <strong>Care:</strong> {product.care}
              </div>
              <div className="detail-item">
                <strong>Availability:</strong>{' '}
                <span className={product.inStock ? 'in-stock' : 'out-of-stock'}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail


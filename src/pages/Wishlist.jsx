import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
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
      image: 'https://via.placeholder.com/400x500/2d5a5a/ffffff?text=Dress',
      onSale: true,
      rating: 4.5,
      reviews: 24
    },
    {
      id: 2,
      name: 'Classic Denim Jacket',
      category: 'Men - Jackets',
      price: 79.99,
      image: 'https://via.placeholder.com/400x500/ff6b6b/ffffff?text=Jacket',
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
      image: 'https://via.placeholder.com/400x500/d2691e/ffffff?text=Handbag',
      onSale: true,
      rating: 4.9,
      reviews: 31
    }
  ])

  const removeFromWishlist = (id) => {
    setWishlistItems(items => items.filter(item => item.id !== id))
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <p>{wishlistItems.length} item(s) saved</p>
        </div>

        {wishlistItems.length > 0 ? (
          <>
            <div className="wishlist-actions">
              <button className="btn btn-outline">Share Wishlist</button>
              <button className="btn btn-outline">Add All to Cart</button>
            </div>
            <div className="wishlist-grid grid-4">
              {wishlistItems.map(product => (
                <div key={product.id} className="wishlist-item-wrapper">
                  <button
                    className="remove-btn"
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label="Remove from wishlist"
                  >
                    <X size={18} />
                  </button>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-wishlist">
            <h2>Your wishlist is empty</h2>
            <p>Start adding items you love to your wishlist</p>
            <Link to="/products/women" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist


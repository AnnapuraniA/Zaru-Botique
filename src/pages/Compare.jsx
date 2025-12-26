import { Link } from 'react-router-dom'
import { X, Star } from 'lucide-react'
import { useState } from 'react'

function Compare() {
  const [compareItems, setCompareItems] = useState([
    {
      id: 1,
      name: 'Elegant Summer Dress',
      image: 'https://via.placeholder.com/300x400/2d5a5a/ffffff?text=Dress+1',
      price: 89.99,
      originalPrice: 129.99,
      rating: 4.5,
      reviews: 24,
      brand: 'FashionCo',
      material: '100% Cotton',
      care: 'Machine Wash',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Navy', 'Coral', 'Sage'],
      inStock: true
    },
    {
      id: 2,
      name: 'Classic White Shirt',
      image: 'https://via.placeholder.com/300x400/ff6b6b/ffffff?text=Shirt',
      price: 49.99,
      rating: 4.8,
      reviews: 18,
      brand: 'StyleBrand',
      material: 'Cotton Blend',
      care: 'Machine Wash',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['White', 'Beige'],
      inStock: true
    },
    {
      id: 3,
      name: 'Floral Print Dress',
      image: 'https://via.placeholder.com/300x400/d2691e/ffffff?text=Floral',
      price: 79.99,
      rating: 4.6,
      reviews: 15,
      brand: 'FashionCo',
      material: 'Polyester',
      care: 'Dry Clean',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Pink', 'Blue', 'Yellow'],
      inStock: true
    }
  ])

  const removeFromCompare = (id) => {
    setCompareItems(items => items.filter(item => item.id !== id))
  }

  const comparisonFields = [
    { key: 'price', label: 'Price' },
    { key: 'rating', label: 'Rating' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'brand', label: 'Brand' },
    { key: 'material', label: 'Material' },
    { key: 'care', label: 'Care Instructions' },
    { key: 'sizes', label: 'Available Sizes' },
    { key: 'colors', label: 'Available Colors' },
    { key: 'inStock', label: 'In Stock' }
  ]

  return (
    <div className="compare-products-page">
      <div className="container">
        <div className="compare-header">
          <h1>Compare Products</h1>
          <p>Compare up to 4 products side by side</p>
        </div>

        {compareItems.length > 0 ? (
          <div className="compare-table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th></th>
                  {compareItems.map(item => (
                    <th key={item.id} className="product-column">
                      <button
                        className="remove-compare-btn"
                        onClick={() => removeFromCompare(item.id)}
                        aria-label="Remove from comparison"
                      >
                        <X size={18} />
                      </button>
                      <Link to={`/product/${item.id}`} className="compare-product-link">
                        <img src={item.image} alt={item.name} />
                        <h3>{item.name}</h3>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFields.map(field => (
                  <tr key={field.key}>
                    <td className="field-label">{field.label}</td>
                    {compareItems.map(item => (
                      <td key={item.id} className="field-value">
                        {field.key === 'price' && (
                          <div>
                            {item.originalPrice && (
                              <span className="original-price">${item.originalPrice}</span>
                            )}
                            <span className="current-price">${item.price}</span>
                          </div>
                        )}
                        {field.key === 'rating' && (
                          <div className="rating-display">
                            <div className="stars">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  fill={i < Math.floor(item.rating) ? '#ffc107' : 'none'}
                                  color="#ffc107"
                                />
                              ))}
                            </div>
                            <span>{item.rating}</span>
                          </div>
                        )}
                        {field.key === 'reviews' && <span>{item.reviews}</span>}
                        {field.key === 'brand' && <span>{item.brand}</span>}
                        {field.key === 'material' && <span>{item.material}</span>}
                        {field.key === 'care' && <span>{item.care}</span>}
                        {field.key === 'sizes' && (
                          <div className="sizes-list">
                            {item.sizes.map(size => (
                              <span key={size} className="size-badge">{size}</span>
                            ))}
                          </div>
                        )}
                        {field.key === 'colors' && (
                          <div className="colors-list">
                            {item.colors.map(color => (
                              <span key={color} className="color-badge">{color}</span>
                            ))}
                          </div>
                        )}
                        {field.key === 'inStock' && (
                          <span className={item.inStock ? 'in-stock' : 'out-of-stock'}>
                            {item.inStock ? 'Yes' : 'No'}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="actions-row">
                  <td className="field-label">Actions</td>
                  {compareItems.map(item => (
                    <td key={item.id} className="field-value">
                      <Link to={`/product/${item.id}`} className="btn btn-primary">
                        View Product
                      </Link>
                      <button className="btn btn-outline">Add to Cart</button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-compare">
            <h2>No products to compare</h2>
            <p>Add products to compare by clicking the compare button on product pages</p>
            <Link to="/products/women" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Compare


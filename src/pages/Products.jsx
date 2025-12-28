import { useParams, Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import ProductCard from '../components/ProductCard/ProductCard'
import { Filter, X, ArrowRight } from 'lucide-react'

function Products() {
  const { category, subcategory } = useParams()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: [0, 50000],
    sizes: [],
    colors: [],
    discount: [],
    style: [],
    material: [],
    sleeveLength: [],
    length: [],
    brand: []
  })

  // Category subcategories mapping
  const categorySubcategories = {
    'Women': ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories'],
    'Teen': ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories'],
    'Girls': ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories']
  }

  // Mock products data with subcategories - Comprehensive dummy data
  const allProducts = [
    // Women - Dresses
    { id: 1, name: 'Elegant Summer Dress', category: 'Women', subcategory: 'Dresses', price: 89.99, originalPrice: 129.99, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop', onSale: true, rating: 4.5, reviews: 24 },
    { id: 2, name: 'Floral Print Maxi Dress', category: 'Women', subcategory: 'Dresses', price: 79.99, image: 'https://images.unsplash.com/photo-1566479179817-1c6d2c05b93e?w=400&h=500&fit=crop', rating: 4.6, reviews: 15 },
    { id: 3, name: 'Classic A-Line Dress', category: 'Women', subcategory: 'Dresses', price: 94.99, originalPrice: 119.99, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop', onSale: true, rating: 4.7, reviews: 32 },
    { id: 4, name: 'Evening Gown', category: 'Women', subcategory: 'Dresses', price: 149.99, image: 'https://images.unsplash.com/photo-1566479179817-1c6d2c05b93e?w=400&h=500&fit=crop', rating: 4.8, reviews: 28 },
    { id: 5, name: 'Casual Midi Dress', category: 'Women', subcategory: 'Dresses', price: 69.99, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop', rating: 4.4, reviews: 19 },
    
    // Women - Tops
    { id: 6, name: 'Classic White Shirt', category: 'Women', subcategory: 'Tops', price: 49.99, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop', rating: 4.8, reviews: 18 },
    { id: 7, name: 'Casual T-Shirt', category: 'Women', subcategory: 'Tops', price: 39.99, originalPrice: 59.99, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop', onSale: true, rating: 4.4, reviews: 12 },
    { id: 8, name: 'Silk Blouse', category: 'Women', subcategory: 'Tops', price: 89.99, image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop', rating: 4.9, reviews: 25 },
    { id: 9, name: 'Crop Top', category: 'Women', subcategory: 'Tops', price: 34.99, image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=500&fit=crop', rating: 4.3, reviews: 16 },
    { id: 10, name: 'Knit Sweater', category: 'Women', subcategory: 'Tops', price: 79.99, originalPrice: 99.99, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop', onSale: true, rating: 4.6, reviews: 21 },
    
    // Women - Bottoms
    { id: 11, name: 'Denim Jeans', category: 'Women', subcategory: 'Bottoms', price: 69.99, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop', rating: 4.7, reviews: 22 },
    { id: 12, name: 'Wide Leg Trousers', category: 'Women', subcategory: 'Bottoms', price: 84.99, image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=500&fit=crop', rating: 4.5, reviews: 14 },
    { id: 13, name: 'Pleated Skirt', category: 'Women', subcategory: 'Bottoms', price: 59.99, originalPrice: 79.99, image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop', onSale: true, rating: 4.6, reviews: 17 },
    { id: 14, name: 'High-Waist Shorts', category: 'Women', subcategory: 'Bottoms', price: 44.99, image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=500&fit=crop', rating: 4.4, reviews: 13 },
    
    // Women - Outerwear
    { id: 15, name: 'Classic Blazer', category: 'Women', subcategory: 'Outerwear', price: 129.99, image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=500&fit=crop', rating: 4.8, reviews: 26 },
    { id: 16, name: 'Denim Jacket', category: 'Women', subcategory: 'Outerwear', price: 79.99, originalPrice: 99.99, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop', onSale: true, rating: 4.7, reviews: 20 },
    { id: 17, name: 'Trench Coat', category: 'Women', subcategory: 'Outerwear', price: 149.99, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop', rating: 4.9, reviews: 30 },
    
    // Women - Accessories
    { id: 18, name: 'Designer Handbag', category: 'Women', subcategory: 'Accessories', price: 149.99, originalPrice: 199.99, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=500&fit=crop', onSale: true, rating: 4.9, reviews: 31 },
    { id: 19, name: 'Leather Belt', category: 'Women', subcategory: 'Accessories', price: 39.99, image: 'https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=400&h=500&fit=crop', rating: 4.5, reviews: 11 },
    { id: 20, name: 'Silk Scarf', category: 'Women', subcategory: 'Accessories', price: 29.99, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=500&fit=crop', rating: 4.6, reviews: 9 },
    
    // Teen - Dresses
    { id: 21, name: 'Trendy Teen Dress', category: 'Teen', subcategory: 'Dresses', price: 59.99, image: 'https://images.unsplash.com/photo-1566479179817-1c6d2c05b93e?w=400&h=500&fit=crop', rating: 4.5, reviews: 20 },
    { id: 22, name: 'Party Dress', category: 'Teen', subcategory: 'Dresses', price: 69.99, originalPrice: 89.99, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop', onSale: true, rating: 4.7, reviews: 18 },
    { id: 23, name: 'Casual Sundress', category: 'Teen', subcategory: 'Dresses', price: 54.99, image: 'https://images.unsplash.com/photo-1566479179817-1c6d2c05b93e?w=400&h=500&fit=crop', rating: 4.4, reviews: 15 },
    { id: 24, name: 'Formal Teen Dress', category: 'Teen', subcategory: 'Dresses', price: 79.99, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop', rating: 4.6, reviews: 12 },
    
    // Teen - Tops
    { id: 25, name: 'Teen Casual Top', category: 'Teen', subcategory: 'Tops', price: 49.99, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop', rating: 4.6, reviews: 18 },
    { id: 26, name: 'Graphic T-Shirt', category: 'Teen', subcategory: 'Tops', price: 39.99, image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=500&fit=crop', rating: 4.5, reviews: 22 },
    { id: 27, name: 'Hoodie', category: 'Teen', subcategory: 'Tops', price: 64.99, originalPrice: 84.99, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop', onSale: true, rating: 4.8, reviews: 25 },
    { id: 28, name: 'Crop Hoodie', category: 'Teen', subcategory: 'Tops', price: 54.99, image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=500&fit=crop', rating: 4.4, reviews: 14 },
    
    // Teen - Bottoms
    { id: 29, name: 'Skinny Jeans', category: 'Teen', subcategory: 'Bottoms', price: 59.99, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop', rating: 4.6, reviews: 19 },
    { id: 30, name: 'Cargo Pants', category: 'Teen', subcategory: 'Bottoms', price: 64.99, image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400&h=500&fit=crop', rating: 4.5, reviews: 16 },
    { id: 31, name: 'Mini Skirt', category: 'Teen', subcategory: 'Bottoms', price: 44.99, originalPrice: 59.99, image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop', onSale: true, rating: 4.7, reviews: 13 },
    
    // Teen - Outerwear
    { id: 32, name: 'Trendy Teen Jacket', category: 'Teen', subcategory: 'Outerwear', price: 69.99, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop', new: true, rating: 4.8, reviews: 18 },
    { id: 33, name: 'Bomber Jacket', category: 'Teen', subcategory: 'Outerwear', price: 79.99, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop', rating: 4.6, reviews: 15 },
    
    // Teen - Accessories
    { id: 34, name: 'Backpack', category: 'Teen', subcategory: 'Accessories', price: 49.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', rating: 4.5, reviews: 17 },
    { id: 35, name: 'Cap', category: 'Teen', subcategory: 'Accessories', price: 24.99, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=500&fit=crop', rating: 4.3, reviews: 10 },
    
    // Girls - Dresses
    { id: 36, name: 'Girls Pretty Dress', category: 'Girls', subcategory: 'Dresses', price: 39.99, image: 'https://images.unsplash.com/photo-1566479179817-1c6d2c05b93e?w=400&h=500&fit=crop', rating: 4.7, reviews: 15 },
    { id: 37, name: 'Princess Dress', category: 'Girls', subcategory: 'Dresses', price: 49.99, originalPrice: 69.99, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop', onSale: true, rating: 4.8, reviews: 22 },
    { id: 38, name: 'Floral Girls Dress', category: 'Girls', subcategory: 'Dresses', price: 34.99, image: 'https://images.unsplash.com/photo-1566479179817-1c6d2c05b93e?w=400&h=500&fit=crop', rating: 4.6, reviews: 14 },
    { id: 39, name: 'Party Dress', category: 'Girls', subcategory: 'Dresses', price: 44.99, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop', rating: 4.5, reviews: 11 },
    
    // Girls - Tops
    { id: 40, name: 'Girls Fun T-Shirt', category: 'Girls', subcategory: 'Tops', price: 29.99, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop', rating: 4.4, reviews: 12 },
    { id: 41, name: 'Cartoon Print Top', category: 'Girls', subcategory: 'Tops', price: 34.99, image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=500&fit=crop', rating: 4.6, reviews: 16 },
    { id: 42, name: 'Ruffled Blouse', category: 'Girls', subcategory: 'Tops', price: 39.99, originalPrice: 54.99, image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop', onSale: true, rating: 4.7, reviews: 13 },
    
    // Girls - Bottoms
    { id: 43, name: 'Denim Shorts', category: 'Girls', subcategory: 'Bottoms', price: 24.99, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop', rating: 4.5, reviews: 10 },
    { id: 44, name: 'Tutu Skirt', category: 'Girls', subcategory: 'Bottoms', price: 29.99, image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop', rating: 4.8, reviews: 18 },
    { id: 45, name: 'Leggings', category: 'Girls', subcategory: 'Bottoms', price: 19.99, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop', rating: 4.4, reviews: 9 },
    
    // Girls - Outerwear
    { id: 46, name: 'Pink Jacket', category: 'Girls', subcategory: 'Outerwear', price: 49.99, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop', rating: 4.6, reviews: 12 },
    { id: 47, name: 'Cardigan', category: 'Girls', subcategory: 'Outerwear', price: 39.99, originalPrice: 54.99, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop', onSale: true, rating: 4.5, reviews: 11 },
    
    // Girls - Accessories
    { id: 48, name: 'Hair Bows Set', category: 'Girls', subcategory: 'Accessories', price: 14.99, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=500&fit=crop', rating: 4.7, reviews: 8 },
    { id: 49, name: 'Kids Backpack', category: 'Girls', subcategory: 'Accessories', price: 34.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop', rating: 4.6, reviews: 14 },
    { id: 50, name: 'Sparkly Shoes', category: 'Girls', subcategory: 'Accessories', price: 44.99, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop', rating: 4.8, reviews: 16 }
  ]

  // Filter products based on category and subcategory
  const filteredProducts = useMemo(() => {
    let filtered = allProducts

    if (category) {
      const catName = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
      filtered = filtered.filter(p => p.category === catName)
    }

    if (subcategory) {
      const subcatName = subcategory.charAt(0).toUpperCase() + subcategory.slice(1).toLowerCase()
      filtered = filtered.filter(p => p.subcategory === subcatName)
    }

    return filtered
  }, [category, subcategory])

  // Group products by subcategory for "View All" pages
  const groupedProducts = useMemo(() => {
    if (category && !subcategory) {
      const grouped = {}
      filteredProducts.forEach(product => {
        if (!grouped[product.subcategory]) {
          grouped[product.subcategory] = []
        }
        grouped[product.subcategory].push(product)
      })
      return grouped
    }
    return {}
  }, [category, subcategory, filteredProducts])

  const isViewAllPage = category && !subcategory
  const pageTitle = subcategory 
    ? `${category} - ${subcategory}` 
    : category 
    ? `View All ${category.charAt(0).toUpperCase() + category.slice(1)}` 
    : 'All Products'

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }))
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>{pageTitle}</h1>
          {!isViewAllPage && (
            <div className="products-controls">
              <button 
                className="filter-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} />
                Filters
              </button>
            </div>
          )}
        </div>

        {/* Filter Overlay */}
        {showFilters && !isViewAllPage && (
          <div className="filter-overlay" onClick={() => setShowFilters(false)}></div>
        )}

        {/* Filter Sidebar */}
        {showFilters && !isViewAllPage && (
          <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button 
                className="close-filters"
                onClick={() => setShowFilters(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="filters-content">
              <div className="filter-section">
                <h4>Price Range</h4>
                <input type="range" min="0" max="50000" step="100" />
                <div className="price-range">
                  <span>₹0</span>
                  <span>₹50,000</span>
                </div>
              </div>

              <div className="filter-section">
                <h4>Size</h4>
                <div className="size-filters">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <label key={size} className="size-option">
                      <input 
                        type="checkbox" 
                        checked={filters.sizes.includes(size)}
                        onChange={() => handleFilterChange('sizes', size)}
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4>Color</h4>
                <div className="color-filters">
                  {['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink'].map(color => (
                    <label key={color} className="color-option">
                      <input 
                        type="checkbox" 
                        checked={filters.colors.includes(color)}
                        onChange={() => handleFilterChange('colors', color)}
                      />
                      <span>{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4>Discount</h4>
                <div className="discount-filters">
                  {['10%', '20%', '30%', '40%', '50%+'].map(discount => (
                    <label key={discount} className="discount-option">
                      <input 
                        type="checkbox" 
                        checked={filters.discount.includes(discount)}
                        onChange={() => handleFilterChange('discount', discount)}
                      />
                      <span>{discount} OFF</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4>Style/Pattern</h4>
                <div className="style-filters">
                  {['Solid', 'Striped', 'Floral', 'Polka Dot', 'Geometric', 'Abstract'].map(style => (
                    <label key={style} className="style-option">
                      <input 
                        type="checkbox" 
                        checked={filters.style.includes(style)}
                        onChange={() => handleFilterChange('style', style)}
                      />
                      <span>{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4>Material/Fabric</h4>
                <div className="material-filters">
                  {['Cotton', 'Polyester', 'Silk', 'Denim', 'Linen', 'Wool'].map(material => (
                    <label key={material} className="material-option">
                      <input 
                        type="checkbox" 
                        checked={filters.material.includes(material)}
                        onChange={() => handleFilterChange('material', material)}
                      />
                      <span>{material}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4>Sleeve Length</h4>
                <div className="sleeve-filters">
                  {['Sleeveless', 'Short Sleeve', '3/4 Sleeve', 'Long Sleeve'].map(sleeve => (
                    <label key={sleeve} className="sleeve-option">
                      <input 
                        type="checkbox" 
                        checked={filters.sleeveLength.includes(sleeve)}
                        onChange={() => handleFilterChange('sleeveLength', sleeve)}
                      />
                      <span>{sleeve}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4>Length</h4>
                <div className="length-filters">
                  {['Short', 'Medium', 'Long', 'Extra Long'].map(length => (
                    <label key={length} className="length-option">
                      <input 
                        type="checkbox" 
                        checked={filters.length.includes(length)}
                        onChange={() => handleFilterChange('length', length)}
                      />
                      <span>{length}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-section">
                <h4>Brand</h4>
                <div className="brand-filters">
                  {['FashionCo', 'StyleHub', 'Trendy', 'Classic', 'Modern'].map(brand => (
                    <label key={brand} className="brand-option">
                      <input 
                        type="checkbox" 
                        checked={filters.brand.includes(brand)}
                        onChange={() => handleFilterChange('brand', brand)}
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Products Display */}
        <div className="products-content">
          {isViewAllPage ? (
            // View All - Grouped by subcategory
            Object.keys(groupedProducts).length > 0 ? (
              <div className="subcategory-sections">
                {(categorySubcategories[category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()] || []).map(subcat => {
                  const subProducts = groupedProducts[subcat] || []
                  if (subProducts.length === 0) return null
                  
                  return (
                    <div key={subcat} className="subcategory-section">
                      <div className="subcategory-header">
                        <h2 className="subcategory-title">{subcat}</h2>
                        <Link
                          to={`/products/${category.toLowerCase()}/${subcat.toLowerCase()}`}
                          className="subcategory-arrow-link"
                        >
                          <span>View All</span>
                          <ArrowRight size={20} />
                        </Link>
                      </div>
                      <div className="products-grid grid-compact">
                        {subProducts.map(product => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="no-products">
                <p>No products found in this category.</p>
              </div>
            )
          ) : (
            // Specific subcategory page
            filteredProducts.length > 0 ? (
              <div className="products-grid grid-medium">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <p>No products found matching your filters.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default Products

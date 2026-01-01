import { useParams, Link } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import ProductCard from '../components/ProductCard/ProductCard'
import { Filter, X, ArrowRight } from 'lucide-react'
import { productsAPI } from '../utils/api'

function Products() {
  const { category, subcategory } = useParams()
  const [showFilters, setShowFilters] = useState(false)
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const apiFilters = {}
        
        if (category) {
          const catName = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
          apiFilters.category = catName
        }
        
        if (subcategory) {
          const subcatName = subcategory.charAt(0).toUpperCase() + subcategory.slice(1).toLowerCase()
          apiFilters.subcategory = subcatName
        }
        
        // Apply additional filters if needed
        if (filters.sizes.length > 0) {
          apiFilters.sizes = filters.sizes
        }
        if (filters.colors.length > 0) {
          apiFilters.colors = filters.colors
        }
        if (filters.priceRange[1] < 50000) {
          apiFilters.maxPrice = filters.priceRange[1]
        }
        if (filters.priceRange[0] > 0) {
          apiFilters.minPrice = filters.priceRange[0]
        }
        
        const response = await productsAPI.getAll(apiFilters)
        setAllProducts(response.products || [])
      } catch (err) {
        console.error('Failed to fetch products:', err)
        setError('Failed to load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [category, subcategory, filters.sizes, filters.colors, filters.priceRange[0], filters.priceRange[1]])

  // Filter products based on category and subcategory (client-side filtering for additional filters)
  const filteredProducts = useMemo(() => {
    let filtered = allProducts

    // Additional client-side filtering for filters not supported by API
    if (filters.style.length > 0) {
      // This would need to be handled by API or removed
    }
    if (filters.material.length > 0) {
      filtered = filtered.filter(p => 
        filters.material.some(m => p.material?.toLowerCase().includes(m.toLowerCase()))
      )
    }
    if (filters.brand.length > 0) {
      filtered = filtered.filter(p => 
        filters.brand.includes(p.brand)
      )
    }

    return filtered
  }, [allProducts, filters.style, filters.material, filters.brand])

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
          {loading ? (
            <div className="loading-spinner">
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
            </div>
          ) : isViewAllPage ? (
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
                          <ProductCard key={product._id || product.id} product={product} />
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
                  <ProductCard key={product._id || product.id} product={product} />
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

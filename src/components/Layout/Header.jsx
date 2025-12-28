import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Heart, User, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

function Header() {
  const { isAuthenticated, user } = useAuth()
  const [expandedCategory, setExpandedCategory] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  const categories = [
    {
      name: 'Women',
      subcategories: ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories']
    },
    {
      name: 'Teen',
      subcategories: ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories']
    },
    {
      name: 'Girls',
      subcategories: ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories']
    }
  ]

  const toggleCategory = (categoryName) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName)
  }

  // Close accordion when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (expandedCategory && !e.target.closest('.nav-category')) {
        setExpandedCategory(null)
      }
    }

    if (expandedCategory) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [expandedCategory])

  const handleCategoryClick = (categoryName) => {
    navigate(`/products/${categoryName.toLowerCase()}`)
    setExpandedCategory(null)
  }

  const handleSubcategoryClick = (categoryName, subcategoryName) => {
    navigate(`/products/${categoryName.toLowerCase()}/${subcategoryName.toLowerCase()}`)
    setExpandedCategory(null)
  }

  return (
    <header className={`header ${!isHomePage ? 'header-footer-style' : ''}`}>
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>Arudhra Boutique</h1>
          </Link>

          <nav className="main-nav">
            {categories.map((category) => (
              <div 
                key={category.name} 
                className={`nav-category ${expandedCategory === category.name ? 'expanded' : ''}`}
              >
                <div className="nav-category-header">
                  <button
                    className="nav-category-btn"
                    onClick={() => toggleCategory(category.name)}
                  >
                    {category.name}
                    {expandedCategory === category.name ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                </div>
                
                {expandedCategory === category.name && (
                  <div className="nav-subcategories">
                    <button
                      className="nav-subcategory-item main-category-link"
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      View All {category.name}
                    </button>
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory}
                        className="nav-subcategory-item"
                        onClick={() => handleSubcategoryClick(category.name, subcategory)}
                      >
                        {subcategory}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="header-actions">
            <div className="search-box">
              <Search size={20} />
              <input type="text" placeholder="Search products..." />
            </div>
            <Link to="/wishlist" className="icon-btn">
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="icon-btn">
              <ShoppingCart size={20} />
            </Link>
            <Link to="/dashboard" className="icon-btn" title={isAuthenticated ? user?.name || 'Profile' : 'Login/Register'}>
              <User size={20} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header


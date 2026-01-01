import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Heart, User, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { cartAPI } from '../../utils/api'

function Header() {
  const { isAuthenticated, user } = useAuth()
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [isSticky, setIsSticky] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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

  // Load cart count
  useEffect(() => {
    const loadCartCount = async () => {
      if (isAuthenticated) {
        try {
          const response = await cartAPI.get()
          const count = (response.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0)
          setCartCount(count)
        } catch (err) {
          console.error('Failed to load cart count:', err)
        }
      } else {
        // Guest cart
        const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '[]')
        const count = guestCart.reduce((sum, item) => sum + (item.quantity || 1), 0)
        setCartCount(count)
      }
    }
    loadCartCount()
    
    // Listen for cart updates
    const handleStorageChange = () => {
      if (!isAuthenticated) {
        const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '[]')
        const count = guestCart.reduce((sum, item) => sum + (item.quantity || 1), 0)
        setCartCount(count)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cartUpdated', loadCartCount)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', loadCartCount)
    }
  }, [isAuthenticated])

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    }
  }

  return (
    <header className={`header ${!isHomePage ? 'header-footer-style' : ''} ${isSticky ? 'sticky' : ''}`}>
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <img src="/Logo.png" alt="Arudhra Fashions Logo" className="logo-img" />
            <h1>Arudhra Fashions</h1>
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
            <form className="search-box" onSubmit={handleSearch}>
              <Search size={20} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
            </form>
            <Link to="/wishlist" className="icon-btn">
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="icon-btn">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="badge show">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
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


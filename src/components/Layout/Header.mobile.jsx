import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Heart, User, Search, ChevronDown, ChevronUp, GitCompare } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHeaderData } from '../../hooks/useHeaderData'

function HeaderMobile() {
  const { isAuthenticated, user } = useAuth()
  const { cartCount, compareCount, isSticky } = useHeaderData()
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isHomeCategoriesOpen, setIsHomeCategoriesOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/categories`)
        const data = await response.json()
        setCategories(data || [])
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }
    fetchCategories()
  }, [])

  const toggleCategory = (categorySlug) => {
    setExpandedCategory(expandedCategory === categorySlug ? null : categorySlug)
  }

  const handleCategoryClick = (categorySlug) => {
    navigate(`/products/${categorySlug}`)
    setExpandedCategory(null)
    setIsHomeCategoriesOpen(false)
  }

  const handleSubcategoryClick = (categorySlug, subcategorySlug) => {
    navigate(`/products/${categorySlug}/${subcategorySlug}`)
    setExpandedCategory(null)
    setIsHomeCategoriesOpen(false)
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

  // Close search when clicking outside
  useEffect(() => {
    if (!isSearchExpanded) return

    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-wrapper') && !e.target.closest('.search-dropdown')) {
        setIsSearchExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSearchExpanded])

  // Close categories when clicking outside (for both home and other pages)
  useEffect(() => {
    if (!isHomeCategoriesOpen) return

    const handleClickOutside = (e) => {
      if (!e.target.closest('.main-nav') && !e.target.closest('.categories-arrow-btn') && !e.target.closest('.categories-arrow-container')) {
        setIsHomeCategoriesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isHomeCategoriesOpen])

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
    <div className={`header-wrapper ${!isHomePage ? 'header-footer-style' : ''}`}>
      <header className={`header header-mobile ${!isHomePage ? 'header-footer-style' : ''} ${isSticky ? 'sticky' : ''} ${isHomePage ? 'home-header' : ''}`}>
        <div className="container">
          <div className={`header-content ${isHomePage ? 'home-header-content' : 'other-page-header-content'}`}>
            {!isHomePage && (
              <Link to="/" className="brand-name">
                Arudhra Fashions
              </Link>
            )}
            
            {/* Categories - Hidden by default on mobile, shown when arrow clicked */}
            <nav className={`main-nav ${isHomePage ? 'home-nav' : 'other-page-nav'} ${isHomePage && isHomeCategoriesOpen ? 'home-categories-open' : ''} ${!isHomePage && isHomeCategoriesOpen ? 'other-page-categories-open' : ''}`}>
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className={`nav-category ${expandedCategory === category.slug ? 'expanded' : ''}`}
                >
                  <div className="nav-category-header">
                    <button
                      className="nav-category-btn"
                      onClick={() => toggleCategory(category.slug)}
                    >
                      {category.name}
                      {expandedCategory === category.slug ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>
                  
                  {expandedCategory === category.slug && (
                    <div className="nav-subcategories">
                      <button
                        className="nav-subcategory-item main-category-link"
                        onClick={() => handleCategoryClick(category.slug)}
                      >
                        View All {category.name}
                      </button>
                      {(category.subcategories || []).map((subcategory) => (
                        <button
                          key={subcategory.id}
                          className="nav-subcategory-item"
                          onClick={() => handleSubcategoryClick(category.slug, subcategory.slug)}
                        >
                          {subcategory.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="header-actions">
              <div className="search-wrapper">
                <button 
                  className="search-icon-btn" 
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  title="Search"
                >
                  <Search size={20} />
                </button>
                {isSearchExpanded && (
                  <div className="search-dropdown">
                    <form className="search-box search-expanded" onSubmit={(e) => { handleSearch(e); setIsSearchExpanded(false); }}>
                      <Search size={20} />
                      <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleSearchKeyPress}
                        autoFocus
                      />
                      <button 
                        type="button" 
                        className="search-close-btn"
                        onClick={() => setIsSearchExpanded(false)}
                      >
                        ×
                      </button>
                    </form>
                  </div>
                )}
              </div>
              {!isHomePage && (
                <>
                  <Link to="/wishlist" className="icon-btn" title="Wishlist">
                    <Heart size={20} />
                  </Link>
                  <Link to="/cart" className="icon-btn" title="Shopping Cart">
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="badge show">{cartCount > 99 ? '99+' : cartCount}</span>
                    )}
                  </Link>
                </>
              )}
              <Link to="/compare" className="icon-btn" title="Compare Products">
                <GitCompare size={20} />
                {compareCount > 0 && (
                  <span className="badge show">{compareCount > 4 ? '4+' : compareCount}</span>
                )}
              </Link>
              <Link to="/dashboard" className="icon-btn" title={isAuthenticated ? user?.name || 'Profile' : 'Login/Register'}>
                <User size={20} />
              </Link>
            </div>
          </div>
        </div>
      </header>
      {/* Arrow button for categories - on mobile for both home and other pages */}
      <div className="categories-arrow-container">
        <button 
          className="categories-arrow-btn"
          onClick={() => setIsHomeCategoriesOpen(!isHomeCategoriesOpen)}
          aria-label="Toggle categories"
        >
          {isHomeCategoriesOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>
    </div>
  )
}

export default HeaderMobile

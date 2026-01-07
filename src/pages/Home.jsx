import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Newsletter from '../components/Newsletter/Newsletter'
import ProductCard from '../components/ProductCard/ProductCard'
import { bannersAPI, productsAPI, contentAPI } from '../utils/api'
import { useToast } from '../components/Toast/ToastContainer'

function Home() {
  const [showNewsletter, setShowNewsletter] = useState(false)
  const [banners, setBanners] = useState([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [heroContent, setHeroContent] = useState({
    title: 'Discover Your Style',
    description: 'Shop the latest fashion trends and timeless classics',
    button1Text: 'Shop Women',
    button1Link: '/products/women',
    button2Text: 'Shop Teen',
    button2Link: '/products/teen',
    button3Text: 'Shop Girls',
    button3Link: '/products/girls'
  })
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newProducts, setNewProducts] = useState([])
  const [saleProducts, setSaleProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { error: showError } = useToast()

  useEffect(() => {
    loadHomeData()
    
    // Show newsletter modal after 3 seconds on first visit
    const hasSeenNewsletter = localStorage.getItem('newsletterShown')
    if (!hasSeenNewsletter) {
      const timer = setTimeout(() => {
        setShowNewsletter(true)
        localStorage.setItem('newsletterShown', 'true')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [banners.length])

  const loadHomeData = async () => {
    try {
      setLoading(true)
      
      // Load banners
      try {
        const bannersData = await bannersAPI.getAll()
        if (Array.isArray(bannersData)) {
          setBanners(bannersData)
        }
      } catch (err) {
        console.error('Failed to load banners:', err)
        setBanners([])
      }

      // Load hero content
      try {
        const heroData = await contentAPI.getHero()
        if (heroData && Object.keys(heroData).length > 0) {
          setHeroContent(prev => ({ ...prev, ...heroData }))
        }
      } catch (err) {
        console.error('Failed to load hero content:', err)
        // Keep default hero content
      }

      // Load featured products
      try {
        const featuredData = await productsAPI.getAll({ featured: true, limit: 8 })
        if (featuredData && Array.isArray(featuredData.products)) {
          setFeaturedProducts(featuredData.products)
        } else if (Array.isArray(featuredData)) {
          setFeaturedProducts(featuredData)
        }
      } catch (err) {
        console.error('Failed to load featured products:', err)
        setFeaturedProducts([])
      }

      // Load new products
      try {
        const newData = await productsAPI.getAll({ new: true, limit: 8 })
        if (newData && Array.isArray(newData.products)) {
          setNewProducts(newData.products)
        } else if (Array.isArray(newData)) {
          setNewProducts(newData)
        }
      } catch (err) {
        console.error('Failed to load new products:', err)
        setNewProducts([])
      }

      // Load sale products
      try {
        const saleData = await productsAPI.getAll({ onSale: true, limit: 8 })
        if (saleData && Array.isArray(saleData.products)) {
          setSaleProducts(saleData.products)
        } else if (Array.isArray(saleData)) {
          setSaleProducts(saleData)
        }
      } catch (err) {
        console.error('Failed to load sale products:', err)
        setSaleProducts([])
      }
    } catch (err) {
      console.error('Failed to load home data:', err)
      // Don't show error toast on initial load to avoid blocking UI
    } finally {
      setLoading(false)
    }
  }

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
  }

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <div className="home-page">
      {/* Hero Section with Banners */}
      {banners.length > 0 ? (
        <section className="hero-banner">
          <Link to="/" className="hero-logo">
            <img src="/Logo.png" alt="Arudhra Fashions Logo" className="hero-logo-img" />
          </Link>
          <div className="banner-slider">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`banner-slide ${index === currentBannerIndex ? 'active' : ''}`}
                style={{ backgroundImage: `url(${banner.image})` }}
              >
                <div className="banner-content">
                  <h1>{banner.title}</h1>
                  {banner.subtitle && <p>{banner.subtitle}</p>}
                  {banner.link && (
                    <Link to={banner.link} className="btn btn-primary btn-large">
                      Shop Now
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {banners.length > 1 && (
              <>
                <button className="banner-nav banner-nav-prev" onClick={prevBanner}>
                  <ChevronLeft size={24} />
                </button>
                <button className="banner-nav banner-nav-next" onClick={nextBanner}>
                  <ChevronRight size={24} />
                </button>
                <div className="banner-indicators">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      className={`banner-indicator ${index === currentBannerIndex ? 'active' : ''}`}
                      onClick={() => setCurrentBannerIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      ) : (
        <section className="hero">
          <Link to="/" className="hero-logo">
            <img src="/Logo.png" alt="Arudhra Fashions Logo" className="hero-logo-img" />
          </Link>
          <div className="hero-content">
            <h1>{heroContent.title}</h1>
            <p>{heroContent.description}</p>
            <div className="hero-buttons">
              <Link to={heroContent.button1Link || "/products/women"} className="btn btn-primary btn-large">
                {heroContent.button1Text || "Shop Women"}
              </Link>
              <Link to={heroContent.button2Link || "/products/teen"} className="btn btn-outline btn-large">
                {heroContent.button2Text || "Shop Teen"}
              </Link>
              <Link to={heroContent.button3Link || "/products/girls"} className="btn btn-outline btn-large">
                {heroContent.button3Text || "Shop Girls"}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <h2>Featured Products</h2>
            <div className="products-grid home-products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="new-arrivals-section">
          <div className="container">
            <h2>New Arrivals</h2>
            <div className="products-grid">
              {newProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="section-footer">
              <Link to="/products?new=true" className="btn btn-outline">
                View All New Arrivals
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Sale Products */}
      {saleProducts.length > 0 && (
        <section className="sale-section">
          <div className="container">
            <h2>On Sale</h2>
            <div className="products-grid home-products-grid">
              {saleProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {showNewsletter && (
        <Newsletter onClose={() => setShowNewsletter(false)} />
      )}
    </div>
  )
}

export default Home


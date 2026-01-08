import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Newsletter from '../components/Newsletter/Newsletter'
import ProductCard from '../components/ProductCard/ProductCard'
import { bannersAPI, productsAPI, contentAPI, newArrivalsAPI, getImageUrl } from '../utils/api'
import { useToast } from '../components/Toast/ToastContainer'
import { useDevice } from '../hooks/useDevice'

function Home() {
  const isMobile = useDevice()
  const [showNewsletter, setShowNewsletter] = useState(false)
  const [banners, setBanners] = useState([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [bannerHeights, setBannerHeights] = useState({})
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
  const [newArrivals, setNewArrivals] = useState([])
  const [currentArrivalIndex, setCurrentArrivalIndex] = useState(0)
  const [selectedArrival, setSelectedArrival] = useState(null)
  const [isHoveringArrivals, setIsHoveringArrivals] = useState(false)
  const arrivalIntervalRef = useRef(null)
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

  // Auto-rotate new arrivals (3 seconds, pause on hover or when modal is open)
  useEffect(() => {
    // Always clear existing interval first
    if (arrivalIntervalRef.current) {
      clearInterval(arrivalIntervalRef.current)
      arrivalIntervalRef.current = null
    }

    // Only set up interval if we have multiple arrivals, not hovering, and modal is not open
    if (newArrivals.length > 1 && !isHoveringArrivals && !selectedArrival) {
      arrivalIntervalRef.current = setInterval(() => {
        setCurrentArrivalIndex((prev) => {
          return (prev + 1) % newArrivals.length
        })
      }, 3000)
    }

    // Cleanup function
    return () => {
      if (arrivalIntervalRef.current) {
        clearInterval(arrivalIntervalRef.current)
        arrivalIntervalRef.current = null
      }
    }
  }, [newArrivals.length, isHoveringArrivals, selectedArrival])

  // Calculate banner heights based on image aspect ratios (full width)
  useEffect(() => {
    if (banners.length === 0) return

    const calculateHeights = () => {
      const heights = {}
      banners.forEach((banner) => {
        const img = new Image()
        img.onload = () => {
          const aspectRatio = img.naturalWidth / img.naturalHeight
          const containerWidth = window.innerWidth
          const calculatedHeight = containerWidth / aspectRatio
          // Allow up to 95vh for tall images, minimum 500px
          const maxHeight = window.innerHeight * 0.95
          const minHeight = 500
          const finalHeight = Math.max(minHeight, Math.min(calculatedHeight, maxHeight))
          heights[banner.id] = finalHeight
          setBannerHeights(prev => ({ ...prev, [banner.id]: finalHeight }))
        }
        img.src = getImageUrl(banner.image)
      })
    }

    calculateHeights()
    window.addEventListener('resize', calculateHeights)
    return () => window.removeEventListener('resize', calculateHeights)
  }, [banners])

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

      // Load featured products (from content settings)
      try {
        const featuredIdsData = await contentAPI.getFeaturedProducts()
        const featuredIds = featuredIdsData.productIds || []
        
        if (featuredIds.length > 0) {
          // Fetch products by IDs
          const productsPromises = featuredIds.map(id => 
            productsAPI.getById(id).catch(() => null)
          )
          const products = await Promise.all(productsPromises)
          const validProducts = products.filter(p => p !== null && p.isActive !== false)
          setFeaturedProducts(validProducts)
        } else {
          setFeaturedProducts([])
        }
      } catch (err) {
        console.error('Failed to load featured products:', err)
        setFeaturedProducts([])
      }

      // Load new products
      try {
        const newData = await productsAPI.getAll({ new: true, limit: 8 })
        console.log('New products response:', newData)
        if (newData && Array.isArray(newData.products)) {
          setNewProducts(newData.products)
        } else if (Array.isArray(newData)) {
          setNewProducts(newData)
        }
      } catch (err) {
        console.error('Failed to load new products:', err)
        setNewProducts([])
      }

      // Load new arrivals
      try {
        const arrivalsData = await newArrivalsAPI.getAll()
        if (Array.isArray(arrivalsData)) {
          setNewArrivals(arrivalsData)
          // Reset to first image when new arrivals load
          if (arrivalsData.length > 0) {
            setCurrentArrivalIndex(0)
          }
        }
      } catch (err) {
        console.error('Failed to load new arrivals:', err)
        setNewArrivals([])
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


  const handleArrivalClick = (arrival) => {
    setSelectedArrival(arrival)
  }

  return (
    <div className="home-page">
      {/* Hero Section with Banners */}
      {banners.length > 0 ? (
        <section 
          className={`hero-banner ${isMobile ? 'hero-mobile' : 'hero-web'}`}
          style={!isMobile && bannerHeights[banners[currentBannerIndex]?.id] ? {
            height: `${bannerHeights[banners[currentBannerIndex].id]}px`
          } : {}}
        >
          <div className="banner-slider">
            {banners.map((banner, index) => {
              const imageUrl = getImageUrl(banner.image)
              const ariaLabel = banner.title + (banner.subtitle ? ` - ${banner.subtitle}` : '')
              return (
                <div
                  key={banner.id}
                  className={`banner-slide ${index === currentBannerIndex ? 'active' : ''}`}
                  role="img"
                  aria-label={ariaLabel}
                >
                  <img 
                    src={imageUrl} 
                    alt={ariaLabel}
                    loading={index === 0 ? "eager" : "lazy"}
                    onLoad={(e) => {
                      if (!isMobile && !bannerHeights[banner.id]) {
                        const img = e.target
                        const aspectRatio = img.naturalWidth / img.naturalHeight
                        const containerWidth = window.innerWidth
                        const calculatedHeight = containerWidth / aspectRatio
                        // Allow up to 95vh for tall images, minimum 500px
                        const maxHeight = window.innerHeight * 0.95
                        const minHeight = 500
                        const finalHeight = Math.max(minHeight, Math.min(calculatedHeight, maxHeight))
                        setBannerHeights(prev => ({ ...prev, [banner.id]: finalHeight }))
                      }
                    }}
                  />
                  {banner.link ? (
                    <Link 
                      to={banner.link} 
                      className="banner-link-overlay"
                      aria-label={`${ariaLabel} - Click to view`}
                    >
                      <span className="sr-only">{ariaLabel}</span>
                    </Link>
                  ) : (
                    <span className="sr-only">{ariaLabel}</span>
                  )}
                </div>
              )
            })}
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
        <section className={`hero ${isMobile ? 'hero-mobile' : 'hero-web'}`}>
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

      {/* Collections */}
      {featuredProducts.length > 0 && (
        <section className="featured-section collections-section">
          <div className="container">
            <h2 className="collections-heading">Collections</h2>
            <div className="products-grid featured-products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} compact={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals Carousel */}
      {newArrivals.length >= 5 && (
        <section 
          className="new-arrivals-carousel-section"
          onMouseEnter={() => setIsHoveringArrivals(true)}
          onMouseLeave={() => setIsHoveringArrivals(false)}
        >
          <div className="container">
            <h2>New Arrivals</h2>
            <div className="new-arrivals-carousel">
              {newArrivals.map((arrival, index) => {
                // Calculate relative position from current index
                const total = newArrivals.length
                let relativeIndex = index - currentArrivalIndex
                
                // Handle wrapping for infinite rotation
                if (relativeIndex > total / 2) {
                  relativeIndex -= total
                } else if (relativeIndex < -total / 2) {
                  relativeIndex += total
                }
                
                // Determine position class
                let positionClass = 'hidden'
                if (relativeIndex === 0) {
                  positionClass = 'center'
                } else if (relativeIndex === -2 || relativeIndex === total - 2) {
                  positionClass = 'left-2'
                } else if (relativeIndex === -1 || relativeIndex === total - 1) {
                  positionClass = 'left-1'
                } else if (relativeIndex === 1 || relativeIndex === -(total - 1)) {
                  positionClass = 'right-1'
                } else if (relativeIndex === 2 || relativeIndex === -(total - 2)) {
                  positionClass = 'right-2'
                }
                
                return (
                  <div
                    key={arrival.id}
                    className={`arrival-slide ${positionClass}`}
                    onClick={() => handleArrivalClick(arrival)}
                  >
                    <img 
                      src={getImageUrl(arrival.image)} 
                      alt={arrival.title}
                    />
                  </div>
                )
              })}
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

      {showNewsletter && (
        <Newsletter onClose={() => setShowNewsletter(false)} />
      )}

      {/* New Arrival Detail Modal */}
      {selectedArrival && (
        <div 
          className="modal-overlay arrival-detail-modal"
          onClick={() => setSelectedArrival(null)}
        >
          <div 
            className="arrival-detail-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="arrival-detail-close"
              onClick={() => setSelectedArrival(null)}
            >
              <X size={24} />
            </button>
            <div className="arrival-detail-wrapper">
              <div className="arrival-detail-image">
                <img 
                  src={getImageUrl(selectedArrival.image)} 
                  alt={selectedArrival.title}
                />
              </div>
              <div className="arrival-detail-info">
                <h2>{selectedArrival.title}</h2>
                {selectedArrival.description && (
                  <p className="arrival-detail-description">{selectedArrival.description}</p>
                )}
                <div className="arrival-detail-price">
                  <span className="current-price">₹{parseFloat(selectedArrival.price).toLocaleString()}</span>
                  {selectedArrival.originalPrice && parseFloat(selectedArrival.originalPrice) > parseFloat(selectedArrival.price) && (
                    <span className="original-price">₹{parseFloat(selectedArrival.originalPrice).toLocaleString()}</span>
                  )}
                </div>
                {selectedArrival.link && (
                  <Link 
                    to={selectedArrival.link} 
                    className="btn btn-primary"
                    onClick={() => setSelectedArrival(null)}
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home


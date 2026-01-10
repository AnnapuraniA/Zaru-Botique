import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Newsletter from '../components/Newsletter/Newsletter'
import ProductCard from '../components/ProductCard/ProductCard'
import { bannersAPI, productsAPI, contentAPI, newArrivalsAPI, testimonialsAPI, getImageUrl } from '../utils/api'
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
  const arrivalIntervalRef = useRef(null)
  const [testimonials, setTestimonials] = useState([])
  const [isHoveringTestimonials, setIsHoveringTestimonials] = useState(false)
  const testimonialScrollRef = useRef(null)
  const carouselSectionRef = useRef(null)
  const [parallaxOffset, setParallaxOffset] = useState(0)
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

  // Auto-rotate new arrivals (3 seconds)
  useEffect(() => {
    // Always clear existing interval first
    if (arrivalIntervalRef.current) {
      clearInterval(arrivalIntervalRef.current)
      arrivalIntervalRef.current = null
    }

    // Set up interval if we have multiple arrivals
    if (newArrivals.length > 1) {
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
  }, [newArrivals.length])

  // Auto-scroll testimonials horizontally
  useEffect(() => {
    // Only enable scrolling if we have at least 2 testimonials (or content is wider than container)
    if (!testimonialScrollRef.current || testimonials.length === 0) {
      return
    }

    const scrollContainer = testimonialScrollRef.current
    let scrollPosition = 0
    let intervalId = null

    const startScrolling = () => {
      // Clear any existing interval
      if (intervalId) {
        clearInterval(intervalId)
      }

      intervalId = setInterval(() => {
        if (!scrollContainer || isHoveringTestimonials) {
          return
        }

        const containerWidth = scrollContainer.clientWidth
        const contentWidth = scrollContainer.scrollWidth

        // Only scroll if content is wider than container
        // With duplication, content should be wider (2x testimonials)
        if (contentWidth > containerWidth) {
          scrollPosition += 1 // 1 pixel per interval
          const oneSetWidth = contentWidth / 2 // Divide by 2 since we duplicate testimonials

          if (scrollPosition >= oneSetWidth) {
            // Reset to start for seamless infinite loop (jump back by one set width)
            scrollPosition = scrollPosition - oneSetWidth
            scrollContainer.scrollLeft = scrollPosition
          } else {
            scrollContainer.scrollLeft = scrollPosition
          }
        }
      }, 20) // Update every 20ms for smooth scrolling
    }

    // Start scrolling after DOM is ready
    const startTimeout = setTimeout(() => {
      if (scrollContainer) {
        // Check if content is actually wider than container before starting
        const containerWidth = scrollContainer.clientWidth
        const contentWidth = scrollContainer.scrollWidth
        
        if (contentWidth > containerWidth) {
          startScrolling()
        }
      }
    }, 500)

    return () => {
      clearTimeout(startTimeout)
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [testimonials.length, isHoveringTestimonials])

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

  // Parallax scroll effect for carousel section
  useEffect(() => {
    const handleScroll = () => {
      if (!carouselSectionRef.current) return
      
      const rect = carouselSectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Calculate parallax offset when section is in viewport
      if (rect.top < windowHeight && rect.bottom > 0) {
        const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height)
        const offset = scrollProgress * 30 // Adjust multiplier for parallax intensity
        setParallaxOffset(offset)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

      // Load testimonials
      try {
        const testimonialsData = await testimonialsAPI.getAll()
        if (Array.isArray(testimonialsData)) {
          setTestimonials(testimonialsData)
        }
      } catch (err) {
        console.error('Failed to load testimonials:', err)
        setTestimonials([])
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
          ref={carouselSectionRef}
          className="new-arrivals-carousel-section"
          style={{
            transform: `translateY(${parallaxOffset}px)`
          }}
        >
          <div className="container">
            <h2>New Arrivals</h2>
            <p className="new-arrivals-subtitle">Curated Collection Just For You</p>
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
                  >
                    <div className="arrival-slide-content">
                      <img 
                        src={getImageUrl(arrival.image)} 
                        alt={arrival.title}
                      />
                      <div className="arrival-slide-info">
                        <h3>{arrival.title}</h3>
                        {arrival.description && (
                          <p>{arrival.description}</p>
                        )}
                        <div className="arrival-slide-price">
                          <span className="current-price">₹{parseFloat(arrival.price).toLocaleString()}</span>
                          {arrival.originalPrice && parseFloat(arrival.originalPrice) > parseFloat(arrival.price) && (
                            <span className="original-price">₹{parseFloat(arrival.originalPrice).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
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

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section 
          className="testimonials-section"
          onMouseEnter={() => setIsHoveringTestimonials(true)}
          onMouseLeave={() => setIsHoveringTestimonials(false)}
        >
          <div className="container" style={{ overflow: 'hidden' }}>
            <h2 className="testimonials-heading">What Our Customers Say</h2>
            <div className="testimonials-carousel" ref={testimonialScrollRef}>
              {/* Render testimonials - duplicate only if we have multiple for seamless scroll */}
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="testimonial-card">
                  <div className="testimonial-content">
                    <p>"{testimonial.content}"</p>
                  </div>
                  <div className="testimonial-author">
                    <h4>{testimonial.name}</h4>
                    {testimonial.rating && (
                      <div className="testimonial-rating">
                        {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* Only duplicate if we have testimonials (for infinite scroll) */}
              {testimonials.length > 0 && testimonials.map((testimonial, index) => (
                <div key={`duplicate-${testimonial.id}-${index}`} className="testimonial-card">
                  <div className="testimonial-content">
                    <p>"{testimonial.content}"</p>
                  </div>
                  <div className="testimonial-author">
                    <h4>{testimonial.name}</h4>
                    {testimonial.rating && (
                      <div className="testimonial-rating">
                        {'★'.repeat(testimonial.rating)}{'☆'.repeat(5 - testimonial.rating)}
                      </div>
                    )}
                  </div>
                </div>
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


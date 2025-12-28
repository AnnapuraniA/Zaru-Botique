import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Newsletter from '../components/Newsletter/Newsletter'

function Home() {
  const [showNewsletter, setShowNewsletter] = useState(false)

  useEffect(() => {
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

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Your Style</h1>
          <p>Shop the latest fashion trends and timeless classics</p>
          <div className="hero-buttons">
            <Link to="/products/women" className="btn btn-primary btn-large">
              Shop Women
            </Link>
            <Link to="/products/teen" className="btn btn-outline btn-large">
              Shop Teen
            </Link>
            <Link to="/products/girls" className="btn btn-outline btn-large">
              Shop Girls
            </Link>
          </div>
        </div>
      </section>

      {showNewsletter && (
        <Newsletter onClose={() => setShowNewsletter(false)} />
      )}
    </div>
  )
}

export default Home


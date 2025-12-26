import { Link } from 'react-router-dom'

function Home() {

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Your Style</h1>
          <p>Shop the latest fashion trends and timeless classics</p>
          <Link to="/products/women" className="btn btn-primary btn-large">
            Shop Now
          </Link>
        </div>
      </section>

    </div>
  )
}

export default Home


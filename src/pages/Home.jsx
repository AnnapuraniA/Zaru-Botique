import { Link } from 'react-router-dom'

function Home() {

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

    </div>
  )
}

export default Home


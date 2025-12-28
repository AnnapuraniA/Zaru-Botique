import { Link, useNavigate } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react'

function Footer() {
  const navigate = useNavigate()

  const handleSignIn = () => {
    navigate('/dashboard', { state: { tab: 'login' } })
  }

  const handleCreateAccount = () => {
    navigate('/dashboard', { state: { tab: 'register' } })
  }
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Arudhra Boutique</h3>
            <p>Your destination for modern fashion and style. Discover the latest trends and timeless classics.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="#" aria-label="Email"><Mail size={20} /></a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Shop</h3>
            <ul>
              <li><Link to="/products/women">Women</Link></li>
              <li><Link to="/products/teen">Teen</Link></li>
              <li><Link to="/products/girls">Girls</Link></li>
              <li><Link to="/products/accessories">Accessories</Link></li>
              <li><Link to="/products/sale">Sale</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Customer Service</h3>
            <ul>
              <li><Link to="/size-guide">Size Guide</Link></li>
              <li><Link to="/shipping">Shipping Info</Link></li>
              <li><Link to="/returns">Returns</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Account</h3>
            <ul>
              <li><button onClick={handleSignIn} className="footer-link-btn">Sign In</button></li>
              <li><button onClick={handleCreateAccount} className="footer-link-btn">Create Account</button></li>
              <li><Link to="/dashboard">My Account</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/order-tracking">Track Order</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
                <p>&copy; 2024 Arudhra Boutique. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


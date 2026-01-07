import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast/ToastContainer'
import { Mail, Lock, Eye, EyeOff, Smartphone, LogIn } from 'lucide-react'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { success, error: showError } = useToast()
  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
    rememberMe: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.mobile || formData.mobile.length !== 10 || !/^[0-9]+$/.test(formData.mobile)) {
      showError('Please enter a valid 10-digit mobile number')
      return
    }
    
    if (!formData.password) {
      showError('Please enter your password')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await login(formData.mobile, formData.password)
      success('Login successful! Welcome back!')
      
      // Handle remember me
      if (formData.rememberMe) {
        // Token is already stored in localStorage by AuthContext
        // Could add additional logic here if needed
      }
      
      // Navigate to dashboard or previous location
      const from = new URLSearchParams(window.location.search).get('from') || '/dashboard'
      navigate(from)
    } catch (err) {
      showError(err.message || 'Invalid mobile number or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <div className="auth-visual">
          <div className="auth-visual-content">
            <h2>Welcome to Arudhra Fashions</h2>
            <p>Your journey to style and elegance begins here</p>
            <div className="auth-features">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">✨</div>
                <span>Exclusive Collections</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon">🚚</div>
                <span>Fast Delivery</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon">💎</div>
                <span>Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Welcome Back</h1>
              <p className="auth-subtitle">Sign in to continue your shopping journey</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="mobile">Mobile Number <span className="required">*</span></label>
                <div className="input-wrapper">
                  <Smartphone className="input-icon" size={20} />
                  <input
                    id="mobile"
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    placeholder="Enter mobile number"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password <span className="required">*</span></label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-large auth-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="btn-spinner"></span>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <div className="social-login">
              <button type="button" className="btn btn-outline social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button type="button" className="btn btn-outline social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
                Continue with Facebook
              </button>
            </div>

            <p className="auth-footer">
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login


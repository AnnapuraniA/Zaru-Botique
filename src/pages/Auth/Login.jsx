import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast/ToastContainer'

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
      <div className="auth-container">
        <div className="auth-card">
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Mobile Number <span className="required">*</span></label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                placeholder="9876543210"
                pattern="[0-9]{10}"
                maxLength="10"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
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
              className="btn btn-primary btn-large"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div className="social-login">
            <button className="btn btn-outline social-btn">
              Continue with Google
            </button>
            <button className="btn btn-outline social-btn">
              Continue with Facebook
            </button>
          </div>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login


import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast/ToastContainer'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { success, error: showError } = useToast()
  const [formData, setFormData] = useState({
    mobile: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
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
    
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 8) {
      showError('Password must be at least 8 characters')
      return
    }
    
    if (!formData.agreeToTerms) {
      showError('Please agree to the terms and conditions')
      return
    }
    
    if (!formData.mobile || formData.mobile.length !== 10 || !/^[0-9]+$/.test(formData.mobile)) {
      showError('Please enter a valid 10-digit mobile number')
      return
    }
    
    if (!formData.name || formData.name.trim().length === 0) {
      showError('Please enter your full name')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await register(
        formData.mobile,
        formData.password,
        formData.name.trim(),
        formData.email || ''
      )
      success('Registration successful! Welcome to Arudhra Fashions!')
      navigate('/dashboard')
    } catch (err) {
      showError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Create Account</h1>
          <p className="auth-subtitle">Sign up to get started</p>

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
              <label>Full Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label>Email Address <span className="optional">(Optional)</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
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
                placeholder="At least 8 characters"
                minLength="8"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
              />
              <span>
                I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>
              </span>
            </label>

            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register


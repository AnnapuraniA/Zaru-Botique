import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, Mail, Lock, Smartphone, User, Eye, EyeOff, UserPlus, LogIn, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAdminAuth } from '../context/AdminAuthContext'
import { useToast } from './Toast/ToastContainer'
import { authAPI } from '../utils/api'

function LoginModal({ isOpen, onClose, initialMode = 'login' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { login: customerLogin, register, isAuthenticated: isCustomerAuth } = useAuth()
  const { login: adminLogin, isAuthenticated: isAdminAuth } = useAdminAuth()
  const { success, error: showError } = useToast()
  
  const [mode, setMode] = useState(initialMode) // 'login', 'register', or 'forgot-password'
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false)
  const [redirectPath, setRedirectPath] = useState(null) // Store the path to redirect to after login

  // Update mode when initialMode changes and store redirect path
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      // Store current location for redirect after login (but not if already on dashboard)
      // Also check if there's a redirect path in location state (from navigate with state)
      const stateRedirect = location.state?.redirectPath
      const currentPath = location.pathname
      
      if (stateRedirect) {
        setRedirectPath(stateRedirect)
      } else if (currentPath !== '/dashboard' && currentPath !== '/admin/dashboard') {
        // Only store if not already on dashboard pages
        setRedirectPath(currentPath)
      } else {
        // Default to home if on dashboard
        setRedirectPath('/')
      }
    }
  }, [initialMode, isOpen, location])
  
  const [formData, setFormData] = useState({
    loginInput: '', // Single field for both email and mobile
    password: '',
    confirmPassword: '',
    name: '',
    email: '', // For registration
    mobile: '', // For registration
    rememberMe: false,
    forgotPasswordInput: '' // For forgot password
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Close modal if user is authenticated
  useEffect(() => {
    if (isCustomerAuth || isAdminAuth) {
      onClose()
    }
  }, [isCustomerAuth, isAdminAuth, onClose])

  // Reset form data when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all form data when modal closes
      setFormData({
        loginInput: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
        mobile: '',
        rememberMe: false,
        forgotPasswordInput: ''
      })
      setError('')
      setShowPassword(false)
      setShowConfirmPassword(false)
      setShowForgotPassword(false)
      setForgotPasswordSent(false)
      setRedirectPath(null) // Reset redirect path when modal closes
    } else {
      // Reset form data when modal opens (fresh start)
      setFormData({
        loginInput: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
        mobile: '',
        rememberMe: false,
        forgotPasswordInput: ''
      })
      setError('')
      setShowPassword(false)
      setShowConfirmPassword(false)
      setShowForgotPassword(false)
      setForgotPasswordSent(false)
    }
  }, [isOpen])


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const input = formData.loginInput.trim()
      
      if (!input) {
        throw new Error('Please enter your email or mobile number')
      }

      if (!formData.password) {
        throw new Error('Please enter your password')
      }

      // Determine if it's admin or customer login
      const isEmail = input.includes('@')
      const isMobile = /^[0-9]{10}$/.test(input)

      if (isEmail) {
        // Could be admin or customer with email
        try {
          // Try admin login first
          await adminLogin(input, formData.password)
          success('Admin login successful!')
          navigate('/admin/dashboard')
          onClose()
          return
        } catch (adminError) {
          // If admin login fails, try customer login with email
          try {
            await customerLogin(null, input, formData.password)
            success('Login successful! Welcome back!')
            // Redirect to stored path or default to home
            navigate(redirectPath || '/')
            onClose()
            return
          } catch (customerError) {
            throw new Error('Invalid email or password')
          }
        }
      } else if (isMobile) {
        // Customer login with mobile
        await customerLogin(input, null, formData.password)
        success('Login successful! Welcome back!')
        // Redirect to stored path or default to home
        navigate(redirectPath || '/')
        onClose()
      } else {
        throw new Error('Please enter a valid email or 10-digit mobile number')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
      showError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate that at least mobile or email is provided
    const hasMobile = formData.mobile && formData.mobile.trim().length > 0
    const hasEmail = formData.email && formData.email.trim().length > 0

    if (!hasMobile && !hasEmail) {
      setError('Please provide either mobile number or email address')
      setIsLoading(false)
      return
    }

    // Validate mobile if provided
    if (hasMobile && (formData.mobile.length !== 10 || !/^[0-9]+$/.test(formData.mobile))) {
      setError('Please enter a valid 10-digit mobile number')
      setIsLoading(false)
      return
    }

    // Validate email if provided
    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    if (!formData.name || formData.name.trim().length === 0) {
      setError('Please enter your full name')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      await register(
        formData.mobile || null,
        formData.password,
        formData.name.trim(),
        formData.email || null
      )
      success('Registration successful! Welcome to Arudhra Fashions!')
      // Redirect to stored path or default to home
      navigate(redirectPath || '/')
      onClose()
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      showError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const input = formData.forgotPasswordInput.trim()
      
      if (!input) {
        throw new Error('Please enter your email or mobile number')
      }

      // Determine if it's email or mobile
      const isEmail = input.includes('@')
      const isMobile = /^[0-9]{10}$/.test(input)

      if (!isEmail && !isMobile) {
        throw new Error('Please enter a valid email or 10-digit mobile number')
      }

      // Call forgot password API
      await authAPI.forgotPassword(input)
      setForgotPasswordSent(true)
      success('Password reset instructions have been sent to your email/mobile')
    } catch (err) {
      setError(err.message || 'Failed to send password reset. Please try again.')
      showError(err.message || 'Failed to send password reset. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    if (showForgotPassword) {
      handleForgotPassword(e)
    } else if (mode === 'login') {
      handleLogin(e)
    } else {
      handleRegister(e)
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <div className="login-modal-overlay" onClick={onClose}>
      <div 
        className={`login-modal-card ${mode === 'register' ? 'login-modal-card-fullscreen' : 'login-modal-card-fit-content'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="login-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="login-modal-header">
          <h2>Arudhra Fashions</h2>
          <p>
            {showForgotPassword 
              ? 'Reset your password' 
              : mode === 'login' 
                ? 'Sign in to continue' 
                : 'Create your account'}
          </p>
        </div>

        {showForgotPassword && (
          <div className="forgot-password-header">
            <button
              type="button"
              className="back-to-login-btn"
              onClick={() => {
                setShowForgotPassword(false)
                setForgotPasswordSent(false)
                setError('')
                setFormData(prev => ({ ...prev, forgotPasswordInput: '' }))
              }}
            >
              <ArrowLeft size={18} />
              Back to Sign In
            </button>
          </div>
        )}

        {!showForgotPassword && (
          <div className="login-modal-tabs">
            <button
              className={`login-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login')
                setError('')
                setShowForgotPassword(false)
              }}
            >
              <LogIn size={18} />
              Sign In
            </button>
            <button
              className={`login-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register')
                setError('')
                setShowForgotPassword(false)
              }}
            >
              <UserPlus size={18} />
              Register
            </button>
          </div>
        )}

        {error && (
          <div className="login-modal-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form className="login-modal-form" onSubmit={handleSubmit}>
          {showForgotPassword ? (
            <>
              {!forgotPasswordSent ? (
                <>
                  <div className="form-group">
                    <label htmlFor="forgot-password-input">
                      <Smartphone size={18} />
                      Email or Mobile Number
                    </label>
                    <div className="input-wrapper">
                      <Smartphone className="input-icon" size={18} />
                      <input
                        type="text"
                        id="forgot-password-input"
                        name="forgotPasswordInput"
                        value={formData.forgotPasswordInput}
                        onChange={handleChange}
                        placeholder="Enter your email or mobile number"
                        autoFocus
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="forgot-password-success">
                  <CheckCircle size={48} className="success-icon" />
                  <h3>Check Your Email/Mobile</h3>
                  <p>
                    We've sent password reset instructions to <strong>{formData.forgotPasswordInput}</strong>
                  </p>
                  <p className="success-hint">
                    Please check your email inbox or SMS messages and follow the instructions to reset your password.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setForgotPasswordSent(false)
                      setFormData(prev => ({ ...prev, forgotPasswordInput: '' }))
                    }}
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </>
          ) : mode === 'login' ? (
            <>
              <div className="form-group">
                <label htmlFor="login-input">
                  <Smartphone size={18} />
                  Mobile Number/Email
                </label>
                <div className="input-wrapper">
                  <Smartphone className="input-icon" size={18} />
                  <input
                    type="text"
                    id="login-input"
                    name="loginInput"
                    value={formData.loginInput}
                    onChange={handleChange}
                    placeholder="Enter mobile number or email"
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="login-password">
                  <Lock size={18} />
                  Password
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => {
                    setShowForgotPassword(true)
                    setError('')
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="register-name">
                  <User size={18} />
                  Full Name
                </label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    id="register-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-mobile">
                  <Smartphone size={18} />
                  Mobile Number (Optional)
                </label>
                <div className="input-wrapper">
                  <Smartphone className="input-icon" size={18} />
                  <input
                    type="tel"
                    id="register-mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-email">
                  <Mail size={18} />
                  Email (Optional)
                </label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    id="register-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>
                <p className="form-hint">
                  Please provide at least mobile number or email address
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="register-password">
                  <Lock size={18} />
                  Password
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="register-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password (min 8 characters)"
                    required
                    minLength="8"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="register-confirm-password">
                  <Lock size={18} />
                  Confirm Password
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="register-confirm-password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {!forgotPasswordSent && (
            <>
              <button
                type="submit"
                className="btn btn-primary btn-large login-modal-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="btn-spinner"></span>
                    {showForgotPassword ? 'Sending...' : mode === 'login' ? 'Signing In...' : 'Registering...'}
                  </>
                ) : (
                  <>
                    {showForgotPassword ? (
                      <>
                        <Mail size={18} />
                        Send Reset Link
                      </>
                    ) : mode === 'login' ? (
                      <>
                        <LogIn size={18} />
                        Sign In
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Create Account
                      </>
                    )}
                  </>
                )}
              </button>
              {showForgotPassword && (
                <p className="forgot-password-subtitle">
                  Check your mobile or email for the password reset link
                </p>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  )

  // Use portal to render modal at body level to avoid z-index issues
  return createPortal(modalContent, document.body)
}

export default LoginModal

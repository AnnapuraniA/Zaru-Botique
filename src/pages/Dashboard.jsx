import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Package, User, Heart, MapPin, CreditCard, Settings, LogOut, Lock, Truck, Search, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ConfirmationModal from '../components/Modal/ConfirmationModal'
import { useToast } from '../components/Toast/ToastContainer'
import { ordersAPI, addressesAPI, paymentAPI, cartAPI } from '../utils/api'

function Dashboard() {
  const { user, logout, isAuthenticated, login, register, resetPassword, updateProfile, mergeCart } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { success: showSuccessToast, error: showError } = useToast()
  const [activeTab, setActiveTab] = useState(isAuthenticated ? 'orders' : 'login')
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newAddress, setNewAddress] = useState({
    type: 'Home',
    name: user?.name || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    isDefault: false
  })
  const [newPayment, setNewPayment] = useState({
    cardNumber: '',
    cardName: '',
    expMonth: '',
    expYear: '',
    cvv: ''
  })
  const [loginForm, setLoginForm] = useState({ mobile: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ mobile: '', password: '', confirmPassword: '', name: '', email: '' })
  const [resetForm, setResetForm] = useState({ mobile: '', newPassword: '', confirmPassword: '' })
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || ''
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [searchOrderQuery, setSearchOrderQuery] = useState('')

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders()
      loadAddresses()
      loadPaymentMethods()
    }
  }, [isAuthenticated])

  // Update profile form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || ''
      })
      setNewAddress(prev => ({ ...prev, name: user.name || '' }))
    }
  }, [user])

  // Handle tab from location state (for footer links)
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab)
    }
  }, [location.state])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getAll()
      // Backend returns array directly, not wrapped in orders property
      setOrders(Array.isArray(response) ? response : (response.orders || []))
    } catch (err) {
      console.error('Failed to load orders:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const loadAddresses = async () => {
    try {
      const response = await addressesAPI.getAll()
      // Backend returns array directly
      setAddresses(Array.isArray(response) ? response : (response.addresses || []))
    } catch (err) {
      console.error('Failed to load addresses:', err)
      setAddresses([])
    }
  }

  const loadPaymentMethods = async () => {
    try {
      const response = await paymentAPI.getAll()
      // Backend returns array directly
      setPaymentMethods(Array.isArray(response) ? response : (response.paymentMethods || []))
    } catch (err) {
      console.error('Failed to load payment methods:', err)
      setPaymentMethods([])
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    
    try {
      await login(loginForm.mobile, loginForm.password)
      showSuccessToast('Login successful!')
      setActiveTab('orders')
      // Merge guest cart
      const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '[]')
      if (guestCart.length > 0 && mergeCart) {
        mergeCart(guestCart)
      }
    } catch (err) {
      setError(err.message)
      showError(err.message)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match')
      showError('Passwords do not match')
      return
    }
    
    if (registerForm.password.length < 8) {
      setError('Password must be at least 8 characters')
      showError('Password must be at least 8 characters')
      return
    }
    
    try {
      await register(registerForm.mobile, registerForm.password, registerForm.name, registerForm.email)
      showSuccessToast('Registration successful!')
      setActiveTab('orders')
      // Merge guest cart
      const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '[]')
      if (guestCart.length > 0 && mergeCart) {
        mergeCart(guestCart)
      }
    } catch (err) {
      setError(err.message)
      showError(err.message)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setError('Passwords do not match')
      showError('Passwords do not match')
      return
    }
    
    if (resetForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      showError('Password must be at least 8 characters')
      return
    }
    
    try {
      await resetPassword(resetForm.mobile, resetForm.newPassword)
      showSuccessToast('Password reset successful! You can now login.')
      setShowResetPassword(false)
      setActiveTab('login')
      setResetForm({ mobile: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message)
      showError(err.message)
    }
  }

  const handleLogout = () => {
    logout()
    setActiveTab('login')
    navigate('/')
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    
    try {
      await updateProfile(profileForm)
      showSuccessToast('Profile updated successfully!')
    } catch (err) {
      setError(err.message)
      showError(err.message)
    }
  }


  // Orders are loaded from API

  return (
    <div className="user-dashboard-page">
      <div className="container">
        <h1>{isAuthenticated ? 'My Account' : 'Account'}</h1>
        <div className="dashboard-content">
          <aside className="dashboard-sidebar">
            <nav className="dashboard-nav">
              {!isAuthenticated ? (
                <>
                  <button
                    className={`nav-item ${activeTab === 'login' ? 'active' : ''}`}
                    onClick={() => setActiveTab('login')}
                  >
                    <User size={20} />
                    <span>Login</span>
                  </button>
                  <button
                    className={`nav-item ${activeTab === 'register' ? 'active' : ''}`}
                    onClick={() => setActiveTab('register')}
                  >
                    <User size={20} />
                    <span>Register</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    <Package size={20} />
                    <span>Orders</span>
                  </button>
                  <button
                    className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <User size={20} />
                    <span>Profile</span>
                  </button>
                  <Link to="/wishlist" className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}>
                    <Heart size={20} />
                    <span>Wishlist</span>
                  </Link>
                  <button
                    className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('addresses')}
                  >
                    <MapPin size={20} />
                    <span>Addresses</span>
                  </button>
                  <button
                    className={`nav-item ${activeTab === 'payment' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payment')}
                  >
                    <CreditCard size={20} />
                    <span>Payment Methods</span>
                  </button>
                  <button
                    className={`nav-item ${activeTab === 'track' ? 'active' : ''}`}
                    onClick={() => setActiveTab('track')}
                  >
                    <Truck size={20} />
                    <span>Track Order</span>
                  </button>
                  <button
                    className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings size={20} />
                    <span>Settings</span>
                  </button>
                  <button
                    className="nav-item logout-btn"
                    onClick={handleLogout}
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </nav>
          </aside>

          <div className="dashboard-main">
            {/* Login Tab */}
            {!isAuthenticated && activeTab === 'login' && (
              <div className="dashboard-section">
                <h2>Login</h2>
                {error && <div className="alert alert-error">{error}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                <form onSubmit={handleLogin} className="auth-form">
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      value={loginForm.mobile}
                      onChange={(e) => setLoginForm({ ...loginForm, mobile: e.target.value })}
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
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      placeholder="Enter your password"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-large">
                    Sign In
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowResetPassword(true)}
                  >
                    <Lock size={16} />
                    Forgot Password?
                  </button>
                </form>

                {showResetPassword && (
                  <div className="reset-password-section">
                    <h3>Reset Password</h3>
                    <form onSubmit={handleResetPassword} className="auth-form">
                      <div className="form-group">
                        <label>Mobile Number</label>
                        <input
                          type="tel"
                          value={resetForm.mobile}
                          onChange={(e) => setResetForm({ ...resetForm, mobile: e.target.value })}
                          required
                          placeholder="9876543210"
                          pattern="[0-9]{10}"
                          maxLength="10"
                        />
                      </div>
                      <div className="form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          value={resetForm.newPassword}
                          onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                          required
                          placeholder="At least 8 characters"
                          minLength="8"
                        />
                      </div>
                      <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          value={resetForm.confirmPassword}
                          onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                          required
                          placeholder="Confirm your password"
                          minLength="8"
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                          Reset Password
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => {
                            setShowResetPassword(false)
                            setResetForm({ mobile: '', newPassword: '', confirmPassword: '' })
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Register Tab */}
            {!isAuthenticated && activeTab === 'register' && (
              <div className="dashboard-section">
                <h2>Create Account</h2>
                {error && <div className="alert alert-error">{error}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                <form onSubmit={handleRegister} className="auth-form">
                  <div className="form-group">
                    <label>Mobile Number <span className="required">*</span></label>
                    <input
                      type="tel"
                      value={registerForm.mobile}
                      onChange={(e) => setRegisterForm({ ...registerForm, mobile: e.target.value })}
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
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address <span className="optional">(Optional)</span></label>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password <span className="required">*</span></label>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      placeholder="At least 8 characters"
                      minLength="8"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password <span className="required">*</span></label>
                    <input
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      required
                      placeholder="Confirm your password"
                      minLength="8"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-large">
                    Create Account
                  </button>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {isAuthenticated && activeTab === 'orders' && (
              <div className="dashboard-section">
                <h2>Order History</h2>
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <Package size={48} />
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here</p>
                    <Link to="/products/women" className="btn btn-primary">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="orders-list">
                    {loading ? (
                      <div className="loading-spinner">
                        <p>Loading orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="empty-state">
                        <Package size={48} />
                        <h3>No orders yet</h3>
                        <p>Start shopping to see your orders here</p>
                        <Link to="/products/women" className="btn btn-primary">
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      orders.map(order => {
                        const orderId = order._id || order.id
                        return (
                          <div key={orderId} className="order-card">
                            <div className="order-header">
                              <div>
                                <h3>Order {orderId.slice(-8).toUpperCase()}</h3>
                                <p className="order-date">Placed on {new Date(order.createdAt || order.date).toLocaleDateString()}</p>
                              </div>
                              <span className={`order-status ${(order.status || 'Processing').toLowerCase()}`}>
                                {order.status || 'Processing'}
                              </span>
                            </div>
                            <div className="order-details">
                              <p>{order.items?.length || 0} item(s) • Total: ₹{(order.total || 0).toFixed(2)}</p>
                              {order.trackingNumber && (
                                <p className="tracking">
                                  Tracking: <strong>{order.trackingNumber}</strong>
                                </p>
                              )}
                            </div>
                            <div className="order-actions">
                              <Link to={`/order/${orderId}`} className="btn btn-outline">
                                View Details
                              </Link>
                              {order.status === 'Delivered' && (
                                <button className="btn btn-outline">Reorder</button>
                              )}
                              {order.trackingNumber && (
                                <Link to={`/track/${order.trackingNumber}`} className="btn btn-primary">
                                  Track Order
                                </Link>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {isAuthenticated && activeTab === 'profile' && (
              <div className="dashboard-section">
                <h2>Profile Information</h2>
                {error && <div className="alert alert-error">{error}</div>}
                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                <form onSubmit={handleUpdateProfile} className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      value={profileForm.mobile}
                      disabled
                      className="disabled-input"
                    />
                    <small>Mobile number cannot be changed</small>
                  </div>
                  <div className="form-group">
                    <label>Email Address <span className="optional">(Optional)</span></label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* Addresses Tab */}
            {isAuthenticated && activeTab === 'addresses' && (
              <div className="dashboard-section">
                <h2>Saved Addresses</h2>
                <div className="addresses-list">
                  {addresses.length > 0 ? (
                    addresses.map(address => (
                      <div key={address._id || address.id} className="address-card">
                        <div className="address-header">
                          <h3>{address.type || 'Home'}</h3>
                          {address.isDefault && <span className="default-badge">Default</span>}
                        </div>
                        <p>{address.name}</p>
                        <p>{address.address}</p>
                        <p>{address.city}, {address.state} {address.zipCode || address.zip}</p>
                        <div className="address-actions">
                          <button 
                            className="btn btn-outline"
                            onClick={async () => {
                              try {
                                await addressesAPI.update(address._id || address.id, { ...address })
                                loadAddresses()
                                showSuccessToast('Address updated')
                              } catch (err) {
                                showError('Failed to update address')
                              }
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-outline"
                            onClick={async () => {
                              if (window.confirm('Delete this address?')) {
                                try {
                                  await addressesAPI.delete(address._id || address.id)
                                  loadAddresses()
                                  showSuccessToast('Address deleted')
                                } catch (err) {
                                  showError('Failed to delete address')
                                }
                              }
                            }}
                          >
                            Delete
                          </button>
                          {!address.isDefault && (
                            <button 
                              className="btn btn-primary"
                              onClick={async () => {
                                try {
                                  await addressesAPI.update(address._id || address.id, { isDefault: true })
                                  loadAddresses()
                                  showSuccessToast('Default address updated')
                                } catch (err) {
                                  showError('Failed to update default address')
                                }
                              }}
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <MapPin size={48} />
                      <h3>No saved addresses</h3>
                      <p>Add an address to speed up checkout</p>
                    </div>
                  )}
                </div>
                {!showAddAddress ? (
                  <button className="btn btn-primary" onClick={() => setShowAddAddress(true)}>
                    Add New Address
                  </button>
                ) : (
                  <div className="add-address-form">
                    <h3>Add New Address</h3>
                    {error && <div className="alert alert-error">{error}</div>}
                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      setError('')
                      setSuccessMessage('')
                      try {
                        const addressData = {
                          ...newAddress,
                          isDefault: addresses.length === 0
                        }
                        await addressesAPI.add(addressData)
                        loadAddresses()
                        showSuccessToast('Address added successfully!')
                        setShowAddAddress(false)
                        setNewAddress({
                          type: 'Home',
                          name: user?.name || '',
                          address: '',
                          city: '',
                          state: '',
                          zip: '',
                          isDefault: false
                        })
                      } catch (err) {
                        console.error('Failed to add address:', err)
                        setError('Failed to add address')
                      }
                    }}>
                      <div className="form-group">
                        <label>Address Type</label>
                        <select
                          value={newAddress.type}
                          onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                          required
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Street Address</label>
                        <input
                          type="text"
                          value={newAddress.address}
                          onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>City</label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>State</label>
                          <input
                            type="text"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>ZIP Code</label>
                          <input
                            type="text"
                            value={newAddress.zip}
                            onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">Save Address</button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => {
                            setShowAddAddress(false)
                            setNewAddress({
                              type: 'Home',
                              name: user?.name || '',
                              address: '',
                              city: '',
                              state: '',
                              zip: '',
                              isDefault: false
                            })
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Payment Methods Tab */}
            {isAuthenticated && activeTab === 'payment' && (
              <div className="dashboard-section">
                <h2>Payment Methods</h2>
                <div className="payment-methods">
                  {paymentMethods.length > 0 ? (
                    paymentMethods.map(method => (
                      <div key={method._id || method.id} className="payment-card">
                        <CreditCard size={24} />
                        <div>
                          <p>•••• •••• •••• {method.last4}</p>
                          <span>Expires {method.expMonth}/{method.expYear}</span>
                        </div>
                        <div className="payment-actions">
                          <button 
                            className="btn btn-outline"
                            onClick={async () => {
                              // Edit functionality - could open a modal
                              showError('Edit functionality coming soon')
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-outline"
                            onClick={async () => {
                              if (window.confirm('Delete this payment method?')) {
                                try {
                                  await paymentAPI.delete(method._id || method.id)
                                  loadPaymentMethods()
                                  showSuccessToast('Payment method deleted')
                                } catch (err) {
                                  showError('Failed to delete payment method')
                                }
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <CreditCard size={48} />
                      <h3>No payment methods</h3>
                      <p>Add a payment method for faster checkout</p>
                    </div>
                  )}
                </div>
                {!showAddPayment ? (
                  <button className="btn btn-primary" onClick={() => setShowAddPayment(true)}>
                    Add New Payment Method
                  </button>
                ) : (
                  <div className="add-payment-form">
                    <h3>Add New Payment Method</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      setError('')
                      setSuccessMessage('')
                      try {
                        const last4 = newPayment.cardNumber.slice(-4)
                        const paymentData = {
                          last4,
                          expMonth: newPayment.expMonth,
                          expYear: newPayment.expYear,
                          cardName: newPayment.cardName,
                          cardNumber: `****${last4}` // Don't store full card number
                        }
                        await paymentAPI.add(paymentData)
                        loadPaymentMethods()
                        showSuccessToast('Payment method added successfully!')
                        setShowAddPayment(false)
                        setNewPayment({
                          cardNumber: '',
                          cardName: '',
                          expMonth: '',
                          expYear: '',
                          cvv: ''
                        })
                      } catch (err) {
                        console.error('Failed to add payment method:', err)
                        setError('Failed to add payment method')
                      }
                    }}>
                      <div className="form-group">
                        <label>Cardholder Name</label>
                        <input
                          type="text"
                          value={newPayment.cardName}
                          onChange={(e) => setNewPayment({ ...newPayment, cardName: e.target.value })}
                          required
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="form-group">
                        <label>Card Number</label>
                        <input
                          type="text"
                          value={newPayment.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '')
                            const formatted = value.match(/.{1,4}/g)?.join(' ') || value
                            setNewPayment({ ...newPayment, cardNumber: formatted })
                          }}
                          required
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Expiry Month</label>
                          <select
                            value={newPayment.expMonth}
                            onChange={(e) => setNewPayment({ ...newPayment, expMonth: e.target.value })}
                            required
                          >
                            <option value="">MM</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                              <option key={month} value={String(month).padStart(2, '0')}>
                                {String(month).padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Expiry Year</label>
                          <select
                            value={newPayment.expYear}
                            onChange={(e) => setNewPayment({ ...newPayment, expYear: e.target.value })}
                            required
                          >
                            <option value="">YY</option>
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                              <option key={year} value={String(year).slice(-2)}>
                                {String(year).slice(-2)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>CVV</label>
                          <input
                            type="text"
                            value={newPayment.cvv}
                            onChange={(e) => setNewPayment({ ...newPayment, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                            required
                            placeholder="123"
                            maxLength="3"
                          />
                        </div>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">Save Payment Method</button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => {
                            setShowAddPayment(false)
                            setNewPayment({
                              cardNumber: '',
                              cardName: '',
                              expMonth: '',
                              expYear: '',
                              cvv: ''
                            })
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Track Order Tab */}
            {isAuthenticated && activeTab === 'track' && (
              <div className="dashboard-section">
                <div className="track-order-header">
                  <div>
                    <h2>Track Your Orders</h2>
                    <p className="section-description">View and track all your orders</p>
                  </div>
                </div>
                
                {/* Search Bar */}
                <div className="track-order-search">
                  <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                      type="text"
                      value={searchOrderQuery}
                      onChange={(e) => setSearchOrderQuery(e.target.value)}
                      placeholder="Search by Order ID, Tracking Number, or Status..."
                      className="track-input"
                    />
                    {searchOrderQuery && (
                      <button
                        type="button"
                        className="clear-search"
                        onClick={() => setSearchOrderQuery('')}
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Orders List */}
                <div className="track-orders-container">
                  {(() => {
                    const filteredOrders = orders.filter(order => {
                      if (!searchOrderQuery.trim()) return true
                      const query = searchOrderQuery.toLowerCase()
                      const orderId = (order._id || order.id || '').toString().toLowerCase()
                      const orderDate = new Date(order.createdAt || order.date).toLocaleDateString().toLowerCase()
                      return (
                        orderId.includes(query) ||
                        order.trackingNumber?.toLowerCase().includes(query) ||
                        (order.status || '').toLowerCase().includes(query) ||
                        orderDate.includes(query)
                      )
                    })

                    if (filteredOrders.length === 0) {
                      return (
                        <div className="empty-state">
                          <Truck size={48} />
                          <h3>{searchOrderQuery ? 'No orders found' : 'No orders yet'}</h3>
                          <p>{searchOrderQuery ? 'Try a different search term' : 'Start shopping to see your orders here'}</p>
                          {!searchOrderQuery && (
                            <Link to="/products/women" className="btn btn-primary">
                              Start Shopping
                            </Link>
                          )}
                        </div>
                      )
                    }

                    return (
                      <div className="track-orders-list">
                        {filteredOrders.map(order => {
                          const orderId = order._id || order.id
                          return (
                            <div key={orderId} className="track-order-card">
                              <div className="order-card-header">
                                <div className="order-header-left">
                                  <h3>Order {orderId.slice(-8).toUpperCase()}</h3>
                                  <p className="order-date">Placed on {new Date(order.createdAt || order.date).toLocaleDateString()}</p>
                                  {order.trackingNumber && (
                                    <p className="tracking-info">
                                      <strong>Tracking:</strong> {order.trackingNumber}
                                    </p>
                                  )}
                                </div>
                                <div className="order-status-badge">
                                  <span className={`status-text ${(order.status || 'Processing').toLowerCase()}`}>
                                    {order.status || 'Processing'}
                                  </span>
                                </div>
                              </div>

                            <div className="order-card-body">
                              <div className="status-timeline-compact">
                                <div className="timeline-compact">
                                  {[
                                    { label: 'Placed', status: 'completed' },
                                    { label: 'Processing', status: (order.status?.toLowerCase() === 'processing' || order.status?.toLowerCase() === 'shipped' || order.status?.toLowerCase() === 'delivered') ? 'completed' : 'pending' },
                                    { label: 'Shipped', status: (order.status?.toLowerCase() === 'shipped' || order.status?.toLowerCase() === 'delivered') ? 'completed' : 'pending' },
                                    { label: 'Delivered', status: order.status?.toLowerCase() === 'delivered' ? 'completed' : 'pending' }
                                  ].map((step, index) => (
                                    <div key={index} className={`timeline-step-compact ${step.status}`}>
                                      <div className="timeline-marker-compact">
                                        {step.status === 'completed' ? (
                                          <CheckCircle size={16} />
                                        ) : (
                                          <div className="timeline-dot-compact"></div>
                                        )}
                                      </div>
                                      <span className="timeline-label">{step.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="order-items-preview">
                                <div className="items-count">
                                  {order.items?.length || 0} item(s)
                                </div>
                                <div className="items-images">
                                  {order.items?.slice(0, 3).map((item, idx) => {
                                    const product = item.product || item
                                    const image = product?.images?.[0] || product?.image || item.image
                                    return (
                                      <img key={idx} src={image} alt={product?.name || item.name} className="item-preview-img" />
                                    )
                                  })}
                                  {order.items?.length > 3 && (
                                    <div className="more-items">+{order.items.length - 3}</div>
                                  )}
                                </div>
                              </div>

                              <div className="order-summary-compact">
                                <div className="summary-row-compact">
                                  <span>Total:</span>
                                  <span className="total-amount">₹{(order.total || 0).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="order-card-actions">
                              <Link to={`/order/${orderId}`} className="btn btn-primary btn-small">
                                View Details
                              </Link>
                              {order.trackingNumber && (
                                <Link to={`/track/${order.trackingNumber}`} className="btn btn-outline btn-small">
                                  <Truck size={16} />
                                  Track
                                </Link>
                              )}
                              {order.status === 'Delivered' && (
                                <button className="btn btn-outline btn-small">
                                  Reorder
                                </button>
                              )}
                            </div>
                          </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {isAuthenticated && activeTab === 'settings' && (
              <div className="dashboard-section">
                <h2>Account Settings</h2>
                <div className="settings-list">
                  <div className="setting-item">
                    <div>
                      <h3>Email Notifications</h3>
                      <p>Receive emails about your orders and promotions</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div>
                      <h3>SMS Notifications</h3>
                      <p>Receive text messages about order updates</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" />
                      <span></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div>
                      <h3>Newsletter</h3>
                      <p>Subscribe to our newsletter for updates and offers</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span></span>
                    </label>
                  </div>
                </div>
                <div className="danger-zone">
                  <h3>Danger Zone</h3>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Account
                  </button>
                </div>
                <ConfirmationModal
                  isOpen={showDeleteModal}
                  onClose={() => setShowDeleteModal(false)}
                  onConfirm={() => {
                    showError('Account deletion is not available in demo mode')
                    setShowDeleteModal(false)
                  }}
                  title="Delete Account"
                  message="Are you sure you want to delete your account? This action cannot be undone. All your data, orders, and preferences will be permanently deleted."
                  confirmText="Delete Account"
                  cancelText="Cancel"
                  type="danger"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

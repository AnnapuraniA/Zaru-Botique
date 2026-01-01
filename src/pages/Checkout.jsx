import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cartAPI, ordersAPI, couponsAPI, settingsAPI } from '../utils/api'
import { useToast } from '../components/Toast/ToastContainer'

function Checkout() {
  const { user, isAuthenticated, getGuestId } = useAuth()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [step, setStep] = useState(1)
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [shippingCosts, setShippingCosts] = useState({
    free: 0,
    standard: 100,
    express: 200
  })
  const [formData, setFormData] = useState({
    mobile: '',
    email: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    shippingMethod: 'free',
    paymentMethod: 'card',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVC: ''
  })

  // Load cart items and settings
  useEffect(() => {
    loadCart()
    loadShippingSettings()
    if (isAuthenticated && user) {
      // Pre-fill user info
      setFormData(prev => ({
        ...prev,
        mobile: user.mobile || '',
        email: user.email || '',
        name: user.name || ''
      }))
    }
  }, [user, isAuthenticated])

  const loadShippingSettings = async () => {
    try {
      const settings = await settingsAPI.getShipping()
      if (settings) {
        setShippingCosts(prev => ({
          ...prev,
          free: settings.freeShipping || 0,
          standard: settings.standardShipping || 100,
          express: settings.expressShipping || 200
        }))
      }
    } catch (err) {
      console.error('Failed to load shipping settings:', err)
      // Use defaults
    }
  }

  const loadCart = async () => {
    try {
      setLoading(true)
      if (isAuthenticated && user) {
        // Load user cart from API
        const response = await cartAPI.get()
        setCartItems(response.items || [])
      } else {
        // Load guest cart from localStorage
        const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '[]')
        setCartItems(guestCart)
      }
    } catch (err) {
      console.error('Failed to load cart:', err)
      showError('Failed to load cart')
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0
    return sum + (price * item.quantity)
  }, 0)
  const shipping = shippingCosts[formData.shippingMethod] || 0
  const tax = subtotal * 0.18
  const couponDiscount = appliedCoupon ? (appliedCoupon.discount || 0) : 0
  const total = Math.max(0, subtotal + shipping + tax - couponDiscount)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setValidatingCoupon(true)
    setCouponError('')

    try {
      const result = await couponsAPI.validate(couponCode, subtotal)
      if (result.valid) {
        setAppliedCoupon(result.coupon)
        setCouponError('')
        success('Coupon applied successfully!')
      } else {
        setCouponError('Invalid coupon code')
        setAppliedCoupon(null)
      }
    } catch (err) {
      console.error('Failed to validate coupon:', err)
      setCouponError(err.message || 'Invalid coupon code')
      setAppliedCoupon(null)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (cartItems.length === 0) {
      showError('Your cart is empty')
      return
    }

    if (!isAuthenticated) {
      showError('Please login to place an order')
      navigate('/dashboard', { state: { tab: 'login' } })
      return
    }

    setSubmitting(true)

    try {
      // Prepare order items for API
      const orderItems = cartItems.map(item => ({
        productId: item.product?._id || item.productId || item.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product?.price || item.price
      }))

      const orderData = {
        items: orderItems,
        shippingAddress: {
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        paymentMethod: formData.paymentMethod,
        shippingMethod: formData.shippingMethod,
        subtotal,
        shippingCost: shipping,
        tax,
        couponCode: appliedCoupon?.code || null,
        couponDiscount: couponDiscount,
        total
      }

      // Create order via API
      const order = await ordersAPI.create(orderData)
      
      // Clear cart
      try {
        await cartAPI.clear()
      } catch (err) {
        console.error('Failed to clear cart:', err)
      }
      
      success('Order placed successfully!')
      navigate(`/order/${order._id || order.id}`)
    } catch (err) {
      console.error('Failed to place order:', err)
      showError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="loading-spinner">
            <p>Loading checkout...</p>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add items to your cart before checkout</p>
            <Link to="/products/women" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>

        <div className="checkout-layout">
          <div className="checkout-form">
            {step === 1 && (
              <div className="checkout-step">
                <h2>Shipping Information</h2>
                {!isAuthenticated && (
                  <p>
                    Have an account? <Link to="/dashboard">Log in</Link> to save your information
                  </p>
                )}

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
                    disabled={isAuthenticated}
                    className={isAuthenticated ? 'disabled-input' : ''}
                  />
                  {isAuthenticated && <small>Mobile number cannot be changed</small>}
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
                  <label>Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ZIP Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Shipping Method *</label>
                  <div className="shipping-options">
                    <label className="shipping-option">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="free"
                        checked={formData.shippingMethod === 'free'}
                        onChange={handleChange}
                      />
                      <div>
                        <strong>Free Shipping</strong>
                        <p>5-7 business days (Orders over ₹2000)</p>
                      </div>
                      <span>Free</span>
                    </label>
                    <label className="shipping-option">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="standard"
                        checked={formData.shippingMethod === 'standard'}
                        onChange={handleChange}
                      />
                      <div>
                        <strong>Standard Shipping</strong>
                        <p>3-5 business days</p>
                      </div>
                      <span>₹100.00</span>
                    </label>
                    <label className="shipping-option">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={formData.shippingMethod === 'express'}
                        onChange={handleChange}
                      />
                      <div>
                        <strong>Express Shipping</strong>
                        <p>1-2 business days</p>
                      </div>
                      <span>₹200.00</span>
                    </label>
                  </div>
                </div>

                <button onClick={handleNext} className="btn btn-primary btn-large">
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-step">
                <h2>Payment Information</h2>
                <div className="form-group">
                  <label>Payment Method *</label>
                  <div className="payment-options">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                      />
                      <CreditCard size={20} />
                      <span>Credit/Debit Card</span>
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={formData.paymentMethod === 'paypal'}
                        onChange={handleChange}
                      />
                      <span>PayPal</span>
                    </label>
                  </div>
                </div>

                {formData.paymentMethod === 'card' && (
                  <>
                    <div className="form-group">
                      <label>Card Number *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                      />
                    </div>
                    <div className="form-group">
                      <label>Cardholder Name *</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date *</label>
                        <input
                          type="text"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleChange}
                          placeholder="MM/YY"
                          maxLength="5"
                        />
                      </div>
                      <div className="form-group">
                        <label>CVC *</label>
                        <input
                          type="text"
                          name="cardCVC"
                          value={formData.cardCVC}
                          onChange={handleChange}
                          placeholder="123"
                          maxLength="3"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="security-badge">
                  <Lock size={18} />
                  <span>Your payment information is secure and encrypted</span>
                </div>

                <div className="checkout-actions">
                  <button onClick={() => setStep(1)} className="btn btn-outline">
                    Back
                  </button>
                  <button onClick={handleNext} className="btn btn-primary btn-large">
                    Continue to Review
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="checkout-step">
                <h2>Review Your Order</h2>
                <div className="order-items">
                  {cartItems.map(item => {
                    const product = item.product || item
                    const productName = product.name || item.name
                    const productImage = product.images?.[0] || product.image || item.image
                    const productPrice = product.price || item.price || 0
                    const itemId = item._id || item.id
                    
                    return (
                      <div key={itemId} className="order-item">
                        <img src={productImage} alt={productName} />
                        <div className="order-item-details">
                          <h4>{productName}</h4>
                          <p>Quantity: {item.quantity}</p>
                          {item.size && <p>Size: {item.size}</p>}
                          {item.color && <p>Color: {item.color}</p>}
                        </div>
                        <span className="order-item-price">
                          ₹{(productPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Coupon Section */}
                <div className="coupon-section">
                  {!appliedCoupon ? (
                    <div className="coupon-input-group">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className={couponError ? 'error' : ''}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon}
                        className="btn btn-outline"
                      >
                        {validatingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div className="coupon-applied">
                      <span>Coupon: {appliedCoupon.code} - ₹{couponDiscount.toFixed(2)} off</span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="btn-link"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {couponError && <p className="error-message">{couponError}</p>}
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="summary-row discount">
                      <span>Coupon Discount</span>
                      <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>GST (18%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="checkout-actions">
                  <button type="button" onClick={() => setStep(2)} className="btn btn-outline">
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-large"
                    disabled={submitting}
                  >
                    {submitting ? 'Placing Order...' : 'Place Order'}
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="checkout-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="order-items-mini">
                {cartItems.map(item => {
                  const product = item.product || item
                  const productName = product.name || item.name
                  const productImage = product.images?.[0] || product.image || item.image
                  const productPrice = product.price || item.price || 0
                  const itemId = item._id || item.id
                  
                  return (
                    <div key={itemId} className="order-item-mini">
                      <img src={productImage} alt={productName} />
                      <div>
                        <p>{productName}</p>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <span>₹{(productPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="summary-divider"></div>
              {/* Coupon Section in Sidebar */}
              <div className="coupon-section">
                {!appliedCoupon ? (
                  <div className="coupon-input-group">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className={couponError ? 'error' : ''}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon}
                      className="btn btn-outline btn-small"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="coupon-applied">
                    <span>{appliedCoupon.code}</span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="btn-link"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponError && <p className="error-message-small">{couponError}</p>}
              </div>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>GST (18%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout


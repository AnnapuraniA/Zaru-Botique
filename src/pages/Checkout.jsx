import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, Lock, ChevronDown, X } from 'lucide-react'
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
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [showCouponDropdown, setShowCouponDropdown] = useState(false)
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const couponInputRef = useRef(null)
  const couponDropdownRef = useRef(null)
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
    // Validate zipcode to only allow numeric digits (6 digits for Indian zipcodes)
    if (name === 'zipCode') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6)
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  // Load available coupons
  const loadAvailableCoupons = async () => {
    setLoadingCoupons(true)
    try {
      console.log('Loading available coupons, subtotal:', subtotal)
      const response = await couponsAPI.getAvailable(subtotal)
      console.log('Coupons response:', response)
      setAvailableCoupons(response.coupons || [])
    } catch (err) {
      console.error('Failed to load coupons:', err)
      showError('Failed to load available coupons')
    } finally {
      setLoadingCoupons(false)
    }
  }

  // Handle coupon input focus/click
  const handleCouponInputFocus = () => {
    setShowCouponDropdown(true)
    // Always load coupons when input is focused (if not already loaded or loading)
    if (availableCoupons.length === 0 && !loadingCoupons) {
      console.log('Input focused, loading coupons...')
      loadAvailableCoupons()
    }
  }

  // Handle coupon selection from dropdown
  const handleSelectCoupon = async (coupon) => {
    setCouponCode(coupon.code)
    setShowCouponDropdown(false)
    // Auto-apply the selected coupon
    setValidatingCoupon(true)
    setCouponError('')
    try {
      console.log('Validating selected coupon:', coupon)
      const result = await couponsAPI.validate(coupon.code, subtotal)
      console.log('Validation result:', result)
      if (result.valid && result.coupon) {
        // Use coupon data from dropdown (has original values) merged with validation result
        const couponToApply = {
          id: result.coupon.id || coupon.id,
          code: coupon.code || result.coupon.code,
          type: coupon.type || result.coupon.type,
          discount: parseFloat(coupon.discount || result.coupon.discount || 0), // Original discount value from dropdown
          maxDiscount: coupon.maxDiscount ? parseFloat(coupon.maxDiscount) : (result.coupon.maxDiscount ? parseFloat(result.coupon.maxDiscount) : null),
          description: coupon.description || result.coupon.description,
          minPurchase: coupon.minPurchase ? parseFloat(coupon.minPurchase) : (result.coupon.minPurchase ? parseFloat(result.coupon.minPurchase) : null)
        }
        console.log('Applying coupon (from dropdown):', couponToApply)
        setAppliedCoupon(couponToApply)
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        couponDropdownRef.current &&
        !couponDropdownRef.current.contains(event.target) &&
        couponInputRef.current &&
        !couponInputRef.current.contains(event.target)
      ) {
        setShowCouponDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0
    return sum + (price * item.quantity)
  }, 0)
  const shipping = shippingCosts[formData.shippingMethod] || 0
  const tax = subtotal * 0.18
  
  // Calculate coupon discount properly
  let couponDiscount = 0
  if (appliedCoupon) {
    console.log('=== Calculating discount ===')
    console.log('Applied coupon:', JSON.stringify(appliedCoupon, null, 2))
    console.log('Subtotal:', subtotal, 'Shipping:', shipping, 'Tax:', tax)
    
    const discountValue = parseFloat(appliedCoupon.discount || 0)
    const couponType = appliedCoupon.type
    
    console.log(`Coupon type: ${couponType}, Discount value: ${discountValue}`)
    
    if (couponType === 'percentage') {
      // Percentage discount: calculate percentage of subtotal
      couponDiscount = (subtotal * discountValue) / 100
      console.log(`Percentage calculation: (${subtotal} * ${discountValue}) / 100 = ${couponDiscount}`)
      
      // Apply max discount cap if specified
      if (appliedCoupon.maxDiscount) {
        const maxDiscount = parseFloat(appliedCoupon.maxDiscount)
        if (couponDiscount > maxDiscount) {
          console.log(`Capping discount at max: ${maxDiscount}`)
          couponDiscount = maxDiscount
        }
      }
    } else if (couponType === 'fixed') {
      // Fixed amount discount: use the discount value directly
      couponDiscount = discountValue
      console.log(`Fixed discount: ${couponDiscount}`)
      
      // Don't allow discount to exceed subtotal
      if (couponDiscount > subtotal) {
        console.log(`Capping discount at subtotal: ${subtotal}`)
        couponDiscount = subtotal
      }
    } else if (couponType === 'free_shipping') {
      // Free shipping discount: use current shipping cost
      couponDiscount = shipping
      console.log(`Free shipping discount: ${couponDiscount}`)
    } else {
      console.warn(`Unknown coupon type: ${couponType}`)
    }
    
    console.log(`Final coupon discount: ₹${couponDiscount.toFixed(2)}`)
  } else {
    console.log('No coupon applied')
  }
  
  const total = Math.max(0, subtotal + shipping + tax - couponDiscount)
  console.log(`=== Total Calculation ===`)
  console.log(`Subtotal: ₹${subtotal.toFixed(2)}`)
  console.log(`Shipping: ₹${shipping.toFixed(2)}`)
  console.log(`Tax (18%): ₹${tax.toFixed(2)}`)
  console.log(`Coupon Discount: -₹${couponDiscount.toFixed(2)}`)
  console.log(`TOTAL: ₹${total.toFixed(2)}`)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setValidatingCoupon(true)
    setCouponError('')

    try {
      console.log('Validating coupon code:', couponCode, 'subtotal:', subtotal)
      const result = await couponsAPI.validate(couponCode, subtotal)
      console.log('Validation result:', result)
      if (result.valid && result.coupon) {
        // Use the original discount value (percentage or fixed amount), not the calculated one
        // The frontend will recalculate based on current subtotal
        const couponToApply = {
          id: result.coupon.id,
          code: result.coupon.code,
          type: result.coupon.type,
          discount: parseFloat(result.coupon.discount) || 0, // Original discount value (percentage number or fixed amount)
          maxDiscount: result.coupon.maxDiscount ? parseFloat(result.coupon.maxDiscount) : null,
          description: result.coupon.description,
          minPurchase: result.coupon.minPurchase ? parseFloat(result.coupon.minPurchase) : null
        }
        console.log('Applying coupon (manual entry):', couponToApply)
        setAppliedCoupon(couponToApply)
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
        <div className="checkout-header">
          <h1>Checkout</h1>
          {cartItems.length > 0 && (
            <p className="checkout-item-count">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your order</p>
          )}
        </div>

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
                      placeholder="Enter 6-digit zipcode"
                      pattern="[0-9]{6}"
                      maxLength="6"
                    />
                    {formData.zipCode && formData.zipCode.length !== 6 && (
                      <small className="error-text">ZIP code must be 6 digits</small>
                    )}
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
                    <div className="coupon-input-wrapper">
                      <div className="coupon-input-group">
                        <input
                          ref={couponInputRef}
                          type="text"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onFocus={handleCouponInputFocus}
                          className={couponError ? 'error' : ''}
                        />
                        <button
                          type="button"
                          className="coupon-dropdown-toggle"
                          onClick={() => {
                            const newState = !showCouponDropdown
                            setShowCouponDropdown(newState)
                            console.log('Dropdown toggle clicked, newState:', newState, 'availableCoupons.length:', availableCoupons.length)
                            if (newState && (availableCoupons.length === 0 || !loadingCoupons)) {
                              console.log('Loading coupons from dropdown toggle...')
                              loadAvailableCoupons()
                            }
                          }}
                        >
                          <ChevronDown size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={validatingCoupon}
                          className="btn btn-outline"
                        >
                          {validatingCoupon ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                      {showCouponDropdown && (
                        <div ref={couponDropdownRef} className="coupon-dropdown">
                          <div className="coupon-dropdown-header">
                            <h4>Available Coupons</h4>
                            <button
                              type="button"
                              className="close-dropdown"
                              onClick={() => setShowCouponDropdown(false)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                          {loadingCoupons ? (
                            <div className="coupon-loading">Loading coupons...</div>
                          ) : availableCoupons.length === 0 ? (
                            <div className="coupon-empty">No coupons available</div>
                          ) : (
                            <div className="coupon-list">
                              {availableCoupons.map((coupon) => (
                                <div
                                  key={coupon.id}
                                  className="coupon-item"
                                  onClick={() => handleSelectCoupon(coupon)}
                                >
                                  <div className="coupon-item-header">
                                    <strong>{coupon.code}</strong>
                                    <span className="coupon-discount">
                                      {coupon.type === 'percentage'
                                        ? `${coupon.discount}% OFF`
                                        : coupon.type === 'fixed'
                                        ? `₹${coupon.discount} OFF`
                                        : 'Free Shipping'}
                                    </span>
                                  </div>
                                  {coupon.description && (
                                    <p className="coupon-description">{coupon.description}</p>
                                  )}
                                  {coupon.minPurchase && (
                                    <p className="coupon-min-purchase">
                                      Min. purchase: ₹{coupon.minPurchase}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="coupon-applied">
                      <span>
                        <strong>{appliedCoupon.code}</strong> - ₹{couponDiscount.toFixed(2)} off
                      </span>
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
                  <div className="coupon-input-wrapper">
                    <div className="coupon-input-group">
                      <input
                        ref={couponInputRef}
                        type="text"
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onFocus={handleCouponInputFocus}
                        className={couponError ? 'error' : ''}
                      />
                      <button
                        type="button"
                        className="coupon-dropdown-toggle"
                        onClick={() => {
                          const newState = !showCouponDropdown
                          setShowCouponDropdown(newState)
                          console.log('Dropdown toggle clicked (sidebar), newState:', newState, 'availableCoupons.length:', availableCoupons.length)
                          if (newState && (availableCoupons.length === 0 || !loadingCoupons)) {
                            console.log('Loading coupons from dropdown toggle (sidebar)...')
                            loadAvailableCoupons()
                          }
                        }}
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon}
                        className="btn btn-outline btn-small"
                      >
                        Apply
                      </button>
                    </div>
                    {showCouponDropdown && (
                      <div ref={couponDropdownRef} className="coupon-dropdown">
                        <div className="coupon-dropdown-header">
                          <h4>Available Coupons</h4>
                          <button
                            type="button"
                            className="close-dropdown"
                            onClick={() => setShowCouponDropdown(false)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        {loadingCoupons ? (
                          <div className="coupon-loading">Loading coupons...</div>
                        ) : availableCoupons.length === 0 ? (
                          <div className="coupon-empty">No coupons available</div>
                        ) : (
                          <div className="coupon-list">
                            {availableCoupons.map((coupon) => (
                              <div
                                key={coupon.id}
                                className="coupon-item"
                                onClick={() => handleSelectCoupon(coupon)}
                              >
                                <div className="coupon-item-header">
                                  <strong>{coupon.code}</strong>
                                  <span className="coupon-discount">
                                    {coupon.type === 'percentage'
                                      ? `${coupon.discount}% OFF`
                                      : coupon.type === 'fixed'
                                      ? `₹${coupon.discount} OFF`
                                      : 'Free Shipping'}
                                  </span>
                                </div>
                                {coupon.description && (
                                  <p className="coupon-description">{coupon.description}</p>
                                )}
                                {coupon.minPurchase && (
                                  <p className="coupon-min-purchase">
                                    Min. purchase: ₹{coupon.minPurchase}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="coupon-applied">
                    <span>
                      <strong>{appliedCoupon.code}</strong> - ₹{couponDiscount.toFixed(2)} off
                    </span>
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


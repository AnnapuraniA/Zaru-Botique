import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Checkout() {
  const { user, isAuthenticated, getGuestId, addOrder } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [cartItems, setCartItems] = useState([])
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

  // Load cart items
  useEffect(() => {
    loadCart()
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

  const loadCart = () => {
    if (isAuthenticated && user) {
      const userCart = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]')
      setCartItems(userCart)
    } else {
      const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '[]')
      setCartItems(guestCart)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = formData.shippingMethod === 'free' ? 0 : formData.shippingMethod === 'standard' ? 100 : 200
  const tax = subtotal * 0.18
  const total = subtotal + shipping + tax

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shipping = formData.shippingMethod === 'free' ? 0 : formData.shippingMethod === 'standard' ? 100 : 200
    const tax = subtotal * 0.18
    const total = subtotal + shipping + tax

    const order = {
      items: cartItems,
      shippingAddress: {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        method: formData.shippingMethod
      },
      payment: {
        method: formData.paymentMethod,
        cardNumber: formData.cardNumber ? `****${formData.cardNumber.slice(-4)}` : '',
        cardName: formData.cardName
      },
      subtotal,
      shippingCost: shipping,
      tax,
      total,
      tracking: `TRACK${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    }

    if (isAuthenticated && user) {
      // Add order to user account
      const orderWithId = addOrder(order)
      // Clear user cart
      localStorage.removeItem(`cart_${user.id}`)
      navigate(`/order/${orderWithId.id}`)
    } else {
      // Save guest order
      const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]')
      const guestOrder = {
        ...order,
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        date: new Date().toISOString(),
        status: 'Processing'
      }
      guestOrders.push(guestOrder)
      localStorage.setItem('guestOrders', JSON.stringify(guestOrders))
      // Clear guest cart
      localStorage.removeItem('cart_guest')
      navigate(`/order/${guestOrder.id}`)
    }
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
                  {cartItems.map(item => (
                    <div key={item.id} className="order-item">
                      <img src={item.image} alt={item.name} />
                      <div className="order-item-details">
                        <h4>{item.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                      <span className="order-item-price">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
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
                  <button type="submit" className="btn btn-primary btn-large">
                    Place Order
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="checkout-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="order-items-mini">
                {cartItems.map(item => (
                  <div key={item.id} className="order-item-mini">
                    <img src={item.image} alt={item.name} />
                    <div>
                      <p>{item.name}</p>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
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


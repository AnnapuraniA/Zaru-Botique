import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Lock } from 'lucide-react'

function Checkout() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    shippingMethod: 'free',
    paymentMethod: 'card',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVC: '',
    checkoutAsGuest: false
  })

  const cartItems = [
    { id: 1, name: 'Elegant Summer Dress', price: 89.99, quantity: 2, image: 'https://via.placeholder.com/100x120/2d5a5a/ffffff?text=Dress' }
  ]

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

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Order placed:', formData)
    // Handle order submission
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
                {!formData.checkoutAsGuest && (
                  <p>
                    Already have an account? <Link to="/login">Log in</Link>
                  </p>
                )}
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.checkoutAsGuest}
                    onChange={(e) => setFormData(prev => ({ ...prev, checkoutAsGuest: e.target.checked }))}
                  />
                  <span>Checkout as guest</span>
                </label>

                {!formData.checkoutAsGuest && (
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
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


import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function Cart() {
  const { user, isAuthenticated, getGuestId } = useAuth()
  const [cartItems, setCartItems] = useState([])

  // Load cart from localStorage
  useEffect(() => {
    loadCart()
  }, [user, isAuthenticated])

  const loadCart = () => {
    if (isAuthenticated && user) {
      // Load user cart
      const userCart = JSON.parse(localStorage.getItem(`cart_${user.id}`) || '[]')
      setCartItems(userCart)
    } else {
      // Load guest cart
      const guestId = getGuestId()
      const guestCart = JSON.parse(localStorage.getItem(`cart_guest`) || '[]')
      setCartItems(guestCart)
    }
  }

  const saveCart = (items) => {
    if (isAuthenticated && user) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(items))
    } else {
      localStorage.setItem('cart_guest', JSON.stringify(items))
    }
  }

  const updateQuantity = (id, change) => {
    setCartItems(items => {
      const updated = items.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change
          return { ...item, quantity: Math.max(1, newQuantity) }
        }
        return item
      })
      saveCart(updated)
      return updated
    })
  }

  const removeItem = (id) => {
    setCartItems(items => {
      const updated = items.filter(item => item.id !== id)
      saveCart(updated)
      return updated
    })
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal >= 2000 ? 0 : 100
  const tax = subtotal * 0.18 // 18% GST
  const total = subtotal + shipping + tax

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Start adding items to your cart</p>
            <Link to="/products/women" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p className="cart-item-meta">
                      Size: {item.size} • Color: {item.color}
                    </p>
                    <p className="cart-item-price">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, -1)}>
                        <Minus size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="cart-item-total">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Tax (GST 18%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              {subtotal < 2000 && (
                <p className="shipping-note">
                  Add ₹{(2000 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
              <Link to="/checkout" className="btn btn-primary btn-large">
                Proceed to Checkout
              </Link>
              <Link to="/products/women" className="btn btn-outline">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart

import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { cartAPI } from '../utils/api'
import { useToast } from '../components/Toast/ToastContainer'

function Cart() {
  const { user, isAuthenticated, getGuestId } = useAuth()
  const { success, error: showError } = useToast()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Load cart from API or localStorage
  useEffect(() => {
    loadCart()
  }, [user, isAuthenticated])

  const loadCart = async () => {
    try {
      setLoading(true)
      if (isAuthenticated && user) {
        // Load user cart from API
        const response = await cartAPI.get()
        setCartItems(response.items || [])
      } else {
        // Load guest cart from localStorage
        const guestCart = JSON.parse(localStorage.getItem(`cart_guest`) || '[]')
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

  const updateQuantity = async (itemId, change) => {
    if (isAuthenticated) {
      try {
        const item = cartItems.find(i => i._id === itemId || i.id === itemId)
        if (!item) return
        
        const newQuantity = item.quantity + change
        if (newQuantity < 1) {
          await removeItem(itemId)
          return
        }
        
        await cartAPI.updateItem(itemId, newQuantity)
        setCartItems(items =>
          items.map(i =>
            (i._id === itemId || i.id === itemId)
              ? { ...i, quantity: newQuantity }
              : i
          )
        )
        // Dispatch cart update event
        window.dispatchEvent(new Event('cartUpdated'))
      } catch (err) {
        console.error('Failed to update quantity:', err)
        showError('Failed to update quantity')
      }
    } else {
      // Guest cart - update localStorage
      setCartItems(items => {
        const updated = items.map(item => {
          if ((item._id === itemId || item.id === itemId)) {
            const newQuantity = item.quantity + change
            return { ...item, quantity: Math.max(1, newQuantity) }
          }
          return item
        })
        localStorage.setItem('cart_guest', JSON.stringify(updated))
        return updated
      })
    }
  }

  const removeItem = async (itemId) => {
    if (isAuthenticated) {
      try {
        await cartAPI.removeItem(itemId)
        setCartItems(items => items.filter(i => i._id !== itemId && i.id !== itemId))
        success('Item removed from cart')
        // Dispatch cart update event
        window.dispatchEvent(new Event('cartUpdated'))
      } catch (err) {
        console.error('Failed to remove item:', err)
        showError('Failed to remove item')
      }
    } else {
      // Guest cart - update localStorage
      setCartItems(items => {
        const updated = items.filter(item => item._id !== itemId && item.id !== itemId)
        localStorage.setItem('cart_guest', JSON.stringify(updated))
        // Dispatch cart update event
        window.dispatchEvent(new Event('cartUpdated'))
        return updated
      })
    }
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0
    return sum + (price * item.quantity)
  }, 0)
  const shipping = subtotal >= 2000 ? 0 : 100
  const tax = subtotal * 0.18 // 18% GST
  const total = subtotal + shipping + tax

  if (loading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="loading-spinner">
            <p>Loading cart...</p>
          </div>
        </div>
      </div>
    )
  }

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
              {cartItems.map(item => {
                const itemId = item._id || item.id
                const product = item.product || item
                const productName = product.name || item.name
                const productImage = product.images?.[0] || product.image || item.image
                const productPrice = product.price || item.price || 0
                const size = item.size || 'N/A'
                const color = item.color || 'N/A'
                
                return (
                  <div key={itemId} className="cart-item">
                    <img src={productImage} alt={productName} />
                    <div className="cart-item-details">
                      <h3>{productName}</h3>
                      <p className="cart-item-meta">
                        Size: {size} • Color: {color}
                      </p>
                      <p className="cart-item-price">₹{productPrice.toFixed(2)}</p>
                    </div>
                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(itemId, -1)}>
                          <Minus size={16} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(itemId, 1)}>
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="cart-item-total">
                        ₹{(productPrice * item.quantity).toFixed(2)}
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(itemId)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )
              })}
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

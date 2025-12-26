import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useState } from 'react'

function Cart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Elegant Summer Dress',
      image: 'https://via.placeholder.com/150x200/2d5a5a/ffffff?text=Dress',
      price: 89.99,
      quantity: 2,
      size: 'M',
      color: 'Navy'
    },
    {
      id: 2,
      name: 'Classic White Shirt',
      image: 'https://via.placeholder.com/150x200/ff6b6b/ffffff?text=Shirt',
      price: 49.99,
      quantity: 1,
      size: 'L',
      color: 'White'
    }
  ])

  const updateQuantity = (id, change) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change
          return { ...item, quantity: Math.max(1, newQuantity) }
        }
        return item
      })
    )
  }

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 2000 ? 0 : 100
  const tax = subtotal * 0.18
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
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p>Size: {item.size} | Color: {item.color}</p>
                    <div className="cart-item-price">₹{item.price.toFixed(2)}</div>
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
                <span>GST (18%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
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


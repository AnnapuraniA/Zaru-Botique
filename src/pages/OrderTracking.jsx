import { useParams, Link } from 'react-router-dom'
import { Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { ordersAPI } from '../utils/api'
import { useToast } from '../components/Toast/ToastContainer'

function OrderTracking() {
  const { id, tracking } = useParams()
  const { isAuthenticated } = useAuth()
  const { error: showError } = useToast()
  const [order, setOrder] = useState(null)
  const [guestOrder, setGuestOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [id, tracking, isAuthenticated])

  const loadOrder = async () => {
    try {
      setLoading(true)
      
      if (isAuthenticated) {
        // Load order from API
        try {
          const orderData = await ordersAPI.getById(id || tracking)
          setOrder(orderData)
        } catch (err) {
          console.error('Failed to load order:', err)
          // Fallback to guest orders if API fails
          const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]')
          const foundOrder = guestOrders.find(o => (o.id === id || o.trackingNumber === tracking))
          if (foundOrder) {
            setGuestOrder(foundOrder)
          }
        }
      } else {
        // Load guest order from localStorage
        const guestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]')
        const foundOrder = guestOrders.find(o => (o.id === id || o.trackingNumber === tracking))
        if (foundOrder) {
          setGuestOrder(foundOrder)
        }
      }
    } catch (err) {
      console.error('Error loading order:', err)
      showError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const currentOrder = order || guestOrder

  if (loading) {
    return (
      <div className="order-tracking-page">
        <div className="container">
          <div className="empty-state">
            <Package size={48} />
            <h2>Loading Order...</h2>
            <p>Please wait while we fetch your order details.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentOrder) {
    return (
      <div className="order-tracking-page">
        <div className="container">
          <div className="empty-state">
            <Package size={48} />
            <h2>Order Not Found</h2>
            <p>We couldn't find an order with that ID.</p>
            <Link to="/" className="btn btn-primary">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle size={24} className="status-icon delivered" />
      case 'shipped':
        return <Truck size={24} className="status-icon shipped" />
      case 'processing':
        return <Clock size={24} className="status-icon processing" />
      default:
        return <Package size={24} className="status-icon" />
    }
  }

  const getStatusSteps = (status) => {
    const steps = [
      { label: 'Order Placed', status: 'completed' },
      { label: 'Processing', status: status === 'processing' || status === 'shipped' || status === 'delivered' ? 'completed' : 'pending' },
      { label: 'Shipped', status: status === 'shipped' || status === 'delivered' ? 'completed' : 'pending' },
      { label: 'Delivered', status: status === 'delivered' ? 'completed' : 'pending' }
    ]
    return steps
  }

  const statusSteps = getStatusSteps(currentOrder.status)

  return (
    <div className="order-tracking-page">
      <div className="container">
        <div className="order-header">
          <h1>Order Tracking</h1>
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="btn btn-outline">
            {isAuthenticated ? "Back to Dashboard" : "Back to Home"}
          </Link>
        </div>

        <div className="order-tracking-content">
          <div className="order-info-card">
            <div className="order-info-header">
              <div>
                <h2>Order {currentOrder.id}</h2>
                <p className="order-date">Placed on {new Date(currentOrder.date).toLocaleDateString()}</p>
              </div>
              <div className="order-status-badge">
                {getStatusIcon(currentOrder.status)}
                <span className={`status-text ${currentOrder.status.toLowerCase()}`}>
                  {currentOrder.status}
                </span>
              </div>
            </div>

            {currentOrder.tracking && (
              <div className="tracking-number">
                <strong>Tracking Number:</strong> {currentOrder.tracking}
              </div>
            )}
          </div>

          <div className="status-timeline">
            <h3>Order Status</h3>
            <div className="timeline">
              {statusSteps.map((step, index) => (
                <div key={index} className={`timeline-step ${step.status}`}>
                  <div className="timeline-marker">
                    {step.status === 'completed' ? (
                      <CheckCircle size={20} />
                    ) : (
                      <div className="timeline-dot"></div>
                    )}
                  </div>
                  <div className="timeline-content">
                    <h4>{step.label}</h4>
                    {step.status === 'completed' && index === statusSteps.length - 1 && (
                      <p>Your order has been delivered</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-details-section">
            <h3>Order Details</h3>
            <div className="order-items-list">
              {currentOrder.items.map((item, index) => (
                <div key={index} className="order-item-row">
                  <img src={item.image} alt={item.name} />
                  <div className="order-item-info">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    {item.size && <p>Size: {item.size}</p>}
                    {item.color && <p>Color: {item.color}</p>}
                  </div>
                  <div className="order-item-price">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{currentOrder.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>₹{currentOrder.shippingCost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="summary-row">
                <span>Tax (GST 18%)</span>
                <span>₹{currentOrder.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{currentOrder.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {currentOrder.shippingAddress && (
            <div className="shipping-info-card">
              <h3>Shipping Address</h3>
              <div className="shipping-address">
                <p><strong>{currentOrder.shippingAddress.name}</strong></p>
                <p>{currentOrder.shippingAddress.address}</p>
                <p>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.zipCode}</p>
                <p>Mobile: {currentOrder.shippingAddress.mobile}</p>
                {currentOrder.shippingAddress.email && <p>Email: {currentOrder.shippingAddress.email}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderTracking


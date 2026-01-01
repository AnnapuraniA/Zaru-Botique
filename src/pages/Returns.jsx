import { useState, useEffect } from 'react'
import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { returnsAPI, ordersAPI } from '../utils/api'
import { useToast } from '../components/Toast/ToastContainer'

function Returns() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { success, error: showError } = useToast()
  const [returns, setReturns] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [returnForm, setReturnForm] = useState({
    orderId: '',
    productId: '',
    productName: '',
    reason: '',
    amount: ''
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadReturns()
      loadOrders()
    }
  }, [isAuthenticated])

  const loadReturns = async () => {
    try {
      if (isAuthenticated) {
        const returnsData = await returnsAPI.getAll()
        setReturns(Array.isArray(returnsData) ? returnsData : [])
      }
    } catch (err) {
      console.error('Failed to load returns:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async () => {
    try {
      if (isAuthenticated) {
        const ordersData = await ordersAPI.getAll()
        setOrders(Array.isArray(ordersData) ? ordersData : [])
      }
    } catch (err) {
      console.error('Failed to load orders:', err)
    }
  }

  const handleOrderSelect = (order) => {
    setSelectedOrder(order)
    setShowReturnForm(true)
  }

  const handleProductSelect = (item) => {
    setReturnForm(prev => ({
      ...prev,
      orderId: selectedOrder.orderId,
      productId: item.product || item.productId,
      productName: item.name,
      amount: item.price * item.quantity
    }))
  }

  const handleSubmitReturn = async (e) => {
    e.preventDefault()
    if (!returnForm.orderId || !returnForm.productId || !returnForm.reason || !returnForm.amount) {
      showError('Please fill in all required fields')
      return
    }

    try {
      await returnsAPI.create(returnForm)
      success('Return request submitted successfully')
      setShowReturnForm(false)
      setReturnForm({ orderId: '', productId: '', productName: '', reason: '', amount: '' })
      setSelectedOrder(null)
      loadReturns()
    } catch (err) {
      console.error('Failed to submit return:', err)
      showError('Failed to submit return request')
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock size={16} />
      case 'approved': return <CheckCircle size={16} />
      case 'rejected': return <XCircle size={16} />
      case 'refunded': return <CheckCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  return (
    <div className="returns-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="page-header">
          <h1>Returns & Exchanges</h1>
          <p>Our hassle-free return and exchange policy</p>
        </div>

        {isAuthenticated && (
          <>
            {/* My Returns Section */}
            <section className="my-returns-section">
              <h2>My Return Requests</h2>
              {loading ? (
                <p>Loading...</p>
              ) : returns.length > 0 ? (
                <div className="returns-list">
                  {returns.map(ret => (
                    <div key={ret.id} className="return-card">
                      <div className="return-header">
                        <div>
                          <strong>{ret.returnId}</strong>
                          <span className={`status-badge status-${ret.status}`}>
                            {getStatusIcon(ret.status)}
                            {ret.status}
                          </span>
                        </div>
                        <span className="return-date">
                          {new Date(ret.requestedAt || ret.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="return-details">
                        <p><strong>Order ID:</strong> {ret.orderId}</p>
                        <p><strong>Product:</strong> {ret.productName}</p>
                        <p><strong>Reason:</strong> {ret.reason}</p>
                        <p><strong>Amount:</strong> ₹{parseFloat(ret.amount).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No return requests yet</p>
              )}

              {/* Request New Return */}
              <div className="request-return-section">
                <h3>Request a Return</h3>
                {orders.length > 0 ? (
                  <div className="orders-list">
                    {orders.filter(order => order.status !== 'Cancelled').map(order => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div>
                            <strong>Order: {order.orderId}</strong>
                            <span className="order-date">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <button 
                            className="btn btn-outline btn-small"
                            onClick={() => handleOrderSelect(order)}
                          >
                            Request Return
                          </button>
                        </div>
                        <div className="order-items">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="order-item">
                              <span>{item.name} - {item.quantity}x</span>
                              <span>₹{parseFloat(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No orders available for return</p>
                )}
              </div>
            </section>

            {/* Return Form Modal */}
            {showReturnForm && selectedOrder && (
              <div className="modal-overlay" onClick={() => setShowReturnForm(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Request Return</h2>
                    <button className="modal-close" onClick={() => setShowReturnForm(false)}>
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleSubmitReturn} className="modal-body">
                    <div className="form-group">
                      <label>Select Product *</label>
                      <select
                        value={returnForm.productId}
                        onChange={(e) => {
                          const item = selectedOrder.items.find(i => 
                            (i.product || i.productId) === e.target.value
                          )
                          if (item) {
                            handleProductSelect(item)
                          }
                        }}
                        required
                      >
                        <option value="">Select a product</option>
                        {selectedOrder.items?.map((item, idx) => (
                          <option key={idx} value={item.product || item.productId}>
                            {item.name} - ₹{parseFloat(item.price * item.quantity).toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Reason for Return *</label>
                      <select
                        value={returnForm.reason}
                        onChange={(e) => setReturnForm(prev => ({ ...prev, reason: e.target.value }))}
                        required
                      >
                        <option value="">Select reason</option>
                        <option value="Size not fitting">Size not fitting</option>
                        <option value="Changed mind">Changed mind</option>
                        <option value="Defective item">Defective item</option>
                        <option value="Wrong item received">Wrong item received</option>
                        <option value="Quality issues">Quality issues</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Refund Amount</label>
                      <input
                        type="text"
                        value={`₹${parseFloat(returnForm.amount || 0).toLocaleString()}`}
                        disabled
                      />
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-outline" onClick={() => setShowReturnForm(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Submit Return Request
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {!isAuthenticated && (
          <div className="auth-prompt">
            <p>Please <Link to="/dashboard">login</Link> to view your return requests or submit a new return.</p>
          </div>
        )}

        <div className="info-sections">
          <section className="info-section">
            <h2>Return Policy</h2>
            <p>We want you to love your purchase! If you're not completely satisfied, you can return most items within <strong>7 days</strong> of delivery.</p>
            
            <div className="policy-box">
              <h3>Items Eligible for Return:</h3>
              <ul className="info-list">
                <li>Items must be unworn, unwashed, and unused</li>
                <li>Original tags must be attached</li>
                <li>Items must be in original packaging</li>
                <li>Proof of purchase required</li>
              </ul>
            </div>

            <div className="policy-box warning">
              <h3>Non-Returnable Items:</h3>
              <ul className="info-list">
                <li>Sale items (unless defective)</li>
                <li>Items without original tags</li>
                <li>Damaged items due to misuse</li>
                <li>Items returned after 7 days</li>
              </ul>
            </div>
          </section>

          <section className="info-section">
            <h2>How to Return an Item</h2>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Log into Your Account</h3>
                  <p>Go to your Dashboard and click on "Orders"</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Select the Order</h3>
                  <p>Find the order containing the item you want to return</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Initiate Return</h3>
                  <p>Click "Return Item" and select the reason for return</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Print Return Label</h3>
                  <p>Download and print the return shipping label</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h3>Pack & Ship</h3>
                  <p>Pack the item securely with the return label and drop it off at the courier service</p>
                </div>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2>Exchange Policy</h2>
            <p>You can exchange items for a different size or color within 7 days of delivery.</p>
            <ul className="info-list">
              <li>Exchanges are subject to availability</li>
              <li>If the desired size/color is unavailable, we'll process a refund</li>
              <li>Price difference will be charged or refunded accordingly</li>
              <li>Free return shipping for exchanges</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Refund Process</h2>
            <div className="refund-info">
              <p><strong>Processing Time:</strong> 5-7 business days after we receive your return</p>
              <p><strong>Refund Method:</strong> Refunded to your original payment method</p>
              <p><strong>Shipping Charges:</strong> Original shipping charges are non-refundable unless the item is defective</p>
            </div>
          </section>

          <section className="info-section">
            <h2>Return Shipping</h2>
            <p>Return shipping charges apply unless the item is defective or incorrect. For exchanges, return shipping is free.</p>
            <p>You can use our prepaid return label or arrange your own shipping. If using your own shipping, please use a trackable service.</p>
          </section>

          <section className="info-section">
            <h2>Damaged or Defective Items</h2>
            <p>If you receive a damaged or defective item, please contact us immediately within 48 hours:</p>
            <ul className="info-list">
              <li>Email photos of the damage to support@arudhraboutique.com</li>
              <li>We'll arrange for a free return and replacement</li>
              <li>Full refund available if replacement is not possible</li>
            </ul>
          </section>

          <section className="info-section">
            <h2>Questions?</h2>
            <p>If you have any questions about returns or exchanges, please contact us:</p>
            <p><strong>Email:</strong> support@arudhraboutique.com</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Returns


import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, User, Heart, MapPin, CreditCard, Settings, X } from 'lucide-react'

function Dashboard() {
  const [activeTab, setActiveTab] = useState('orders')

  const orders = [
    { id: 'ORD-001', date: '2024-01-15', status: 'Delivered', items: 2, total: 189.98, tracking: 'TRACK123456' },
    { id: 'ORD-002', date: '2024-01-10', status: 'Shipped', items: 1, total: 89.99, tracking: 'TRACK123457' },
    { id: 'ORD-003', date: '2024-01-05', status: 'Processing', items: 3, total: 249.97, tracking: null }
  ]

  const profile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900'
  }

  const addresses = [
    { id: 1, type: 'Home', name: 'John Doe', address: '123 Main Street', city: 'New York', state: 'NY', zip: '10001', isDefault: true },
    { id: 2, type: 'Work', name: 'John Doe', address: '456 Business Ave', city: 'New York', state: 'NY', zip: '10002', isDefault: false }
  ]

  return (
    <div className="user-dashboard-page">
      <div className="container">
        <h1>My Account</h1>
        <div className="dashboard-content">
          <aside className="dashboard-sidebar">
            <nav className="dashboard-nav">
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
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>
            </nav>
          </aside>

          <div className="dashboard-main">
            {activeTab === 'orders' && (
              <div className="dashboard-section">
                <h2>Order History</h2>
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div>
                          <h3>Order {order.id}</h3>
                          <p className="order-date">Placed on {order.date}</p>
                        </div>
                        <span className={`order-status ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="order-details">
                        <p>{order.items} item(s) • Total: ${order.total.toFixed(2)}</p>
                        {order.tracking && (
                          <p className="tracking">
                            Tracking: <strong>{order.tracking}</strong>
                          </p>
                        )}
                      </div>
                      <div className="order-actions">
                        <Link to={`/order/${order.id}`} className="btn btn-outline">
                          View Details
                        </Link>
                        {order.status === 'Delivered' && (
                          <button className="btn btn-outline">Reorder</button>
                        )}
                        {order.tracking && (
                          <Link to={`/track/${order.tracking}`} className="btn btn-primary">
                            Track Order
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="dashboard-section">
                <h2>Profile Information</h2>
                <form className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" defaultValue={profile.firstName} />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input type="text" defaultValue={profile.lastName} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" defaultValue={profile.email} />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="tel" defaultValue={profile.phone} />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="dashboard-section">
                <h2>Saved Addresses</h2>
                <div className="addresses-list">
                  {addresses.map(address => (
                    <div key={address.id} className="address-card">
                      <div className="address-header">
                        <h3>{address.type}</h3>
                        {address.isDefault && <span className="default-badge">Default</span>}
                      </div>
                      <p>{address.name}</p>
                      <p>{address.address}</p>
                      <p>{address.city}, {address.state} {address.zip}</p>
                      <div className="address-actions">
                        <button className="btn btn-outline">Edit</button>
                        <button className="btn btn-outline">Delete</button>
                        {!address.isDefault && (
                          <button className="btn btn-primary">Set as Default</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary">Add New Address</button>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="dashboard-section">
                <h2>Payment Methods</h2>
                <div className="payment-methods">
                  <div className="payment-card">
                    <CreditCard size={24} />
                    <div>
                      <p>•••• •••• •••• 1234</p>
                      <span>Expires 12/25</span>
                    </div>
                    <div className="payment-actions">
                      <button className="btn btn-outline">Edit</button>
                      <button className="btn btn-outline">Delete</button>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary">Add New Payment Method</button>
              </div>
            )}

            {activeTab === 'settings' && (
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
                  <button className="btn btn-secondary">Delete Account</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard


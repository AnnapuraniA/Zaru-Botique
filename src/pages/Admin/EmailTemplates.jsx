import { useState } from 'react'
import { Search, Edit, Mail, Eye, X } from 'lucide-react'

function EmailTemplates() {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingTemplate, setEditingTemplate] = useState(null)

  const templates = [
    {
      id: 1,
      name: 'Order Confirmation',
      subject: 'Order Confirmed - {{orderId}}',
      type: 'order_confirmation',
      lastModified: '2024-01-10'
    },
    {
      id: 2,
      name: 'Order Shipped',
      subject: 'Your Order Has Been Shipped - {{orderId}}',
      type: 'order_shipped',
      lastModified: '2024-01-08'
    },
    {
      id: 3,
      name: 'Order Delivered',
      subject: 'Your Order Has Been Delivered - {{orderId}}',
      type: 'order_delivered',
      lastModified: '2024-01-05'
    },
    {
      id: 4,
      name: 'Password Reset',
      subject: 'Reset Your Password',
      type: 'password_reset',
      lastModified: '2024-01-01'
    },
    {
      id: 5,
      name: 'Welcome Email',
      subject: 'Welcome to Arudhra Boutique!',
      type: 'welcome',
      lastModified: '2024-01-01'
    },
    {
      id: 6,
      name: 'Newsletter',
      subject: '{{newsletterSubject}}',
      type: 'newsletter',
      lastModified: '2024-01-12'
    }
  ]

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTemplateContent = (type) => {
    const contents = {
      order_confirmation: `Dear {{customerName}},

Thank you for your order!

Order ID: {{orderId}}
Order Date: {{orderDate}}
Total Amount: ₹{{orderAmount}}

Your order is being processed and will be shipped soon.

View Order: {{orderLink}}

Thank you for shopping with Arudhra Boutique!`,
      order_shipped: `Dear {{customerName}},

Great news! Your order has been shipped.

Order ID: {{orderId}}
Tracking Number: {{trackingNumber}}
Estimated Delivery: {{deliveryDate}}

Track Your Order: {{trackingLink}}

Thank you for shopping with Arudhra Boutique!`,
      password_reset: `Dear {{customerName}},

You requested to reset your password. Click the link below to reset:

{{resetLink}}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.`,
      welcome: `Welcome to Arudhra Boutique, {{customerName}}!

We're excited to have you join our fashion community.

Get 10% off your first order with code: WELCOME10

Start Shopping: {{shopLink}}

Thank you for choosing Arudhra Boutique!`
    }
    return contents[type] || 'Template content...'
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Email Templates</h1>
          <p>Manage email templates for order notifications and communications</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="filter-select">
          <option value="">All Types</option>
          <option value="order">Order Related</option>
          <option value="account">Account Related</option>
          <option value="marketing">Marketing</option>
        </select>
      </div>

      <div className="templates-grid">
        {filteredTemplates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <div className="template-icon">
                <Mail size={24} />
              </div>
              <div className="template-info">
                <h3>{template.name}</h3>
                <p className="text-muted">Last modified: {new Date(template.lastModified).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="template-subject">
              <strong>Subject:</strong> {template.subject}
            </div>
            <div className="template-preview">
              <pre>{getTemplateContent(template.type).substring(0, 150)}...</pre>
            </div>
            <div className="template-actions">
              <button className="btn btn-outline btn-small" onClick={() => setEditingTemplate(template)}>
                <Eye size={16} />
                Preview
              </button>
              <button className="btn btn-primary btn-small" onClick={() => setEditingTemplate(template)}>
                <Edit size={16} />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="modal-overlay" onClick={() => setEditingTemplate(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Email Template: {editingTemplate.name}</h2>
              <button className="modal-close" onClick={() => setEditingTemplate(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Email Subject *</label>
                <input
                  type="text"
                  defaultValue={editingTemplate.subject}
                  placeholder="Order Confirmed - {{orderId}}"
                />
                <small className="text-muted">Use {{variableName}} for dynamic content</small>
              </div>
              <div className="form-group">
                <label>Email Body *</label>
                <textarea
                  rows="15"
                  defaultValue={getTemplateContent(editingTemplate.type)}
                  placeholder="Enter email template content..."
                ></textarea>
                <small className="text-muted">Available variables: {{customerName}}, {{orderId}}, {{orderAmount}}, etc.</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditingTemplate(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                alert('Template saved successfully')
                setEditingTemplate(null)
              }}>Save Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailTemplates


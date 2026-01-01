import { useState, useEffect } from 'react'
import { Search, Edit, Mail, Eye, X } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'
import { adminEmailTemplatesAPI } from '../../utils/adminApi'

function EmailTemplates() {
  const { success, error: showError } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: '',
    subject: '',
    body: '',
    variables: []
  })

  useEffect(() => {
    loadTemplates()
  }, [typeFilter])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadTemplates()
    }, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await adminEmailTemplatesAPI.getAll(typeFilter || undefined)
      setTemplates(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading templates:', err)
      showError('Failed to load email templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!templateForm.name || !templateForm.type || !templateForm.subject || !templateForm.body) {
      showError('Please fill in all required fields')
      return
    }
    try {
      if (editingTemplate) {
        await adminEmailTemplatesAPI.update(editingTemplate.id, templateForm)
        success('Template updated successfully')
      } else {
        await adminEmailTemplatesAPI.create(templateForm)
        success('Template created successfully')
      }
      setEditingTemplate(null)
      setTemplateForm({ name: '', type: '', subject: '', body: '', variables: [] })
      await loadTemplates()
    } catch (err) {
      showError('Failed to save template')
    }
  }

  const handleEdit = async (template) => {
    try {
      const fullTemplate = await adminEmailTemplatesAPI.getById(template.id)
      setEditingTemplate(fullTemplate)
      setTemplateForm({
        name: fullTemplate.name || '',
        type: fullTemplate.type || '',
        subject: fullTemplate.subject || '',
        body: fullTemplate.body || '',
        variables: fullTemplate.variables || []
      })
    } catch (err) {
      showError('Failed to load template')
    }
  }

  const filteredTemplates = templates.filter(template =>
    !searchQuery || 
    template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Email Templates</h1>
          <p>Manage email templates for order confirmations, notifications, and more</p>
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
        <select 
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="order_confirmation">Order Confirmation</option>
          <option value="shipping_notification">Shipping Notification</option>
          <option value="order_cancelled">Order Cancelled</option>
          <option value="password_reset">Password Reset</option>
          <option value="welcome">Welcome</option>
        </select>
      </div>

      <div className="templates-list">
        {loading ? (
          <div className="loading-state">Loading templates...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="empty-state">No templates found</div>
        ) : (
          filteredTemplates.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-header">
                <div>
                  <h3>{template.name}</h3>
                  <span className="template-type">{template.type}</span>
                </div>
                <button 
                  className="btn-icon" 
                  title="Edit"
                  onClick={() => handleEdit(template)}
                >
                  <Edit size={16} />
                </button>
              </div>
              <div className="template-content">
                <p><strong>Subject:</strong> {template.subject}</p>
                <div className="template-body-preview">
                  {template.body?.substring(0, 150)}...
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="modal-overlay" onClick={() => setEditingTemplate(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Email Template</h2>
              <button 
                className="modal-close" 
                onClick={() => {
                  setEditingTemplate(null)
                  setTemplateForm({ name: '', type: '', subject: '', body: '', variables: [] })
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="Order Confirmation"
                  required
                />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select
                  value={templateForm.type}
                  onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="order_confirmation">Order Confirmation</option>
                  <option value="shipping_notification">Shipping Notification</option>
                  <option value="order_cancelled">Order Cancelled</option>
                  <option value="password_reset">Password Reset</option>
                  <option value="welcome">Welcome</option>
                </select>
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  placeholder="Your order has been confirmed"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Body *</label>
                <textarea
                  rows={15}
                  value={templateForm.body}
                  onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                  placeholder="Enter email template body. Use {{variable}} for dynamic content."
                  required
                />
                <small>Use variables like {'{{orderNumber}}'}, {'{{customerName}}'}, etc.</small>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setEditingTemplate(null)
                  setTemplateForm({ name: '', type: '', subject: '', body: '', variables: [] })
                }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailTemplates

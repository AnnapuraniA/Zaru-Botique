import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Image as ImageIcon, Eye, EyeOff, ArrowUp, ArrowDown, X } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'
import { adminBannersAPI } from '../../utils/adminApi'

function Banners() {
  const { success, error: showError } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      setLoading(true)
      const data = await adminBannersAPI.getAll()
      setBanners(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading banners:', err)
      showError('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    position: banners.length + 1,
    visible: true,
    startDate: '',
    endDate: ''
  })

  const filteredBanners = banners.filter(banner =>
    !searchQuery || banner.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = async () => {
    if (!formData.title || !formData.image) {
      showError('Please fill in all required fields')
      return
    }
    try {
      await adminBannersAPI.create({
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null
      })
      setShowAddModal(false)
      setFormData({
        title: '',
        subtitle: '',
        image: '',
        link: '',
        position: banners.length + 1,
        visible: true,
        startDate: '',
        endDate: ''
      })
      await loadBanners()
      success('Banner added successfully')
    } catch (err) {
      showError('Failed to add banner')
    }
  }

  const handleUpdate = async () => {
    if (!editingBanner) return
    try {
      await adminBannersAPI.update(editingBanner.id, {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null
      })
      setEditingBanner(null)
      setShowAddModal(false)
      setFormData({
        title: '',
        subtitle: '',
        image: '',
        link: '',
        position: banners.length + 1,
        visible: true,
        startDate: '',
        endDate: ''
      })
      await loadBanners()
      success('Banner updated successfully')
    } catch (err) {
      showError('Failed to update banner')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this banner?')) {
      try {
        await adminBannersAPI.delete(id)
        await loadBanners()
        success('Banner deleted successfully')
      } catch (err) {
        showError('Failed to delete banner')
      }
    }
  }

  const handleToggleVisibility = async (id) => {
    try {
      await adminBannersAPI.toggleVisibility(id)
      await loadBanners()
      success('Banner visibility updated')
    } catch (err) {
      showError('Failed to update banner visibility')
    }
  }


  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Banner & Slider Management</h1>
          <p>Manage promotional banners and homepage sliders</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditingBanner(null)
          setFormData({
            title: '',
            subtitle: '',
            image: '',
            link: '',
            position: banners.length + 1,
            visible: true,
            startDate: '',
            endDate: ''
          })
          setShowAddModal(true)
        }}>
          <Plus size={18} />
          Add Banner
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search banners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="filter-select">
          <option value="">All Banners</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      <div className="banners-grid">
        {loading ? (
          <div className="loading-state">Loading banners...</div>
        ) : filteredBanners.length === 0 ? (
          <div className="empty-state">No banners found</div>
        ) : (
          filteredBanners.map(banner => (
          <div key={banner.id} className="banner-card">
            <div className="banner-image-preview">
              <img src={banner.image} alt={banner.title} />
              <div className="banner-overlay">
                <span className="banner-position">Position: {banner.position}</span>
              </div>
            </div>
            <div className="banner-details">
              <h3>{banner.title}</h3>
              <p>{banner.subtitle}</p>
              <div className="banner-meta">
                <span>Link: {banner.link}</span>
                <span>Visible: {banner.visible ? 'Yes' : 'No'}</span>
              </div>
              <div className="banner-actions">
                <button 
                  className="btn-icon" 
                  title={banner.visible ? 'Hide' : 'Show'}
                  onClick={() => handleToggleVisibility(banner.id)}
                >
                  {banner.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button 
                  className="btn-icon" 
                  title="Move Up"
                  onClick={() => handleMove(banner.id, 'up')}
                  disabled={banner.position === 1}
                >
                  <ArrowUp size={16} />
                </button>
                <button 
                  className="btn-icon" 
                  title="Move Down"
                  onClick={() => handleMove(banner.id, 'down')}
                  disabled={banner.position === banners.length}
                >
                  <ArrowDown size={16} />
                </button>
                <button className="btn-icon" title="Edit" onClick={() => handleEdit(banner)}>
                  <Edit size={16} />
                </button>
                <button className="btn-icon danger" title="Delete" onClick={() => handleDelete(banner.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
              <button className="modal-close" onClick={() => {
                setShowAddModal(false)
                setEditingBanner(null)
                setFormData({
                  title: '',
                  subtitle: '',
                  image: '',
                  link: '',
                  position: banners.length + 1,
                  visible: true,
                  startDate: '',
                  endDate: ''
                })
              }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Banner Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Summer Collection Sale"
                  required
                />
              </div>
              <div className="form-group">
                <label>Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Up to 50% off on selected items"
                />
              </div>
              <div className="form-group">
                <label>Banner Image URL *</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
              <div className="form-group">
                <label>Link URL</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/products/women"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.visible}
                    onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                  />
                  <span>Visible on website</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={editingBanner ? handleUpdate : handleAdd}>
                {editingBanner ? 'Update Banner' : 'Add Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Banners


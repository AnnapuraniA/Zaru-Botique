import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Image as ImageIcon, Eye, EyeOff, ArrowUp, ArrowDown, X } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'

function Banners() {
  const { success } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const [banners, setBanners] = useState([
    { 
      id: 1, 
      title: 'Summer Collection Sale', 
      subtitle: 'Up to 50% off on selected items', 
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
      link: '/products/women',
      position: 1,
      visible: true,
      startDate: '2024-01-01',
      endDate: '2024-03-31'
    },
    { 
      id: 2, 
      title: 'New Arrivals', 
      subtitle: 'Discover the latest fashion trends', 
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=400&fit=crop',
      link: '/products/teen',
      position: 2,
      visible: true,
      startDate: '2024-01-15',
      endDate: '2024-04-15'
    },
    { 
      id: 3, 
      title: 'Free Shipping', 
      subtitle: 'On orders above ₹2000', 
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
      link: '/shipping',
      position: 3,
      visible: false,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }
  ])

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
    banner.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAdd = () => {
    if (!formData.title || !formData.image) {
      alert('Please fill in all required fields')
      return
    }
    const newBanner = {
      id: banners.length + 1,
      ...formData,
      position: banners.length + 1
    }
    setBanners([...banners, newBanner])
    setShowAddModal(false)
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      link: '',
      position: banners.length + 2,
      visible: true,
      startDate: '',
      endDate: ''
    })
    success('Banner added successfully')
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this banner?')) {
      setBanners(banners.filter(b => b.id !== id))
      success('Banner deleted successfully')
    }
  }

  const handleToggleVisibility = (id) => {
    setBanners(banners.map(b => 
      b.id === id ? { ...b, visible: !b.visible } : b
    ))
    success('Banner visibility updated')
  }

  const handleMove = (id, direction) => {
    const index = banners.findIndex(b => b.id === id)
    if (direction === 'up' && index > 0) {
      const newBanners = [...banners]
      [newBanners[index], newBanners[index - 1]] = [newBanners[index - 1], newBanners[index]]
      setBanners(newBanners)
      success('Banner position updated')
    } else if (direction === 'down' && index < banners.length - 1) {
      const newBanners = [...banners]
      [newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]]
      setBanners(newBanners)
      success('Banner position updated')
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Banner & Slider Management</h1>
          <p>Manage promotional banners and homepage sliders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
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
        {filteredBanners.map(banner => (
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
                <button className="btn-icon" title="Edit">
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
              <h2>Add New Banner</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
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
              <button className="btn btn-primary" onClick={handleAdd}>Add Banner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Banners


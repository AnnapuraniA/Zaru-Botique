import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Eye, Image as ImageIcon } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'
import { adminContentAPI } from '../../utils/adminApi'

function Content() {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [heroContent, setHeroContent] = useState({
    title: 'Discover Your Style',
    description: 'Shop the latest fashion trends and timeless classics',
    button1Text: 'Shop Women',
    button1Link: '/products/women',
    button2Text: 'Shop Teen',
    button2Link: '/products/teen',
    button3Text: 'Shop Girls',
    button3Link: '/products/girls',
    backgroundImage: ''
  })

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const data = await adminContentAPI.getAll('hero')
      if (data && data.hero) {
        setHeroContent(prev => ({ ...prev, ...data.hero }))
      }
    } catch (err) {
      console.error('Error loading content:', err)
      showError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await adminContentAPI.update('hero', heroContent)
      success('Home page content saved successfully')
    } catch (err) {
      showError('Failed to save content')
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Content Management</h1>
          <p>Edit home page content and sections</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">
            <Eye size={18} />
            Preview
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="content-sections">
        {/* Hero Section */}
        <div className="content-section-card">
          <h2>Hero Section</h2>
          <div className="form-group">
            <label>Hero Title</label>
            <input
              type="text"
              value={heroContent.title}
              onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Hero Description</label>
            <textarea
              rows="3"
              value={heroContent.description}
              onChange={(e) => setHeroContent({ ...heroContent, description: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Button 1 Text</label>
              <input
                type="text"
                value={heroContent.button1Text}
                onChange={(e) => setHeroContent({ ...heroContent, button1Text: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Button 1 Link</label>
              <input
                type="text"
                value={heroContent.button1Link}
                onChange={(e) => setHeroContent({ ...heroContent, button1Link: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Button 2 Text</label>
              <input
                type="text"
                value={heroContent.button2Text}
                onChange={(e) => setHeroContent({ ...heroContent, button2Text: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Button 2 Link</label>
              <input
                type="text"
                value={heroContent.button2Link}
                onChange={(e) => setHeroContent({ ...heroContent, button2Link: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Button 3 Text</label>
              <input
                type="text"
                value={heroContent.button3Text}
                onChange={(e) => setHeroContent({ ...heroContent, button3Text: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Button 3 Link</label>
              <input
                type="text"
                value={heroContent.button3Link}
                onChange={(e) => setHeroContent({ ...heroContent, button3Link: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Background Image URL</label>
            <div className="image-upload-input">
              <ImageIcon size={20} />
              <input
                type="text"
                placeholder="Enter image URL or upload"
                value={heroContent.backgroundImage}
                onChange={(e) => setHeroContent({ ...heroContent, backgroundImage: e.target.value })}
              />
              <button type="button" className="btn btn-outline btn-small">Upload</button>
            </div>
          </div>
        </div>

        {/* Promotional Banners Section */}
        <div className="content-section-card">
          <div className="section-header">
            <h2>Promotional Banners</h2>
            <button 
              className="btn btn-outline btn-small"
              onClick={() => navigate('/admin/banners')}
            >
              Manage Banners
            </button>
          </div>
          <p className="section-note">Manage promotional banners displayed on the home page. Click to go to Banners page.</p>
        </div>

        {/* Featured Products Section */}
        <div className="content-section-card">
          <div className="section-header">
            <h2>Featured Products</h2>
            <button 
              className="btn btn-outline btn-small"
              onClick={() => navigate('/admin/products')}
            >
              Manage Products
            </button>
          </div>
          <p className="section-note">Mark products as "Featured" in the Products page to display them on the home page.</p>
        </div>
      </div>
    </div>
  )
}

export default Content


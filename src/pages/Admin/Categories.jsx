import { useState } from 'react'
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react'
import { useToast } from '../../components/Toast/ToastContainer'

function Categories() {
  const { success } = useToast()
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')

  const [categories, setCategories] = useState({
    'Women': ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories'],
    'Teen': ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories'],
    'Girls': ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories']
  })

  const handleAddCategory = () => {
    if (newCategoryName && newCategoryName.trim()) {
      const categoryName = newCategoryName.trim()
      if (categories[categoryName]) {
        alert('Category already exists!')
        return
      }
      setCategories(prev => ({
        ...prev,
        [categoryName]: []
      }))
      setNewCategoryName('')
      setShowAddCategoryModal(false)
      success('Category added successfully')
    }
  }

  const handleAddSubcategory = (category) => {
    const newSub = prompt('Enter new subcategory name:')
    if (newSub && newSub.trim()) {
      setCategories(prev => ({
        ...prev,
        [category]: [...prev[category], newSub.trim()]
      }))
      success('Subcategory added successfully')
    }
  }

  const handleDeleteCategory = (category) => {
    if (window.confirm(`Delete category "${category}" and all its subcategories?`)) {
      setCategories(prev => {
        const newCategories = { ...prev }
        delete newCategories[category]
        return newCategories
      })
      success('Category deleted successfully')
    }
  }

  const handleDeleteSubcategory = (category, subcategory) => {
    if (window.confirm(`Delete "${subcategory}" from ${category}?`)) {
      setCategories(prev => ({
        ...prev,
        [category]: prev[category].filter(sub => sub !== subcategory)
      }))
      success('Subcategory deleted successfully')
    }
  }

  const handleEditSubcategory = (category, oldSub, newSub) => {
    setCategories(prev => ({
      ...prev,
      [category]: prev[category].map(sub => sub === oldSub ? newSub : sub)
    }))
    success('Subcategory updated successfully')
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Categories & Subcategories</h1>
          <p>Manage product categories and subcategories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddCategoryModal(true)}>
          <Plus size={18} />
          Add New Category
        </button>
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowAddCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Category</h2>
              <button className="modal-close" onClick={() => setShowAddCategoryModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Men, Accessories, etc."
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory()
                    }
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddCategoryModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddCategory}>
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="categories-list">
        {Object.keys(categories).map(category => (
          <div key={category} className="category-card">
            <div 
              className="category-header"
              onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
            >
              <div className="category-title-wrapper">
                {expandedCategory === category ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                <h2>{category}</h2>
                <span className="subcategory-count">{categories[category].length} subcategories</span>
              </div>
              <div className="category-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn-outline btn-small"
                  onClick={() => handleAddSubcategory(category)}
                >
                  <Plus size={16} />
                  Add Subcategory
                </button>
                <button
                  className="btn-icon danger"
                  onClick={() => handleDeleteCategory(category)}
                  title="Delete Category"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {expandedCategory === category && (
              <div className="subcategories-list">
                {categories[category].map((subcategory, index) => (
                  <div key={index} className="subcategory-item">
                    <span>{subcategory}</span>
                    <div className="subcategory-actions">
                      <button
                        className="btn-icon"
                        onClick={() => {
                          const newName = prompt('Enter new name:', subcategory)
                          if (newName && newName.trim() && newName !== subcategory) {
                            handleEditSubcategory(category, subcategory, newName.trim())
                          }
                        }}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDeleteSubcategory(category, subcategory)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Categories


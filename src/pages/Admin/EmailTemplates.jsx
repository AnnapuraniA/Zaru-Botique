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


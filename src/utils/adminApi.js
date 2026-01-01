// Admin API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

// Helper function to get admin auth token
const getAdminToken = () => {
  return localStorage.getItem('adminToken')
}

// Helper function to get headers
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (includeAuth) {
    const token = getAdminToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }
  
  return headers
}

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const { method = 'GET', body, includeAuth = true } = options
  
  const config = {
    method,
    headers: getHeaders(includeAuth)
  }
  
  if (body) {
    config.body = JSON.stringify(body)
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    // Check if response is ok before parsing JSON
    if (!response.ok) {
      let errorMessage = 'Something went wrong'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }
    
    // Handle empty responses
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      return data
    }
    
    return {}
  } catch (error) {
    console.error('Admin API Error:', error)
    // Don't throw network errors that break the app
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Unable to connect to server. Please check your connection.')
    }
    throw error
  }
}

// Admin Auth API
export const adminAuthAPI = {
  login: (email, password) =>
    apiCall('/admin/auth/login', {
      method: 'POST',
      body: { email, password },
      includeAuth: false
    }),
  
  getMe: () => apiCall('/admin/auth/me')
}

// Admin Dashboard API
export const adminDashboardAPI = {
  getStats: () => apiCall('/admin/stats'),
  getRecentOrders: (limit = 10) => apiCall(`/admin/recent-orders?limit=${limit}`),
  getTopProducts: () => apiCall('/admin/top-products')
}

// Admin Upload API
export const adminUploadAPI = {
  uploadImages: async (files) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })
    
    const token = getAdminToken()
    const response = await fetch(`${API_BASE_URL}/admin/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to upload images')
    }
    
    return response.json()
  },
  
  deleteImage: (filename) => {
    const name = filename.split('/').pop() // Extract filename from path
    return apiCall(`/admin/upload/images/${name}`, { method: 'DELETE' })
  }
}

// Admin Products API
export const adminProductsAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key])
      }
    })
    const queryString = queryParams.toString()
    return apiCall(`/admin/products${queryString ? `?${queryString}` : ''}`)
  },
  
  create: (productData) =>
    apiCall('/admin/products', {
      method: 'POST',
      body: productData
    }),
  
  getById: (id) =>
    apiCall(`/admin/products/${id}`),
  
  update: (id, productData) =>
    apiCall(`/admin/products/${id}`, {
      method: 'PUT',
      body: productData
    }),
  
  delete: (id) =>
    apiCall(`/admin/products/${id}`, {
      method: 'DELETE'
    }),
  
  toggleStatus: (id) =>
    apiCall(`/admin/products/${id}/status`, {
      method: 'PUT'
    })
}

// Admin Orders API
export const adminOrdersAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key])
      }
    })
    const queryString = queryParams.toString()
    return apiCall(`/admin/orders${queryString ? `?${queryString}` : ''}`)
  },
  
  getById: (id) => apiCall(`/admin/orders/${id}`),
  
  updateStatus: (id, status) =>
    apiCall(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: { status }
    })
}

// Admin Customers API
export const adminCustomersAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key])
      }
    })
    const queryString = queryParams.toString()
    return apiCall(`/admin/customers${queryString ? `?${queryString}` : ''}`)
  },
  
  getById: (id) => apiCall(`/admin/customers/${id}`)
}

// Admin Banners API
export const adminBannersAPI = {
  getAll: () => apiCall('/admin/banners/all'),
  create: (bannerData) =>
    apiCall('/admin/banners/create', {
      method: 'POST',
      body: bannerData
    }),
  update: (id, bannerData) =>
    apiCall(`/admin/banners/update/${id}`, {
      method: 'PUT',
      body: bannerData
    }),
  delete: (id) =>
    apiCall(`/admin/banners/delete/${id}`, {
      method: 'DELETE'
    }),
  updatePosition: (id, position) =>
    apiCall(`/admin/banners/position/${id}`, {
      method: 'PUT',
      body: { position }
    }),
  toggleVisibility: (id) =>
    apiCall(`/admin/banners/visibility/${id}`, {
      method: 'PUT'
    })
}

// Admin Coupons API
export const adminCouponsAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key])
      }
    })
    const queryString = queryParams.toString()
    return apiCall(`/admin/coupons/all${queryString ? `?${queryString}` : ''}`)
  },
  create: (couponData) =>
    apiCall('/admin/coupons/create', {
      method: 'POST',
      body: couponData
    }),
  update: (id, couponData) =>
    apiCall(`/admin/coupons/update/${id}`, {
      method: 'PUT',
      body: couponData
    }),
  delete: (id) =>
    apiCall(`/admin/coupons/delete/${id}`, {
      method: 'DELETE'
    }),
  toggleStatus: (id) =>
    apiCall(`/admin/coupons/status/${id}`, {
      method: 'PUT'
    })
}

// Admin Settings API
export const adminSettingsAPI = {
  getAll: (category) => {
    const query = category ? `?category=${category}` : ''
    return apiCall(`/admin/settings/all${query}`)
  },
  update: (settings) =>
    apiCall('/admin/settings/update', {
      method: 'PUT',
      body: settings
    }),
  updateSingle: (key, value, type, category, description) =>
    apiCall(`/admin/settings/update/${key}`, {
      method: 'PUT',
      body: { value, type, category, description }
    })
}

// Admin Queries API
export const adminQueriesAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key])
      }
    })
    const queryString = queryParams.toString()
    return apiCall(`/admin/queries/all${queryString ? `?${queryString}` : ''}`)
  },
  getById: (id) => apiCall(`/admin/queries/details/${id}`),
  updateStatus: (id, status) =>
    apiCall(`/admin/queries/status/${id}`, {
      method: 'PUT',
      body: { status }
    }),
  reply: (id, reply) =>
    apiCall(`/admin/queries/reply/${id}`, {
      method: 'POST',
      body: { reply }
    })
}

// Admin Returns API
export const adminReturnsAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key])
      }
    })
    const queryString = queryParams.toString()
    return apiCall(`/admin/returns/all${queryString ? `?${queryString}` : ''}`)
  },
  getById: (id) => apiCall(`/admin/returns/details/${id}`),
  updateStatus: (id, status) =>
    apiCall(`/admin/returns/status/${id}`, {
      method: 'PUT',
      body: { status }
    }),
  processRefund: (id) =>
    apiCall(`/admin/returns/refund/${id}`, {
      method: 'POST'
    })
}

// Admin Categories API
export const adminCategoriesAPI = {
  getAll: () => apiCall('/admin/categories/all'),
  create: (categoryData) =>
    apiCall('/admin/categories/create', {
      method: 'POST',
      body: categoryData
    }),
  update: (id, categoryData) =>
    apiCall(`/admin/categories/update/${id}`, {
      method: 'PUT',
      body: categoryData
    }),
  delete: (id) =>
    apiCall(`/admin/categories/delete/${id}`, {
      method: 'DELETE'
    }),
  addSubcategory: (categoryId, subcategoryData) =>
    apiCall(`/admin/categories/subcategory/${categoryId}`, {
      method: 'POST',
      body: subcategoryData
    }),
  updateSubcategory: (subId, subcategoryData) =>
    apiCall(`/admin/categories/subcategory/${subId}`, {
      method: 'PUT',
      body: subcategoryData
    }),
  deleteSubcategory: (subId) =>
    apiCall(`/admin/categories/subcategory/${subId}`, {
      method: 'DELETE'
    })
}

// Admin Discounts API
export const adminDiscountsAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key])
      }
    })
    const queryString = queryParams.toString()
    return apiCall(`/admin/discounts/all${queryString ? `?${queryString}` : ''}`)
  },
  create: (discountData) =>
    apiCall('/admin/discounts/create', {
      method: 'POST',
      body: discountData
    }),
  update: (id, discountData) =>
    apiCall(`/admin/discounts/update/${id}`, {
      method: 'PUT',
      body: discountData
    }),
  delete: (id) =>
    apiCall(`/admin/discounts/delete/${id}`, {
      method: 'DELETE'
    }),
  toggleStatus: (id) =>
    apiCall(`/admin/discounts/status/${id}`, {
      method: 'PUT'
    })
}

// Admin Newsletter API
export const adminNewsletterAPI = {
  getSubscribers: (filters = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key])
      }
    })
    const queryString = queryParams.toString()
    return apiCall(`/admin/newsletter/subscribers${queryString ? `?${queryString}` : ''}`)
  },
  send: (subject, content) =>
    apiCall('/admin/newsletter/send', {
      method: 'POST',
      body: { subject, content }
    }),
  removeSubscriber: (id) =>
    apiCall(`/admin/newsletter/subscribers/${id}`, {
      method: 'DELETE'
    })
}

// Admin Content API
export const adminContentAPI = {
  getAll: (section) => {
    const query = section ? `?section=${section}` : ''
    return apiCall(`/admin/content/all${query}`)
  },
  update: (section, content) =>
    apiCall('/admin/content/update', {
      method: 'PUT',
      body: { section, content }
    })
}

// Admin Analytics API
export const adminAnalyticsAPI = {
  getRevenue: (period = '30days') =>
    apiCall(`/admin/analytics/revenue?period=${period}`),
  getSales: (period = '30days') =>
    apiCall(`/admin/analytics/sales?period=${period}`),
  getCustomers: (period = '30days') =>
    apiCall(`/admin/analytics/customers?period=${period}`),
  getProducts: (period = '30days') =>
    apiCall(`/admin/analytics/products?period=${period}`),
  getCategories: (period = '30days') =>
    apiCall(`/admin/analytics/categories?period=${period}`)
}

// Admin Inventory API
export const adminInventoryAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key])
      }
    })
    const queryString = queryParams.toString()
    return apiCall(`/admin/inventory/all${queryString ? `?${queryString}` : ''}`)
  },
  update: (productId, stockCount, type, reason) =>
    apiCall(`/admin/inventory/update/${productId}`, {
      method: 'PUT',
      body: { stockCount, type, reason }
    }),
  getLowStock: (threshold = 20) =>
    apiCall(`/admin/inventory/low-stock?threshold=${threshold}`),
  getOutOfStock: () => apiCall('/admin/inventory/out-of-stock')
}

// Admin Email Templates API
export const adminEmailTemplatesAPI = {
  getAll: (type) => {
    const query = type ? `?type=${type}` : ''
    return apiCall(`/admin/email-templates/all${query}`)
  },
  getById: (id) => apiCall(`/admin/email-templates/${id}`),
  create: (templateData) =>
    apiCall('/admin/email-templates/create', {
      method: 'POST',
      body: templateData
    }),
  update: (id, templateData) =>
    apiCall(`/admin/email-templates/update/${id}`, {
      method: 'PUT',
      body: templateData
    })
}

// Admin Reports API
export const adminReportsAPI = {
  getSales: (startDate, endDate, format = 'json') => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    params.append('format', format)
    return apiCall(`/admin/reports/sales?${params.toString()}`)
  },
  getCustomers: (format = 'json') =>
    apiCall(`/admin/reports/customers?format=${format}`),
  getProducts: (format = 'json') =>
    apiCall(`/admin/reports/products?format=${format}`),
  getOrders: (startDate, endDate, status, format = 'json') => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    if (status) params.append('status', status)
    params.append('format', format)
    return apiCall(`/admin/reports/orders?${params.toString()}`)
  },
  getInventory: (format = 'json') =>
    apiCall(`/admin/reports/inventory?format=${format}`)
}

export default {
  adminAuthAPI,
  adminDashboardAPI,
  adminUploadAPI,
  adminProductsAPI,
  adminOrdersAPI,
  adminCustomersAPI,
  adminBannersAPI,
  adminCouponsAPI,
  adminSettingsAPI,
  adminQueriesAPI,
  adminReturnsAPI,
  adminCategoriesAPI,
  adminDiscountsAPI,
  adminNewsletterAPI,
  adminContentAPI,
  adminAnalyticsAPI,
  adminInventoryAPI,
  adminEmailTemplatesAPI,
  adminReportsAPI
}


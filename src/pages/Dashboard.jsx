import { useState, useEffect, useRef } from 'react'
import { useDevice } from '../hooks/useDevice'
import DashboardMobile from './Dashboard.mobile'
import DashboardWeb from './Dashboard.web'
import { ordersAPI, addressesAPI, paymentAPI, authAPI, newsletterAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useLoginModal } from '../context/LoginModalContext'
import { useToast } from '../components/Toast/ToastContainer'

function Dashboard() {
  const isMobile = useDevice()
  const { user, logout, isAuthenticated, updateProfile, changePassword } = useAuth()
  const { openModal } = useLoginModal()
  const { success: showSuccessToast, error: showError } = useToast()
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newAddress, setNewAddress] = useState({
    type: 'Home',
    name: user?.name || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    isDefault: false,
    otherDetail: ''
  })
  const [newPayment, setNewPayment] = useState({
    methodType: 'card',
    cardName: '',
    upiId: '',
    netBankingBank: '',
    walletProvider: ''
  })
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const paymentFormRef = useRef(null)
  const [editingPaymentId, setEditingPaymentId] = useState(null)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || ''
  })
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchOrderQuery, setSearchOrderQuery] = useState('')
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newsletter: false
  })
  const [newsletterStatus, setNewsletterStatus] = useState({ subscribed: false, email: null })
  const [loadingPreferences, setLoadingPreferences] = useState(false)

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders()
      loadAddresses()
      loadPaymentMethods()
      loadPreferences()
      loadNewsletterStatus()
    }
  }, [isAuthenticated])

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        setRazorpayLoaded(true)
      }
      script.onerror = () => {
        console.error('Failed to load Razorpay script')
        showError('Failed to load payment gateway. Please refresh the page.')
      }
      document.body.appendChild(script)

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script)
        }
      }
    }

    if (showAddPayment) {
      loadRazorpay()
    }
  }, [showAddPayment])

  // Update profile form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || ''
      })
      setNewAddress(prev => ({ ...prev, name: user.name || '' }))
    }
  }, [user])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getAll()
      setOrders(Array.isArray(response) ? response : (response.orders || []))
    } catch (err) {
      console.error('Failed to load orders:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const loadAddresses = async () => {
    try {
      const response = await addressesAPI.getAll()
      const addressesList = Array.isArray(response) ? response : (response.addresses || [])
      setAddresses(addressesList)
      return addressesList
    } catch (err) {
      console.error('Failed to load addresses:', err)
      setAddresses([])
      throw err
    }
  }

  const loadPaymentMethods = async () => {
    try {
      const response = await paymentAPI.getAll()
      setPaymentMethods(Array.isArray(response) ? response : (response.paymentMethods || []))
    } catch (err) {
      console.error('Failed to load payment methods:', err)
      setPaymentMethods([])
    }
  }

  const loadPreferences = async () => {
    try {
      setLoadingPreferences(true)
      const prefs = await authAPI.getPreferences()
      setPreferences(prefs)
    } catch (err) {
      console.error('Failed to load preferences:', err)
    } finally {
      setLoadingPreferences(false)
    }
  }

  const loadNewsletterStatus = async () => {
    try {
      const status = await newsletterAPI.getStatus()
      setNewsletterStatus(status)
      if (status.subscribed !== undefined) {
        setPreferences(prev => ({ ...prev, newsletter: status.subscribed }))
      }
    } catch (err) {
      console.error('Failed to load newsletter status:', err)
    }
  }

  const handlePreferenceChange = async (key, value) => {
    try {
      const updatedPreferences = { ...preferences, [key]: value }
      setPreferences(updatedPreferences)
      
      if (key === 'newsletter') {
        if (value) {
          if (!user?.email) {
            showError('Please add an email address to your account first')
            setPreferences(prev => ({ ...prev, newsletter: false }))
            return
          }
          await newsletterAPI.subscribeUser()
          await loadNewsletterStatus()
          showSuccessToast('Subscribed to newsletter successfully')
        } else {
          await newsletterAPI.unsubscribeUser()
          await loadNewsletterStatus()
          showSuccessToast('Unsubscribed from newsletter')
        }
      } else {
        await authAPI.updatePreferences({ [key]: value })
        showSuccessToast('Preferences updated successfully')
      }
    } catch (err) {
      console.error('Failed to update preference:', err)
      showError(err.response?.data?.message || 'Failed to update preference')
      setPreferences(prev => ({ ...prev, [key]: !value }))
    }
  }

  const handleLogout = () => {
    logout()
    setActiveTab('login')
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    
    try {
      await updateProfile(profileForm)
      showSuccessToast('Profile updated successfully!')
    } catch (err) {
      setError(err.message)
      showError(err.message)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      showError('New passwords do not match')
      return
    }
    
    if (passwordForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      showError('Password must be at least 8 characters')
      return
    }
    
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      showSuccessToast('Password changed successfully!')
      setShowChangePassword(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      setError(err.message)
      showError(err.message)
    }
  }

  // Render mobile or web version
  if (isMobile) {
    return <DashboardMobile />
  }

                      return (
    <DashboardWeb
      orders={orders}
      addresses={addresses}
      paymentMethods={paymentMethods}
      loading={loading}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      showAddAddress={showAddAddress}
      setShowAddAddress={setShowAddAddress}
      editingAddressId={editingAddressId}
      setEditingAddressId={setEditingAddressId}
      showAddPayment={showAddPayment}
      setShowAddPayment={setShowAddPayment}
      editingPaymentId={editingPaymentId}
      setEditingPaymentId={setEditingPaymentId}
      newAddress={newAddress}
      setNewAddress={setNewAddress}
      newPayment={newPayment}
      setNewPayment={setNewPayment}
      razorpayLoaded={razorpayLoaded}
      paymentFormRef={paymentFormRef}
      profileForm={profileForm}
      setProfileForm={setProfileForm}
      showChangePassword={showChangePassword}
      setShowChangePassword={setShowChangePassword}
      passwordForm={passwordForm}
      setPasswordForm={setPasswordForm}
      showCurrentPassword={showCurrentPassword}
      setShowCurrentPassword={setShowCurrentPassword}
      showNewPassword={showNewPassword}
      setShowNewPassword={setShowNewPassword}
      showConfirmPassword={showConfirmPassword}
      setShowConfirmPassword={setShowConfirmPassword}
      error={error}
      setError={setError}
      successMessage={successMessage}
      setSuccessMessage={setSuccessMessage}
      searchOrderQuery={searchOrderQuery}
      setSearchOrderQuery={setSearchOrderQuery}
      preferences={preferences}
      setPreferences={setPreferences}
      newsletterStatus={newsletterStatus}
      loadingPreferences={loadingPreferences}
      handleLogout={handleLogout}
      handleUpdateProfile={handleUpdateProfile}
      handleChangePassword={handleChangePassword}
      handlePreferenceChange={handlePreferenceChange}
      loadAddresses={loadAddresses}
      loadPaymentMethods={loadPaymentMethods}
      showDeleteModal={showDeleteModal}
      setShowDeleteModal={setShowDeleteModal}
      showSuccessToast={showSuccessToast}
      showError={showError}
      user={user}
      isAuthenticated={isAuthenticated}
      openModal={openModal}
    />
  )
}

export default Dashboard

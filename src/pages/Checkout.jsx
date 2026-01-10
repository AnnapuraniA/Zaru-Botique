import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, Lock, ChevronDown, X, Smartphone, Building2, Wallet, Shield, CheckCircle2, User, Phone, Mail, MapPin, Tag, CheckCircle, IndianRupee, Package, ShoppingBag, FileText, Plus, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cartAPI, ordersAPI, couponsAPI, settingsAPI, addressesAPI, paymentAPI } from '../utils/api'
import { useToast } from '../components/Toast/ToastContainer'

function Checkout() {
  const { user, isAuthenticated, getGuestId } = useAuth()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [step, setStep] = useState(1)
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [availableCoupons, setAvailableCoupons] = useState([])
  const [showCouponDropdown, setShowCouponDropdown] = useState(false)
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const couponInputRef = useRef(null)
  const couponDropdownRef = useRef(null)
  const [shippingCosts, setShippingCosts] = useState({
    free: 0,
    standard: 100,
    express: 200
  })
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([])
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null)
  const [useSavedPayment, setUseSavedPayment] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [formData, setFormData] = useState({
    mobile: '',
    email: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    shippingMethod: 'free',
    paymentMethod: 'card',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVC: '',
    upiId: '',
    netBankingBank: '',
    walletProvider: ''
  })

  // Load Razorpay script
  useEffect(() => {
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
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Load cart items and settings
  useEffect(() => {
    loadCart()
    loadShippingSettings()
    if (isAuthenticated && user) {
      loadSavedAddresses()
      loadSavedPaymentMethods()
      // Pre-fill user info
      setFormData(prev => ({
        ...prev,
        mobile: user.mobile || '',
        email: user.email || '',
        name: user.name || ''
      }))
    }
  }, [user, isAuthenticated])

  const loadSavedPaymentMethods = async () => {
    try {
      const methods = await paymentAPI.getAll()
      setSavedPaymentMethods(Array.isArray(methods) ? methods : [])
      // Auto-select first saved method if available
      if (methods && methods.length > 0) {
        setSelectedPaymentMethodId(methods[0].id || methods[0]._id)
        setUseSavedPayment(true)
      }
    } catch (err) {
      console.error('Failed to load saved payment methods:', err)
      setSavedPaymentMethods([])
    }
  }

  const loadSavedAddresses = async () => {
    try {
      const response = await addressesAPI.getAll()
      const addresses = Array.isArray(response) ? response : (response.addresses || [])
      setSavedAddresses(addresses)
      
      // Auto-select default address if available
      const defaultAddress = addresses.find(addr => addr.isDefault)
      if (defaultAddress) {
        handleSelectAddress(defaultAddress)
      }
    } catch (err) {
      console.error('Failed to load saved addresses:', err)
    }
  }

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address._id || address.id)
    setShowAddAddress(false)
    setFormData(prev => ({
      ...prev,
      name: address.name || prev.name,
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || address.zip || ''
    }))
  }

  const handleUseNewAddress = () => {
    setSelectedAddressId(null)
    setShowAddAddress(true)
    setFormData(prev => ({
      ...prev,
      address: '',
      city: '',
      state: '',
      zipCode: ''
    }))
  }

  const loadShippingSettings = async () => {
    try {
      const settings = await settingsAPI.getShipping()
      if (settings) {
        setShippingCosts(prev => ({
          ...prev,
          free: settings.freeShipping || 0,
          standard: settings.standardShipping || 100,
          express: settings.expressShipping || 200
        }))
      }
    } catch (err) {
      console.error('Failed to load shipping settings:', err)
      // Use defaults
    }
  }

  const loadCart = async () => {
    try {
      setLoading(true)
      if (isAuthenticated && user) {
        // Load user cart from API
        const response = await cartAPI.get()
        setCartItems(response.items || [])
      } else {
        // Load guest cart from localStorage
        const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '[]')
        setCartItems(guestCart)
      }
    } catch (err) {
      console.error('Failed to load cart:', err)
      showError('Failed to load cart')
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    // Validate zipcode to only allow numeric digits (6 digits for Indian zipcodes)
    if (name === 'zipCode') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6)
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }))
    } else if (name === 'cardNumber') {
      // Format card number with spaces every 4 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 16)
      const formattedValue = numericValue.replace(/(.{4})/g, '$1 ').trim()
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
    } else if (name === 'cardExpiry') {
      // Format expiry date as MM/YY
      const numericValue = value.replace(/\D/g, '').slice(0, 4)
      let formattedValue = numericValue
      if (numericValue.length >= 2) {
        formattedValue = numericValue.slice(0, 2) + '/' + numericValue.slice(2)
      }
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
    } else if (name === 'cardCVC') {
      // Only allow 3-4 digits for CVC
      const numericValue = value.replace(/\D/g, '').slice(0, 4)
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  // Load available coupons
  const loadAvailableCoupons = async () => {
    setLoadingCoupons(true)
    try {
      console.log('Loading available coupons, subtotal:', subtotal)
      const response = await couponsAPI.getAvailable(subtotal)
      console.log('Coupons response:', response)
      setAvailableCoupons(response.coupons || [])
    } catch (err) {
      console.error('Failed to load coupons:', err)
      showError('Failed to load available coupons')
    } finally {
      setLoadingCoupons(false)
    }
  }

  // Handle coupon input focus/click
  const handleCouponInputFocus = () => {
    setShowCouponDropdown(true)
    // Always load coupons when input is focused (if not already loaded or loading)
    if (availableCoupons.length === 0 && !loadingCoupons) {
      console.log('Input focused, loading coupons...')
      loadAvailableCoupons()
    }
  }

  // Handle coupon selection from dropdown
  const handleSelectCoupon = async (coupon) => {
    setCouponCode(coupon.code)
    setShowCouponDropdown(false)
    // Auto-apply the selected coupon
    setValidatingCoupon(true)
    setCouponError('')
    try {
      console.log('Validating selected coupon:', coupon)
      const result = await couponsAPI.validate(coupon.code, subtotal)
      console.log('Validation result:', result)
      if (result.valid && result.coupon) {
        // Use coupon data from dropdown (has original values) merged with validation result
        const couponToApply = {
          id: result.coupon.id || coupon.id,
          code: coupon.code || result.coupon.code,
          type: coupon.type || result.coupon.type,
          discount: parseFloat(coupon.discount || result.coupon.discount || 0), // Original discount value from dropdown
          maxDiscount: coupon.maxDiscount ? parseFloat(coupon.maxDiscount) : (result.coupon.maxDiscount ? parseFloat(result.coupon.maxDiscount) : null),
          description: coupon.description || result.coupon.description,
          minPurchase: coupon.minPurchase ? parseFloat(coupon.minPurchase) : (result.coupon.minPurchase ? parseFloat(result.coupon.minPurchase) : null)
        }
        console.log('Applying coupon (from dropdown):', couponToApply)
        setAppliedCoupon(couponToApply)
        setCouponError('')
        success('Coupon applied successfully!')
      } else {
        setCouponError('Invalid coupon code')
        setAppliedCoupon(null)
      }
    } catch (err) {
      console.error('Failed to validate coupon:', err)
      setCouponError(err.message || 'Invalid coupon code')
      setAppliedCoupon(null)
    } finally {
      setValidatingCoupon(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        couponDropdownRef.current &&
        !couponDropdownRef.current.contains(event.target) &&
        couponInputRef.current &&
        !couponInputRef.current.contains(event.target)
      ) {
        setShowCouponDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0
    return sum + (price * item.quantity)
  }, 0)
  const shipping = shippingCosts[formData.shippingMethod] || 0
  const tax = subtotal * 0.18
  
  // Calculate coupon discount properly
  let couponDiscount = 0
  if (appliedCoupon) {
    console.log('=== Calculating discount ===')
    console.log('Applied coupon:', JSON.stringify(appliedCoupon, null, 2))
    console.log('Subtotal:', subtotal, 'Shipping:', shipping, 'Tax:', tax)
    
    const discountValue = parseFloat(appliedCoupon.discount || 0)
    const couponType = appliedCoupon.type
    
    console.log(`Coupon type: ${couponType}, Discount value: ${discountValue}`)
    
    if (couponType === 'percentage') {
      // Percentage discount: calculate percentage of subtotal
      couponDiscount = (subtotal * discountValue) / 100
      console.log(`Percentage calculation: (${subtotal} * ${discountValue}) / 100 = ${couponDiscount}`)
      
      // Apply max discount cap if specified
      if (appliedCoupon.maxDiscount) {
        const maxDiscount = parseFloat(appliedCoupon.maxDiscount)
        if (couponDiscount > maxDiscount) {
          console.log(`Capping discount at max: ${maxDiscount}`)
          couponDiscount = maxDiscount
        }
      }
    } else if (couponType === 'fixed') {
      // Fixed amount discount: use the discount value directly
      couponDiscount = discountValue
      console.log(`Fixed discount: ${couponDiscount}`)
      
      // Don't allow discount to exceed subtotal
      if (couponDiscount > subtotal) {
        console.log(`Capping discount at subtotal: ${subtotal}`)
        couponDiscount = subtotal
      }
    } else if (couponType === 'free_shipping') {
      // Free shipping discount: use current shipping cost
      couponDiscount = shipping
      console.log(`Free shipping discount: ${couponDiscount}`)
    } else {
      console.warn(`Unknown coupon type: ${couponType}`)
    }
    
    console.log(`Final coupon discount: ₹${couponDiscount.toFixed(2)}`)
  } else {
    console.log('No coupon applied')
  }
  
  const total = Math.max(0, subtotal + shipping + tax - couponDiscount)
  console.log(`=== Total Calculation ===`)
  console.log(`Subtotal: ₹${subtotal.toFixed(2)}`)
  console.log(`Shipping: ₹${shipping.toFixed(2)}`)
  console.log(`Tax (18%): ₹${tax.toFixed(2)}`)
  console.log(`Coupon Discount: -₹${couponDiscount.toFixed(2)}`)
  console.log(`TOTAL: ₹${total.toFixed(2)}`)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setValidatingCoupon(true)
    setCouponError('')

    try {
      console.log('Validating coupon code:', couponCode, 'subtotal:', subtotal)
      const result = await couponsAPI.validate(couponCode, subtotal)
      console.log('Validation result:', result)
      if (result.valid && result.coupon) {
        // Use the original discount value (percentage or fixed amount), not the calculated one
        // The frontend will recalculate based on current subtotal
        const couponToApply = {
          id: result.coupon.id,
          code: result.coupon.code,
          type: result.coupon.type,
          discount: parseFloat(result.coupon.discount) || 0, // Original discount value (percentage number or fixed amount)
          maxDiscount: result.coupon.maxDiscount ? parseFloat(result.coupon.maxDiscount) : null,
          description: result.coupon.description,
          minPurchase: result.coupon.minPurchase ? parseFloat(result.coupon.minPurchase) : null
        }
        console.log('Applying coupon (manual entry):', couponToApply)
        setAppliedCoupon(couponToApply)
        setCouponError('')
        success('Coupon applied successfully!')
      } else {
        setCouponError('Invalid coupon code')
        setAppliedCoupon(null)
      }
    } catch (err) {
      console.error('Failed to validate coupon:', err)
      setCouponError(err.message || 'Invalid coupon code')
      setAppliedCoupon(null)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (cartItems.length === 0) {
      showError('Your cart is empty')
      return
    }

    if (!isAuthenticated) {
      showError('Please login to place an order')
      navigate('/dashboard', { state: { tab: 'login', redirectPath: window.location.pathname } })
      return
    }

    // Validate required fields
    if (!formData.name || !formData.mobile || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      showError('Please fill in all required shipping address fields')
      return
    }

    if (!formData.paymentMethod) {
      showError('Please select a payment method')
      return
    }

    // Calculate order total
    const subtotal = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.product?.price || item.price || 0)
      return sum + (price * item.quantity)
    }, 0)

    let shippingCost = 0
    if (formData.shippingMethod === 'standard') shippingCost = shippingCosts.standard
    else if (formData.shippingMethod === 'express') shippingCost = shippingCosts.express
    else if (subtotal < 2000) shippingCost = shippingCosts.standard

    const discount = appliedCoupon ? (subtotal * (appliedCoupon.discountPercent / 100)) : 0
    const tax = (subtotal - discount) * 0.18
    const total = subtotal - discount + shippingCost + tax

    setSubmitting(true)

    try {
      // If using saved payment method, use saved preferences
      if (useSavedPayment && selectedPaymentMethodId) {
        const savedMethod = savedPaymentMethods.find(m => (m.id || m._id) === selectedPaymentMethodId)
        if (savedMethod) {
          // For cards, process through Razorpay
          if (formData.paymentMethod === 'card' && savedMethod.razorpayPaymentId) {
            await processRazorpayPayment(total, savedMethod)
            return
          }
          // For UPI, Net Banking, Wallet - use saved preferences
          if (formData.paymentMethod === 'upi' && savedMethod.upiId) {
            setFormData(prev => ({ ...prev, upiId: savedMethod.upiId }))
          }
          if (formData.paymentMethod === 'netbanking' && savedMethod.bank) {
            setFormData(prev => ({ ...prev, netBankingBank: savedMethod.bank }))
          }
          if (formData.paymentMethod === 'wallet' && savedMethod.walletProvider) {
            setFormData(prev => ({ ...prev, walletProvider: savedMethod.walletProvider }))
          }
        }
      }

      // For new payments or non-card methods, use Razorpay checkout
      if (formData.paymentMethod === 'card') {
        // Create Razorpay order
        const orderResponse = await paymentAPI.createRazorpayOrder({
          amount: Math.round(total),
          currency: 'INR',
          receipt: `order_${Date.now()}`
        })

        if (!orderResponse.orderId) {
          throw new Error('Failed to create payment order')
        }

        // Open Razorpay checkout
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
          amount: Math.round(total * 100), // Convert to paise
          currency: 'INR',
          name: 'Arudhra Fashions',
          description: 'Order Payment',
          order_id: orderResponse.orderId,
          prefill: {
            name: formData.name,
            email: formData.email || user?.email || '',
            contact: formData.mobile || user?.mobile || ''
          },
          handler: async function(response) {
            try {
              await processOrderAfterPayment(response, total)
            } catch (err) {
              console.error('Failed to process order:', err)
              showError(err.message || 'Failed to process order')
              setSubmitting(false)
            }
          },
          modal: {
            ondismiss: function() {
              setSubmitting(false)
            }
          },
          theme: {
            color: '#7A5051'
          }
        }

        const razorpay = new window.Razorpay(options)
        razorpay.on('payment.failed', function(response) {
          console.error('Payment failed:', response.error)
          showError(response.error.description || 'Payment failed. Please try again.')
          setSubmitting(false)
        })
        razorpay.open()
      } else {
        // For UPI, Net Banking, Wallet - create order directly (they'll be processed by Razorpay)
        await processOrderWithRazorpay(total, formData.paymentMethod)
      }
    } catch (err) {
      console.error('Failed to place order:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to place order. Please try again.'
      showError(errorMessage)
      setSubmitting(false)
    }
  }

  const processRazorpayPayment = async (total, savedMethod) => {
    try {
      // Create Razorpay order
      const orderResponse = await paymentAPI.createRazorpayOrder({
        amount: Math.round(total),
        currency: 'INR',
        receipt: `order_${Date.now()}`
      })

      if (!orderResponse.orderId) {
        throw new Error('Failed to create payment order')
      }

      // For saved methods, we need to process payment
      // Note: Razorpay doesn't support direct payment with saved methods in this way
      // We'll need to open checkout but pre-fill the saved card
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'Arudhra Fashions',
        description: 'Order Payment',
        order_id: orderResponse.orderId,
        prefill: {
          name: savedMethod.cardName || formData.name,
          email: formData.email || user?.email || '',
          contact: formData.mobile || user?.mobile || ''
        },
        handler: async function(response) {
          await processOrderAfterPayment(response, total, savedMethod)
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false)
          }
        },
        theme: {
          color: '#7A5051'
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', function(response) {
        showError(response.error.description || 'Payment failed. Please try again.')
        setSubmitting(false)
      })
      razorpay.open()
    } catch (err) {
      throw err
    }
  }

  const processOrderWithRazorpay = async (total, paymentMethod) => {
    try {
      // Create Razorpay order for non-card methods
      const orderResponse = await paymentAPI.createRazorpayOrder({
        amount: Math.round(total),
        currency: 'INR',
        receipt: `order_${Date.now()}`
      })

      if (!orderResponse.orderId) {
        throw new Error('Failed to create payment order')
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'Arudhra Fashions',
        description: 'Order Payment',
        order_id: orderResponse.orderId,
        method: paymentMethod,
        prefill: {
          name: formData.name,
          email: formData.email || user?.email || '',
          contact: formData.mobile || user?.mobile || ''
        },
        ...(paymentMethod === 'upi' && formData.upiId && { prefill: { upi: formData.upiId } }),
        handler: async function(response) {
          await processOrderAfterPayment(response, total)
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false)
          }
        },
        theme: {
          color: '#7A5051'
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', function(response) {
        showError(response.error.description || 'Payment failed. Please try again.')
        setSubmitting(false)
      })
      razorpay.open()
    } catch (err) {
      throw err
    }
  }

  const processOrderAfterPayment = async (razorpayResponse, total, savedMethod = null) => {
    try {
      // Prepare order items
      const orderItems = cartItems.map(item => ({
        productId: item.product?._id || item.productId || item.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product?.price || item.price
      }))

      // Prepare payment data
      const paymentData = {
        method: formData.paymentMethod,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
        ...(savedMethod && { savedPaymentMethodId: savedMethod.id || savedMethod._id }),
        ...(formData.paymentMethod === 'card' && {
          cardNumber: savedMethod?.last4 || formData.cardNumber ? formData.cardNumber.replace(/\s/g, '').slice(-4) : null,
          cardName: savedMethod?.cardName || formData.cardName || null
        }),
        ...(formData.paymentMethod === 'upi' && {
          upiId: formData.upiId || null
        }),
        ...(formData.paymentMethod === 'netbanking' && {
          bank: formData.netBankingBank || null
        }),
        ...(formData.paymentMethod === 'wallet' && {
          walletProvider: formData.walletProvider || null
        })
      }

      const orderData = {
        shippingAddress: {
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email || null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        payment: paymentData,
        shippingMethod: formData.shippingMethod || 'free',
        couponCode: appliedCoupon?.code || null,
        discount: appliedCoupon ? (orderItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0) * (appliedCoupon.discountPercent / 100)) : 0
      }

      // Create order via API
      const order = await ordersAPI.create(orderData)
      
      // Clear cart
      try {
        await cartAPI.clear()
      } catch (err) {
        console.error('Failed to clear cart:', err)
      }
      
      success('Order placed successfully!')
      navigate(`/order/${order._id || order.id || order.orderId}`)
    } catch (err) {
      console.error('Failed to create order:', err)
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="loading-spinner">
            <p>Loading checkout...</p>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add items to your cart before checkout</p>
            <Link to="/products/women" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          {cartItems.length > 0 && (
            <p className="checkout-item-count">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your order</p>
          )}
        </div>

        <div className={`checkout-layout ${step === 3 ? 'no-sidebar' : ''}`}>
          <div className="checkout-form">
            {step === 1 && (
              <div className="checkout-step">
                <div className="shipping-header">
                  <h2>Shipping Information</h2>
                  <p className="shipping-subtitle">Enter your delivery details</p>
                  {!isAuthenticated && (
                    <p className="shipping-login-hint">
                      Have an account? <Link to="/dashboard">Log in</Link> to save your information
                    </p>
                  )}
                </div>

                {/* Contact Information Section */}
                <div className="shipping-section">
                  <div className="shipping-section-header">
                    <User size={20} />
                    <span>Contact Details</span>
                  </div>
                  <div className="form-group">
                    <label>Mobile Number <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-icon" />
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        required
                        placeholder="9876543210"
                        pattern="[0-9]{10}"
                        maxLength="10"
                        disabled={isAuthenticated}
                        className={isAuthenticated ? 'disabled-input' : ''}
                      />
                    </div>
                    {isAuthenticated && <small className="input-hint">Mobile number cannot be changed</small>}
                  </div>

                  <div className="form-group">
                    <label>Full Name <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <User size={18} className="input-icon" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Address <span className="optional">(Optional)</span></label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                      />
                    </div>
                    <small className="input-hint">For order updates and tracking</small>
                  </div>
                </div>

                {/* Delivery Address Section */}
                <div className="shipping-section">
                  <div className="shipping-section-header">
                    <MapPin size={20} />
                    <span>Delivery Address</span>
                  </div>

                  {/* Saved Addresses Selection */}
                  {isAuthenticated && savedAddresses.length > 0 && !showAddAddress && (
                    <div className="saved-addresses-section">
                      <div className="saved-addresses-header">
                        <span>Select a saved address</span>
                        <button
                          type="button"
                          className="btn-link-small"
                          onClick={handleUseNewAddress}
                        >
                          <Plus size={16} />
                          Use New Address
                        </button>
                      </div>
                      <div className="saved-addresses-grid">
                        {savedAddresses.map(address => (
                          <div
                            key={address._id || address.id}
                            className={`saved-address-card ${selectedAddressId === (address._id || address.id) ? 'selected' : ''}`}
                            onClick={() => handleSelectAddress(address)}
                          >
                            <div className="address-card-header">
                              <div className="address-type-badge">
                                {address.type || 'Home'}
                              </div>
                              {address.isDefault && (
                                <span className="default-badge-small">Default</span>
                              )}
                              {selectedAddressId === (address._id || address.id) && (
                                <Check size={18} className="selected-check" />
                              )}
                            </div>
                            <div className="address-card-body">
                              <p className="address-name">{address.name}</p>
                              <p className="address-line">{address.address}</p>
                              <p className="address-city">
                                {address.city}, {address.state} {address.zipCode || address.zip}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual Address Entry */}
                  {(showAddAddress || !isAuthenticated || savedAddresses.length === 0) && (
                    <div className="manual-address-form">
                      {isAuthenticated && savedAddresses.length > 0 && (
                        <div className="form-section-header">
                          <span>Enter new address</span>
                          {savedAddresses.length > 0 && (
                            <button
                              type="button"
                              className="btn-link-small"
                              onClick={() => {
                                setShowAddAddress(false)
                                const defaultAddress = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0]
                                if (defaultAddress) {
                                  handleSelectAddress(defaultAddress)
                                }
                              }}
                            >
                              Use Saved Address
                            </button>
                          )}
                        </div>
                      )}
                      <div className="form-group">
                        <label>Street Address <span className="required">*</span></label>
                        <div className="input-with-icon">
                          <MapPin size={18} className="input-icon" />
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            placeholder="House/Flat No., Building Name, Street"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>City <span className="required">*</span></label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            placeholder="City"
                          />
                        </div>
                        <div className="form-group">
                          <label>State <span className="required">*</span></label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            required
                            placeholder="State"
                          />
                        </div>
                        <div className="form-group">
                          <label>ZIP Code <span className="required">*</span></label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            required
                            placeholder="6-digit code"
                            pattern="[0-9]{6}"
                            maxLength="6"
                          />
                          {formData.zipCode && formData.zipCode.length !== 6 && (
                            <small className="error-text">ZIP code must be 6 digits</small>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="checkout-actions">
                  <button onClick={handleNext} className="btn btn-primary btn-large">
                    Continue to Payment
                    <ChevronDown size={18} style={{ transform: 'rotate(-90deg)', marginLeft: '0.5rem' }} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-step">
                <div className="payment-header">
                  <h2>Payment Information</h2>
                  <p className="payment-subtitle">Choose your preferred payment method</p>
                </div>
                
                <div className="form-group">
                  <label className="payment-method-label">Payment Method *</label>
                  <div className="payment-options">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                      />
                      <div className="payment-option-content">
                        <CreditCard size={24} />
                        <div className="payment-option-text">
                          <span className="payment-option-title">Credit/Debit Card</span>
                          <span className="payment-option-desc">Visa, Mastercard, RuPay</span>
                        </div>
                      </div>
                      <CheckCircle2 className="payment-check-icon" size={20} />
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="upi"
                        checked={formData.paymentMethod === 'upi'}
                        onChange={handleChange}
                      />
                      <div className="payment-option-content">
                        <Smartphone size={24} />
                        <div className="payment-option-text">
                          <span className="payment-option-title">UPI</span>
                          <span className="payment-option-desc">Google Pay, PhonePe, Paytm</span>
                        </div>
                      </div>
                      <CheckCircle2 className="payment-check-icon" size={20} />
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="netbanking"
                        checked={formData.paymentMethod === 'netbanking'}
                        onChange={handleChange}
                      />
                      <div className="payment-option-content">
                        <Building2 size={24} />
                        <div className="payment-option-text">
                          <span className="payment-option-title">Net Banking</span>
                          <span className="payment-option-desc">All major banks</span>
                        </div>
                      </div>
                      <CheckCircle2 className="payment-check-icon" size={20} />
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="wallet"
                        checked={formData.paymentMethod === 'wallet'}
                        onChange={handleChange}
                      />
                      <div className="payment-option-content">
                        <Wallet size={24} />
                        <div className="payment-option-text">
                          <span className="payment-option-title">Wallets</span>
                          <span className="payment-option-desc">Paytm, PhonePe, Amazon Pay</span>
                        </div>
                      </div>
                      <CheckCircle2 className="payment-check-icon" size={20} />
                    </label>
                  </div>
                </div>

                {formData.paymentMethod === 'card' && (
                  <div className="payment-details-card">
                    {savedPaymentMethods.length > 0 && (
                      <div className="saved-payment-methods-section">
                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={useSavedPayment}
                              onChange={(e) => {
                                setUseSavedPayment(e.target.checked)
                                if (!e.target.checked) {
                                  setSelectedPaymentMethodId(null)
                                } else if (savedPaymentMethods.length > 0) {
                                  setSelectedPaymentMethodId(savedPaymentMethods[0].id || savedPaymentMethods[0]._id)
                                }
                              }}
                            />
                            Use saved payment method
                          </label>
                        </div>
                        {useSavedPayment && (
                          <div className="saved-payment-methods-grid">
                            {savedPaymentMethods.map(method => (
                              <div
                                key={method.id || method._id}
                                className={`saved-payment-card ${selectedPaymentMethodId === (method.id || method._id) ? 'selected' : ''}`}
                                onClick={() => setSelectedPaymentMethodId(method.id || method._id)}
                              >
                                <CreditCard size={20} />
                                <div className="payment-card-info">
                                  <p>•••• •••• •••• {method.last4 || '****'}</p>
                                  <span>{method.network || 'Card'} • Expires {method.expMonth || '**'}/{method.expYear || '**'}</span>
                                  {method.cardName && <span className="cardholder-name">{method.cardName}</span>}
                                </div>
                                {selectedPaymentMethodId === (method.id || method._id) && (
                                  <CheckCircle2 className="selected-check" size={20} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {(!useSavedPayment || savedPaymentMethods.length === 0) && (
                      <>
                        <div className="payment-details-header">
                          <Shield size={20} />
                          <span>Secure Payment via Razorpay</span>
                        </div>
                        <div className="razorpay-info-checkout">
                          <p>Your card details will be securely processed by Razorpay. We never store your full card information.</p>
                        </div>
                        <div className="form-group">
                          <label>Cardholder Name *</label>
                          <input
                            type="text"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleChange}
                            placeholder="Name on card"
                            required={!useSavedPayment}
                          />
                        </div>
                        <p className="payment-note">Card details will be entered securely in Razorpay's payment gateway</p>
                      </>
                    )}
                  </div>
                )}

                {formData.paymentMethod === 'upi' && (
                  <div className="payment-details-card">
                    {savedPaymentMethods.filter(m => (m.method || m.type) === 'upi').length > 0 && (
                      <div className="saved-payment-methods-section">
                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={useSavedPayment && formData.paymentMethod === 'upi'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const savedUpi = savedPaymentMethods.find(m => (m.method || m.type) === 'upi')
                                  if (savedUpi) {
                                    setUseSavedPayment(true)
                                    setSelectedPaymentMethodId(savedUpi.id || savedUpi._id)
                                    setFormData(prev => ({ ...prev, upiId: savedUpi.upiId || '' }))
                                  }
                                } else {
                                  setUseSavedPayment(false)
                                  setSelectedPaymentMethodId(null)
                                  setFormData(prev => ({ ...prev, upiId: '' }))
                                }
                              }}
                            />
                            Use saved UPI ID
                          </label>
                        </div>
                        {useSavedPayment && savedPaymentMethods.filter(m => (m.method || m.type) === 'upi').map(method => (
                          <div
                            key={method.id || method._id}
                            className={`saved-payment-card ${selectedPaymentMethodId === (method.id || method._id) ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedPaymentMethodId(method.id || method._id)
                              setFormData(prev => ({ ...prev, upiId: method.upiId || '' }))
                            }}
                          >
                            <Smartphone size={20} />
                            <div className="payment-card-info">
                              <p>UPI</p>
                              <span>{method.upiId || 'UPI Payment Method'}</span>
                            </div>
                            {selectedPaymentMethodId === (method.id || method._id) && (
                              <CheckCircle2 className="selected-check" size={20} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {(!useSavedPayment || savedPaymentMethods.filter(m => (m.method || m.type) === 'upi').length === 0) && (
                      <>
                        <div className="payment-details-header">
                          <Smartphone size={20} />
                          <span>UPI Details</span>
                        </div>
                        <div className="form-group">
                          <label>UPI ID *</label>
                          <div className="input-with-icon">
                            <Smartphone size={18} className="input-icon" />
                            <input
                              type="text"
                              name="upiId"
                              value={formData.upiId}
                              onChange={handleChange}
                              placeholder="yourname@upi"
                              pattern="[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}"
                            />
                          </div>
                          <small className="input-hint">Enter your UPI ID (e.g., yourname@paytm, yourname@ybl)</small>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {formData.paymentMethod === 'netbanking' && (
                  <div className="payment-details-card">
                    {savedPaymentMethods.filter(m => (m.method || m.type) === 'netbanking').length > 0 && (
                      <div className="saved-payment-methods-section">
                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={useSavedPayment && formData.paymentMethod === 'netbanking'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const savedBank = savedPaymentMethods.find(m => (m.method || m.type) === 'netbanking')
                                  if (savedBank) {
                                    setUseSavedPayment(true)
                                    setSelectedPaymentMethodId(savedBank.id || savedBank._id)
                                    setFormData(prev => ({ ...prev, netBankingBank: savedBank.bank || '' }))
                                  }
                                } else {
                                  setUseSavedPayment(false)
                                  setSelectedPaymentMethodId(null)
                                  setFormData(prev => ({ ...prev, netBankingBank: '' }))
                                }
                              }}
                            />
                            Use saved bank preference
                          </label>
                        </div>
                        {useSavedPayment && savedPaymentMethods.filter(m => (m.method || m.type) === 'netbanking').map(method => (
                          <div
                            key={method.id || method._id}
                            className={`saved-payment-card ${selectedPaymentMethodId === (method.id || method._id) ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedPaymentMethodId(method.id || method._id)
                              setFormData(prev => ({ ...prev, netBankingBank: method.bank || '' }))
                            }}
                          >
                            <Building2 size={20} />
                            <div className="payment-card-info">
                              <p>Net Banking</p>
                              <span>{method.bank || 'Bank Account'}</span>
                            </div>
                            {selectedPaymentMethodId === (method.id || method._id) && (
                              <CheckCircle2 className="selected-check" size={20} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {(!useSavedPayment || savedPaymentMethods.filter(m => (m.method || m.type) === 'netbanking').length === 0) && (
                      <>
                        <div className="payment-details-header">
                          <Building2 size={20} />
                          <span>Net Banking</span>
                        </div>
                        <div className="form-group">
                          <label>Select Bank *</label>
                          <div className="input-with-icon">
                            <Building2 size={18} className="input-icon" />
                            <select
                              name="netBankingBank"
                              value={formData.netBankingBank}
                              onChange={handleChange}
                              required
                              className="select-input"
                            >
                              <option value="">Select your bank</option>
                              <option value="HDFC">HDFC Bank</option>
                              <option value="ICICI">ICICI Bank</option>
                              <option value="SBI">State Bank of India</option>
                              <option value="AXIS">Axis Bank</option>
                              <option value="KOTAK">Kotak Mahindra Bank</option>
                              <option value="PNB">Punjab National Bank</option>
                              <option value="BOI">Bank of India</option>
                              <option value="BOB">Bank of Baroda</option>
                              <option value="CANARA">Canara Bank</option>
                              <option value="UNION">Union Bank of India</option>
                              <option value="IDBI">IDBI Bank</option>
                              <option value="YES">Yes Bank</option>
                              <option value="INDUS">IndusInd Bank</option>
                              <option value="FEDERAL">Federal Bank</option>
                              <option value="OTHER">Other Bank</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {formData.paymentMethod === 'wallet' && (
                  <div className="payment-details-card">
                    {savedPaymentMethods.filter(m => (m.method || m.type) === 'wallet').length > 0 && (
                      <div className="saved-payment-methods-section">
                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={useSavedPayment && formData.paymentMethod === 'wallet'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const savedWallet = savedPaymentMethods.find(m => (m.method || m.type) === 'wallet')
                                  if (savedWallet) {
                                    setUseSavedPayment(true)
                                    setSelectedPaymentMethodId(savedWallet.id || savedWallet._id)
                                    setFormData(prev => ({ ...prev, walletProvider: savedWallet.walletProvider || '' }))
                                  }
                                } else {
                                  setUseSavedPayment(false)
                                  setSelectedPaymentMethodId(null)
                                  setFormData(prev => ({ ...prev, walletProvider: '' }))
                                }
                              }}
                            />
                            Use saved wallet preference
                          </label>
                        </div>
                        {useSavedPayment && savedPaymentMethods.filter(m => (m.method || m.type) === 'wallet').map(method => (
                          <div
                            key={method.id || method._id}
                            className={`saved-payment-card ${selectedPaymentMethodId === (method.id || method._id) ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedPaymentMethodId(method.id || method._id)
                              setFormData(prev => ({ ...prev, walletProvider: method.walletProvider || '' }))
                            }}
                          >
                            <Wallet size={20} />
                            <div className="payment-card-info">
                              <p>Digital Wallet</p>
                              <span>{method.walletProvider || 'Wallet'}</span>
                            </div>
                            {selectedPaymentMethodId === (method.id || method._id) && (
                              <CheckCircle2 className="selected-check" size={20} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {(!useSavedPayment || savedPaymentMethods.filter(m => (m.method || m.type) === 'wallet').length === 0) && (
                      <>
                        <div className="payment-details-header">
                          <Wallet size={20} />
                          <span>Digital Wallet</span>
                        </div>
                        <div className="form-group">
                          <label>Select Wallet *</label>
                          <div className="input-with-icon">
                            <Wallet size={18} className="input-icon" />
                            <select
                              name="walletProvider"
                              value={formData.walletProvider}
                              onChange={handleChange}
                              required
                              className="select-input"
                            >
                              <option value="">Select wallet</option>
                              <option value="paytm">Paytm</option>
                              <option value="phonepe">PhonePe</option>
                              <option value="amazonpay">Amazon Pay</option>
                              <option value="freecharge">Freecharge</option>
                              <option value="mobikwik">MobiKwik</option>
                              <option value="jiomoney">JioMoney</option>
                              <option value="airtelmoney">Airtel Money</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="security-badge">
                  <div className="security-badge-content">
                    <Shield size={20} />
                    <div className="security-text">
                      <span className="security-title">Secure Payment</span>
                      <span className="security-desc">Your payment information is encrypted and secure</span>
                    </div>
                  </div>
                  <div className="security-badges">
                    <span className="security-tag">SSL Secured</span>
                    <span className="security-tag">PCI Compliant</span>
                  </div>
                </div>

                <div className="checkout-actions">
                  <button onClick={() => setStep(1)} className="btn btn-outline">
                    Back
                  </button>
                  <button onClick={handleNext} className="btn btn-primary btn-large">
                    Continue to Review
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="checkout-step">
                <div className="review-header">
                  <div className="review-header-content">
                    <ShoppingBag size={28} className="review-header-icon" />
                    <div>
                      <h2>Review Your Order</h2>
                      <p className="review-subtitle">Please review your order details before placing</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address Section */}
                <div className="review-section">
                  <div className="review-section-header">
                    <MapPin size={20} />
                    <span>Delivery Address</span>
                  </div>
                  <div className="shipping-address-card">
                    <div className="address-details">
                      <p className="address-name">{formData.name}</p>
                      <p className="address-line">{formData.address}</p>
                      <p className="address-city">
                        {formData.city}, {formData.state} - {formData.zipCode}
                      </p>
                      <div className="address-contact">
                        <Phone size={14} />
                        <span>{formData.mobile}</span>
                        {formData.email && (
                          <>
                            <Mail size={14} />
                            <span>{formData.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items Section */}
                <div className="review-section">
                  <div className="review-section-header">
                    <Package size={20} />
                    <span>Order Items ({cartItems.length})</span>
                  </div>
                  <div className="order-items-enhanced">
                    {cartItems.map(item => {
                      const product = item.product || item
                      const productName = product.name || item.name
                      const productImage = product.images?.[0] || product.image || item.image
                      const productPrice = product.price || item.price || 0
                      const itemId = item._id || item.id
                      
                      return (
                        <div key={itemId} className="order-item-enhanced">
                          <div className="order-item-image-wrapper">
                            <img src={productImage} alt={productName} />
                          </div>
                          <div className="order-item-content">
                            <h4 className="order-item-title">{productName}</h4>
                            <div className="order-item-meta">
                              {item.size && (
                                <span className="order-item-badge">
                                  <span className="badge-label">Size:</span> {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="order-item-badge">
                                  <span className="badge-label">Color:</span> {item.color}
                                </span>
                              )}
                              <span className="order-item-badge">
                                <span className="badge-label">Qty:</span> {item.quantity}
                              </span>
                            </div>
                            <div className="order-item-price-info">
                              <span className="unit-price">₹{productPrice.toFixed(2)} × {item.quantity}</span>
                            </div>
                          </div>
                          <div className="order-item-total">
                            <span className="order-item-price">₹{(productPrice * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Enhanced Coupon Section */}
                <div className="coupon-section-enhanced">
                  {!appliedCoupon ? (
                    <div className="coupon-card">
                      <div className="coupon-card-header">
                        <Tag size={20} />
                        <span>Have a coupon code?</span>
                      </div>
                      <div className="coupon-input-wrapper">
                        <div className="coupon-input-group-enhanced">
                          <input
                            ref={couponInputRef}
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            onFocus={handleCouponInputFocus}
                            className={couponError ? 'error' : ''}
                          />
                          <button
                            type="button"
                            className="coupon-dropdown-toggle-enhanced"
                            onClick={() => {
                              const newState = !showCouponDropdown
                              setShowCouponDropdown(newState)
                              if (newState && (availableCoupons.length === 0 || !loadingCoupons)) {
                                loadAvailableCoupons()
                              }
                            }}
                          >
                            <ChevronDown size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={validatingCoupon}
                            className="btn-coupon-apply"
                          >
                            {validatingCoupon ? 'Applying...' : 'Apply'}
                          </button>
                        </div>
                        {showCouponDropdown && (
                          <div ref={couponDropdownRef} className="coupon-dropdown-enhanced">
                            <div className="coupon-dropdown-header">
                              <h4>Available Coupons</h4>
                              <button
                                type="button"
                                className="close-dropdown"
                                onClick={() => setShowCouponDropdown(false)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                            {loadingCoupons ? (
                              <div className="coupon-loading">Loading coupons...</div>
                            ) : availableCoupons.length === 0 ? (
                              <div className="coupon-empty">No coupons available</div>
                            ) : (
                              <div className="coupon-list">
                                {availableCoupons.map((coupon) => (
                                  <div
                                    key={coupon.id}
                                    className="coupon-item"
                                    onClick={() => handleSelectCoupon(coupon)}
                                  >
                                    <div className="coupon-item-header">
                                      <strong>{coupon.code}</strong>
                                      <span className="coupon-discount">
                                        {coupon.type === 'percentage'
                                          ? `${coupon.discount}% OFF`
                                          : coupon.type === 'fixed'
                                          ? `₹${coupon.discount} OFF`
                                          : 'Free Shipping'}
                                      </span>
                                    </div>
                                    {coupon.description && (
                                      <p className="coupon-description">{coupon.description}</p>
                                    )}
                                    {coupon.minPurchase && (
                                      <p className="coupon-min-purchase">
                                        Min. purchase: ₹{coupon.minPurchase}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {couponError && <p className="error-message">{couponError}</p>}
                    </div>
                  ) : (
                    <div className="coupon-applied-enhanced">
                      <div className="coupon-applied-content">
                        <CheckCircle size={20} className="coupon-check-icon" />
                        <div className="coupon-applied-info">
                          <span className="coupon-applied-label">Coupon Applied</span>
                          <span className="coupon-applied-code">{appliedCoupon.code}</span>
                        </div>
                        <span className="coupon-applied-discount">-₹{couponDiscount.toFixed(2)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="btn-coupon-remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="order-summary-enhanced">
                  <div className="summary-row-enhanced">
                    <span className="summary-label">Subtotal</span>
                    <span className="summary-value">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="summary-row-enhanced discount-row">
                      <span className="summary-label">
                        <Tag size={16} />
                        Coupon Discount
                      </span>
                      <span className="summary-value discount-value">-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="summary-row-enhanced">
                    <span className="summary-label">Shipping</span>
                    <span className="summary-value">{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="summary-row-enhanced">
                    <span className="summary-label">GST (18%)</span>
                    <span className="summary-value">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="summary-divider-enhanced"></div>
                  <div className="summary-total-enhanced">
                    <div className="total-label-wrapper">
                      <IndianRupee size={24} />
                      <span className="total-label">Total Amount to Pay</span>
                    </div>
                    <span className="total-amount">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="checkout-actions">
                  <button type="button" onClick={() => setStep(2)} className="btn btn-outline">
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-large"
                    disabled={submitting}
                  >
                    {submitting ? 'Placing Order...' : 'Place Order'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {step !== 3 && (
          <div className="checkout-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="order-items-mini">
                {cartItems.map(item => {
                  const product = item.product || item
                  const productName = product.name || item.name
                  const productImage = product.images?.[0] || product.image || item.image
                  const productPrice = product.price || item.price || 0
                  const itemId = item._id || item.id
                  
                  return (
                    <div key={itemId} className="order-item-mini">
                      <img src={productImage} alt={productName} />
                      <div>
                        <p>{productName}</p>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <span>₹{(productPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="summary-divider"></div>
              {/* Enhanced Coupon Section in Sidebar */}
              <div className="coupon-section-enhanced">
                {!appliedCoupon ? (
                  <div className="coupon-card">
                    <div className="coupon-card-header">
                      <Tag size={18} />
                      <span>Have a coupon?</span>
                    </div>
                    <div className="coupon-input-wrapper">
                      <div className="coupon-input-group-enhanced">
                        <input
                          ref={couponInputRef}
                          type="text"
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onFocus={handleCouponInputFocus}
                          className={couponError ? 'error' : ''}
                        />
                        <button
                          type="button"
                          className="coupon-dropdown-toggle-enhanced"
                          onClick={() => {
                            const newState = !showCouponDropdown
                            setShowCouponDropdown(newState)
                            if (newState && (availableCoupons.length === 0 || !loadingCoupons)) {
                              loadAvailableCoupons()
                            }
                          }}
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={validatingCoupon}
                          className="btn-coupon-apply"
                        >
                          {validatingCoupon ? '...' : 'Apply'}
                        </button>
                      </div>
                      {showCouponDropdown && (
                        <div ref={couponDropdownRef} className="coupon-dropdown-enhanced">
                          <div className="coupon-dropdown-header">
                            <h4>Available Coupons</h4>
                            <button
                              type="button"
                              className="close-dropdown"
                              onClick={() => setShowCouponDropdown(false)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                          {loadingCoupons ? (
                            <div className="coupon-loading">Loading coupons...</div>
                          ) : availableCoupons.length === 0 ? (
                            <div className="coupon-empty">No coupons available</div>
                          ) : (
                            <div className="coupon-list">
                              {availableCoupons.map((coupon) => (
                                <div
                                  key={coupon.id}
                                  className="coupon-item"
                                  onClick={() => handleSelectCoupon(coupon)}
                                >
                                  <div className="coupon-item-header">
                                    <strong>{coupon.code}</strong>
                                    <span className="coupon-discount">
                                      {coupon.type === 'percentage'
                                        ? `${coupon.discount}% OFF`
                                        : coupon.type === 'fixed'
                                        ? `₹${coupon.discount} OFF`
                                        : 'Free Shipping'}
                                    </span>
                                  </div>
                                  {coupon.description && (
                                    <p className="coupon-description">{coupon.description}</p>
                                  )}
                                  {coupon.minPurchase && (
                                    <p className="coupon-min-purchase">
                                      Min. purchase: ₹{coupon.minPurchase}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {couponError && <p className="error-message-small">{couponError}</p>}
                  </div>
                ) : (
                  <div className="coupon-applied-enhanced">
                    <div className="coupon-applied-content">
                      <CheckCircle size={18} className="coupon-check-icon" />
                      <div className="coupon-applied-info">
                        <span className="coupon-applied-label">Coupon Applied</span>
                        <span className="coupon-applied-code">{appliedCoupon.code}</span>
                      </div>
                      <span className="coupon-applied-discount">-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="btn-coupon-remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="summary-row-enhanced">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">₹{subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="summary-row-enhanced discount-row">
                  <span className="summary-label">
                    <Tag size={14} />
                    Discount
                  </span>
                  <span className="summary-value discount-value">-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row-enhanced">
                <span className="summary-label">Shipping</span>
                <span className="summary-value">{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-row-enhanced">
                <span className="summary-label">GST (18%)</span>
                <span className="summary-value">₹{tax.toFixed(2)}</span>
              </div>
              <div className="summary-divider-enhanced"></div>
              <div className="summary-total-enhanced">
                <div className="total-label-wrapper">
                  <IndianRupee size={20} />
                  <span className="total-label">Total Amount</span>
                </div>
                <span className="total-amount">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Checkout


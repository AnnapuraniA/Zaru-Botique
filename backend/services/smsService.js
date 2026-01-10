/**
 * SMS Service for sending SMS via Twilio
 * Configure using environment variables:
 * - TWILIO_ACCOUNT_SID: Your Twilio Account SID
 * - TWILIO_AUTH_TOKEN: Your Twilio Auth Token
 * - TWILIO_PHONE_NUMBER: Your Twilio phone number (e.g., +1234567890)
 */

let twilioClient = null
let twilioModule = null

// Initialize Twilio client if credentials are available
const initializeTwilio = async () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio SMS service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.')
    return null
  }

  try {
    // Dynamic import of twilio (only if configured)
    // Twilio uses CommonJS, so we need to handle it properly
    if (!twilioModule) {
      twilioModule = await import('twilio')
    }
    // Twilio exports as default in ES modules
    const Twilio = twilioModule.default || twilioModule.Twilio || twilioModule
    twilioClient = Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
    return twilioClient
  } catch (error) {
    console.error('Error initializing Twilio:', error)
    return null
  }
}

/**
 * Format phone number for Twilio (adds + prefix if needed)
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} - Formatted phone number
 */
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '')
  
  // If it starts with country code, add +, otherwise assume +91 (India)
  if (cleaned.length === 10) {
    return `+91${cleaned}` // India default
  } else if (cleaned.length > 10) {
    return `+${cleaned}`
  }
  
  return phoneNumber
}

/**
 * Send SMS
 * @param {Object} options - SMS options
 * @param {string} options.to - Recipient phone number
 * @param {string} options.message - SMS message body
 * @returns {Promise<Object>} - Result object with success status
 */
export const sendSMS = async ({ to, message }) => {
  try {
    // Format phone number
    const formattedTo = formatPhoneNumber(to)
    if (!formattedTo) {
      return {
        success: false,
        message: 'Invalid phone number'
      }
    }

    // Initialize Twilio if not already initialized
    if (!twilioClient && process.env.TWILIO_ACCOUNT_SID) {
      await initializeTwilio()
    }

    // If Twilio is not configured, log and return mock success
    if (!twilioClient) {
      console.log(`[SMS Service - Mock] Would send SMS to: ${formattedTo}`)
      console.log(`[SMS Service - Mock] Message: ${message}`)
      return {
        success: true,
        message: 'SMS service not configured (mock mode)',
        sid: 'mock-' + Date.now()
      }
    }

    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    const result = await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: formattedTo
    })

    console.log(`SMS sent successfully to ${formattedTo}:`, result.sid)
    return {
      success: true,
      message: 'SMS sent successfully',
      sid: result.sid
    }
  } catch (error) {
    console.error('SMS sending error:', error)
    return {
      success: false,
      message: error.message || 'Failed to send SMS',
      error: error.toString()
    }
  }
}

/**
 * Send invoice SMS with download link
 * @param {string} mobile - User mobile number
 * @param {string} orderId - Order ID
 * @param {string} invoiceUrl - Invoice download URL
 * @returns {Promise<Object>} - Result object
 */
export const sendInvoiceSMS = async (mobile, orderId, invoiceUrl) => {
  const message = `Your invoice for order ${orderId} is ready. Download: ${invoiceUrl}`
  return await sendSMS({ to: mobile, message })
}

/**
 * Send order confirmation SMS
 * @param {string} mobile - User mobile number
 * @param {string} orderId - Order ID
 * @param {number} total - Order total
 * @returns {Promise<Object>} - Result object
 */
export const sendOrderConfirmationSMS = async (mobile, orderId, total) => {
  const message = `Order confirmed! Order ID: ${orderId}, Total: ₹${parseFloat(total || 0).toFixed(2)}. Thank you for shopping with Arudhra Fashions!`
  return await sendSMS({ to: mobile, message })
}

/**
 * Send password reset SMS with OTP
 * @param {string} mobile - User mobile number
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} - Result object
 */
export const sendPasswordResetSMS = async (mobile, otp) => {
  const message = `Your password reset OTP for Arudhra Fashions is: ${otp}. Valid for 10 minutes. Do not share this code.`
  return await sendSMS({ to: mobile, message })
}

export default {
  sendSMS,
  sendInvoiceSMS,
  sendOrderConfirmationSMS,
  sendPasswordResetSMS
}

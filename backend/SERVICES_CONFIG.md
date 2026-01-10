# Email and SMS Services Configuration Guide

This document explains how to configure email and SMS services for the Arudhra Fashions backend.

## Overview

The backend includes basic implementations for:
- **Email Service**: Using Nodemailer (supports any SMTP provider)
- **SMS Service**: Using Twilio

Both services are designed to work in "mock mode" when not configured, allowing the application to function without credentials while logging what would be sent.

## Email Service Configuration

### Environment Variables

Add the following variables to your `.env` file:

```env
# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com          # SMTP server host
EMAIL_PORT=587                      # SMTP port (587 for TLS, 465 for SSL)
EMAIL_USER=your-email@gmail.com     # Your email address
EMAIL_PASS=your-app-password        # Email password or app-specific password
EMAIL_FROM=noreply@arudhraboutique.com  # From email address (optional, defaults to EMAIL_USER)
```

### Gmail Setup

1. Enable 2-Step Verification on your Google Account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `EMAIL_PASS`

### Other Email Providers

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

**Outlook/Office365:**
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

**Custom SMTP:**
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASS=your-password
```

### Features

The email service supports:
- ✅ Sending plain text and HTML emails
- ✅ Sending emails with PDF attachments (invoices)
- ✅ Order confirmation emails
- ✅ Password reset emails
- ✅ Custom email templates

## SMS Service Configuration (Twilio)

### Environment Variables

Add the following variables to your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number (E.164 format)
```

### Twilio Setup

1. Sign up for a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token from the Twilio Console
3. Get a phone number from Twilio (or use your existing one)
4. Add the credentials to your `.env` file

### Phone Number Format

The service automatically formats phone numbers:
- 10-digit numbers are assumed to be Indian (+91)
- Numbers with country code are preserved
- Format: `+[country code][number]` (E.164 format)

Example: `9876543210` → `+919876543210`

### Features

The SMS service supports:
- ✅ Sending SMS messages
- ✅ Invoice SMS with download links
- ✅ Order confirmation SMS
- ✅ Password reset OTP via SMS

## Mock Mode

When services are not configured:
- ✅ Application continues to function normally
- ✅ All email/SMS operations log to console (development)
- ✅ API responses indicate mock mode
- ✅ No errors are thrown

This allows development and testing without requiring actual service credentials.

## Usage Examples

### Sending an Email

```javascript
import { sendEmail } from './services/emailService.js'

const result = await sendEmail({
  to: 'customer@example.com',
  subject: 'Order Confirmation',
  html: '<h1>Thank you for your order!</h1>'
})
```

### Sending an Email with PDF

```javascript
import { sendEmailWithPDF } from './services/emailService.js'

const result = await sendEmailWithPDF({
  to: 'customer@example.com',
  subject: 'Your Invoice',
  html: '<p>Please find your invoice attached.</p>',
  pdfPath: '/uploads/invoices/invoice-123.pdf',
  pdfName: 'invoice.pdf'
})
```

### Sending an SMS

```javascript
import { sendSMS } from './services/smsService.js'

const result = await sendSMS({
  to: '9876543210',
  message: 'Your order has been confirmed!'
})
```

## Integration Points

The services are integrated into:

1. **Order Creation** (`/api/orders`)
   - Sends order confirmation email/SMS when order is created

2. **Invoice Sending** (`/api/orders/:id/send-invoice`)
   - Sends invoice PDF via email
   - Sends invoice download link via SMS

3. **Password Reset** (`/api/auth/forgot-password`)
   - Sends password reset email with link
   - Sends password reset OTP via SMS

4. **Admin Invoice Sending** (`/api/admin/orders/:id/send-invoice`)
   - Same as customer invoice sending, accessible to admins

## Testing

### Test Email Service

1. Configure email credentials in `.env`
2. Create a test order or trigger password reset
3. Check your email inbox

### Test SMS Service

1. Configure Twilio credentials in `.env`
2. Create a test order or trigger password reset
3. Check the phone number for SMS

### Mock Mode Testing

1. Don't configure any credentials
2. Check console logs for mock messages
3. API responses will indicate mock mode

## Troubleshooting

### Email Not Sending

- Check SMTP credentials are correct
- Verify firewall/network allows SMTP connections
- Check spam folder
- For Gmail, ensure App Password is used (not regular password)
- Check email provider's sending limits

### SMS Not Sending

- Verify Twilio credentials are correct
- Check Twilio account balance
- Verify phone number format
- Check Twilio console for error messages
- Ensure phone number is verified (for trial accounts)

### Service Not Working

- Check environment variables are loaded correctly
- Restart server after adding environment variables
- Check console logs for error messages
- Verify dependencies are installed: `npm install`

## Security Notes

- ⚠️ Never commit `.env` file to version control
- ⚠️ Use app-specific passwords for email (not main password)
- ⚠️ Keep Twilio credentials secure
- ⚠️ Use environment variables for all sensitive data
- ⚠️ In production, use proper email/SMS providers with good security practices

## Next Steps

1. Choose your email provider (Gmail, SendGrid, etc.)
2. Sign up for Twilio account
3. Add credentials to `.env` file
4. Test the services
5. Monitor usage and costs

## Support

For issues or questions:
- Check service provider documentation
- Review console logs for error messages
- Verify environment variables are set correctly

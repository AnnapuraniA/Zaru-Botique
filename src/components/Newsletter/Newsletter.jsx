import { useState } from 'react'
import { Mail, X } from 'lucide-react'
import { useToast } from '../Toast/ToastContainer'

function Newsletter({ onClose }) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { success, error } = useToast()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) {
      error('Please enter your email address')
      return
    }

    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      success('Successfully subscribed to our newsletter!')
      setEmail('')
      if (onClose) onClose()
    }, 1000)
  }

  return (
    <div className="newsletter-modal">
      <div className="newsletter-content">
        {onClose && (
          <button className="newsletter-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        )}
        <div className="newsletter-icon">
          <Mail size={48} />
        </div>
        <h2>Subscribe to Our Newsletter</h2>
        <p>Get the latest fashion trends, exclusive offers, and style tips delivered to your inbox!</p>
        <form onSubmit={handleSubmit} className="newsletter-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="newsletter-input"
            required
          />
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        <p className="newsletter-note">By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.</p>
      </div>
    </div>
  )
}

export default Newsletter


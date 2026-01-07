import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, AlertCircle } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useToast } from '../../components/Toast/ToastContainer'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const { error: showErrorToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
      showErrorToast(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <h1>Arudhra Fashions</h1>
          <h2>Admin Dashboard</h2>
          <p>Sign in to manage your store</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} />
              Enter email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@arudhraboutique.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-large" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin


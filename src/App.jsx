import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { ToastProvider } from './components/Toast/ToastContainer'
import { Header, Footer } from './components/Layout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import Wishlist from './pages/Wishlist'
import SizeGuide from './pages/SizeGuide'
import Compare from './pages/Compare'
import OrderTracking from './pages/OrderTracking'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Shipping from './pages/Shipping'
import Returns from './pages/Returns'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'
import ServerError from './pages/ServerError'
import AdminLogin from './pages/Admin/AdminLogin'
import AdminDashboard from './pages/Admin/AdminDashboard'

// Layout wrapper for public pages
function PublicLayout({ children }) {
  return (
    <div className="App">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Admin Routes - No Header/Footer */}
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              
              {/* Public Routes - With Header/Footer */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/products/:category/:subcategory?" element={<PublicLayout><Products /></PublicLayout>} />
              <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
              <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
              <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
              <Route path="/dashboard" element={<PublicLayout><Dashboard /></PublicLayout>} />
              <Route path="/wishlist" element={<PublicLayout><Wishlist /></PublicLayout>} />
              <Route path="/size-guide" element={<PublicLayout><SizeGuide /></PublicLayout>} />
              <Route path="/compare" element={<PublicLayout><Compare /></PublicLayout>} />
              <Route path="/order/:id" element={<PublicLayout><OrderTracking /></PublicLayout>} />
              <Route path="/track/:tracking" element={<PublicLayout><OrderTracking /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
              <Route path="/faq" element={<PublicLayout><FAQ /></PublicLayout>} />
              <Route path="/shipping" element={<PublicLayout><Shipping /></PublicLayout>} />
              <Route path="/returns" element={<PublicLayout><Returns /></PublicLayout>} />
              <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
              <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
              <Route path="/500" element={<PublicLayout><ServerError /></PublicLayout>} />
              <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
            </Routes>
          </Router>
        </ToastProvider>
      </AdminAuthProvider>
    </AuthProvider>
  )
}

export default App

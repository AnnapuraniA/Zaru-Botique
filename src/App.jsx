import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header, Footer } from './components/Layout'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard'
import Wishlist from './pages/Wishlist'
import SizeGuide from './pages/SizeGuide'
import Compare from './pages/Compare'

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products/:category/:subcategory?" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App



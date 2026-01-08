import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Package, FolderTree, ShoppingBag, Users, FileText, 
  MessageSquare, BarChart3, Boxes, Settings, LogOut, Menu, X, ChevronDown, ChevronRight,
  Tag, Mail, RotateCcw, Ticket, Image as ImageIcon, FileText as FileTextIcon, Download
} from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import DashboardOverview from './DashboardOverview'
import Products from './Products'
import Categories from './Categories'
import Orders from './Orders'
import Customers from './Customers'
import Content from './Content'
import Queries from './Queries'
import Analytics from './Analytics'
import Inventory from './Inventory'
import AdminSettings from './AdminSettings'
import Discounts from './Discounts'
import Newsletter from './Newsletter'
import Returns from './Returns'
import Coupons from './Coupons'
import Banners from './Banners'
import EmailTemplates from './EmailTemplates'
import Reports from './Reports'

function AdminDashboard() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedSections, setExpandedSections] = useState({})

  const menuSections = [
    {
      id: 'main',
      label: 'Main',
      items: [
        {
          id: 'overview',
          label: 'Dashboard',
          icon: LayoutDashboard,
          path: '/admin/dashboard',
          exact: true
        },
        {
          id: 'orders',
          label: 'Orders',
          icon: ShoppingBag,
          path: '/admin/orders'
        },
        {
          id: 'customers',
          label: 'Customers',
          icon: Users,
          path: '/admin/customers'
        }
      ]
    },
    {
      id: 'catalog',
      label: 'Catalog',
      items: [
        {
          id: 'categories',
          label: 'Categories',
          icon: FolderTree,
          path: '/admin/categories'
        },
        {
          id: 'products',
          label: 'Products',
          icon: Package,
          path: '/admin/products',
          children: [
            { label: 'All Products', path: '/admin/products' },
            { label: 'Add Product', path: '/admin/products/add' }
          ]
        },
        {
          id: 'inventory',
          label: 'Inventory',
          icon: Boxes,
          path: '/admin/inventory'
        }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing',
      items: [
        {
          id: 'discounts',
          label: 'Discounts & Promotions',
          icon: Tag,
          path: '/admin/discounts'
        },
        {
          id: 'coupons',
          label: 'Coupon Codes',
          icon: Ticket,
          path: '/admin/coupons'
        },
        {
          id: 'banners',
          label: 'Banners & Sliders',
          icon: ImageIcon,
          path: '/admin/banners'
        },
        {
          id: 'newsletter',
          label: 'Newsletter',
          icon: Mail,
          path: '/admin/newsletter'
        }
      ]
    },
    {
      id: 'content',
      label: 'Content & Communication',
      items: [
        {
          id: 'content',
          label: 'Home Page Content',
          icon: FileText,
          path: '/admin/content'
        },
        {
          id: 'email-templates',
          label: 'Email Templates',
          icon: FileTextIcon,
          path: '/admin/email-templates'
        },
        {
          id: 'queries',
          label: 'Customer Queries',
          icon: MessageSquare,
          path: '/admin/queries'
        }
      ]
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      items: [
        {
          id: 'analytics',
          label: 'Analytics',
          icon: BarChart3,
          path: '/admin/analytics'
        },
        {
          id: 'reports',
          label: 'Reports & Export',
          icon: Download,
          path: '/admin/reports'
        },
        {
          id: 'returns',
          label: 'Returns & Refunds',
          icon: RotateCcw,
          path: '/admin/returns'
        }
      ]
    },
    {
      id: 'system',
      label: 'System',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          path: '/admin/settings'
        }
      ]
    }
  ]

  const toggleSection = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <img src="/Logo.png" alt="Arudhra Fashions Logo" className="admin-logo-img" />
            <div>
              <h2>Arudhra Fashions</h2>
              <span>Admin Panel</span>
            </div>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="admin-nav">
          {menuSections.map(section => (
            <div key={section.id} className="nav-section">
              {sidebarOpen && (
                <div className="nav-section-label">
                  {section.label}
                </div>
              )}
              {section.items.map(item => {
                const Icon = item.icon
                const hasChildren = item.children && item.children.length > 0
                const isExpanded = expandedSections[item.id]
                const active = isActive(item.path, item.exact)

                return (
                  <div key={item.id} className="nav-item-wrapper">
                    <button
                      className={`nav-item ${active ? 'active' : ''}`}
                      onClick={() => {
                        if (hasChildren) {
                          toggleSection(item.id)
                        } else {
                          navigate(item.path)
                        }
                      }}
                    >
                      <Icon size={20} />
                      {sidebarOpen && <span>{item.label}</span>}
                      {sidebarOpen && hasChildren && (
                        isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                      )}
                    </button>
                    {sidebarOpen && hasChildren && isExpanded && (
                      <div className="nav-submenu">
                        {item.children.map((child, idx) => (
                          <button
                            key={idx}
                            className={`nav-submenu-item ${isActive(child.path) ? 'active' : ''}`}
                            onClick={() => navigate(child.path)}
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {admin.name.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="admin-user-details">
                <p className="admin-name">{admin.name}</p>
                <p className="admin-role">{admin.role}</p>
              </div>
            )}
          </div>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        <div className="admin-content-wrapper">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="products/*" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="content" element={<Content />} />
            <Route path="queries" element={<Queries />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="discounts" element={<Discounts />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="banners" element={<Banners />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="returns" element={<Returns />} />
            <Route path="email-templates" element={<EmailTemplates />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard


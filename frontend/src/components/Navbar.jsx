import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Package, LayoutDashboard, Truck, ArrowLeftRight, LogOut } from 'lucide-react'

const links = [
  { to: '/',             label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/products',     label: 'Products',     icon: Package },
  { to: '/suppliers',    label: 'Suppliers',    icon: Truck },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-gray-900 border-r border-gray-800 flex flex-col z-40">
      <div className="px-5 py-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Package className="text-indigo-400" size={22} />
          <span className="font-bold text-white text-lg">InvManager</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === to ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}>
            <Icon size={17} /> {label}
          </Link>
        ))}
      </nav>
      {user && (
        <div className="px-4 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-1 truncate">{user.email}</p>
          <button onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors">
            <LogOut size={15} /> Logout
          </button>
        </div>
      )}
    </aside>
  )
}

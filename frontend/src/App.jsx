import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Suppliers from './pages/Suppliers'
import Transactions from './pages/Transactions'
import Login from './pages/Login'
import Register from './pages/Register'

function ProtectedLayout({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="ml-56 flex-1 p-8">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/"            element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/products"    element={<ProtectedLayout><Products /></ProtectedLayout>} />
          <Route path="/suppliers"   element={<ProtectedLayout><Suppliers /></ProtectedLayout>} />
          <Route path="/transactions" element={<ProtectedLayout><Transactions /></ProtectedLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

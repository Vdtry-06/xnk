import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage              from './pages/LoginPage'
import AgentOrdersPage        from './pages/agent/OrdersPage'
import AgentCreateOrderPage   from './pages/agent/CreateOrderPage'
import AgentOrderDetailPage   from './pages/agent/OrderDetailPage'
import AgentPaymentPage       from './pages/agent/PaymentPage'
import AdminOrdersPage        from './pages/admin/orderitem/AdminOrdersPage'
import AdminOrderDetailPage   from './pages/admin/orderitem/AdminOrderDetailPage'
import AdminAgentsPage        from './pages/admin/manageagent/AdminAgentsPage'
import CreateAgentPage        from './pages/admin/manageagent/CreateAgentPage'

import DeliveryPage           from './pages/warehouse/DeliveryPage'
import CreateDeliveryPage     from './pages/warehouse/CreateDeliveryPage'

function DefaultRoute() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace/>
  if (user.role === 'ADMIN')           return <Navigate to="/admin/orders" replace/>
  if (user.role === 'AGENT')           return <Navigate to="/orders" replace/>
  if (user.role === 'WAREHOUSE_STAFF') return <Navigate to="/delivery" replace/>
  return <Navigate to="/login" replace/>
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace/>
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace/>
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace/> : <LoginPage/>}/>
      <Route path="/" element={<DefaultRoute/>}/>

      {/* Agent */}
      <Route path="/orders" element={
        <ProtectedRoute allowedRoles={['AGENT']}><AgentOrdersPage/></ProtectedRoute>
      }/>
      <Route path="/orders/create" element={
        <ProtectedRoute allowedRoles={['AGENT']}><AgentCreateOrderPage/></ProtectedRoute>
      }/>
      <Route path="/orders/:id" element={
        <ProtectedRoute allowedRoles={['AGENT']}><AgentOrderDetailPage/></ProtectedRoute>
      }/>
      <Route path="/orders/:id/payment" element={
        <ProtectedRoute allowedRoles={['AGENT']}><AgentPaymentPage/></ProtectedRoute>
      }/>

      {/* Admin */}
      <Route path="/admin/orders" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminOrdersPage/></ProtectedRoute>
      }/>
      <Route path="/admin/orders/:id" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminOrderDetailPage/></ProtectedRoute>
      }/>
      <Route path="/admin/agents" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminAgentsPage/></ProtectedRoute>
      }/>
      <Route path="/admin/agents/create" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><CreateAgentPage/></ProtectedRoute>
      }/>
      {/* Warehouse */}
      <Route path="/delivery" element={
        <ProtectedRoute allowedRoles={['WAREHOUSE_STAFF']}><DeliveryPage/></ProtectedRoute>
      }/>
      <Route path="/delivery/create" element={
        <ProtectedRoute allowedRoles={['WAREHOUSE_STAFF']}><CreateDeliveryPage/></ProtectedRoute>
      }/>

      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes/>
        <Toaster position="top-right" toastOptions={{ duration:3000 }}/>
      </BrowserRouter>
    </AuthProvider>
  )
}

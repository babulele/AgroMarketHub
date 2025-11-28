import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import FarmerDashboard from './pages/farmer/Dashboard';
import BuyerMarketplace from './pages/buyer/Marketplace';
import RiderDashboard from './pages/rider/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/farmer/*"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/buyer/*"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerMarketplace />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/rider/*"
            element={
              <ProtectedRoute allowedRoles={['rider']}>
                <RiderDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;


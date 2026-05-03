import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const CampusTourPage = React.lazy(() => import('./pages/CampusTourPage'));
const MapPage = React.lazy(() => import('./pages/MapPage'));

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)'
        }
      }}/>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="student/dashboard" element={
               <ProtectedRoute allowedRoles={['student', 'admin']}>
                 <StudentDashboard />
               </ProtectedRoute>
            } />
            <Route path="admin/dashboard" element={
               <ProtectedRoute allowedRoles={['admin']}>
                 <AdminDashboard />
               </ProtectedRoute>
            } />
            
            {/* Public Interactive Features */}
            <Route path="campus-tour" element={
              <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-xl font-bold text-primary animate-pulse">Loading 3D Engine...</div>}>
                <CampusTourPage />
              </Suspense>
            } />
            <Route path="map" element={
              <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-xl font-bold text-primary animate-pulse">Initializing Map Module...</div>}>
                <MapPage />
              </Suspense>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

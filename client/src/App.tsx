import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// Redux hooks
import { useAppDispatch, useAppSelector } from '@/store'
import { initializeTheme } from '@/store/slices/themeSlice'
import { selectIsAuthenticated, selectUser, selectUserRole } from '@/store/slices/authSlice'

// Layout components
import AuthLayout from '@/components/layouts/AuthLayout'
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout'
import ClientLayout from '@/components/layouts/ClientLayout'
import AgencyLayout from '@/components/layouts/AgencyLayout'
import PublicLayout from '@/components/layouts/PublicLayout'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// Super Admin pages
import SuperAdminDashboard from '@/pages/super-admin/Dashboard'
import ClientsPage from '@/pages/super-admin/ClientsPage'
import AgenciesPage from '@/pages/super-admin/AgenciesPage'
import SystemPage from '@/pages/super-admin/SystemPage'
import AnalyticsPage from '@/pages/super-admin/AnalyticsPage'

// Client pages
import ClientDashboard from '@/pages/client/Dashboard'
import MyAgenciesPage from '@/pages/client/MyAgenciesPage'
import AgencySettingsPage from '@/pages/client/AgencySettingsPage'
import ClientAccountPage from '@/pages/client/AccountPage'

// Agency pages
import AgencyDashboard from '@/pages/agency/Dashboard'
import StudentsPage from '@/pages/agency/StudentsPage'
import PagesPage from '@/pages/agency/PagesPage'
import FormsPage from '@/pages/agency/FormsPage'
import MediaPage from '@/pages/agency/MediaPage'
import BlogPage from '@/pages/agency/BlogPage'

// Public pages
import HomePage from '@/pages/public/HomePage'
import AboutPage from '@/pages/public/AboutPage'
import ContactPage from '@/pages/public/ContactPage'
import NotFoundPage from '@/pages/public/NotFoundPage'

// Hooks
import { useAuth } from '@/hooks/useAuth'
import { useSystemTheme } from '@/hooks/useSystemTheme'

// Components
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorBoundary from '@/components/ErrorBoundary'

// Route guards
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import RoleGuard from '@/components/auth/RoleGuard'

function App() {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectUser)
  const userRole = useAppSelector(selectUserRole)
  
  // Initialize auth and theme
  const { isLoading: authLoading } = useAuth()
  useSystemTheme()

  useEffect(() => {
    // Initialize theme on app load
    dispatch(initializeTheme())
  }, [dispatch])

  // Show loading spinner while auth is being initialized
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>

            {/* Auth routes - redirect if already authenticated */}
            <Route path="/auth" element={
              isAuthenticated ? <Navigate to={getRoleBasedRedirect(userRole)} replace /> : <AuthLayout />
            }>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Super Admin routes */}
            <Route path="/super-admin" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['super_admin']}>
                  <SuperAdminLayout />
                </RoleGuard>
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="agencies" element={<AgenciesPage />} />
              <Route path="system" element={<SystemPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>

            {/* Client routes */}
            <Route path="/client" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['client']}>
                  <ClientLayout />
                </RoleGuard>
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<ClientDashboard />} />
              <Route path="agencies" element={<MyAgenciesPage />} />
              <Route path="agencies/:id/settings" element={<AgencySettingsPage />} />
              <Route path="account" element={<ClientAccountPage />} />
            </Route>

            {/* Agency Admin routes */}
            <Route path="/agency" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin', 'editor', 'viewer']}>
                  <AgencyLayout />
                </RoleGuard>
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AgencyDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="pages" element={<PagesPage />} />
              <Route path="forms" element={<FormsPage />} />
              <Route path="media" element={<MediaPage />} />
              <Route path="blog" element={<BlogPage />} />
            </Route>

            {/* Default redirect based on authentication status */}
            <Route path="/dashboard" element={
              isAuthenticated 
                ? <Navigate to={getRoleBasedRedirect(userRole)} replace />
                : <Navigate to="/auth/login" replace />
            } />

            {/* 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  )
}

// Helper function to determine redirect based on user role
function getRoleBasedRedirect(role?: string): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin/dashboard'
    case 'client':
      return '/client/dashboard'
    case 'admin':
    case 'editor':
    case 'viewer':
      return '/agency/dashboard'
    default:
      return '/auth/login'
  }
}

export default App
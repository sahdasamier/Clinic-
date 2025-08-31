import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ProtectedRoute, AdminProtectedRoute, ClinicAccessGuard, PermissionGuard, BlurredPermissionGuard, EnhancedRouteGuard } from "@components/guards";
import { AppLayout } from "@layouts";
import DashboardPage from "@features/dashboard/pages/DashboardPage";
import LoginPage from "@features/auth/pages/LoginPage";
import ResetPasswordPage from "@features/auth/pages/ResetPasswordPage";
import AdminLoginPage from "@features/auth/pages/AdminLoginPage";
import AdminPanelPage from "@features/admin/pages/AdminPanelPage";
import ReceptionistDashboard from "@features/dashboard/pages/ReceptionistDashboard";
import DoctorDashboard from "@features/dashboard/pages/DoctorDashboard";
import { PatientListPage, PatientDetailPage } from "@features/patients";
import { AppointmentListPage, AppointmentCalendarPage } from "@features/appointments";
import PaymentListPage from "@features/payments/pages/PaymentListPage";
import LaboratoryRadiologyCenterPage from "@features/LaboratoryRadiologyCenterPage/LaboratoryRadiologyCenterPage";
import NotificationsPage from "@features/notifications/pages/NotificationsPage";
import DoctorSchedulingPage from "@features/doctor-scheduling/pages/DoctorSchedulingPage";
import SettingsPage from "@features/settings/pages/SettingsPage";



const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes - No ProtectedRoute needed */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminPanelPage /></AdminProtectedRoute>} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminPanelPage /></AdminProtectedRoute>} />
        
        {/* Protected Routes - Enhanced with permission-aware routing */}
        <Route path="/" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <AppLayout>
                <EnhancedRouteGuard feature="dashboard" level="read">
                  <DashboardPage />
                </EnhancedRouteGuard>
              </AppLayout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <AppLayout>
                <EnhancedRouteGuard feature="dashboard" level="read">
                  <DashboardPage />
                </EnhancedRouteGuard>
              </AppLayout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/receptionist" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <AppLayout>
                <EnhancedRouteGuard feature="dashboard" level="read">
                  <ReceptionistDashboard />
                </EnhancedRouteGuard>
              </AppLayout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/doctor" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <AppLayout>
                <EnhancedRouteGuard feature="dashboard" level="read">
                  <DoctorDashboard />
                </EnhancedRouteGuard>
              </AppLayout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        {/* Patient Routes */}
        <Route path="/patients" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <AppLayout>
                <EnhancedRouteGuard feature="patients" level="read">
                  <PatientListPage />
                </EnhancedRouteGuard>
              </AppLayout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/patients/:id" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <AppLayout>
                <EnhancedRouteGuard feature="patient_details" level="read">
                  <PatientDetailPage />
                </EnhancedRouteGuard>
              </AppLayout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        {/* Appointment Routes */}
        <Route path="/appointments" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <AppLayout>
                <EnhancedRouteGuard feature="appointments" level="read">
                  <AppointmentListPage />
                </EnhancedRouteGuard>
              </AppLayout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/appointments/calendar" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <AppLayout>
                <EnhancedRouteGuard feature="appointment_calendar" level="read">
                  <AppointmentCalendarPage />
                </EnhancedRouteGuard>
              </AppLayout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        {/* Business Operations Routes */}
        <Route path="/payments" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <AppLayout>
                <EnhancedRouteGuard feature="payments" level="read">
                  <PaymentListPage />
                </EnhancedRouteGuard>
              </AppLayout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/laboratoryRadiology" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <AppLayout>
                <EnhancedRouteGuard feature="laboratoryRadiology" level="read">
                  <LaboratoryRadiologyCenterPage />
                </EnhancedRouteGuard>
              </AppLayout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        {/* Advanced Features Routes */}
        <Route path="/notifications" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <AppLayout>
                <EnhancedRouteGuard feature="notifications" level="read">
                  <NotificationsPage />
                </EnhancedRouteGuard>
              </AppLayout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />

        <Route path="/doctor-scheduling" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <AppLayout>
                <EnhancedRouteGuard feature="doctor_scheduling" level="read">
                  <DoctorSchedulingPage />
                </EnhancedRouteGuard>
              </AppLayout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />


        
        {/* Administrative Routes */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <AppLayout>
                <EnhancedRouteGuard feature="settings" level="read">
                  <SettingsPage />
                </EnhancedRouteGuard>
              </AppLayout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />



        {/* Catch-all route for 404 or unauthorized access attempts */}
        <Route path="*" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <AppLayout>
                <EnhancedRouteGuard 
                  feature="dashboard" 
                  level="read" 
                  redirectTo="/dashboard"
                  showUnauthorized={false}
                >
                  <div>Page not found</div>
                </EnhancedRouteGuard>
              </AppLayout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default Router; 
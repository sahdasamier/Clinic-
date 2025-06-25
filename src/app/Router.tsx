import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminProtectedRoute from "../components/AdminProtectedRoute";
import ClinicAccessGuard from "../components/ClinicAccessGuard";
import PermissionGuard from "../components/PermissionGuard";
import BlurredPermissionGuard from "../components/BlurredPermissionGuard";
import EnhancedRouteGuard from "../components/EnhancedRouteGuard";
import Layout from "../components/Layout";
import DashboardPage from "../features/dashboard/DashboardPage";
import LoginPage from "../features/auth/LoginPage";
import ResetPasswordPage from "../features/auth/ResetPasswordPage";
import AdminLoginPage from "../features/auth/AdminLoginPage";
import AdminPanelPage from "../features/admin/AdminPanelPage";
import ReceptionistDashboard from "../features/dashboard/ReceptionistDashboard";
import DoctorDashboard from "../features/dashboard/DoctorDashboard";
import PatientListPage from "../features/patients/PatientListPage";
import PatientDetailPage from "../features/patients/PatientDetailPage";
import AppointmentListPage from "../features/appointments/AppointmentListPage";
import AppointmentCalendarPage from "../features/appointments/AppointmentCalendarPage";
import PaymentListPage from "../features/payments/PaymentListPage";
import InventoryPage from "../features/inventory/InventoryPage";
import NotificationsPage from "../features/notifications/NotificationsPage";

import SettingsPage from "../features/settings/SettingsPage";
import AppointmentSchedulingPage from "../features/DoctorScheduling";

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
              <Layout>
                <EnhancedRouteGuard feature="dashboard" level="read">
                  <DashboardPage />
                </EnhancedRouteGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <EnhancedRouteGuard feature="dashboard" level="read">
                  <DashboardPage />
                </EnhancedRouteGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/receptionist" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <EnhancedRouteGuard feature="dashboard" level="read">
                  <ReceptionistDashboard />
                </EnhancedRouteGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/doctor" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <EnhancedRouteGuard feature="dashboard" level="read">
                  <DoctorDashboard />
                </EnhancedRouteGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        {/* Patient Routes */}
        <Route path="/patients" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <EnhancedRouteGuard feature="patients" level="read">
                  <PatientListPage />
                </EnhancedRouteGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/patients/:id" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <EnhancedRouteGuard feature="patient_details" level="read">
                  <PatientDetailPage />
                </EnhancedRouteGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        {/* Appointment Routes */}
        <Route path="/appointments" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <EnhancedRouteGuard feature="appointments" level="read">
                  <AppointmentListPage />
                </EnhancedRouteGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/appointments/calendar" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <EnhancedRouteGuard feature="appointment_calendar" level="read">
                  <AppointmentCalendarPage />
                </EnhancedRouteGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        {/* Business Operations Routes */}
        <Route path="/payments" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <EnhancedRouteGuard feature="payments" level="read">
                  <PaymentListPage />
                </EnhancedRouteGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        <Route path="/inventory" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <EnhancedRouteGuard feature="inventory" level="read">
                  <InventoryPage />
                </EnhancedRouteGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        {/* Advanced Features Routes */}
        <Route path="/notifications" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <EnhancedRouteGuard feature="notifications" level="read">
                  <NotificationsPage />
                </EnhancedRouteGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />

        <Route path="/doctor-scheduling" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <EnhancedRouteGuard feature="doctor_scheduling" level="read">
                  <AppointmentSchedulingPage />
                </EnhancedRouteGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        {/* Administrative Routes */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <EnhancedRouteGuard feature="settings" level="read">
                  <SettingsPage />
                </EnhancedRouteGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />

        {/* Catch-all route for 404 or unauthorized access attempts */}
        <Route path="*" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <EnhancedRouteGuard 
                  feature="dashboard" 
                  level="read" 
                  redirectTo="/dashboard"
                  showUnauthorized={false}
                >
                  <div>Page not found</div>
                </EnhancedRouteGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default Router; 
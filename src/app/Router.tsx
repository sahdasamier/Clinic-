import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminProtectedRoute from "../components/AdminProtectedRoute";
import ClinicAccessGuard from "../components/ClinicAccessGuard";
import PermissionGuard from "../components/PermissionGuard";
import BlurredPermissionGuard from "../components/BlurredPermissionGuard";
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
        
        {/* Protected Routes - Wrapped with ProtectedRoute, ClinicAccessGuard, Layout, and BlurredPermissionGuard */}
        <Route path="/" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="dashboard">
                  <DashboardPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="dashboard">
                  <DashboardPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/receptionist" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="dashboard">
                  <ReceptionistDashboard />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/doctor" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="dashboard">
                  <DoctorDashboard />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        {/* Patient Routes */}
        <Route path="/patients" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="patients">
                  <PatientListPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        <Route path="/patients/:id" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="patient_details">
                  <PatientDetailPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        {/* Appointment Routes */}
        <Route path="/appointments" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="appointments">
                  <AppointmentListPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        <Route path="/appointments/calendar" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="appointment_calendar">
                  <AppointmentCalendarPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        
        {/* Other Feature Routes */}
        <Route path="/payments" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="payments">
                  <PaymentListPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="inventory">
                  <InventoryPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="notifications">
                  <NotificationsPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />

        <Route path="/doctor-scheduling" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="doctor_scheduling">
                  <AppointmentSchedulingPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="settings">
                  <SettingsPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default Router; 
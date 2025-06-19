import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import AuthGuard from "./AuthGuard";
import AdminProtectedRoute from "../components/AdminProtectedRoute";
import ClinicAccessGuard from "../components/ClinicAccessGuard";
import PermissionGuard from "../components/PermissionGuard";
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
        {/* Authentication Routes - No AuthGuard needed */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminPanelPage /></AdminProtectedRoute>} />
        
        {/* Protected Routes - Wrapped with AuthGuard, ClinicAccessGuard, and PermissionGuard */}
        <Route path="/" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <PermissionGuard feature="dashboard">
                <DashboardPage />
              </PermissionGuard>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/dashboard" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <PermissionGuard feature="dashboard">
                <DashboardPage />
              </PermissionGuard>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/dashboard/receptionist" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <PermissionGuard feature="dashboard">
                <ReceptionistDashboard />
              </PermissionGuard>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/dashboard/doctor" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <PermissionGuard feature="dashboard">
                <DoctorDashboard />
              </PermissionGuard>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        
        {/* Patient Routes */}
        <Route path="/patients" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <PermissionGuard feature="patients">
                <PatientListPage />
              </PermissionGuard>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/patients/:id" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <PermissionGuard feature="patient_details">
                <PatientDetailPage />
              </PermissionGuard>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        
        {/* Appointment Routes */}
        <Route path="/appointments" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <PermissionGuard feature="appointments">
                <AppointmentListPage />
              </PermissionGuard>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/appointments/calendar" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <PermissionGuard feature="appointment_calendar">
                <AppointmentCalendarPage />
              </PermissionGuard>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        
        {/* Other Feature Routes */}
        <Route path="/payments" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <PermissionGuard feature="payments">
                <PaymentListPage />
              </PermissionGuard>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/inventory" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <PermissionGuard feature="inventory">
                <InventoryPage />
              </PermissionGuard>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/notifications" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <PermissionGuard feature="notifications">
                <NotificationsPage />
              </PermissionGuard>
            </ClinicAccessGuard>
          </AuthGuard>
        } />

        <Route path="/doctor-scheduling" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <PermissionGuard feature="doctor_scheduling">
                <AppointmentSchedulingPage />
              </PermissionGuard>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/settings" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <PermissionGuard feature="settings">
                <SettingsPage />
              </PermissionGuard>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default Router; 
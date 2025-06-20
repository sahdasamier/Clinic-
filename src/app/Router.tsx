import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import AuthGuard from "./AuthGuard";
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
        {/* Authentication Routes - No AuthGuard needed */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminPanelPage /></AdminProtectedRoute>} />
        
        {/* Protected Routes - Wrapped with AuthGuard, ClinicAccessGuard, Layout, and BlurredPermissionGuard */}
        <Route path="/" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="dashboard">
                  <DashboardPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/dashboard" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="dashboard">
                  <DashboardPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/dashboard/receptionist" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="dashboard">
                  <ReceptionistDashboard />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/dashboard/doctor" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="dashboard">
                  <DoctorDashboard />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        
        {/* Patient Routes */}
        <Route path="/patients" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="patients">
                  <PatientListPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/patients/:id" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="patient_details">
                  <PatientDetailPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        
        {/* Appointment Routes */}
        <Route path="/appointments" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="appointments">
                  <AppointmentListPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/appointments/calendar" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="appointment_calendar">
                  <AppointmentCalendarPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        
        {/* Other Feature Routes */}
        <Route path="/payments" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="payments">
                  <PaymentListPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/inventory" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="inventory">
                  <InventoryPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/notifications" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="notifications">
                  <NotificationsPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </AuthGuard>
        } />

        <Route path="/doctor-scheduling" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="doctor_scheduling">
                  <AppointmentSchedulingPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
        <Route path="/settings" element={
          <AuthGuard>
            <ClinicAccessGuard>
              <Layout>
                <BlurredPermissionGuard feature="settings">
                  <SettingsPage />
                </BlurredPermissionGuard>
              </Layout>
            </ClinicAccessGuard>
          </AuthGuard>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default Router; 
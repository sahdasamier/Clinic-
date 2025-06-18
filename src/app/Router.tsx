import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import AuthGuard from "./AuthGuard";
import AdminProtectedRoute from "../components/AdminProtectedRoute";
import ClinicAccessGuard from "../components/ClinicAccessGuard";
import DashboardPage from "../features/dashboard/DashboardPage";
import LoginPage from "../features/auth/LoginPage";
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
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminPanelPage /></AdminProtectedRoute>} />
        
        {/* Protected Routes - Wrapped with AuthGuard and ClinicAccessGuard */}
        <Route path="/" element={<AuthGuard><ClinicAccessGuard><DashboardPage /></ClinicAccessGuard></AuthGuard>} />
        <Route path="/dashboard" element={<AuthGuard><ClinicAccessGuard><DashboardPage /></ClinicAccessGuard></AuthGuard>} />
        <Route path="/dashboard/receptionist" element={<AuthGuard><ClinicAccessGuard><ReceptionistDashboard /></ClinicAccessGuard></AuthGuard>} />
        <Route path="/dashboard/doctor" element={<AuthGuard><ClinicAccessGuard><DoctorDashboard /></ClinicAccessGuard></AuthGuard>} />
        
        {/* Patient Routes */}
        <Route path="/patients" element={<AuthGuard><ClinicAccessGuard><PatientListPage /></ClinicAccessGuard></AuthGuard>} />
        <Route path="/patients/:id" element={<AuthGuard><ClinicAccessGuard><PatientDetailPage /></ClinicAccessGuard></AuthGuard>} />
        
        {/* Appointment Routes */}
        <Route path="/appointments" element={<AuthGuard><ClinicAccessGuard><AppointmentListPage /></ClinicAccessGuard></AuthGuard>} />
        <Route path="/appointments/calendar" element={<AuthGuard><ClinicAccessGuard><AppointmentCalendarPage /></ClinicAccessGuard></AuthGuard>} />
        
        {/* Other Feature Routes */}
        <Route path="/payments" element={<AuthGuard><ClinicAccessGuard><PaymentListPage /></ClinicAccessGuard></AuthGuard>} />
        <Route path="/inventory" element={<AuthGuard><ClinicAccessGuard><InventoryPage /></ClinicAccessGuard></AuthGuard>} />
        <Route path="/notifications" element={<AuthGuard><ClinicAccessGuard><NotificationsPage /></ClinicAccessGuard></AuthGuard>} />

        <Route path="/doctor-scheduling" element={<AuthGuard><ClinicAccessGuard><AppointmentSchedulingPage /></ClinicAccessGuard></AuthGuard>} />
        <Route path="/settings" element={<AuthGuard><ClinicAccessGuard><SettingsPage /></ClinicAccessGuard></AuthGuard>} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router; 
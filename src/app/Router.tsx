import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import AuthGuard from "./AuthGuard";
import DashboardPage from "../features/dashboard/DashboardPage";
import LoginPage from "../features/auth/LoginPage";
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
        
        {/* Protected Routes - Wrapped with AuthGuard */}
        <Route path="/" element={<AuthGuard><DashboardPage /></AuthGuard>} />
        <Route path="/dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
        <Route path="/dashboard/receptionist" element={<AuthGuard><ReceptionistDashboard /></AuthGuard>} />
        <Route path="/dashboard/doctor" element={<AuthGuard><DoctorDashboard /></AuthGuard>} />
        
        {/* Patient Routes */}
        <Route path="/patients" element={<AuthGuard><PatientListPage /></AuthGuard>} />
        <Route path="/patients/:id" element={<AuthGuard><PatientDetailPage /></AuthGuard>} />
        
        {/* Appointment Routes */}
        <Route path="/appointments" element={<AuthGuard><AppointmentListPage /></AuthGuard>} />
        <Route path="/appointments/calendar" element={<AuthGuard><AppointmentCalendarPage /></AuthGuard>} />
        
        {/* Other Feature Routes */}
        <Route path="/payments" element={<AuthGuard><PaymentListPage /></AuthGuard>} />
        <Route path="/inventory" element={<AuthGuard><InventoryPage /></AuthGuard>} />
        <Route path="/notifications" element={<AuthGuard><NotificationsPage /></AuthGuard>} />

        <Route path="/doctor-scheduling" element={<AuthGuard><AppointmentSchedulingPage /></AuthGuard>} />
        <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router; 
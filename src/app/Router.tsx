import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
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
import ChatPage from "../features/chat/ChatPage";

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Dashboard Routes */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/receptionist" element={<ReceptionistDashboard />} />
        <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
        
        {/* Patient Routes */}
        <Route path="/patients" element={<PatientListPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        
        {/* Appointment Routes */}
        <Route path="/appointments" element={<AppointmentListPage />} />
        <Route path="/appointments/calendar" element={<AppointmentCalendarPage />} />
        
        {/* Other Feature Routes */}
        <Route path="/payments" element={<PaymentListPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router; 
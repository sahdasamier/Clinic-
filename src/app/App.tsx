import React, { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "../contexts/AuthContext";
import { UserProvider } from "../contexts/UserContext";
import { NotificationProvider as LegacyNotificationProvider } from "../contexts/NotificationContext";
import { SidebarProvider } from "../contexts/SidebarContext";
import { NotificationProvider } from "../contexts/NotificationProvider";
import { ensureDemoClinicExists } from "../scripts/initFirestore";
import Router from "./Router";

const AppContent: React.FC = () => {
  const { i18n } = useTranslation();

  // Set RTL direction globally when language changes
  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language, i18n]);

  // Check demo clinic status on app start (non-blocking, safe)
  useEffect(() => {
    // This now just checks status without trying to write anything
    // Actual initialization will happen after admin authentication
    ensureDemoClinicExists().catch(error => {
      console.warn('⚠️ Demo clinic status check failed (this is normal):', error);
    });
  }, []);

  return <Router />;
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <UserProvider>
        <LegacyNotificationProvider>
          <SidebarProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </SidebarProvider>
        </LegacyNotificationProvider>
      </UserProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App; 
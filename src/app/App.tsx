import React, { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "@store/auth";
import { UserProvider } from "@store/auth";
import { GlobalDataProvider } from "@store/global";
import { SidebarProvider } from "@store/global";
import { NotificationProvider } from "@store/notifications/NotificationContext";
import { NotificationProvider as SnackbarProvider } from "@store/notifications/NotificationProvider";
import { ensureDemoClinicExists } from "@/scripts/initFirestore";
import { useDocumentTitle } from "@hooks/useDocumentTitle";
import { updateDocumentDirection } from "@utils/i18nUtils";
import ErrorBoundary from "@components/common/ErrorBoundary";
import Router from "./Router";

const AppContent: React.FC = () => {
  const { i18n } = useTranslation();
  
  // Update document title based on clinic branding
  useDocumentTitle();

  // Set RTL direction globally when language changes
  useEffect(() => {
    updateDocumentDirection();
  }, [i18n.language, i18n]);

  // Check demo clinic status on app start (non-blocking, safe)
  useEffect(() => {
    // Add a small delay to ensure Firebase is fully initialized
    const timer = setTimeout(() => {
      // This now just checks status without trying to write anything
      // Actual initialization will happen after admin authentication
      ensureDemoClinicExists().catch(error => {
        console.warn('⚠️ Demo clinic status check failed (this is normal on first load):', error);
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Initialize payment status checking system
  useEffect(() => {
    // Initialize payment status check for overdue detection
    import('@utils/paymentUtils').then(({ initializePaymentStatusCheck }) => {
      initializePaymentStatusCheck();
    });
    
    // ✅ NEW: Initialize appointment backup sync system
    import('@utils/paymentUtils').then(({ initializeAppointmentBackupSync }) => {
      initializeAppointmentBackupSync();
    });
  }, []);

  return <Router />;
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <UserProvider>
        <GlobalDataProvider>
          <SidebarProvider>
            <NotificationProvider>
              <SnackbarProvider>
                <ErrorBoundary>
                  <AppContent />
                </ErrorBoundary>
              </SnackbarProvider>
            </NotificationProvider>
          </SidebarProvider>
        </GlobalDataProvider>
      </UserProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App; 
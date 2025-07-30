import React, { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "../contexts/AuthContext";
import { UserProvider } from "../contexts/UserContext";
import { GlobalDataProvider } from "../contexts/GlobalDataContext";
import { SidebarProvider } from "../contexts/SidebarContext";
import { NotificationProvider } from "../contexts/NotificationProvider";
import { NotificationProvider as NotificationDataProvider } from "../contexts/NotificationContext";
import { ensureDemoClinicExists } from "../scripts/initFirestore";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { updateDocumentDirection } from "../utils/i18nUtils";
import ErrorBoundary from "../components/ErrorBoundary";
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

  return <Router />;
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <UserProvider>
        <GlobalDataProvider>
          <SidebarProvider>
            <NotificationProvider>
              <NotificationDataProvider>
                <ErrorBoundary>
                  <AppContent />
                </ErrorBoundary>
              </NotificationDataProvider>
            </NotificationProvider>
          </SidebarProvider>
        </GlobalDataProvider>
      </UserProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App; 
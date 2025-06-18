import React, { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { UserProvider } from "../contexts/UserContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import Router from "./Router";

const AppContent: React.FC = () => {
  const { i18n } = useTranslation();

  // Set RTL direction globally when language changes
  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language, i18n]);

  return <Router />;
};

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <UserProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </UserProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App; 
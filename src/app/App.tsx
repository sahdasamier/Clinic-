import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { NotificationProvider } from "../contexts/NotificationContext";
import Router from "./Router";

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <NotificationProvider>
        <Router />
      </NotificationProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App; 
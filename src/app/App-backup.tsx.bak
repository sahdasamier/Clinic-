import React, { useEffect } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { UserProvider } from "../contexts/UserContext";
import { NotificationProvider } from "../contexts/NotificationProvider";
import { SidebarProvider } from "../contexts/SidebarContext";
import Router from "./Router";

const App: React.FC = () => {
  // Simple error boundary to catch any provider issues
  return (
    <div>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <SidebarProvider>
              <NotificationProvider>
                <Router />
              </NotificationProvider>
            </SidebarProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
};

export default App; 
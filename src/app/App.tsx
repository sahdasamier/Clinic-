import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import Router from "./Router";

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </ThemeProvider>
);

export default App; 
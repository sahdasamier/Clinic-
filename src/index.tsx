// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated for React 18+
import App from './App';
import { AppointmentProvider } from './contexts/AppointmentContext';
import './index.css'; // Assuming a basic CSS file might exist or be added

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AppointmentProvider>
        <App />
      </AppointmentProvider>
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. Ensure your HTML has an element with id='root'.");
}

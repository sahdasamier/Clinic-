// src/App.tsx
import React from 'react';
import Dashboard from './pages/Dashboard'; // Assuming Dashboard will be the main content for now

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Appointment Management</h1>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;

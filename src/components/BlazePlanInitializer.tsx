import React, { useEffect } from 'react';

// Mock Blaze Plan Initializer component
// This replaces the removed Blaze plan functionality

const BlazePlanInitializer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    console.log('🔥 Mock Blaze Plan Initializer - Plan would be initialized here');
    
    // Simulate initialization
    const initializeMockBlazePlan = () => {
      console.log('✅ Mock Blaze Plan initialized successfully');
    };
    
    // Initialize with a small delay to simulate real initialization
    const timeout = setTimeout(initializeMockBlazePlan, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  // Just render children if provided
  return <>{children}</>;
};

export default BlazePlanInitializer; 
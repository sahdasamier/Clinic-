import { useState, useEffect } from 'react';

interface ClinicSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  timezone: string;
  licenseNumber: string;
  website: string;
  specialization: string;
  logo: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  appointmentDuration: number;
  breakBetweenAppointments: number;
  advanceBookingLimit: number;
  allowOnlineBooking: boolean;
  requirePaymentAtBooking: boolean;
  sendReminders: boolean;
  insuranceProviders: Array<{
    id: number;
    name: string;
    enabled: boolean;
  }>;
}

const defaultClinicSettings: ClinicSettings = {
  name: '',
  address: '',
  phone: '',
  email: '',
  workingHours: '',
  timezone: '',
  licenseNumber: '',
  website: '',
  specialization: '',
  logo: '',
  tagline: '',
  primaryColor: '#1976d2',
  secondaryColor: '#2e7d32',
  description: '',
  appointmentDuration: 30,
  breakBetweenAppointments: 15,
  advanceBookingLimit: 30,
  allowOnlineBooking: false,
  requirePaymentAtBooking: false,
  sendReminders: false,
  insuranceProviders: [],
};

export const useClinicSettings = () => {
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(defaultClinicSettings);
  const [loading, setLoading] = useState(true);

  // Load clinic settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('clinicSettings');
        if (saved) {
          const parsedData = JSON.parse(saved);
          console.log('✅ useClinicSettings: Loaded clinic settings from localStorage:', parsedData);
          setClinicSettings({ ...defaultClinicSettings, ...parsedData });
        } else {
          console.log('ℹ️ useClinicSettings: No saved clinic settings found, using defaults');
          setClinicSettings(defaultClinicSettings);
        }
      } catch (error) {
        console.error('❌ useClinicSettings: Failed to parse clinic settings:', error);
        setClinicSettings(defaultClinicSettings);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    // Listen for changes to localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'clinicSettings') {
        console.log('🔄 useClinicSettings: Clinic settings changed in localStorage, reloading...');
        loadSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update clinic settings
  const updateClinicSettings = (newSettings: Partial<ClinicSettings>) => {
    try {
      const updatedSettings = { ...clinicSettings, ...newSettings };
      setClinicSettings(updatedSettings);
      localStorage.setItem('clinicSettings', JSON.stringify(updatedSettings));
      console.log('✅ useClinicSettings: Clinic settings updated successfully');
    } catch (error) {
      console.error('❌ useClinicSettings: Failed to update clinic settings:', error);
    }
  };

  // Get clinic display name (with fallback)
  const getClinicDisplayName = () => {
    if (clinicSettings.name && clinicSettings.name.trim()) {
      return clinicSettings.name;
    }
    return 'Clinicy Healthcare'; // Default fallback
  };

  // Get clinic tagline (with fallback)
  const getClinicTagline = () => {
    if (clinicSettings.tagline && clinicSettings.tagline.trim()) {
      return clinicSettings.tagline;
    }
    return 'Professional Healthcare'; // Default fallback
  };

 

  // Check if clinic branding is configured
  const isBrandingConfigured = () => {
    return !!(clinicSettings.name && clinicSettings.name.trim());
  };

  return {
    clinicSettings,
    loading,
    updateClinicSettings,
    getClinicDisplayName,
    getClinicTagline,
    isBrandingConfigured,
  };
}; 
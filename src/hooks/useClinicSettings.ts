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

  // Initialize with default settings (no localStorage)
  useEffect(() => {
    console.log('ℹ️ useClinicSettings: Using default clinic settings (localStorage removed)');
    setClinicSettings(defaultClinicSettings);
    setLoading(false);
  }, []);

  // Update clinic settings - in-memory only
  const updateClinicSettings = (newSettings: Partial<ClinicSettings>) => {
    try {
      const updatedSettings = { ...clinicSettings, ...newSettings };
      setClinicSettings(updatedSettings);
      console.log('✅ useClinicSettings: Clinic settings updated in-memory (no localStorage)');
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
import { useEffect } from 'react';
import { useClinicSettings } from './useClinicSettings';

export const useDocumentTitle = (pageTitle?: string) => {
  const { getClinicDisplayName, isBrandingConfigured } = useClinicSettings();

  useEffect(() => {
    const clinicName = getClinicDisplayName();
    
    // Create a meaningful title based on clinic branding
    let title = 'Clinic Management System';
    
    if (isBrandingConfigured()) {
      if (pageTitle) {
        title = `${pageTitle} - ${clinicName}`;
      } else {
        title = `${clinicName} - Healthcare Management`;
      }
    } else {
      if (pageTitle) {
        title = `${pageTitle} - Clinicy Healthcare`;
      } else {
        title = 'Clinicy - Healthcare Management System';
      }
    }
    
    // Update document title
    document.title = title;
    
    console.log('📄 Document title updated:', title);
  }, [pageTitle, getClinicDisplayName, isBrandingConfigured]);
}; 
import { useMemo } from 'react';
import { useUser } from '../contexts/UserContext';

interface Patient {
  id: string;
  doctorId?: string;
  name?: string;
}

interface PatientGuardInfo {
  isBlurred: boolean;
  tableRowProps: {
    sx?: Record<string, any>;
    onClick?: (event: any) => void;
  };
  shouldShowOverlay: boolean;
  overlayMessage: string;
}

export const usePatientsGuard = (patients: Patient[]): Map<string, PatientGuardInfo> => {
  const { userProfile } = useUser();

  return useMemo(() => {
    const guardMap = new Map<string, PatientGuardInfo>();

    patients.forEach(patient => {
      // Allow access for non-doctors or admins
      if (!userProfile || userProfile.role !== 'doctor') {
        guardMap.set(patient.id, {
          isBlurred: false,
          tableRowProps: {},
          shouldShowOverlay: false,
          overlayMessage: ''
        });
        return;
      }

      // Check if the current doctor is assigned to this patient
      const isPatientAssignedToCurrentDoctor = patient.doctorId === userProfile.id;

      // If patient is assigned to current doctor, show normally
      if (isPatientAssignedToCurrentDoctor) {
        guardMap.set(patient.id, {
          isBlurred: false,
          tableRowProps: {},
          shouldShowOverlay: false,
          overlayMessage: ''
        });
        return;
      }

      // If patient is not assigned to current doctor, apply blur
      guardMap.set(patient.id, {
        isBlurred: true,
        tableRowProps: {
          sx: {
            position: 'relative',
            '& > *': {
              filter: 'blur(3px)',
              opacity: 0.4,
              pointerEvents: 'none',
              userSelect: 'none'
            },
            '&::after': {
              content: '"🔒 Patient not assigned to you"',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.875rem',
              color: 'text.secondary',
              fontWeight: 500,
              zIndex: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.1)',
              whiteSpace: 'nowrap'
            }
          },
          onClick: (event: any) => {
            event.preventDefault();
            event.stopPropagation();
          }
        },
        shouldShowOverlay: true,
        overlayMessage: 'Patient not assigned to you'
      });
    });

    return guardMap;
  }, [userProfile, patients]);
};

export default usePatientsGuard; 
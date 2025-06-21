import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor, Slide, SlideProps } from '@mui/material';

export type NotificationType = AlertColor | 'validation-error' | 'validation-success';

interface NotificationState {
  open: boolean;
  message: string;
  type: NotificationType;
  autoHideDuration?: number;
  persist?: boolean;
}

interface NotificationContextType {
  // Basic notification methods
  showNotification: (message: string, type?: NotificationType, options?: NotificationOptions) => void;
  hideNotification: () => void;
  
  // Specific validation notification methods
  showValidationError: (fields: string[], customMessage?: string) => void;
  showValidationSuccess: (message?: string) => void;
  showSaveError: (error: string | Error) => void;
  showSaveSuccess: (message?: string) => void;
  
  // Form-specific notifications
  showRequiredFieldsError: (missingFields: string[]) => void;
  showUnsavedChangesWarning: () => void;
  
  // Current notification state
  currentNotification: NotificationState | null;
}

interface NotificationOptions {
  autoHideDuration?: number;
  persist?: boolean;
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Slide transition component
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    type: 'info',
    autoHideDuration: 6000,
    persist: false
  });

  const [position, setPosition] = useState<{
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  }>({
    vertical: 'top',
    horizontal: 'center'
  });

  const showNotification = (
    message: string, 
    type: NotificationType = 'info', 
    options: NotificationOptions = {}
  ) => {
    const {
      autoHideDuration = 6000,
      persist = false,
      position: newPosition
    } = options;

    if (newPosition) {
      setPosition(newPosition);
    }

    setNotification({
      open: true,
      message,
      type,
      autoHideDuration: persist ? undefined : autoHideDuration,
      persist
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Validation-specific notification methods
  const showValidationError = (fields: string[], customMessage?: string) => {
    const fieldNames = fields.join(', ');
    const message = customMessage || `Please check the following fields: ${fieldNames}`;
    showNotification(message, 'validation-error', { autoHideDuration: 8000 });
  };

  const showValidationSuccess = (message = 'Form validation passed') => {
    showNotification(message, 'validation-success', { autoHideDuration: 3000 });
  };

  const showSaveError = (error: string | Error) => {
    const message = error instanceof Error ? error.message : error;
    showNotification(`Save failed: ${message}`, 'error', { autoHideDuration: 8000 });
  };

  const showSaveSuccess = (message = 'Data saved successfully') => {
    showNotification(message, 'success', { autoHideDuration: 4000 });
  };

  const showRequiredFieldsError = (missingFields: string[]) => {
    const fieldNames = missingFields.join(', ');
    showNotification(
      `Please fill in the following required fields: ${fieldNames}`, 
      'warning', 
      { autoHideDuration: 10000 }
    );
  };

  const showUnsavedChangesWarning = () => {
    showNotification(
      'You have unsaved changes. Your work will be lost if you leave this page.',
      'warning',
      { autoHideDuration: 8000 }
    );
  };

  // Get the appropriate severity for Material-UI Alert
  const getAlertSeverity = (type: NotificationType): AlertColor => {
    switch (type) {
      case 'validation-error':
        return 'error';
      case 'validation-success':
        return 'success';
      default:
        return type as AlertColor;
    }
  };

  // Get the appropriate icon for different notification types
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'validation-error':
        return '⚠️';
      case 'validation-success':
        return '✅';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '';
    }
  };

  const value: NotificationContextType = {
    showNotification,
    hideNotification,
    showValidationError,
    showValidationSuccess,
    showSaveError,
    showSaveSuccess,
    showRequiredFieldsError,
    showUnsavedChangesWarning,
    currentNotification: notification.open ? notification : null
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.autoHideDuration}
        onClose={hideNotification}
        anchorOrigin={position}
        TransitionComponent={SlideTransition}
        sx={{
          '& .MuiSnackbar-root': {
            top: position.vertical === 'top' ? 24 : undefined,
            bottom: position.vertical === 'bottom' ? 24 : undefined,
          }
        }}
      >
        <Alert 
          onClose={hideNotification} 
          severity={getAlertSeverity(notification.type)}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontWeight: 500,
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }
          }}
          icon={
            <span style={{ fontSize: '1.2rem' }}>
              {getNotificationIcon(notification.type)}
            </span>
          }
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

// Compatibility alias for existing SnackbarContext usage
export const useSnackbar = () => {
  const { showNotification, hideNotification } = useNotification();
  return {
    showSnackbar: showNotification,
    hideSnackbar: hideNotification
  };
}; 
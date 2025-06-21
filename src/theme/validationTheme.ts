import { createTheme, Theme } from '@mui/material/styles';

// Validation-specific color palette
export const validationColors = {
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#fff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#fff',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#fff',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#fff',
  }
};

// Global validation theme overrides for Material-UI components
export const createValidationTheme = (baseTheme: Theme) => createTheme({
  ...baseTheme,
  components: {
    ...baseTheme.components,
    
    // TextField validation styling
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            
            // Default state
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            
            // Hover state
            '&:hover fieldset': {
              borderColor: '#bdbdbd',
            },
            
            // Focused state
            '&.Mui-focused fieldset': {
              borderColor: baseTheme.palette.primary.main,
              borderWidth: 2,
            },
            
            // Error state
            '&.Mui-error': {
              '& fieldset': {
                borderColor: validationColors.error.main,
                borderWidth: 2,
              },
              '&:hover fieldset': {
                borderColor: validationColors.error.dark,
              },
              '&.Mui-focused fieldset': {
                borderColor: validationColors.error.main,
                borderWidth: 2,
                boxShadow: `0 0 0 2px ${validationColors.error.main}25`,
              },
            },
            
            // Success state (when field is valid)
            '&.validation-success': {
              '& fieldset': {
                borderColor: validationColors.success.main,
              },
              '&:hover fieldset': {
                borderColor: validationColors.success.dark,
              },
            },
          },
        },
      },
    },
    
    // FormHelperText (error messages) styling
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: 8,
          marginLeft: 14,
          fontSize: '0.75rem',
          fontWeight: 400,
          
          '&.Mui-error': {
            color: validationColors.error.main,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            
            '&::before': {
              content: '"⚠"',
              fontSize: '0.875rem',
            },
          },
          
          // Success helper text
          '&.validation-success': {
            color: validationColors.success.main,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            
            '&::before': {
              content: '"✓"',
              fontSize: '0.875rem',
            },
          },
        },
      },
    },
    
    // FormControl error styling
    MuiFormControl: {
      styleOverrides: {
        root: {
          '&.Mui-error': {
            '& .MuiInputLabel-root': {
              color: validationColors.error.main,
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: validationColors.error.main,
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    
    // Select component error styling
    MuiSelect: {
      styleOverrides: {
        root: {
          '&.Mui-error': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: validationColors.error.main,
              borderWidth: 2,
            },
          },
        },
      },
    },
    
    // Button styling for form actions
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          
          // Primary button with validation states
          '&.MuiButton-contained': {
            boxShadow: 'none',
            
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
            
            '&:disabled': {
              backgroundColor: '#f5f5f5',
              color: '#9e9e9e',
              cursor: 'not-allowed',
            },
          },
          
          // Error button variant
          '&.validation-error': {
            backgroundColor: validationColors.error.main,
            color: validationColors.error.contrastText,
            
            '&:hover': {
              backgroundColor: validationColors.error.dark,
            },
          },
          
          // Success button variant
          '&.validation-success': {
            backgroundColor: validationColors.success.main,
            color: validationColors.success.contrastText,
            
            '&:hover': {
              backgroundColor: validationColors.success.dark,
            },
          },
        },
      },
    },
    
    // Loading button styling
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          '&.button-loading': {
            color: 'inherit',
          },
        },
      },
    },
    
    // Snackbar styling for validation messages
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          
          '&.MuiAlert-filledError': {
            backgroundColor: validationColors.error.main,
          },
          
          '&.MuiAlert-filledSuccess': {
            backgroundColor: validationColors.success.main,
          },
          
          '&.MuiAlert-filledWarning': {
            backgroundColor: validationColors.warning.main,
          },
          
          '&.MuiAlert-filledInfo': {
            backgroundColor: validationColors.info.main,
          },
        },
      },
    },
  },
});

// Utility classes for validation states
export const validationClasses = {
  success: 'validation-success',
  error: 'validation-error',
  loading: 'button-loading',
};

// Helper function to get validation color
export const getValidationColor = (type: 'error' | 'success' | 'warning' | 'info') => {
  return validationColors[type];
};

// Helper function to apply validation styling to TextField
export const getTextFieldValidationProps = (
  error?: string,
  isValid?: boolean,
  showSuccess = false
) => {
  const hasError = !!error;
  const isSuccess = !hasError && isValid && showSuccess;
  
  return {
    error: hasError,
    helperText: error,
    className: isSuccess ? validationClasses.success : '',
    FormHelperTextProps: {
      className: isSuccess ? validationClasses.success : '',
    },
  };
};

// Helper function for FormControl validation styling
export const getFormControlValidationProps = (error?: string) => {
  return {
    error: !!error,
    className: error ? validationClasses.error : '',
  };
}; 
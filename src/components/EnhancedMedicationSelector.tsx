import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Chip
} from '@mui/material';
import { Add, Medication as MedicationIcon, LocalPharmacy } from '@mui/icons-material';
import {
  COMMON_MEDICATIONS,
  MEDICATION_CATEGORIES,
  searchMedications,
  getMedicationsByCategory,
  getMedicationById,
  type Medication
} from '../data/medications';

interface EnhancedMedicationSelectorProps {
  value: {
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
  };
  onChange: (value: {
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
  }) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  showDosageAndFrequency?: boolean;
}

// Custom storage for dynamically added medications
let customMedications: Medication[] = [];

const EnhancedMedicationSelector: React.FC<EnhancedMedicationSelectorProps> = ({
  value,
  onChange,
  label = "Medication",
  placeholder = "Select or type a medication name",
  helperText,
  error = false,
  disabled = false,
  fullWidth = true,
  showDosageAndFrequency = true
}) => {
  const [allMedications, setAllMedications] = useState<Medication[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<Medication[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [addNewMedicationOpen, setAddNewMedicationOpen] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    category: 'Other',
    commonDosages: [''],
    commonFrequencies: ['']
  });

  // Initialize medications (common + custom)
  useEffect(() => {
    const combined = [...COMMON_MEDICATIONS, ...customMedications];
    setAllMedications(combined);
    setFilteredOptions(combined);
  }, []);

  // Filter options based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredOptions(allMedications);
    } else {
      const filtered = searchMedications(inputValue);
      const customFiltered = customMedications.filter(medication =>
        medication.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions([...filtered, ...customFiltered]);
    }
  }, [inputValue, allMedications]);

  const handleMedicationSelect = (medication: Medication | null) => {
    if (medication) {
      // If it's a predefined medication with common dosages/frequencies, suggest them
      onChange({
        name: medication.name,
        dosage: value.dosage || '',
        frequency: value.frequency || '',
        duration: value.duration || ''
      });
    } else {
      onChange({
        name: '',
        dosage: '',
        frequency: '',
        duration: ''
      });
    }
  };

  const handleAddNewMedication = () => {
    if (!newMedication.name.trim()) return;

    const newMed: Medication = {
      id: `custom-${Date.now()}`,
      name: newMedication.name.trim(),
      category: newMedication.category,
      commonDosages: newMedication.commonDosages.filter(d => d.trim()),
      commonFrequencies: newMedication.commonFrequencies.filter(f => f.trim()),
      description: 'Custom medication added by user'
    };

    customMedications.push(newMed);
    const updatedMedications = [...COMMON_MEDICATIONS, ...customMedications];
    setAllMedications(updatedMedications);
    
    // Set the new medication as selected
    onChange({
      name: newMedication.name.trim(),
      dosage: value.dosage || '',
      frequency: value.frequency || '',
      duration: value.duration || ''
    });
    
    // Reset form
    setNewMedication({
      name: '',
      category: 'Other',
      commonDosages: [''],
      commonFrequencies: ['']
    });
    setAddNewMedicationOpen(false);
  };

  // Get selected medication for dosage/frequency suggestions
  const selectedMedication = allMedications.find(med => med.name === value.name);

  // Check if current value exists in options
  const currentMedicationExists = allMedications.some(medication => 
    medication.name.toLowerCase() === value.name.toLowerCase()
  );

  const handleDosageClick = (dosage: string) => {
    onChange({ ...value, dosage });
  };

  const handleFrequencyClick = (frequency: string) => {
    onChange({ ...value, frequency });
  };

  return (
    <>
      <Grid container spacing={2}>
        {/* Medication Name Selector */}
        <Grid item xs={12}>
          <Autocomplete
            fullWidth={fullWidth}
            disabled={disabled}
            options={filteredOptions}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
            value={allMedications.find(medication => medication.name === value.name) || null}
            onChange={(event, newValue) => handleMedicationSelect(newValue)}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            freeSolo
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                placeholder={placeholder}
                helperText={helperText}
                error={error}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <LocalPharmacy sx={{ color: 'primary.main', mr: 1 }} />
                  ),
                  endAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {params.InputProps.endAdornment}
                      <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={() => {
                          setNewMedication({ 
                            name: inputValue || '', 
                            category: 'Other',
                            commonDosages: [''],
                            commonFrequencies: ['']
                          });
                          setAddNewMedicationOpen(true);
                        }}
                        sx={{ minWidth: 'auto', p: 0.5 }}
                      >
                        Add
                      </Button>
                    </Box>
                  )
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.id}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.category}
                  </Typography>
                </Box>
              </Box>
            )}
            groupBy={(option) => option.category}
            renderGroup={(params) => (
              <Box key={params.key}>
                <Typography
                  variant="overline"
                  sx={{ 
                    px: 2, 
                    py: 1, 
                    backgroundColor: 'grey.100', 
                    fontWeight: 600,
                    display: 'block',
                    color: 'primary.main'
                  }}
                >
                  {params.group}
                </Typography>
                {params.children}
              </Box>
            )}
            ListboxProps={{
              style: { maxHeight: '300px' }
            }}
          />

          {/* Suggestion for non-existing medications */}
          {inputValue && !currentMedicationExists && inputValue.length > 2 && (
            <Alert 
              severity="info" 
              sx={{ mt: 1 }}
              action={
                <Button 
                  size="small" 
                  onClick={() => {
                    setNewMedication({ 
                      name: inputValue, 
                      category: 'Other',
                      commonDosages: [''],
                      commonFrequencies: ['']
                    });
                    setAddNewMedicationOpen(true);
                  }}
                >
                  Add "{inputValue}"
                </Button>
              }
            >
              Medication not found in our database. Would you like to add it?
            </Alert>
          )}
        </Grid>

        {/* Dosage and Frequency Fields */}
        {showDosageAndFrequency && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dosage"
                value={value.dosage || ''}
                onChange={(e) => onChange({ ...value, dosage: e.target.value })}
                placeholder="e.g., 500mg, 1 tablet, 2 capsules"
                helperText="Enter the strength/amount per dose"
              />
              {/* Dosage Suggestions */}
              {selectedMedication?.commonDosages && selectedMedication.commonDosages.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                    Common dosages:
                  </Typography>
                  {selectedMedication.commonDosages.map((dosage, index) => (
                    <Chip
                      key={index}
                      label={dosage}
                      size="small"
                      variant={value.dosage === dosage ? "filled" : "outlined"}
                      onClick={() => handleDosageClick(dosage)}
                      clickable
                      color="primary"
                    />
                  ))}
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Frequency"
                value={value.frequency || ''}
                onChange={(e) => onChange({ ...value, frequency: e.target.value })}
                placeholder="e.g., Twice daily, Every 8 hours"
                helperText="How often should it be taken"
              />
              {/* Frequency Suggestions */}
              {selectedMedication?.commonFrequencies && selectedMedication.commonFrequencies.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                    Common frequencies:
                  </Typography>
                  {selectedMedication.commonFrequencies.map((frequency, index) => (
                    <Chip
                      key={index}
                      label={frequency}
                      size="small"
                      variant={value.frequency === frequency ? "filled" : "outlined"}
                      onClick={() => handleFrequencyClick(frequency)}
                      clickable
                      color="primary"
                    />
                  ))}
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Duration (Optional)"
                value={value.duration || ''}
                onChange={(e) => onChange({ ...value, duration: e.target.value })}
                placeholder="e.g., 30 days, 3 months, As needed"
                helperText="How long to continue the medication"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Add New Medication Dialog */}
      <Dialog
        open={addNewMedicationOpen}
        onClose={() => setAddNewMedicationOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalPharmacy color="primary" />
            <Typography variant="h6">Add New Medication</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Medication Name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  placeholder="Enter the medication name"
                  helperText="Use generic name when possible (e.g., Ibuprofen instead of Advil)"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newMedication.category}
                    onChange={(e) => setNewMedication({ ...newMedication, category: e.target.value })}
                    label="Category"
                  >
                    {MEDICATION_CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Common Dosages (Optional)"
                  value={newMedication.commonDosages.join(', ')}
                  onChange={(e) => setNewMedication({ 
                    ...newMedication, 
                    commonDosages: e.target.value.split(',').map(d => d.trim()) 
                  })}
                  placeholder="e.g., 250mg, 500mg, 1000mg"
                  helperText="Separate multiple dosages with commas"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Common Frequencies (Optional)"
                  value={newMedication.commonFrequencies.join(', ')}
                  onChange={(e) => setNewMedication({ 
                    ...newMedication, 
                    commonFrequencies: e.target.value.split(',').map(f => f.trim()) 
                  })}
                  placeholder="e.g., Once daily, Twice daily"
                  helperText="Separate multiple frequencies with commas"
                />
              </Grid>
            </Grid>

            <Alert severity="success">
              <Typography variant="body2">
                <strong>Great!</strong> This medication will be added to your clinic's database and 
                will be available for future use by all users in your clinic.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddNewMedicationOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddNewMedication}
            disabled={!newMedication.name.trim()}
            startIcon={<Add />}
          >
            Add Medication
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EnhancedMedicationSelector; 
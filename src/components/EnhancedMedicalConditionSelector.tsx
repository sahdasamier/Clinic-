import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Chip,
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
  Divider
} from '@mui/material';
import { Add, LocalHospital } from '@mui/icons-material';
import {
  COMMON_MEDICAL_CONDITIONS,
  MEDICAL_CONDITION_CATEGORIES,
  searchMedicalConditions,
  getMedicalConditionsByCategory,
  type MedicalCondition
} from '../data/medicalConditions';

interface EnhancedMedicalConditionSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

// Custom storage for dynamically added conditions
let customConditions: MedicalCondition[] = [];

const EnhancedMedicalConditionSelector: React.FC<EnhancedMedicalConditionSelectorProps> = ({
  value,
  onChange,
  label = "Medical Condition",
  placeholder = "Select or type a medical condition",
  helperText,
  error = false,
  disabled = false,
  fullWidth = true
}) => {
  const [allConditions, setAllConditions] = useState<MedicalCondition[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<MedicalCondition[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [addNewConditionOpen, setAddNewConditionOpen] = useState(false);
  const [newCondition, setNewCondition] = useState({
    name: '',
    category: 'Other'
  });

  // Initialize conditions (common + custom)
  useEffect(() => {
    const combined = [...COMMON_MEDICAL_CONDITIONS, ...customConditions];
    setAllConditions(combined);
    setFilteredOptions(combined);
  }, []);

  // Filter options based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredOptions(allConditions);
    } else {
      const filtered = searchMedicalConditions(inputValue);
      const customFiltered = customConditions.filter(condition =>
        condition.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions([...filtered, ...customFiltered]);
    }
  }, [inputValue, allConditions]);

  const handleAddNewCondition = () => {
    if (!newCondition.name.trim()) return;

    const newMedicalCondition: MedicalCondition = {
      id: `custom-${Date.now()}`,
      name: newCondition.name.trim(),
      category: newCondition.category,
      description: 'Custom condition added by user'
    };

    customConditions.push(newMedicalCondition);
    const updatedConditions = [...COMMON_MEDICAL_CONDITIONS, ...customConditions];
    setAllConditions(updatedConditions);
    
    // Set the new condition as selected
    onChange(newCondition.name.trim());
    
    // Reset form
    setNewCondition({ name: '', category: 'Other' });
    setAddNewConditionOpen(false);
  };

  const groupedOptions = MEDICAL_CONDITION_CATEGORIES.map(category => ({
    category,
    conditions: filteredOptions.filter(condition => condition.category === category)
  })).filter(group => group.conditions.length > 0);

  // Check if current value exists in options
  const currentConditionExists = allConditions.some(condition => 
    condition.name.toLowerCase() === value.toLowerCase()
  );

  return (
    <>
      <Autocomplete
        fullWidth={fullWidth}
        disabled={disabled}
        options={filteredOptions}
        getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
        value={allConditions.find(condition => condition.name === value) || null}
        onChange={(event, newValue) => {
          if (newValue) {
            onChange(typeof newValue === 'string' ? newValue : newValue.name);
          } else {
            onChange('');
          }
        }}
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
                <LocalHospital sx={{ color: 'primary.main', mr: 1 }} />
              ),
              endAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {params.InputProps.endAdornment}
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => {
                      setNewCondition({ name: inputValue || '', category: 'Other' });
                      setAddNewConditionOpen(true);
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

      {/* Suggestion for non-existing conditions */}
      {inputValue && !currentConditionExists && inputValue.length > 2 && (
        <Alert 
          severity="info" 
          sx={{ mt: 1 }}
          action={
            <Button 
              size="small" 
              onClick={() => {
                setNewCondition({ name: inputValue, category: 'Other' });
                setAddNewConditionOpen(true);
              }}
            >
              Add "{inputValue}"
            </Button>
          }
        >
          Condition not found in our database. Would you like to add it?
        </Alert>
      )}

      {/* Add New Condition Dialog */}
      <Dialog
        open={addNewConditionOpen}
        onClose={() => setAddNewConditionOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalHospital color="primary" />
            <Typography variant="h6">Add New Medical Condition</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Condition Name"
              value={newCondition.name}
              onChange={(e) => setNewCondition({ ...newCondition, name: e.target.value })}
              placeholder="Enter the medical condition name"
              helperText="Be specific and use standard medical terminology when possible"
            />
            
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newCondition.category}
                onChange={(e) => setNewCondition({ ...newCondition, category: e.target.value })}
                label="Category"
              >
                {MEDICAL_CONDITION_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Alert severity="success">
              <Typography variant="body2">
                <strong>Great!</strong> This condition will be added to your clinic's database and 
                will be available for future use by all users in your clinic.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddNewConditionOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddNewCondition}
            disabled={!newCondition.name.trim()}
            startIcon={<Add />}
          >
            Add Condition
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EnhancedMedicalConditionSelector; 
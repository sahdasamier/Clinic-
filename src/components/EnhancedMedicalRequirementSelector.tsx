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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { Add, Science, LocalHospital, Assignment } from '@mui/icons-material';
import {
  COMMON_MEDICAL_REQUIREMENTS,
  REQUIREMENT_CATEGORIES,
  searchRequirements,
  getRequirementsByCategory,
  getRequirementById,
  type MedicalRequirement
} from '../data/medicalRequirements';

interface EnhancedMedicalRequirementSelectorProps {
  value: {
    type: string;
    title: string;
    description: string;
    priority: string;
    dueDate: string;
    estimatedTime?: string;
    preparations?: string[];
  };
  onChange: (value: {
    type: string;
    title: string;
    description: string;
    priority: string;
    dueDate: string;
    estimatedTime?: string;
    preparations?: string[];
  }) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

// Custom storage for dynamically added requirements
let customRequirements: MedicalRequirement[] = [];

const EnhancedMedicalRequirementSelector: React.FC<EnhancedMedicalRequirementSelectorProps> = ({
  value,
  onChange,
  label = "Medical Requirement",
  placeholder = "Select or type a medical requirement",
  helperText,
  error = false,
  disabled = false,
  fullWidth = true
}) => {
  const [allRequirements, setAllRequirements] = useState<MedicalRequirement[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<MedicalRequirement[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [addNewRequirementOpen, setAddNewRequirementOpen] = useState(false);
  const [newRequirement, setNewRequirement] = useState({
    title: '',
    type: '',
    category: 'Other',
    description: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent'
  });

  // Initialize requirements (common + custom)
  useEffect(() => {
    const combined = [...COMMON_MEDICAL_REQUIREMENTS, ...customRequirements];
    setAllRequirements(combined);
    setFilteredOptions(combined);
  }, []);

  // Filter options based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredOptions(allRequirements);
    } else {
      const filtered = searchRequirements(inputValue);
      const customFiltered = customRequirements.filter(requirement =>
        requirement.title.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions([...filtered, ...customFiltered]);
    }
  }, [inputValue, allRequirements]);

  const handleRequirementSelect = (requirement: MedicalRequirement | null) => {
    if (requirement) {
      onChange({
        type: requirement.type,
        title: requirement.title,
        description: requirement.description,
        priority: requirement.priority,
        dueDate: value.dueDate || '',
        estimatedTime: requirement.estimatedTime || '',
        preparations: requirement.preparations || []
      });
    } else {
      onChange({
        type: '',
        title: '',
        description: '',
        priority: 'normal',
        dueDate: '',
        estimatedTime: '',
        preparations: []
      });
    }
  };

  const handleAddNewRequirement = () => {
    if (!newRequirement.title.trim()) return;

    const newReq: MedicalRequirement = {
      id: `custom-${Date.now()}`,
      title: newRequirement.title.trim(),
      type: newRequirement.type || 'other',
      category: newRequirement.category,
      description: newRequirement.description || newRequirement.title,
      priority: newRequirement.priority,
      estimatedTime: 'TBD',
      preparations: []
    };

    customRequirements.push(newReq);
    const updatedRequirements = [...COMMON_MEDICAL_REQUIREMENTS, ...customRequirements];
    setAllRequirements(updatedRequirements);
    
    // Set the new requirement as selected
    onChange({
      type: newReq.type,
      title: newReq.title,
      description: newReq.description,
      priority: newReq.priority,
      dueDate: value.dueDate || ''
    });
    
    // Reset form
    setNewRequirement({
      title: '',
      type: '',
      category: 'Other',
      description: '',
      priority: 'normal'
    });
    setAddNewRequirementOpen(false);
  };

  // Get selected requirement for additional info display
  const selectedRequirement = allRequirements.find(req => req.title === value.title);

  // Check if current value exists in options
  const currentRequirementExists = allRequirements.some(requirement => 
    requirement.title.toLowerCase() === value.title.toLowerCase()
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'normal': return 'primary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lab': return <Science />;
      case 'imaging': return <Assignment />;
      case 'cardiac': case 'pulmonary': return <LocalHospital />;
      default: return <Assignment />;
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        {/* Requirement Selector */}
        <Grid item xs={12}>
          <Autocomplete
            fullWidth={fullWidth}
            disabled={disabled}
            options={filteredOptions}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.title}
            value={allRequirements.find(requirement => requirement.title === value.title) || null}
            onChange={(event, newValue) => {
              if (typeof newValue === 'string') {
                // Handle free text input
                onChange({
                  type: 'other',
                  title: newValue,
                  description: '',
                  priority: 'normal',
                  dueDate: value.dueDate || '',
                  estimatedTime: '',
                  preparations: []
                });
              } else {
                handleRequirementSelect(newValue);
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
                          setNewRequirement({ 
                            title: inputValue || '', 
                            type: '',
                            category: 'Other',
                            description: '',
                            priority: 'normal'
                          });
                          setAddNewRequirementOpen(true);
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
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                  {getTypeIcon(option.type)}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">{option.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.category} • {option.estimatedTime || 'Time TBD'}
                    </Typography>
                  </Box>
                  <Chip 
                    label={option.priority} 
                    size="small" 
                    color={getPriorityColor(option.priority) as any}
                    variant="outlined"
                  />
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

          {/* Suggestion for non-existing requirements */}
          {inputValue && !currentRequirementExists && inputValue.length > 2 && (
            <Alert 
              severity="info" 
              sx={{ mt: 1 }}
              action={
                <Button 
                  size="small" 
                  onClick={() => {
                    setNewRequirement({ 
                      title: inputValue, 
                      type: '',
                      category: 'Other',
                      description: '',
                      priority: 'normal'
                    });
                    setAddNewRequirementOpen(true);
                  }}
                >
                  Add "{inputValue}"
                </Button>
              }
            >
              Requirement not found in our database. Would you like to add it?
            </Alert>
          )}
        </Grid>

        {/* Additional Fields */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={value.priority || 'normal'}
              onChange={(e) => onChange({ ...value, priority: e.target.value })}
              label="Priority"
            >
              <MenuItem value="low">Low Priority</MenuItem>
              <MenuItem value="normal">Normal Priority</MenuItem>
              <MenuItem value="high">High Priority</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Due Date (Optional)"
            value={value.dueDate || ''}
            onChange={(e) => onChange({ ...value, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
            helperText="When should this be completed"
          />
        </Grid>

        {/* Selected Requirement Details */}
        {selectedRequirement && (
          <Grid item xs={12}>
            <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Requirement Details:
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {selectedRequirement.description}
              </Typography>
              {selectedRequirement.preparations && selectedRequirement.preparations.length > 0 && (
                <Box>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                    Patient Preparations:
                  </Typography>
                  <List dense sx={{ mt: 0.5 }}>
                    {selectedRequirement.preparations.map((prep, index) => (
                      <ListItem key={index} sx={{ py: 0, px: 0 }}>
                        <ListItemText 
                          primary={prep} 
                          primaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Add New Requirement Dialog */}
      <Dialog
        open={addNewRequirementOpen}
        onClose={() => setAddNewRequirementOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalHospital color="primary" />
            <Typography variant="h6">Add New Medical Requirement</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Requirement Title"
                  value={newRequirement.title}
                  onChange={(e) => setNewRequirement({ ...newRequirement, title: e.target.value })}
                  placeholder="Enter the requirement name"
                  helperText="Be specific about what test or procedure is needed"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newRequirement.category}
                    onChange={(e) => setNewRequirement({ ...newRequirement, category: e.target.value })}
                    label="Category"
                  >
                    {REQUIREMENT_CATEGORIES.map((category) => (
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
                  label="Type"
                  value={newRequirement.type}
                  onChange={(e) => setNewRequirement({ ...newRequirement, type: e.target.value })}
                  placeholder="e.g., lab, imaging, cardiac"
                  helperText="Type of requirement (optional)"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newRequirement.priority}
                    onChange={(e) => setNewRequirement({ ...newRequirement, priority: e.target.value as any })}
                    label="Priority"
                  >
                    <MenuItem value="low">Low Priority</MenuItem>
                    <MenuItem value="normal">Normal Priority</MenuItem>
                    <MenuItem value="high">High Priority</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={newRequirement.description}
                  onChange={(e) => setNewRequirement({ ...newRequirement, description: e.target.value })}
                  placeholder="Detailed description of what needs to be done"
                  helperText="Optional: Add detailed instructions or notes"
                />
              </Grid>
            </Grid>

            <Alert severity="success">
              <Typography variant="body2">
                <strong>Great!</strong> This requirement will be added to your clinic's database and 
                will be available for future use by all doctors in your clinic.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddNewRequirementOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddNewRequirement}
            disabled={!newRequirement.title.trim()}
            startIcon={<Add />}
          >
            Add Requirement
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EnhancedMedicalRequirementSelector; 
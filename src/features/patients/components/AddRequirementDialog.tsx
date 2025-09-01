import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography
} from '@mui/material';
import { Add, LocalHospital } from '@mui/icons-material';
import EnhancedMedicalRequirementSelector from './EnhancedMedicalRequirementSelector';

interface AddRequirementDialogProps {
  open: boolean;
  onClose: () => void;
  newRequirement: {
    type: string;
    title: string;
    description: string;
    priority: string;
    dueDate: string;
    status: string;
    estimatedTime: string;
    preparations: string[];
  };
  setNewRequirement: React.Dispatch<React.SetStateAction<{
    type: string;
    title: string;
    description: string;
    priority: string;
    dueDate: string;
    status: string;
    estimatedTime: string;
    preparations: string[];
  }>>;
  onAdd: () => void;
}

const AddRequirementDialog: React.FC<AddRequirementDialogProps> = ({
  open,
  onClose,
  newRequirement,
  setNewRequirement,
  onAdd
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospital color="primary" />
          <Typography variant="h6">Add Medical Requirement</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <EnhancedMedicalRequirementSelector
            value={newRequirement}
            onChange={(value) => setNewRequirement({ ...newRequirement, ...value })}
            label="Medical Requirement"
            placeholder="Select or type a medical requirement"
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={onAdd}
          disabled={!newRequirement.title.trim()}
          startIcon={<Add />}
        >
          Add Requirement
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRequirementDialog;
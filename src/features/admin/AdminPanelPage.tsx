import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  doc, 
  query, 
  orderBy,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../../api/firebase';
import { AuthContext } from '../../app/AuthProvider';
import { Clinic, User } from '../../types/models';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AdminPanelSettings,
  Add,
  Business,
  People,
  ExitToApp,
  Refresh,
  Delete,
  Warning,
  Edit,
} from '@mui/icons-material';

const AdminPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState(0);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [clinicDialogOpen, setClinicDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'clinic' | 'user', id: string, name: string} | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  
  // Form states
  const [newClinic, setNewClinic] = useState({
    name: '',
    subscriptionPlan: 'basic' as 'basic' | 'premium' | 'enterprise',
    maxUsers: 10,
  });
  
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'receptionist' as 'management' | 'doctor' | 'receptionist',
    clinicId: '',
    password: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchClinics(), fetchUsers()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchClinics = async () => {
    const clinicsQuery = query(collection(db, 'clinics'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(clinicsQuery);
    const clinicsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Clinic[];
    setClinics(clinicsData);
  };

  const fetchUsers = async () => {
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(usersQuery);
    const usersData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
    setUsers(usersData);
  };

  const handleCreateClinic = async () => {
    // Validation
    if (!newClinic.name) {
      setError('Please enter a clinic name');
      return;
    }
    
    try {
      await addDoc(collection(db, 'clinics'), {
        name: newClinic.name,
        isActive: true,
        settings: {
          allowedFeatures: ['patients', 'appointments', 'payments'],
          maxUsers: newClinic.maxUsers,
          subscriptionPlan: newClinic.subscriptionPlan,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user?.email || '',
      });
      
      resetClinicForm();
      setClinicDialogOpen(false);
      fetchClinics();
    } catch (error) {
      console.error('Error creating clinic:', error);
      setError('Failed to create clinic');
    }
  };

  const handleUpdateClinic = async () => {
    if (!editingClinic) return;
    
    // Validation
    if (!newClinic.name) {
      setError('Please enter a clinic name');
      return;
    }
    
    try {
      await updateDoc(doc(db, 'clinics', editingClinic.id), {
        name: newClinic.name,
        settings: {
          ...editingClinic.settings,
          maxUsers: newClinic.maxUsers,
          subscriptionPlan: newClinic.subscriptionPlan,
        },
        updatedAt: serverTimestamp(),
      });
      
      resetClinicForm();
      setClinicDialogOpen(false);
      setEditingClinic(null);
      fetchClinics();
    } catch (error) {
      console.error('Error updating clinic:', error);
      setError('Failed to update clinic');
    }
  };

  const resetClinicForm = () => {
    setNewClinic({
      name: '',
      subscriptionPlan: 'basic',
      maxUsers: 10,
    });
  };

  const handleEditClinic = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setNewClinic({
      name: clinic.name,
      subscriptionPlan: clinic.settings.subscriptionPlan,
      maxUsers: clinic.settings.maxUsers,
    });
    setClinicDialogOpen(true);
  };

  const handleClinicDialogClose = () => {
    setClinicDialogOpen(false);
    setEditingClinic(null);
    resetClinicForm();
  };

  const handleCreateUser = async () => {
    // Validation
    if (!newUser.email || !newUser.firstName || !newUser.lastName || !newUser.clinicId || !newUser.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      // In a real app, you'd create the user account using Firebase Admin SDK
      // For now, we'll just create the user document
      await addDoc(collection(db, 'users'), {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        clinicId: newUser.clinicId,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user?.email || '',
      });
      
      resetUserForm();
      setUserDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    // Validation
    if (!newUser.email || !newUser.firstName || !newUser.lastName || !newUser.clinicId) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      await updateDoc(doc(db, 'users', editingUser.id), {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        clinicId: newUser.clinicId,
        updatedAt: serverTimestamp(),
      });
      
      resetUserForm();
      setUserDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    }
  };

  const resetUserForm = () => {
    setNewUser({
      email: '',
      firstName: '',
      lastName: '',
      role: 'receptionist',
      clinicId: '',
      password: '',
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      clinicId: user.clinicId,
      password: '', // Don't show existing password
    });
    setUserDialogOpen(true);
  };

  const handleUserDialogClose = () => {
    setUserDialogOpen(false);
    setEditingUser(null);
    resetUserForm();
  };

  const toggleClinicStatus = async (clinicId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'clinics', clinicId), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      fetchClinics();
    } catch (error) {
      console.error('Error updating clinic status:', error);
      setError('Failed to update clinic status');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp(),
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status');
    }
  };

  const handleDeleteClinic = async () => {
    if (!itemToDelete || itemToDelete.type !== 'clinic') return;
    
    try {
      await deleteDoc(doc(db, 'clinics', itemToDelete.id));
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      fetchClinics();
    } catch (error) {
      console.error('Error deleting clinic:', error);
      setError('Failed to delete clinic');
    }
  };

  const handleDeleteUser = async () => {
    if (!itemToDelete || itemToDelete.type !== 'user') return;
    
    try {
      await deleteDoc(doc(db, 'users', itemToDelete.id));
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  const confirmDelete = (type: 'clinic' | 'user', id: string, name: string) => {
    setItemToDelete({ type, id, name });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete?.type === 'clinic') {
      handleDeleteClinic();
    } else if (itemToDelete?.type === 'user') {
      handleDeleteUser();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getClinicName = (clinicId: string) => {
    const clinic = clinics.find(c => c.id === clinicId);
    return clinic?.name || 'Unknown Clinic';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ backgroundColor: '#7C3AED' }}>
        <Toolbar>
          <AdminPanelSettings sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Super Admin Panel
          </Typography>
          <Button 
            color="inherit" 
            onClick={fetchData}
            startIcon={<Refresh />}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <IconButton color="inherit" onClick={handleSignOut}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Clinics
                </Typography>
                <Typography variant="h4">
                  {clinics.length}
                </Typography>
                <Typography color="textSecondary">
                  {clinics.filter(c => c.isActive).length} active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">
                  {users.length}
                </Typography>
                <Typography color="textSecondary">
                  {users.filter(u => u.isActive).length} active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Clinics Management" icon={<Business />} />
            <Tab label="Users Management" icon={<People />} />
          </Tabs>
        </Box>

        {/* Clinics Tab */}
        {activeTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5">Clinics</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setClinicDialogOpen(true)}
                sx={{ backgroundColor: '#7C3AED' }}
              >
                Add Clinic
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Max Users</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clinics.map((clinic) => (
                    <TableRow key={clinic.id}>
                      <TableCell>{clinic.name}</TableCell>
                      <TableCell>
                        <Chip label={clinic.settings.subscriptionPlan} size="small" />
                      </TableCell>
                      <TableCell>{clinic.settings.maxUsers}</TableCell>
                      <TableCell>
                        <Chip 
                          label={clinic.isActive ? 'Active' : 'Inactive'} 
                          color={clinic.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(clinic.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch
                            checked={clinic.isActive}
                            onChange={() => toggleClinicStatus(clinic.id, clinic.isActive)}
                          />
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleEditClinic(clinic)}
                            title="Edit Clinic"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => confirmDelete('clinic', clinic.id, clinic.name)}
                            title="Delete Clinic"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Users Tab */}
        {activeTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5">Users</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setUserDialogOpen(true)}
                sx={{ backgroundColor: '#7C3AED' }}
              >
                Add User
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Clinic</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" />
                      </TableCell>
                      <TableCell>{getClinicName(user.clinicId)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.isActive ? 'Active' : 'Inactive'} 
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch
                            checked={user.isActive}
                            onChange={() => toggleUserStatus(user.id, user.isActive)}
                          />
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleEditUser(user)}
                            title="Edit User"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => confirmDelete('user', user.id, `${user.firstName} ${user.lastName}`)}
                            title="Delete User"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Container>

      {/* Create/Edit Clinic Dialog */}
      <Dialog open={clinicDialogOpen} onClose={handleClinicDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingClinic ? 'Edit Clinic' : 'Create New Clinic'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Clinic Name"
            fullWidth
            variant="outlined"
            value={newClinic.name}
            onChange={(e) => setNewClinic({...newClinic, name: e.target.value})}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Subscription Plan</InputLabel>
            <Select
              value={newClinic.subscriptionPlan}
              label="Subscription Plan"
              onChange={(e) => setNewClinic({...newClinic, subscriptionPlan: e.target.value as any})}
            >
              <MenuItem value="basic">Basic</MenuItem>
              <MenuItem value="premium">Premium</MenuItem>
              <MenuItem value="enterprise">Enterprise</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Max Users"
            type="number"
            fullWidth
            variant="outlined"
            value={newClinic.maxUsers}
            onChange={(e) => setNewClinic({...newClinic, maxUsers: parseInt(e.target.value)})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClinicDialogClose}>Cancel</Button>
          <Button 
            onClick={editingClinic ? handleUpdateClinic : handleCreateClinic} 
            variant="contained"
          >
            {editingClinic ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit User Dialog */}
      <Dialog open={userDialogOpen} onClose={handleUserDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="First Name"
                fullWidth
                variant="outlined"
                value={newUser.firstName}
                onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Last Name"
                fullWidth
                variant="outlined"
                value={newUser.lastName}
                onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  label="Role"
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                >
                  <MenuItem value="management">Management</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="receptionist">Receptionist</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Clinic</InputLabel>
                <Select
                  value={newUser.clinicId}
                  label="Clinic"
                  onChange={(e) => setNewUser({...newUser, clinicId: e.target.value})}
                >
                  {clinics.filter(c => c.isActive).map((clinic) => (
                    <MenuItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {!editingUser && (
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Temporary Password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  helperText="User will be asked to change this on first login"
                />
              </Grid>
            )}
            {editingUser && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                  Note: Password changes must be handled through the authentication system separately.
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUserDialogClose}>Cancel</Button>
          <Button 
            onClick={editingUser ? handleUpdateUser : handleCreateUser} 
            variant="contained"
          >
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="error" />
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete {' '}
            <strong>{itemToDelete?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action cannot be undone. {itemToDelete?.type === 'clinic' 
              ? 'All users and data associated with this clinic will become inaccessible.' 
              : 'This user will be completely removed from the system.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error"
            startIcon={<Delete />}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanelPage; 
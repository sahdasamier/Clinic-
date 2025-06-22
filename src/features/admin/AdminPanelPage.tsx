import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, createUserWithEmailAndPassword, updateProfile, getAuth, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
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
  serverTimestamp,
  setDoc 
} from 'firebase/firestore';
import { auth, db, firebaseConfig } from '../../api/firebase';
import { createUserAccount, createUserInvitation, isValidEmail, checkEmailExists, doubleCheckEmailBeforeCreation, createUserAccountWithCleanup, suggestAlternativeEmails } from '../../api/auth';
import { fixClinicAccess } from '../../utils/clinicUtils';
import { initializeDemoClinicAfterAuth } from '../../scripts/initFirestore';
import { useAuth } from '../../contexts/AuthContext';
import { Clinic, User } from '../../types/models';
import { validateUserLimit, getPlanInfo, canAddUser } from '../../utils/subscriptionUtils';
import { formatDateForTable, formatDateTime, formatDateForInput, timestampToDate, getRelativeTime } from '../../utils/dateUtils';
import { UserPermissions } from '../../types/permissions';
import PermissionsManager from '../../components/PermissionsManager';
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
  InputAdornment,
  Snackbar,
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
  Security,
  Visibility,
  VisibilityOff,
  ContentCopy,
  AutorenewRounded,
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';

const AdminPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [userForPermissions, setUserForPermissions] = useState<User | null>(null);
  
  // Add this near your other dialog state declarations
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  
  // Password success dialog
  const [passwordSuccessOpen, setPasswordSuccessOpen] = useState(false);
  const [createdUserCredentials, setCreatedUserCredentials] = useState<{email: string, password: string, name: string} | null>(null);
  
  // Email validation
  const [emailValidation, setEmailValidation] = useState<{
    isChecking: boolean;
    isValid: boolean;
    error: string;
    exists: boolean;
  }>({
    isChecking: false,
    isValid: true,
    error: '',
    exists: false
  });
  
  // Password visibility and notifications
  const [showTempPassword, setShowTempPassword] = useState(true); // Show password by default
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [generatedPasswords, setGeneratedPasswords] = useState<{[userId: string]: string}>({});
  
  // Form states
  const [newClinic, setNewClinic] = useState({
    name: '',
    subscriptionPlan: 'basic' as 'basic' | 'premium' | 'enterprise',
    maxUsers: 10,
    createdAt: '',
  });
  
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'receptionist' as 'management' | 'doctor' | 'receptionist',
    clinicId: '',
    password: '',
    createdAt: '',
  });

  // Debug Auth State - Temporary debugging code
  useEffect(() => {
    console.log('🔍 Debug Auth State:');
    console.log('User from AuthContext:', user);
    console.log('Firebase Auth Current User:', auth.currentUser);
    console.log('User Email:', user?.email || auth.currentUser?.email);
    console.log('User UID:', user?.uid || auth.currentUser?.uid);
  }, [user]);

  useEffect(() => {
    fetchData();
    
    // Initialize demo clinic after admin authentication
    if (user?.email) {
      initializeDemoClinicAfterAuth().catch(error => {
        console.warn('⚠️ Post-auth demo clinic initialization failed:', error);
      });
    }
  }, [user]);

  // Helper functions for password management
  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setNewUser({...newUser, password: newPassword});
    setShowTempPassword(true); // Always show password when generated
    showSnackbar('Password generated and visible!');
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(newUser.password);
      showSnackbar('Password copied to clipboard');
    } catch (error) {
      console.error('Failed to copy password:', error);
      showSnackbar('Failed to copy password');
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // Simple email validation - orphaned accounts handled during creation
  const handleEmailChange = (email: string) => {
    setNewUser({...newUser, email});
    
    // Clear previous errors
    setError('');
    
    // Simple format validation only
    if (email.trim() && !isValidEmail(email)) {
      setEmailValidation({
        isChecking: false,
        isValid: false,
        error: 'Please enter a valid email format',
        exists: false
      });
    } else {
      setEmailValidation({
        isChecking: false,
        isValid: true,
        error: '',
        exists: false
      });
    }
  };

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
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
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

    // Check if new max users is valid for the plan
    const currentUserCount = users.filter(u => u.clinicId === editingClinic.id && u.isActive).length;
    const validation = validateUserLimit(
      newClinic.subscriptionPlan,
      newClinic.maxUsers,
      0 // Don't check current count when editing clinic
    );
    
    if (!validation.isValid) {
      setError(validation.message || 'Invalid user limit for selected plan');
      return;
    }

    // Check if reducing max users below current active users
    if (newClinic.maxUsers < currentUserCount) {
      setError(`Cannot set max users to ${newClinic.maxUsers}. Currently has ${currentUserCount} active users.`);
      return;
    }
    
    try {
      const updateData: any = {
        name: newClinic.name,
        settings: {
          ...editingClinic.settings,
          maxUsers: newClinic.maxUsers,
          subscriptionPlan: newClinic.subscriptionPlan,
        },
        updatedAt: serverTimestamp(),
      };

      // Update creation date if provided and different
      if (newClinic.createdAt && newClinic.createdAt !== formatDateForInput(editingClinic.createdAt)) {
        updateData.createdAt = new Date(newClinic.createdAt);
      }

      await updateDoc(doc(db, 'clinics', editingClinic.id), updateData);
      
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
      createdAt: '',
    });
  };

  const handleEditClinic = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setNewClinic({
      name: clinic.name,
      subscriptionPlan: clinic.settings.subscriptionPlan,
      maxUsers: clinic.settings.maxUsers,
      createdAt: formatDateForInput(clinic.createdAt),
    });
    setClinicDialogOpen(true);
  };

  const handleClinicDialogClose = () => {
    setClinicDialogOpen(false);
    setEditingClinic(null);
    resetClinicForm();
  };

  const handleCreateUser = async () => {
    // Store current admin user
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser?.email;
    
    if (!currentUserEmail) {
      setError('Admin session lost. Please refresh and try again.');
      return;
    }

    // Clear previous errors
    setError('');
    
    // Basic validation
    if (!newUser.email?.trim() || !newUser.firstName?.trim() || !newUser.lastName?.trim() || !newUser.clinicId || !newUser.password?.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!isValidEmail(newUser.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      showSnackbar('Creating user account...');
      
      // Create a secondary Firebase app instance to avoid signing out admin
      const secondaryApp = initializeApp(firebaseConfig, 'secondary');
      const secondaryAuth = getAuth(secondaryApp);
      
      // Create user with secondary auth (won't affect main session)
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        newUser.email.trim(), 
        newUser.password
      );
      const newUserId = userCredential.user.uid;
      
      // Delete the secondary app
      await deleteApp(secondaryApp);
      
      // Create Firestore document using admin privileges
      const userDoc = {
        id: newUserId,
        email: newUser.email.trim(),
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        role: newUser.role,
        clinicId: newUser.clinicId,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUserEmail,
      };
      
      await setDoc(doc(db, 'users', newUserId), userDoc);
      
      // Store password for display
      setGeneratedPasswords(prev => ({
        ...prev,
        [newUser.email.trim()]: newUser.password
      }));
      
      setCreatedUserCredentials({
        email: newUser.email.trim(),
        password: newUser.password,
        name: `${newUser.firstName.trim()} ${newUser.lastName.trim()}`
      });
      
      resetUserForm();
      setUserDialogOpen(false);
      setPasswordSuccessOpen(true);
      fetchUsers();
      showSnackbar('✅ User account created successfully!');
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(`Failed to create user: ${error.message}`);
      showSnackbar('❌ Failed to create user');
    } finally {
      setLoading(false);
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
      const updateData: any = {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        clinicId: newUser.clinicId,
        updatedAt: serverTimestamp(),
      };

      // Update creation date if provided and different
      if (newUser.createdAt && newUser.createdAt !== formatDateForInput(editingUser.createdAt)) {
        updateData.createdAt = new Date(newUser.createdAt);
      }

      await updateDoc(doc(db, 'users', editingUser.id), updateData);
      
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
      createdAt: '',
    });
    setShowTempPassword(true); // Show password by default for new users
    
    // Reset email validation
    setEmailValidation({
      isChecking: false,
      isValid: true,
      error: '',
      exists: false
    });
    
    // Clear any pending validation timeouts
    clearTimeout((window as any).emailValidationTimeout);
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
      createdAt: formatDateForInput(user.createdAt),
    });
    setUserDialogOpen(true);
  };

  const handleUserDialogClose = () => {
    setUserDialogOpen(false);
    setEditingUser(null);
    resetUserForm();
  };

  const handleManagePermissions = (user: User) => {
    setUserForPermissions(user);
    setPermissionsDialogOpen(true);
  };

  const handleSavePermissions = async (permissions: UserPermissions) => {
    if (!userForPermissions) return;

    try {
      await updateDoc(doc(db, 'users', userForPermissions.id), {
        permissions,
        updatedAt: serverTimestamp(),
      });
      
      fetchUsers(); // Refresh user list
      setPermissionsDialogOpen(false);
      setUserForPermissions(null);
    } catch (error) {
      console.error('Error updating user permissions:', error);
      setError('Failed to update user permissions');
    }
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
      // Find the user to get their email
      const userToDelete = users.find(u => u.id === itemToDelete.id);
      const userEmail = userToDelete?.email;
      
      if (!userEmail) {
        setError('User email not found');
        return;
      }

      // Delete the Firestore document first
      await deleteDoc(doc(db, 'users', itemToDelete.id));
      
      // Try to delete Firebase Auth account if we have the password
      let authDeleted = false;
      const userPassword = generatedPasswords[userEmail];
      
      if (userPassword) {
        try {
          // Create secondary Firebase app to avoid affecting admin session
          const secondaryApp = initializeApp(firebaseConfig, `delete-${Date.now()}`);
          const secondaryAuth = getAuth(secondaryApp);
          
          // Sign in as the user to be deleted
          const userCredential = await signInWithEmailAndPassword(secondaryAuth, userEmail, userPassword);
          
          // Delete the user account
          await deleteUser(userCredential.user);
          
          // Clean up secondary app
          await deleteApp(secondaryApp);
          
          authDeleted = true;
          console.log(`✅ Firebase Auth account deleted: ${userEmail}`);
          
        } catch (authError: any) {
          console.warn(`⚠️ Could not delete Firebase Auth account for ${userEmail}:`, authError);
          // Continue anyway - database deletion was successful
        }
      }
      
      // Remove from generated passwords if it exists
      if (generatedPasswords[userEmail]) {
        setGeneratedPasswords(prev => {
          const newPasswords = { ...prev };
          delete newPasswords[userEmail];
          return newPasswords;
        });
      }
      
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      fetchUsers();
      
      // Show appropriate success message
      if (authDeleted) {
        showSnackbar(`✅ User ${userEmail} completely deleted (database + auth)`);
      } else if (userPassword) {
        showSnackbar(`⚠️ User ${userEmail} database deleted, auth deletion failed`);
      } else {
        showSnackbar(`✅ User ${userEmail} database deleted (auth account remains - no password available)`);
      }
      
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
      showSnackbar('❌ Failed to delete user');
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

  const handleFixClinicAccess = async () => {
    try {
      setLoading(true);
      showSnackbar('🔧 Fixing clinic access...');
      
      const success = await fixClinicAccess('demo-clinic');
      
      if (success) {
        showSnackbar('✅ Demo clinic access fixed! Users should now be able to login.');
      } else {
        showSnackbar('❌ Failed to fix clinic access. Check console for details.');
      }
    } catch (error) {
      console.error('Error fixing clinic access:', error);
      showSnackbar('❌ Error fixing clinic access');
    } finally {
      setLoading(false);
    }
  };

  // Debug function to check for common orphaned accounts
  const handleCheckOrphanedAccounts = async () => {
    try {
      setLoading(true);
      showSnackbar('🔍 Checking for orphaned accounts...');
      
      const commonEmails = [
        'test@example.com',
        'admin@test.com',
        'user@clinic.com',
        'doctor@clinic.com',
        'receptionist@clinic.com'
      ];
      
      let orphanedCount = 0;
      
      for (const email of commonEmails) {
        try {
          const exists = await checkEmailExists(email);
          if (exists) {
            console.warn(`🚨 Orphaned account found: ${email}`);
            orphanedCount++;
          }
        } catch (error) {
          console.error(`Error checking ${email}:`, error);
        }
      }
      
      if (orphanedCount > 0) {
        showSnackbar(`⚠️ Found ${orphanedCount} potential orphaned accounts. Check console for details.`);
      } else {
        showSnackbar('✅ No orphaned accounts found in common email list.');
      }
      
    } catch (error) {
      console.error('Error checking orphaned accounts:', error);
      showSnackbar('❌ Error checking orphaned accounts');
    } finally {
      setLoading(false);
    }
  };

  const getClinicName = (clinicId: string) => {
    const clinic = clinics.find(c => c.id === clinicId);
    return clinic?.name || 'Unknown Clinic';
  };

  const getClinicUserCount = (clinicId: string) => {
    return users.filter(u => u.clinicId === clinicId && u.isActive).length;
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
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button 
            color="inherit" 
            onClick={handleFixClinicAccess}
            startIcon={<Warning />}
            sx={{ mr: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            title="Fix clinic access issues (if users can't login)"
          >
            Fix Access
          </Button>
          <Button 
            color="inherit" 
            onClick={handleCheckOrphanedAccounts}
            startIcon={<Security />}
            sx={{ mr: 2, backgroundColor: 'rgba(255,255,255,0.1)' }}
            title="Check for orphaned Firebase Auth accounts"
          >
            Check Orphans
          </Button>
          <IconButton color="inherit" onClick={handleSignOut}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
              {error}
            </Box>
          </Alert>
        )}

        {/* Admin Info Panel */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            🔐 Admin-Only User Management:
          </Typography>
          <Typography variant="body2">
            • Only administrators can create user accounts (no self-registration)
            • Generated passwords are visible in the Password column and success dialog
            • If users can't login after creation, click "Fix Access" button above
            • Share credentials securely with users via secure channels
          </Typography>
        </Alert>



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
                    <TableCell>Users</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clinics.map((clinic) => {
                    const currentUsers = getClinicUserCount(clinic.id);
                    const maxUsers = clinic.settings.maxUsers;
                    const planInfo = getPlanInfo(clinic.settings.subscriptionPlan);
                    const isNearLimit = currentUsers / maxUsers > 0.8;
                    const isAtLimit = currentUsers >= maxUsers;

                    return (
                      <TableRow key={clinic.id}>
                        <TableCell>{clinic.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={planInfo.name} 
                            size="small"
                            color={planInfo.color as any}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                              color={isAtLimit ? 'error' : isNearLimit ? 'warning.main' : 'text.primary'}
                              fontWeight={isAtLimit ? 'bold' : 'normal'}
                            >
                              {currentUsers}/{maxUsers}
                            </Typography>
                            {isAtLimit && (
                              <Chip label="FULL" size="small" color="error" />
                            )}
                            {isNearLimit && !isAtLimit && (
                              <Chip label="NEAR LIMIT" size="small" color="warning" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={clinic.isActive ? 'Active' : 'Inactive'} 
                            color={clinic.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={formatDateTime(clinic.createdAt)} arrow>
                            <Box sx={{ cursor: 'pointer' }}>
                              <Typography variant="body2">
                                {formatDateForTable(clinic.createdAt)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getRelativeTime(clinic.createdAt)}
                              </Typography>
                            </Box>
                          </Tooltip>
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
                    );
                  })}
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
                    <TableCell>Password</TableCell>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {generatedPasswords[user.email] ? (
                            <>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                {generatedPasswords[user.email]}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  navigator.clipboard.writeText(generatedPasswords[user.email]);
                                  showSnackbar('Password copied to clipboard');
                                }}
                                title="Copy password"
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Set by user
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.isActive ? 'Active' : 'Inactive'} 
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={formatDateTime(user.createdAt)} arrow>
                          <Box sx={{ cursor: 'pointer' }}>
                            <Typography variant="body2">
                              {formatDateForTable(user.createdAt)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getRelativeTime(user.createdAt)}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch
                            checked={user.isActive}
                            onChange={() => toggleUserStatus(user.id, user.isActive)}
                          />
                          <IconButton
                            color="secondary"
                            size="small"
                            onClick={() => handleManagePermissions(user)}
                            title="Manage Permissions"
                          >
                            <Security />
                          </IconButton>
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
            sx={{ mb: 2 }}
          />
          {editingClinic && (
            <TextField
              margin="dense"
              label="Created Date"
              type="date"
              fullWidth
              variant="outlined"
              value={newClinic.createdAt}
              onChange={(e) => setNewClinic({...newClinic, createdAt: e.target.value})}
              InputLabelProps={{ shrink: true }}
              helperText="Change the creation date if needed"
            />
          )}
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
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Create New User'}
          {!editingUser && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 'normal' }}>
              🔐 Admin-only user creation - Only administrators can create user accounts
            </Typography>
          )}
        </DialogTitle>
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
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={newUser.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                error={!emailValidation.isValid}
                helperText={
                  emailValidation.isChecking 
                    ? "Checking email availability..." 
                    : emailValidation.error || 
                      (emailValidation.isValid && newUser.email && !emailValidation.exists 
                        ? "✅ Email is available" 
                        : "")
                }
                InputProps={{
                  endAdornment: emailValidation.isChecking ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : emailValidation.isValid && newUser.email && !emailValidation.exists ? (
                    <InputAdornment position="end">
                      <Typography sx={{ color: 'success.main', fontSize: '1.2rem' }}>✅</Typography>
                    </InputAdornment>
                  ) : emailValidation.error ? (
                    <InputAdornment position="end">
                      <Typography sx={{ color: 'error.main', fontSize: '1.2rem' }}>❌</Typography>
                    </InputAdornment>
                  ) : null
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderColor: emailValidation.isValid ? 'inherit' : 'error.main',
                  }
                }}
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
                  {clinics.filter(c => c.isActive).map((clinic) => {
                    const currentUsers = getClinicUserCount(clinic.id);
                    const remaining = clinic.settings.maxUsers - currentUsers;
                    const isAtLimit = remaining <= 0;
                    
                    return (
                      <MenuItem 
                        key={clinic.id} 
                        value={clinic.id}
                        disabled={isAtLimit && !editingUser}
                      >
                        {clinic.name} ({currentUsers}/{clinic.settings.maxUsers} users)
                        {isAtLimit && !editingUser && " - FULL"}
                      </MenuItem>
                    );
                  })}
                </Select>
                {newUser.clinicId && !editingUser && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {(() => {
                      const selectedClinic = clinics.find(c => c.id === newUser.clinicId);
                      if (selectedClinic) {
                        const currentUsers = getClinicUserCount(selectedClinic.id);
                        const remaining = selectedClinic.settings.maxUsers - currentUsers;
                        return remaining > 0 
                          ? `${remaining} user slots remaining`
                          : 'No slots available';
                      }
                      return '';
                    })()}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            {!editingUser && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                  🔐 User Password
                </Typography>
                <Box sx={{ 
                  border: '2px solid', 
                  borderColor: newUser.password ? 'success.main' : 'grey.300',
                  borderRadius: 2, 
                  p: 2, 
                  backgroundColor: newUser.password ? 'success.50' : 'grey.50' 
                }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 2 }}>
                    <TextField
                      margin="dense"
                      label="Temporary Password"
                      type={showTempPassword ? 'text' : 'password'}
                      fullWidth
                      variant="outlined"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      helperText={newUser.password ? "✅ Password is ready! Copy this for the user." : "Generate or enter a password"}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white',
                          fontFamily: showTempPassword ? 'monospace' : 'inherit',
                          fontSize: showTempPassword ? '1.1rem' : 'inherit',
                          fontWeight: showTempPassword ? 'bold' : 'normal',
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowTempPassword(!showTempPassword)}
                              edge="end"
                              size="small"
                              title={showTempPassword ? 'Hide password' : 'Show password'}
                              color={showTempPassword ? 'primary' : 'default'}
                            >
                              {showTempPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                            <IconButton
                              onClick={handleCopyPassword}
                              edge="end"
                              size="small"
                              disabled={!newUser.password}
                              title="Copy password"
                              sx={{ ml: 0.5 }}
                              color={newUser.password ? 'primary' : 'default'}
                            >
                              <ContentCopy />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleGeneratePassword}
                      startIcon={<AutorenewRounded />}
                      sx={{ 
                        mt: 1, 
                        minWidth: 'auto',
                        px: 3,
                        height: '56px',
                        backgroundColor: 'secondary.main',
                        '&:hover': {
                          backgroundColor: 'secondary.dark',
                        }
                      }}
                      title="Generate random password"
                    >
                      Generate
                    </Button>
                  </Box>
                  
                  {newUser.password && (
                    <Box sx={{ 
                      backgroundColor: 'success.100', 
                      border: '1px solid', 
                      borderColor: 'success.main',
                      borderRadius: 1, 
                      p: 2,
                      mt: 1
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.dark', mb: 1 }}>
                        📋 Password for {newUser.firstName} {newUser.lastName}:
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          backgroundColor: 'white',
                          p: 1,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'success.main',
                          color: 'success.dark',
                          fontWeight: 'bold',
                          letterSpacing: '0.1em'
                        }}
                      >
                        {newUser.password}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        💡 Make sure to save this password before creating the user!
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            )}
            {editingUser && (
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  label="Created Date"
                  type="date"
                  fullWidth
                  variant="outlined"
                  value={newUser.createdAt}
                  onChange={(e) => setNewUser({...newUser, createdAt: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                  helperText="Change the creation date if needed"
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
            disabled={
              loading || 
              (!editingUser && (
                emailValidation.isChecking || 
                !emailValidation.isValid || 
                emailValidation.exists ||
                !newUser.email?.trim() ||
                !newUser.firstName?.trim() ||
                !newUser.lastName?.trim() ||
                !newUser.password?.trim() ||
                !newUser.clinicId
              ))
            }
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                {editingUser ? 'Updating...' : 'Creating...'}
              </Box>
            ) : (
              editingUser ? 'Update' : 'Create User'
            )}
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
              : 'This user will be removed from the database.'}
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

      {/* Permissions Manager Dialog */}
      <PermissionsManager
        open={permissionsDialogOpen}
        onClose={() => {
          setPermissionsDialogOpen(false);
          setUserForPermissions(null);
        }}
        user={userForPermissions}
        onSave={handleSavePermissions}
      />

      {/* Password Success Dialog */}
      <Dialog 
        open={passwordSuccessOpen} 
        onClose={() => setPasswordSuccessOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: 'success.main', 
          color: 'white',
          textAlign: 'center',
          py: 3
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            🎉 User Account Created Successfully!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {createdUserCredentials && (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  ✅ {createdUserCredentials.name} can now login with these credentials:
                </Typography>
              </Alert>
              
              <Box sx={{ 
                border: '2px solid', 
                borderColor: 'success.main',
                borderRadius: 2, 
                p: 3, 
                backgroundColor: 'success.50',
                mb: 3
              }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'success.dark' }}>
                      📧 Email Address:
                    </Typography>
                    <Box sx={{ 
                      backgroundColor: 'white',
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Typography variant="h6" sx={{ fontFamily: 'monospace', flexGrow: 1 }}>
                        {createdUserCredentials.email}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(createdUserCredentials.email);
                          showSnackbar('Email copied to clipboard');
                        }}
                        title="Copy email"
                      >
                        <ContentCopy />
                      </IconButton>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'success.dark' }}>
                      🔐 Password:
                    </Typography>
                    <Box sx={{ 
                      backgroundColor: 'white',
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          flexGrow: 1,
                          fontWeight: 'bold',
                          letterSpacing: '0.1em'
                        }}
                      >
                        {createdUserCredentials.password}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(createdUserCredentials.password);
                          showSnackbar('Password copied to clipboard');
                        }}
                        title="Copy password"
                      >
                        <ContentCopy />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>📋 Important Notes:</strong>
                  <br />• Share these credentials securely with the user
                  <br />• The user can login immediately at /login
                  <br />• Password is also visible in the Users table for future reference
                  <br />• Consider asking the user to change their password on first login
                </Typography>
              </Alert>
              
              <Box sx={{ 
                backgroundColor: 'primary.50',
                border: '1px solid',
                borderColor: 'primary.main',
                borderRadius: 1,
                p: 2
              }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                  🚀 Quick Actions:
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const credentials = `Email: ${createdUserCredentials.email}\nPassword: ${createdUserCredentials.password}`;
                    navigator.clipboard.writeText(credentials);
                    showSnackbar('Full credentials copied to clipboard');
                  }}
                  startIcon={<ContentCopy />}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Copy Both
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setPasswordSuccessOpen(false)}
                  sx={{ mt: 1 }}
                >
                  Create Another User
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setPasswordSuccessOpen(false)} 
            variant="contained"
            size="large"
            sx={{ minWidth: 120 }}
          >
            Got It!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Cleanup Instructions Dialog */}
      <Dialog 
        open={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          Manual Cleanup Required
        </DialogTitle>
        <DialogContent>
          <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
            {confirmMessage}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            I'll Do This Later
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmAction}
            startIcon={<ExitToApp />}
          >
            Open Firebase Console
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default AdminPanelPage; 
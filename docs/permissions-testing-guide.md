# Permissions System Testing Guide

## Overview
This guide helps you test and verify that the granular permissions system is working correctly.

## Access Points

### Live Application
- **URL**: https://clinic-d9c0a-230db.web.app
- **Admin Login**: `/admin/login`
- **Admin Emails**: 
  - admin@sahdasclinic.com
  - sahdasamier013@gmail.com

## Testing Scenarios

### 1. Super Admin Access Test
**Objective**: Verify super admin has full access

**Steps**:
1. Login at `/admin/login` with super admin email
2. Navigate to Admin Panel (`/admin/dashboard`)
3. Go to Users Management tab
4. Click Security icon (🔒) next to any user
5. **Expected**: Permissions Manager opens with full controls

**Verification**:
- ✅ Can modify any user's permissions
- ✅ All features accessible regardless of user permissions
- ✅ No access restrictions apply

### 2. Role-Based Default Permissions Test
**Objective**: Verify default permissions work correctly

**Test Users** (Create via Admin Panel):

#### Management User
- **Role**: Management
- **Expected Access**: 
  - ✅ Full: Dashboard, Patients, Appointments, Payments, Inventory, Reports, Settings, Notifications
  - ✅ Write: User Management, Clinic Settings

#### Doctor User  
- **Role**: Doctor
- **Expected Access**:
  - ✅ Full: Dashboard, Patients, Appointments, Notifications, Doctor Scheduling
  - 👁️ Read: Payments, Inventory, Reports, Settings
  - ❌ None: Payment Management, Inventory Management, User Management

#### Receptionist User
- **Role**: Receptionist  
- **Expected Access**:
  - ✅ Full: Appointments
  - ✅ Write: Patients, Payments, Patient Details, Appointment Calendar
  - 👁️ Read: Dashboard, Inventory, Reports, Notifications
  - ❌ None: Settings, Inventory Management, User Management

### 3. Custom Permissions Test
**Objective**: Verify custom permissions override role defaults

**Steps**:
1. Select a test user (any role)
2. Click Security icon (🔒) to open Permissions Manager
3. Change specific permissions (e.g., Dashboard from Full to None)
4. Save changes
5. Login as that user
6. **Expected**: Modified permissions take effect immediately

**Verification**:
- ✅ Custom permissions override role defaults
- ✅ Changes apply without user logout/login
- ✅ Access denied pages show proper messages

### 4. Route Protection Test
**Objective**: Verify routes are properly protected

**Test Routes**:
```
/dashboard - Requires 'dashboard' permission
/patients - Requires 'patients' permission  
/patients/123 - Requires 'patient_details' permission
/appointments - Requires 'appointments' permission
/appointments/calendar - Requires 'appointment_calendar' permission
/payments - Requires 'payments' permission
/inventory - Requires 'inventory' permission
/notifications - Requires 'notifications' permission
/doctor-scheduling - Requires 'doctor_scheduling' permission
/settings - Requires 'settings' permission
```

**Test Method**:
1. Create user with limited permissions
2. Login as that user
3. Try accessing restricted routes directly
4. **Expected**: Access denied page with "Request Access" button

### 5. Component-Level Protection Test
**Objective**: Verify UI elements are hidden/disabled based on permissions

**Test Elements**:
- Action buttons (Edit, Delete, Create)
- Navigation menu items
- Feature sections within pages
- Administrative controls

**Test Method**:
1. Login with different permission levels
2. Check that UI elements respect permission levels:
   - **None**: Element hidden completely
   - **Read**: Element visible but disabled/read-only
   - **Write**: Element fully functional
   - **Full**: All capabilities including delete

### 6. Permission Manager Interface Test
**Objective**: Verify admin can properly manage permissions

**Steps**:
1. Open Permissions Manager for any user
2. Test all features:
   - ✅ Permission groups expand/collapse
   - ✅ Individual permission dropdowns work
   - ✅ Visual icons update correctly
   - ✅ Permission summary updates
   - ✅ Reset to Role Defaults works
   - ✅ Save functionality works

**Features to Test**:
- **Core Features**: Dashboard, Patients, Appointments
- **Business Operations**: Payments, Inventory, Reports  
- **Advanced Features**: Doctor Scheduling, Notifications, Settings
- **Detailed Access**: Patient Details, Calendar, etc.
- **Administrative**: User Management, Clinic Settings

### 7. Security Validation Test
**Objective**: Verify security rules prevent unauthorized access

**Database Security Test**:
1. Create user with limited permissions
2. Login as that user
3. Try to modify their own permissions via browser dev tools
4. **Expected**: Operation blocked by Firestore rules

**Backend Protection Test**:
1. User with no 'payments' access
2. Try direct API calls to payment endpoints
3. **Expected**: Access denied at database level

## Testing Checklist

### Permission Levels
- [ ] **None**: Feature completely hidden
- [ ] **Read**: View only, no modifications
- [ ] **Write**: View and edit capabilities  
- [ ] **Full**: Complete access including delete

### User Experience
- [ ] Clean access denied messages
- [ ] "Request Access" button functional
- [ ] No broken pages or error states
- [ ] Proper loading states
- [ ] Visual permission indicators work

### Administrative Functions
- [ ] Super admin can modify all permissions
- [ ] Permission changes save correctly
- [ ] Permission summary accurate
- [ ] Role defaults restoration works
- [ ] User creation includes proper permissions

### Security Validation
- [ ] Database rules prevent permission field modification
- [ ] Route protection works at all levels
- [ ] Component protection hides sensitive elements
- [ ] No permission escalation possible

## Common Issues & Solutions

### Permission Not Applied
**Symptoms**: User still has access after permission removal
**Solutions**:
1. Check if user is super admin (bypasses all restrictions)
2. Verify permission was saved (check admin panel)
3. Clear browser cache/refresh page
4. Check console for errors

### Access Denied on Valid Permission
**Symptoms**: User can't access feature they should have access to
**Solutions**:
1. Verify clinic is active (disabled clinics block all access)
2. Check user's actual permissions vs role defaults
3. Verify permission level matches requirement
4. Check route implementation has correct feature key

### Permissions Manager Not Opening
**Symptoms**: Security button doesn't open dialog
**Solutions**:
1. Verify super admin access
2. Check browser console for errors
3. Refresh admin panel page
4. Verify user data loaded correctly

## Success Criteria

The permissions system is working correctly when:

1. **Security**: Only authorized users can access features
2. **Flexibility**: Permissions can be customized per user
3. **Usability**: Clear feedback on access restrictions  
4. **Performance**: No delays or errors in permission checking
5. **Reliability**: Consistent behavior across all features
6. **Maintainability**: Easy to add new permissions/features

## Reporting Issues

If you find issues during testing:

1. **Document**: Screenshot, steps to reproduce
2. **Context**: User role, permissions, browser
3. **Expected vs Actual**: What should vs what happened
4. **Console**: Any browser console errors
5. **Contact**: admin@sahdasclinic.com with "Permission Issue" subject

## Performance Notes

- Permission checks are lightweight (client-side)
- Database rules provide secondary security layer
- No impact on application loading speed
- Real-time permission updates without page refresh 
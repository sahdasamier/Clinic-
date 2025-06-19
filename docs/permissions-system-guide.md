# Permissions System Guide

## Overview
The permissions system provides granular control over what features and pages clinic users can access. Super admins can customize permissions for individual users or rely on role-based defaults.

## Permission Levels

### Access Levels
- **None**: Feature is completely hidden from user
- **Read**: User can view but not modify
- **Write**: User can view and modify 
- **Full**: Complete access including delete operations

### Features & Pages Controlled
- **Dashboard**: Main dashboard and overview
- **Patients**: Patient management and records
- **Appointments**: Appointment scheduling and management
- **Payments**: Payment processing and billing
- **Inventory**: Inventory and supplies management
- **Reports**: Reports and analytics
- **Settings**: System settings and configuration
- **Notifications**: Notifications and alerts
- **Doctor Scheduling**: Doctor scheduling and availability
- **Patient Details**: Detailed patient information
- **Appointment Calendar**: Calendar view and scheduling
- **Payment Management**: Advanced payment features
- **Inventory Management**: Inventory control and ordering
- **User Management**: User management within clinic
- **Clinic Settings**: Clinic-specific settings

## Role-Based Defaults

### Management Role
- **Full Access**: Dashboard, Patients, Appointments, Payments, Inventory, Reports, Settings, Notifications, Doctor Scheduling, Patient Details, Appointment Calendar, Payment Management, Inventory Management
- **Write Access**: User Management, Clinic Settings

### Doctor Role
- **Full Access**: Dashboard, Patients, Appointments, Notifications, Doctor Scheduling, Patient Details, Appointment Calendar
- **Read Access**: Payments, Inventory, Reports, Settings
- **No Access**: Payment Management, Inventory Management, User Management, Clinic Settings

### Receptionist Role
- **Full Access**: Appointments
- **Write Access**: Patients, Payments, Patient Details, Appointment Calendar, Payment Management
- **Read Access**: Dashboard, Inventory, Reports, Notifications, Doctor Scheduling
- **No Access**: Settings, Inventory Management, User Management, Clinic Settings

## Managing User Permissions

### Access Permissions Manager
1. Navigate to Admin Panel (`/admin/dashboard`)
2. Go to Users Management tab
3. Click the **Security icon** (🔒) next to any user
4. The Permissions Manager dialog opens

### Permission Groups
Permissions are organized into logical groups:

#### Core Features
- Dashboard
- Patients 
- Appointments

#### Business Operations
- Payments
- Inventory
- Reports

#### Advanced Features
- Doctor Scheduling
- Notifications
- Settings

#### Detailed Access
- Patient Details
- Appointment Calendar
- Payment Management
- Inventory Management

#### Administrative
- User Management
- Clinic Settings

### Customizing Permissions

#### Individual Permission Control
- Each feature can be set to None/Read/Write/Full
- Visual icons indicate permission level:
  - 🔒 None (Red)
  - 👁️ Read (Blue)  
  - ✏️ Write (Orange)
  - 🛡️ Full (Green)

#### Reset to Defaults
- Click "Reset to Role Defaults" to restore role-based permissions
- Useful when you want to start over with standard settings

#### Permission Summary
- Bottom panel shows all permissions at a glance
- Color-coded chips for quick overview

## How Permissions Work

### Permission Hierarchy
1. **Super Admins**: Full access to everything (bypasses all checks)
2. **Custom Permissions**: User-specific overrides take precedence
3. **Role Defaults**: Used when no custom permissions set

### Route Protection
All protected routes are wrapped with `PermissionGuard`:
```tsx
<PermissionGuard feature="patients" level="read">
  <PatientListPage />
</PermissionGuard>
```

### Access Denied Behavior
When user lacks permission:
- Clean "Access Restricted" message
- Explanation of required permission level
- "Request Access" button (emails admin)
- No error or broken experience

### Component-Level Protection
Use `PermissionGuard` to protect specific UI elements:
```tsx
<PermissionGuard feature="payments" level="write" showFallback={false}>
  <Button>Process Payment</Button>
</PermissionGuard>
```

## Implementation Examples

### Protecting a Feature Button
```tsx
import PermissionGuard from '../components/PermissionGuard';

// Hide button completely if no access
<PermissionGuard feature="inventory_management" showFallback={false}>
  <Button onClick={addInventoryItem}>Add Item</Button>
</PermissionGuard>

// Show disabled state if only read access
<PermissionGuard 
  feature="payments" 
  level="write"
  fallback={<Button disabled>Edit Payment (Read Only)</Button>}
>
  <Button onClick={editPayment}>Edit Payment</Button>
</PermissionGuard>
```

### Protecting Route Components
```tsx
<Route path="/advanced-reports" element={
  <AuthGuard>
    <ClinicAccessGuard>
      <PermissionGuard feature="reports" level="full">
        <AdvancedReportsPage />
      </PermissionGuard>
    </ClinicAccessGuard>
  </AuthGuard>
} />
```

### Checking Permissions Programmatically
```tsx
import { useUser } from '../contexts/UserContext';
import { hasPermission, getUserPermissions } from '../types/permissions';

function MyComponent() {
  const { userProfile } = useUser();
  const userPermissions = getUserPermissions(userProfile);
  
  const canDeletePatients = hasPermission(userPermissions, 'patients', 'full');
  const canViewReports = hasPermission(userPermissions, 'reports', 'read');
  
  return (
    <div>
      {canDeletePatients && <DeleteButton />}
      {canViewReports && <ReportsLink />}
    </div>
  );
}
```

## Business Use Cases

### Restricting Receptionist Access
- Remove access to financial reports
- Limit to patient scheduling only
- Prevent settings modifications

### Doctor Permissions
- Full patient access for treatment
- Read-only financial information
- No administrative capabilities

### Management Oversight
- Full access to all operational features
- User management within clinic
- Settings and configuration control

### Temporary Access Restrictions
- Quickly disable specific features for training
- Restrict access during system maintenance
- Gradual permission rollout for new features

## Security Features

### Data Protection
- Database-level access control via Firestore rules
- Frontend route protection prevents unauthorized navigation
- Component-level hiding prevents feature exposure

### Admin Controls
- Only super admins can modify permissions
- Changes logged with timestamps
- Immediate effect across all user sessions

### Audit Trail
- All permission changes tracked
- User creation includes initial permissions
- Update timestamps for accountability

## Best Practices

### Permission Design
1. Start with role defaults
2. Customize only when necessary
3. Regular permission audits
4. Document custom permission reasons

### User Experience
1. Clear feedback on restricted access
2. Request access workflows
3. Progressive permission disclosure
4. Training on available features

### Security Considerations
1. Principle of least privilege
2. Regular access reviews
3. Immediate revocation capability
4. Monitor for permission escalation

## Troubleshooting

### User Can't Access Feature
1. Check user's role defaults
2. Verify custom permissions
3. Confirm clinic is active
4. Check super admin status

### Permission Changes Not Applied
1. User may need to refresh/logout
2. Check admin panel for save confirmation
3. Verify database connection
4. Review browser console for errors

### Route Access Issues
1. Verify PermissionGuard implementation
2. Check feature key spelling
3. Confirm permission level requirements
4. Review route protection hierarchy

## Contact & Support
For permission-related issues or access requests:
- Email: admin@sahdasclinic.com
- Subject: Access Request - [Feature Name]
- Include: User email, clinic, requested permission level 
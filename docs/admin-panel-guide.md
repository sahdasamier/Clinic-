# Multi-Clinic Admin Panel Guide

## Overview
The admin panel provides super admin functionality to manage multiple clinics and their users from a single interface.

## Access
- **URL**: `/admin/login`
- **Authorized Emails**: 
  - `admin@sahdasclinic.com`
  - `sahdasamier013@gmail.com`

## Features

### 1. Clinic Management
- **Create new clinics** with subscription plans (Basic/Premium/Enterprise)
- **Edit clinic information**: Name, subscription plan, and user limits
- **Enable/disable clinics** with toggle switches
- **Delete clinics** permanently from the system
- **View clinic statistics** and user counts
- **Set maximum users** per clinic

#### Clinic Edit Features:
- **Update Name**: Change clinic display name
- **Subscription Plans**: Switch between Basic/Premium/Enterprise
- **User Limits**: Adjust maximum allowed users per clinic
- **Immediate Effect**: Changes apply instantly to all clinic users
- **Validation**: Ensures required fields are completed

#### What Happens When You Disable a Clinic:
- **Immediate Effect**: All users from that clinic are locked out
- **Access Blocked**: Users see "Access Suspended" page when they try to login
- **Data Preserved**: All clinic data remains in database (not deleted)
- **Re-enable Anytime**: Toggle switch to restore full access instantly
- **Use Cases**: Payment issues, contract disputes, temporary suspension

### 2. User Management
- **Create users** for specific clinics
- **Edit user information**: Name, email, role, and clinic assignment
- **Assign roles**: Management, Doctor, Receptionist
- **Enable/disable users** with toggle switches
- **Delete users** permanently from the system
- **View user details** including clinic assignments

#### User Edit Features:
- **Update Profile**: Change name, email, role, clinic assignment
- **Role Changes**: Switch between Management/Doctor/Receptionist
- **Clinic Transfer**: Move users between clinics
- **Password Reset**: Handled separately through authentication system
- **Validation**: Ensures all required fields are completed

### 3. Data Isolation
- Each clinic's data is completely isolated
- Regular users can only see their clinic's data
- Super admins have access to all clinics

## Security Features

### Multi-Tenancy
- **Firestore Rules**: Automatic clinic-based data filtering
- **Frontend Guards**: Route protection for admin access
- **Email Validation**: Only authorized emails can access admin panel

### Data Protection
- All collections include `clinicId` for isolation
- Patients, appointments, payments, inventory are clinic-specific
- Cross-clinic data access is prevented at the database level

## Business Workflow

1. **New Clinic Onboarding**:
   - Create clinic in admin panel
   - Set subscription plan and user limits
   - Create initial management user
   - Send login credentials to clinic

2. **User Management**:
   - Add doctors, receptionists as needed
   - Edit user information when roles change
   - Transfer users between clinics if needed
   - Assign appropriate roles
   - Disable users when they leave
   - Delete users who permanently leave

3. **Clinic Control**:
   - Edit clinic details when business changes
   - Upgrade/downgrade subscription plans
   - Adjust user limits based on growth
   - Disable clinic if payment stops
   - Re-enable when payment resumes
   - Monitor usage and upgrade plans

## Technical Details

### Database Collections
```typescript
// New collections
clinics: {
  name: string,
  isActive: boolean,
  settings: {
    subscriptionPlan: 'basic' | 'premium' | 'enterprise',
    maxUsers: number,
    allowedFeatures: string[]
  }
}

// Updated collections (all include clinicId)
users: { ..., clinicId: string }
patients: { ..., clinicId: string }
appointments: { ..., clinicId: string }
// ... all other collections
```

### Security Rules Summary
- Super admins: Full access to all data
- Regular users: Only their clinic's data
- No cross-clinic data access possible
- Automatic filtering at database level

## Usage Tips

1. **Creating Clinics**: Choose appropriate subscription plans based on feature needs
2. **Editing Clinics**: Update plans and limits as businesses grow
3. **User Roles**: 
   - Management: Full clinic access
   - Doctor: Patient and appointment access
   - Receptionist: Front desk operations
4. **User Management**: Edit roles and transfer users between clinics as needed
5. **Monitoring**: Check user counts against clinic limits
6. **Support**: Disable problematic clinics temporarily rather than deleting

## Troubleshooting

### Common Issues
1. **Login Issues**: Verify email is in authorized list
2. **Data Not Showing**: Check if user has correct clinicId
3. **Permission Errors**: Ensure Firestore rules are deployed

### Support Commands
```bash
# Deploy security rules
npm run deploy:rules

# Check Firestore rules
firebase firestore:rules get

# View logs
firebase functions:log
``` 
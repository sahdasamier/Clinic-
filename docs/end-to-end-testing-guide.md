# End-to-End Testing Guide: Secure Admin User Creation

This guide provides comprehensive testing procedures to verify that your secure admin user creation system is working correctly.

## 🚀 Quick Setup & Test Flow

### Step 1: Set Up Admin Claims

```bash
# Install Firebase Admin SDK
npm install firebase-admin

# Download service account key from Firebase Console
# Place as serviceAccountKey.json in project root

# Update setAdmin.js with your actual admin UID
# Run the admin setup script
npm run setup-admin
```

### Step 2: Refresh Admin Token

After setting claims, the admin user **MUST** refresh their token:

**Option A: Sign out and back in (Recommended)**
1. Navigate to your app
2. Sign out completely 
3. Sign back in with admin account

**Option B: Force token refresh (Developer)**
```javascript
// In browser console while logged in as admin
await firebase.auth().currentUser.getIdToken(true);
console.log('Token refreshed');
location.reload(); // Refresh the page
```

### Step 3: Verify Admin Access

Navigate to the admin panel and verify:
- ✅ Green admin verification status
- ✅ "Admin Verified (Custom Claims)" message
- ✅ "Add User" button is enabled
- ✅ No error messages in admin status panel

## 🧪 Comprehensive Testing Scenarios

### Test Scenario 1: Admin User Creation (Happy Path)

#### 1.1 Create New User as Admin

1. **Login as admin** and navigate to admin panel
2. **Click "Add User"** button
3. **Fill out form**:
   ```
   First Name: John
   Last Name: Doe
   Email: john.doe@testclinic.com
   Role: Doctor
   Clinic: [Select available clinic]
   Password: [Generate or enter strong password]
   ```
4. **Click "Create User"**
5. **Expected Results**:
   - ✅ Success message appears
   - ✅ User appears in users table
   - ✅ Password is visible in table
   - ✅ Admin remains logged in
   - ✅ No permission errors

#### 1.2 Verify Firestore Document

1. **Check Firebase Console** → Firestore Database → `users` collection
2. **Verify new document** with user's UID contains:
   ```json
   {
     "email": "john.doe@testclinic.com",
     "firstName": "John",
     "lastName": "Doe",
     "role": "doctor",
     "clinicId": "[clinic-id]",
     "isActive": true,
     "createdAt": "[timestamp]",
     "createdBy": "[admin-email]"
   }
   ```

#### 1.3 Verify Firebase Auth Account

1. **Check Firebase Console** → Authentication → Users
2. **Verify new user** appears with:
   - Email: john.doe@testclinic.com
   - Display Name: John Doe
   - UID matches Firestore document

### Test Scenario 2: New User Login Test

#### 2.1 Login as New User

1. **Sign out** of admin account
2. **Login** with new user credentials:
   ```
   Email: john.doe@testclinic.com
   Password: [password from admin creation]
   ```
3. **Expected Results**:
   - ✅ Login successful
   - ✅ Redirected to appropriate dashboard (not admin)
   - ✅ No admin features visible
   - ✅ User can access their clinic's data only

#### 2.2 Verify Limited Access

1. **Try accessing admin routes** (manually navigate to `/admin`)
2. **Expected Results**:
   - ❌ Access denied or redirected
   - ❌ Cannot see admin panel
   - ❌ Cannot access other clinics' data

### Test Scenario 3: Security Tests

#### 3.1 Non-Admin Cannot Create Users

1. **Login as regular user** (or create one first)
2. **Navigate to admin routes** 
3. **Expected Results**:
   - ❌ Admin panel inaccessible
   - ❌ Add User button disabled/hidden
   - ❌ Permission denied errors

#### 3.2 Firestore Security Rules Test

Open browser console and try unauthorized operations:

```javascript
// This should FAIL for regular users
try {
  await firebase.firestore().collection('users').add({
    email: 'hacker@evil.com',
    role: 'management',
    permissions: { admin: true }
  });
  console.log('❌ SECURITY BREACH: Regular user created admin account!');
} catch (error) {
  console.log('✅ Security working:', error.message);
}
```

#### 3.3 Custom Claims Verification

```javascript
// Check admin claims (should only work for admins)
const user = firebase.auth().currentUser;
if (user) {
  const idTokenResult = await user.getIdTokenResult();
  console.log('User claims:', idTokenResult.claims);
  console.log('Is admin:', idTokenResult.claims.admin === true);
}
```

### Test Scenario 4: Admin Session Persistence

#### 4.1 Multiple User Creation Test

1. **As admin, create multiple users** in sequence:
   - User 1: receptionist@clinic.com
   - User 2: doctor2@clinic.com  
   - User 3: manager@clinic.com

2. **Expected Results**:
   - ✅ Admin stays logged in throughout
   - ✅ All users created successfully
   - ✅ No authentication errors
   - ✅ All Firestore documents created

#### 4.2 Admin Token Persistence Test

```javascript
// Before creating user - get admin token
const beforeToken = await firebase.auth().currentUser.getIdToken();
console.log('Admin token before:', beforeToken.substring(0, 20) + '...');

// After creating user - verify same admin token
const afterToken = await firebase.auth().currentUser.getIdToken();
console.log('Admin token after:', afterToken.substring(0, 20) + '...');
console.log('Same admin session:', beforeToken === afterToken);
```

## 🔍 Testing Checklist

### Admin Setup Verification
- [ ] Service account key downloaded and placed correctly
- [ ] Admin UID identified from Firebase Console
- [ ] setAdmin.js script updated with correct UID
- [ ] Script runs without errors
- [ ] Admin user signed out and back in
- [ ] Admin verification panel shows green status

### User Creation Testing
- [ ] Admin can access admin panel
- [ ] Add User button is enabled for admin
- [ ] User creation form works correctly
- [ ] Password generation functions
- [ ] User created in both Auth and Firestore
- [ ] Admin session persists during creation
- [ ] Success messages display correctly

### Security Testing  
- [ ] Regular users cannot access admin features
- [ ] Non-admin Add User button is disabled
- [ ] Firestore rules block unauthorized writes
- [ ] Custom claims work correctly
- [ ] Admin privileges verified server-side

### New User Testing
- [ ] New user can login with generated credentials
- [ ] New user has appropriate role and permissions
- [ ] New user cannot access admin features
- [ ] New user can only see their clinic's data

## 🚨 Troubleshooting Common Issues

### "Admin verification failed"

**Symptoms**: Red status panel, Add User button disabled
**Solutions**:
1. Check admin UID is correct in setAdmin.js
2. Verify service account key is valid
3. Ensure admin signed out and back in after claims set
4. Check browser console for detailed errors

### "Permission denied" during user creation

**Symptoms**: User creation fails with permission error
**Solutions**:
1. Verify Firestore rules are deployed: `firebase deploy --only firestore:rules`
2. Check admin custom claims in Firebase Console
3. Ensure admin token has been refreshed
4. Verify admin is using correct account

### "Firebase App 'Secondary' already exists"

**Symptoms**: Error when creating multiple users
**Solutions**:
1. Refresh the admin panel page
2. Check browser console for cleanup errors
3. Verify secondary app cleanup is working
4. Clear browser cache if needed

### New user cannot login

**Symptoms**: Login fails for newly created user
**Solutions**:
1. Verify password was copied correctly
2. Check Firebase Auth console for user account
3. Ensure email is exactly as entered
4. Check for typos in generated password

## 📋 Test Results Documentation

Create a test report documenting:

```markdown
### Test Execution Report
- **Date**: [Date]
- **Tester**: [Name]
- **Environment**: [Development/Production]

### Results Summary
- Admin Setup: ✅ PASS / ❌ FAIL
- User Creation: ✅ PASS / ❌ FAIL  
- Security Tests: ✅ PASS / ❌ FAIL
- New User Access: ✅ PASS / ❌ FAIL

### Issues Found
1. [Issue description]
   - **Severity**: High/Medium/Low
   - **Steps to reproduce**: [Steps]
   - **Expected vs Actual**: [Description]

### Sign-off
- [ ] All critical tests passing
- [ ] Security measures verified
- [ ] Ready for production use
```

## 🎯 Success Criteria

Your secure admin user creation system is working correctly when:

✅ **Admin Setup**: Custom claims set and verified  
✅ **Admin Access**: Green verification status in panel  
✅ **User Creation**: Admins can create users without logout  
✅ **Security**: Non-admins cannot access admin features  
✅ **Data Integrity**: Users created in both Auth and Firestore  
✅ **Session Persistence**: Admin stays logged in throughout  
✅ **New User Access**: Created users can login and access appropriate features  

**🎉 When all tests pass, your secure admin user creation system is production-ready!** 
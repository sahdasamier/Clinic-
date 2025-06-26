# Admin Setup Quickstart Guide

This is a quick setup guide for getting the secure admin user creation system working in your clinic management app.

## 🚀 Prerequisites

- Your clinic app is deployed and working
- You have Firebase project access
- Node.js installed on your local machine
- Admin user account created in your app (regular signup)

## 📋 Step-by-Step Setup

### Step 1: Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/) → Your Project
2. Navigate to **Project Settings** → **Service accounts**
3. Click **"Generate new private key"**
4. Save the file as `serviceAccountKey.json` in your project root
5. **⚠️ NEVER commit this file to version control!**

### Step 2: Get Your Admin User UID

1. Go to Firebase Console → **Authentication** → **Users**
2. Find your admin user account (the one you created)
3. Copy the **User UID** (looks like: `1a2b3c4d5e6f7g8h9i0j`)

### Step 3: Set Admin Claims

Create a file called `setup-admin.js` in your project root:

```javascript
const admin = require('firebase-admin');

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json')
});

async function setupAdmin() {
  // Replace with your actual admin user UID from Step 2
  const adminUID = "YOUR_ADMIN_USER_UID_HERE";
  
  try {
    // Set admin custom claims
    await admin.auth().setCustomUserClaims(adminUID, {
      admin: true,
      role: 'super_admin',
      grantedAt: Date.now()
    });
    
    console.log("✅ Admin claims set successfully!");
    console.log("⚠️ Admin user must sign out and sign back in for changes to take effect");
    
    // Verify claims were set
    const user = await admin.auth().getUser(adminUID);
    console.log("📋 Current claims:", user.customClaims);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting admin claims:", error);
    process.exit(1);
  }
}

setupAdmin();
```

### Step 4: Install Dependencies and Run Setup

```bash
# Install Firebase Admin SDK
npm install firebase-admin

# Run the setup script
node setup-admin.js
```

### Step 5: Test Admin Access

1. **Sign out** of your admin account in the app
2. **Sign back in** (this refreshes the token with new claims)
3. Navigate to the admin panel
4. You should see:
   - ✅ Green admin verification status
   - 🔐 "Admin Verified (Custom Claims)" message
   - "Add User" button enabled

## 🔧 Verification Checklist

- [ ] Service account key downloaded and secured
- [ ] Admin UID copied correctly
- [ ] Setup script ran without errors
- [ ] Admin user signed out and back in
- [ ] Admin panel shows green verification status
- [ ] "Add User" button is enabled
- [ ] Can successfully create new users

## 🚨 Troubleshooting

### "Admin verification failed"
- Double-check the UID is correct
- Ensure admin user signed out and back in
- Verify service account key is valid

### "Add User button disabled"
- Check admin verification panel for error message
- Ensure custom claims were set properly
- Try force refreshing token: `user.getIdToken(true)`

### "Permission denied when creating user"
- Verify Firestore rules are deployed
- Check admin custom claims in Firebase Console
- Ensure you're using the correct admin account

## 🛡️ Security Notes

- **Service account key**: Never commit to version control, store securely
- **Admin access**: Only give to trusted users
- **Regular audits**: Review admin users periodically
- **Firestore rules**: Your primary security defense

## 📞 Need Help?

If you encounter issues:
1. Check the full [Secure Admin User Creation Guide](secure-admin-user-creation-guide.md)
2. Verify Firestore rules are properly deployed
3. Check Firebase Console logs for errors
4. Ensure you followed each step exactly

---

**Once setup is complete, you can securely create user accounts without losing your admin session!** 🎉 
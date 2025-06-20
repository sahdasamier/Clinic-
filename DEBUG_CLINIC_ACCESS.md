# 🔧 Clinic Access Debugging Guide

## ❌ **Problem**: "Access Suspended" Screen After Creating User

If users get the "Access Suspended" screen after you create them, here's how to debug and fix it:

## 🕵️ **Step 1: Debug Console Logs**

Open browser Developer Tools (F12) → Console tab and look for these messages:

```
🔐 Checking clinic access for user: [email], clinicId: [clinic-id]
🔍 Checking clinic status for ID: [clinic-id]
📊 Clinic data for [clinic-id]: { name: "...", isActive: true/false }
```

## ✅ **Step 2: Quick Fix Options**

### **Option A: Use Admin Panel Fix Button**
1. Login as super admin
2. Go to Admin Panel
3. Click "**Fix Access**" button in the top toolbar
4. Wait for "✅ Demo clinic access fixed!" message
5. Ask user to try logging in again

### **Option B: Manual Console Commands**

Open browser console and run:

```javascript
// Check demo clinic status
import { checkDemoClinicExists } from './src/scripts/initFirestore';
await checkDemoClinicExists();

// Fix demo clinic manually
import { ensureDemoClinicActive } from './src/scripts/initFirestore';
await ensureDemoClinicActive();

// Verify clinic access for a user
import { hasActiveClinicAccess } from './src/utils/clinicUtils';
await hasActiveClinicAccess('user@email.com', 'demo-clinic');
```

## 🔍 **Step 3: Verify Fix Worked**

### **Check Admin Panel:**
1. Go to Admin Panel → Clinics tab
2. Look for "Demo Clinic" 
3. Status should show "Active" (green chip)
4. Users column should show current user count

### **Check Console Logs:**
After clicking "Fix Access", you should see:
```
🔧 Ensuring demo clinic is active...
✅ Demo clinic created/updated and set to active
✅ Demo clinic access fixed
```

### **Test User Login:**
1. Ask affected user to try logging in again
2. They should now access the dashboard successfully
3. No more "Access Suspended" screen

## 🐛 **Common Causes & Solutions**

### **Cause 1: Demo Clinic Doesn't Exist**
**Solution:** Click "Fix Access" button - this creates the demo clinic

### **Cause 2: Demo Clinic Is Inactive**
**Solution:** Click "Fix Access" button - this activates the clinic

### **Cause 3: Wrong Clinic ID**
**Solution:** Check user's `clinicId` field matches existing clinic

### **Cause 4: Firestore Permissions**
**Solution:** Check Firebase console → Firestore → Rules

## 📋 **Prevention Tips**

1. **Always click "Fix Access"** after creating multiple users
2. **Check console logs** for any Firebase errors
3. **Test with one user first** before creating many
4. **Keep browser console open** to catch issues early

## 🚀 **Quick Test Sequence**

```bash
# 1. Create a test user via admin panel
# 2. Note the email and password
# 3. Open new incognito tab
# 4. Go to /login
# 5. Try logging in with test credentials
# 6. If "Access Suspended" → click "Fix Access" in admin panel
# 7. Try logging in again → should work!
```

## 📞 **If Still Not Working**

1. **Check browser console** for red error messages
2. **Check Firebase console** → Firestore → `clinics` collection
3. **Verify demo clinic exists** with `isActive: true`
4. **Check user document** has correct `clinicId: "demo-clinic"`
5. **Try creating a new clinic** and assigning users to it

The "Fix Access" button should resolve 95% of clinic access issues! 🎯 
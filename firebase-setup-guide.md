# Firebase Project Setup Guide
# This guide will help you resolve the Firestore 400 errors

## 🔍 Problem Analysis
The 400 errors you're seeing are likely due to one of these issues:

1. **Missing Google Cloud APIs**: The Firebase project needs certain APIs enabled
2. **Authentication Issues**: The app is trying to connect before authentication
3. **Project Configuration**: The Firebase project might need additional setup

## 🛠️ Solution Steps

### Step 1: Enable Required Google Cloud APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `clinic-d9c0a`
3. Go to "APIs & Services" > "Library"
4. Search for and enable these APIs:
   - **Firestore API** (should already be enabled)
   - **Firebase Authentication API**
   - **Firebase Hosting API**
   - **Firebase Storage API**
   - **Firebase Functions API**

### Step 2: Check Firebase Project Settings
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `clinic-d9c0a`
3. Go to "Project Settings" > "General"
4. Verify the web app configuration matches your `.env` file

### Step 3: Verify Authentication Setup
1. In Firebase Console, go to "Authentication" > "Sign-in method"
2. Make sure "Email/Password" is enabled
3. Add your domain to authorized domains if needed

### Step 4: Check Firestore Rules
Your Firestore rules look correct, but verify they're deployed:
```bash
firebase deploy --only firestore:rules
```

### Step 5: Test the Configuration
1. Restart your development server
2. Open the browser console
3. Look for any Firebase initialization errors
4. Try logging in to see if the 400 errors persist

## 🔧 Additional Debugging

If the 400 errors persist, try these steps:

1. **Clear browser cache and cookies**
2. **Check if you're logged into the correct Google account**
3. **Verify the Firebase project is in the correct region**
4. **Check if there are any billing issues with the project**

## 📋 Current Configuration Status

✅ Firebase Project: `clinic-d9c0a`  
✅ Web App: `1:430481926571:web:4ac32749d6b0f674868aee`  
✅ Firestore Database: Enabled  
✅ Firestore Rules: Configured  
✅ Environment Variables: Set in `.env`  

## 🚀 Next Steps

1. Follow the steps above to enable required APIs
2. Restart your development server
3. Test the application
4. If issues persist, check the browser console for specific error messages

The 400 errors should be resolved once the proper APIs are enabled and the project is fully configured.

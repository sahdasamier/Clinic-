# 🔥 Firebase Health Check & Verification Guide

This guide helps you verify that all Firebase services and functionality are working correctly in your clinic management system.

## 🚀 Quick Health Check (5 Minutes)

Run these checks in order to verify your Firebase setup:

### 1. Firebase Connection Test

Open your browser console on your app and run:

```javascript
// Test 1: Firebase App Initialization
console.log('🔥 Firebase App:', firebase.app().name);
console.log('📋 Firebase Config:', firebase.app().options);

// Test 2: Authentication Service
console.log('🔐 Auth Service:', firebase.auth().app.name);

// Test 3: Firestore Service  
console.log('💾 Firestore Service:', firebase.firestore().app.name);

// Test 4: Check if online
console.log('🌐 Network Status:', navigator.onLine ? 'Online' : 'Offline');
```

**Expected Results:**
- ✅ Firebase app name should be "[DEFAULT]"
- ✅ Config should show your project details
- ✅ Auth and Firestore should be initialized
- ✅ Network should be online

### 2. Authentication Test

```javascript
// Test current auth state
const user = firebase.auth().currentUser;
if (user) {
  console.log('✅ User authenticated:', user.email);
  console.log('🆔 User UID:', user.uid);
  
  // Test token and claims
  user.getIdTokenResult().then(idTokenResult => {
    console.log('🎫 Token Claims:', idTokenResult.claims);
    console.log('🔐 Is Admin:', idTokenResult.claims.admin === true);
  });
} else {
  console.log('❌ No user authenticated');
}
```

### 3. Firestore Connection Test

```javascript
// Test Firestore connection
firebase.firestore().enableNetwork().then(() => {
  console.log('✅ Firestore connected');
  
  // Test read access
  return firebase.firestore().collection('clinics').limit(1).get();
}).then(snapshot => {
  console.log('✅ Firestore read test passed:', snapshot.size, 'documents');
}).catch(error => {
  console.error('❌ Firestore test failed:', error);
});
```

## 🧪 Comprehensive System Tests

### Test 1: Firebase Configuration Verification

Create a test file `firebase-test.html` and open it in your browser:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Firebase Health Check</title>
    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js"></script>
</head>
<body>
    <h1>Firebase Health Check</h1>
    <div id="results"></div>
    
    <script>
        // Your Firebase config
        const firebaseConfig = {
           const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // optional
};
        };
        
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        
        function logResult(message, isSuccess = true) {
            const div = document.getElementById('results');
            div.innerHTML += `<p style="color: ${isSuccess ? 'green' : 'red'}">${message}</p>`;
            console.log(message);
        }
        
        // Test Firebase initialization
        try {
            logResult('✅ Firebase app initialized successfully');
            logResult(`📱 App name: ${firebase.app().name}`);
            logResult(`🔧 Project ID: ${firebase.app().options.projectId}`);
        } catch (error) {
            logResult(`❌ Firebase initialization failed: ${error.message}`, false);
        }
        
        // Test Auth service
        try {
            const auth = firebase.auth();
            logResult('✅ Firebase Auth service available');
        } catch (error) {
            logResult(`❌ Firebase Auth failed: ${error.message}`, false);
        }
        
        // Test Firestore service
        try {
            const db = firebase.firestore();
            logResult('✅ Firebase Firestore service available');
        } catch (error) {
            logResult(`❌ Firebase Firestore failed: ${error.message}`, false);
        }
    </script>
</body>
</html>
```

### Test 2: Authentication Flow Test

```javascript
async function testAuthFlow() {
    console.log('🔄 Testing authentication flow...');
    
    try {
        // Test sign up
        const testEmail = `test-${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        
        const userCredential = await firebase.auth()
            .createUserWithEmailAndPassword(testEmail, testPassword);
        console.log('✅ Sign up test passed:', userCredential.user.uid);
        
        // Test sign out
        await firebase.auth().signOut();
        console.log('✅ Sign out test passed');
        
        // Test sign in
        await firebase.auth().signInWithEmailAndPassword(testEmail, testPassword);
        console.log('✅ Sign in test passed');
        
        // Clean up - delete test user
        await firebase.auth().currentUser.delete();
        console.log('✅ Test user cleanup completed');
        
    } catch (error) {
        console.error('❌ Auth flow test failed:', error);
    }
}

// Run the test
testAuthFlow();
```

### Test 3: Firestore Rules Test

```javascript
async function testFirestoreRules() {
    console.log('🔄 Testing Firestore security rules...');
    
    // Test 1: Unauthenticated access (should fail)
    try {
        await firebase.firestore().collection('users').add({
            email: 'test@example.com',
            role: 'admin'
        });
        console.log('❌ Security breach: Unauthenticated write succeeded!');
    } catch (error) {
        console.log('✅ Security test passed: Unauthenticated write blocked');
    }
    
    // Test 2: Read access
    try {
        const snapshot = await firebase.firestore().collection('clinics').limit(1).get();
        console.log('✅ Read access test passed:', snapshot.size, 'documents');
    } catch (error) {
        console.error('❌ Read access test failed:', error);
    }
}

// Run the test
testFirestoreRules();
```

### Test 4: Admin Claims Verification

```javascript
async function testAdminClaims() {
    console.log('🔄 Testing admin custom claims...');
    
    const user = firebase.auth().currentUser;
    if (!user) {
        console.log('❌ No user logged in for claims test');
        return;
    }
    
    try {
        const idTokenResult = await user.getIdTokenResult();
        const claims = idTokenResult.claims;
        
        console.log('📋 User claims:', claims);
        console.log('🔐 Admin status:', claims.admin === true ? 'Admin' : 'Regular user');
        console.log('🏷️ Role:', claims.role || 'No role set');
        console.log('📅 Token issued:', new Date(idTokenResult.issuedAtTime));
        console.log('⏰ Token expires:', new Date(idTokenResult.expirationTime));
        
        if (claims.admin === true) {
            console.log('✅ Admin claims verified successfully');
        } else {
            console.log('ℹ️ User does not have admin claims');
        }
        
    } catch (error) {
        console.error('❌ Claims verification failed:', error);
    }
}

// Run the test
testAdminClaims();
```

### Test 5: Secondary App Test

```javascript
async function testSecondaryApp() {
    console.log('🔄 Testing secondary Firebase app creation...');
    
    try {
        // Get current Firebase config
        const config = firebase.app().options;
        
        // Create secondary app
        const secondaryApp = firebase.initializeApp(config, 'TestSecondary');
        console.log('✅ Secondary app created:', secondaryApp.name);
        
        // Test secondary auth
        const secondaryAuth = firebase.auth(secondaryApp);
        console.log('✅ Secondary auth service available');
        
        // Clean up
        await secondaryApp.delete();
        console.log('✅ Secondary app cleanup completed');
        
    } catch (error) {
        console.error('❌ Secondary app test failed:', error);
    }
}

// Run the test
testSecondaryApp();
```

## 🔧 Complete Health Check Script

Create this script to run all tests at once:

```javascript
// firebase-health-check.js
async function runCompleteHealthCheck() {
    console.log('🏥 Starting Firebase Health Check...\n');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function recordTest(name, success, message) {
        results.tests.push({ name, success, message });
        if (success) {
            results.passed++;
            console.log(`✅ ${name}: ${message}`);
        } else {
            results.failed++;
            console.error(`❌ ${name}: ${message}`);
        }
    }
    
    // Test 1: Firebase Initialization
    try {
        const app = firebase.app();
        recordTest('Firebase Init', true, `App "${app.name}" initialized`);
    } catch (error) {
        recordTest('Firebase Init', false, error.message);
    }
    
    // Test 2: Auth Service
    try {
        const auth = firebase.auth();
        const user = auth.currentUser;
        recordTest('Auth Service', true, user ? `User: ${user.email}` : 'Service available');
    } catch (error) {
        recordTest('Auth Service', false, error.message);
    }
    
    // Test 3: Firestore Service
    try {
        await firebase.firestore().enableNetwork();
        const snapshot = await firebase.firestore().collection('clinics').limit(1).get();
        recordTest('Firestore Service', true, `Connected, ${snapshot.size} docs found`);
    } catch (error) {
        recordTest('Firestore Service', false, error.message);
    }
    
    // Test 4: Admin Claims (if logged in)
    if (firebase.auth().currentUser) {
        try {
            const idTokenResult = await firebase.auth().currentUser.getIdTokenResult();
            const isAdmin = idTokenResult.claims.admin === true;
            recordTest('Admin Claims', true, isAdmin ? 'Admin verified' : 'Regular user');
        } catch (error) {
            recordTest('Admin Claims', false, error.message);
        }
    }
    
    // Test 5: Secondary App
    try {
        const config = firebase.app().options;
        const secondaryApp = firebase.initializeApp(config, `HealthCheck-${Date.now()}`);
        await secondaryApp.delete();
        recordTest('Secondary App', true, 'Created and cleaned up successfully');
    } catch (error) {
        recordTest('Secondary App', false, error.message);
    }
    
    // Results Summary
    console.log('\n📊 Health Check Results:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 All Firebase services are working correctly!');
    } else {
        console.log('\n⚠️ Some issues found. Check the details above.');
    }
    
    return results;
}

// Run the health check
runCompleteHealthCheck();
```

## 🔍 Environment-Specific Checks

### Development Environment
```javascript
// Check if in development mode
if (window.location.hostname === 'localhost') {
    console.log('🛠️ Development mode detected');
    
    // Check for emulators
    try {
        firebase.firestore().useEmulator('localhost', 8080);
        console.log('📱 Firestore emulator connected');
    } catch (error) {
        console.log('ℹ️ No Firestore emulator');
    }
    
    try {
        firebase.auth().useEmulator('http://localhost:9099');
        console.log('🔐 Auth emulator connected');
    } catch (error) {
        console.log('ℹ️ No Auth emulator');
    }
}
```

### Production Environment
```javascript
// Production-specific checks
if (window.location.hostname !== 'localhost') {
    console.log('🚀 Production mode detected');
    
    // Check SSL
    if (window.location.protocol === 'https:') {
        console.log('✅ SSL enabled');
    } else {
        console.log('⚠️ SSL not enabled');
    }
    
    // Check performance
    const startTime = performance.now();
    firebase.firestore().collection('clinics').limit(1).get().then(() => {
        const loadTime = performance.now() - startTime;
        console.log(`⚡ Firestore response time: ${loadTime.toFixed(2)}ms`);
    });
}
```

## 🚨 Common Issues & Solutions

### Issue: "Firebase App already exists"
```javascript
// Solution: Check and delete existing apps
firebase.apps.forEach(app => {
    if (app.name !== '[DEFAULT]') {
        app.delete().then(() => {
            console.log(`Deleted app: ${app.name}`);
        });
    }
});
```

### Issue: "Insufficient permissions"
```javascript
// Check current user permissions
const user = firebase.auth().currentUser;
if (user) {
    user.getIdTokenResult().then(result => {
        console.log('Current permissions:', result.claims);
    });
}
```

### Issue: Network connectivity
```javascript
// Test network connectivity
function testNetworkConnectivity() {
    return fetch('https://firebase.googleapis.com/', { mode: 'no-cors' })
        .then(() => {
            console.log('✅ Firebase network connectivity OK');
            return true;
        })
        .catch(() => {
            console.log('❌ Firebase network connectivity failed');
            return false;
        });
}

testNetworkConnectivity();
```

## 📋 Health Check Checklist

Run through this checklist to ensure everything is working:

- [ ] **Firebase App Initialization**: App loads without errors
- [ ] **Authentication Service**: Can sign in/out users
- [ ] **Firestore Database**: Can read/write data
- [ ] **Security Rules**: Block unauthorized access
- [ ] **Admin Custom Claims**: Properly set and verified
- [ ] **Secondary Apps**: Can create and cleanup
- [ ] **Network Connectivity**: All Firebase services reachable
- [ ] **Error Handling**: Graceful failure modes work
- [ ] **Performance**: Reasonable response times
- [ ] **Production Config**: Correct project and environment

## 🎯 Expected Results Summary

When everything is working correctly, you should see:

✅ **Firebase App**: Initialized with correct project ID  
✅ **Authentication**: Users can sign in/out successfully  
✅ **Firestore**: Database reads/writes work with proper security  
✅ **Admin Claims**: Custom claims are set and verified  
✅ **Secondary Apps**: Can create/cleanup without conflicts  
✅ **Security Rules**: Unauthorized access is blocked  
✅ **Performance**: Reasonable response times (<2 seconds)  

**🏆 When all tests pass, your Firebase setup is production-ready!** 
#!/bin/bash

# Firebase Project Setup and Verification Script
# This script helps resolve Firestore 400 errors

echo "🔥 Firebase Project Setup and Verification"
echo "=========================================="

# Check if we're in the right project
echo "📋 Current Firebase Project:"
firebase use

echo ""
echo "🔍 Checking Firebase Configuration..."

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
    
    # Check if required variables are set
    if grep -q "VITE_FIREBASE_API_KEY" .env; then
        echo "✅ VITE_FIREBASE_API_KEY is set"
    else
        echo "❌ VITE_FIREBASE_API_KEY is missing"
    fi
    
    if grep -q "VITE_FIREBASE_PROJECT_ID" .env; then
        echo "✅ VITE_FIREBASE_PROJECT_ID is set"
    else
        echo "❌ VITE_FIREBASE_PROJECT_ID is missing"
    fi
else
    echo "❌ .env file not found"
    echo "   Run: ./setup-firebase-config.sh"
    exit 1
fi

echo ""
echo "🔧 Checking Firebase Services..."

# Check Firestore
if firebase firestore:databases:list > /dev/null 2>&1; then
    echo "✅ Firestore is enabled"
else
    echo "❌ Firestore is not enabled"
fi

# Check web apps
if firebase apps:list > /dev/null 2>&1; then
    echo "✅ Web apps are configured"
else
    echo "❌ No web apps found"
fi

echo ""
echo "📋 Next Steps to Resolve 400 Errors:"
echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
echo "2. Select project: clinic-d9c0a"
echo "3. Go to 'APIs & Services' > 'Library'"
echo "4. Enable these APIs:"
echo "   - Firestore API"
echo "   - Firebase Authentication API"
echo "   - Firebase Hosting API"
echo "   - Firebase Storage API"
echo "   - Firebase Functions API"
echo ""
echo "5. Restart your development server:"
echo "   npm run dev"
echo ""
echo "6. Test the application in your browser"
echo ""
echo "💡 If you still see 400 errors, check the browser console for specific error messages."

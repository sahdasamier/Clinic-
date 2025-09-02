#!/bin/bash

# Script to set admin claims using Firebase CLI
# This is a simpler approach that doesn't require service account keys

echo "🔧 Setting admin claims using Firebase CLI..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase auth:list &> /dev/null; then
    echo "❌ Not logged into Firebase. Please run: firebase login"
    exit 1
fi

# Set admin claims for the super admin email
EMAIL="sahdasamier013@gmail.com"

echo "🔧 Setting admin claims for: $EMAIL"

# Use Firebase CLI to set custom claims
firebase auth:set-custom-claims $EMAIL '{"admin": true, "role": "super_admin", "clinicId": "demo-clinic"}'

if [ $? -eq 0 ]; then
    echo "✅ Admin claims set successfully for $EMAIL"
    echo ""
    echo "🔄 Next steps:"
    echo "1. Sign out and sign back in to refresh your token"
    echo "2. Try completing the medical requirement order again"
    echo "3. The new Firestore rules should now work correctly"
else
    echo "❌ Failed to set admin claims"
    echo ""
    echo "💡 Alternative: You can set admin claims manually in Firebase Console:"
    echo "1. Go to Firebase Console > Authentication > Users"
    echo "2. Find your user and click 'Edit'"
    echo "3. Add custom claims: {\"admin\": true, \"role\": \"super_admin\", \"clinicId\": \"demo-clinic\"}"
fi

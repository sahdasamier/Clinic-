#!/bin/bash

# Deploy Firestore Security Rules
echo "🚀 Deploying Firestore security rules..."

# Make sure we're in the project directory
if [ ! -f "firestore.rules" ]; then
    echo "❌ Error: firestore.rules not found. Make sure you're in the project root directory."
    exit 1
fi

# Deploy only firestore rules
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully!"
    echo "🔐 Multi-clinic security rules are now active."
    echo ""
    echo "Your security rules now include:"
    echo "  - Super admin access for: admin@sahdasclinic.com, sahdasamier013@gmail.com"
    echo "  - Clinic isolation for all regular users"
    echo "  - Complete data separation between clinics"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi 
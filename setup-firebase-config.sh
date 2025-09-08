#!/bin/bash

# Firebase Configuration Setup Script
# This script will create a .env file for either development or production

echo "🔥 Firebase Configuration Setup"
echo "Which environment do you want to configure?"
read -p "Enter 'dev' for Development or 'prod' for Production: " env_choice

# --- DEVELOPMENT CONFIGURATION ---
if [[ "$env_choice" == "dev" ]]; then
  echo "🚀 Setting up DEVELOPMENT configuration for clinic-d9c0a..."

  cat > .env << 'EOF'
# Firebase Configuration for clinic-d9c0a (DEVELOPMENT)
VITE_FIREBASE_API_KEY=AIzaSyDotAr3OZOao6-2EGsg6xusem8ENdgRa-E
VITE_FIREBASE_AUTH_DOMAIN=clinic-d9c0a.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=clinic-d9c0a
VITE_FIREBASE_STORAGE_BUCKET=clinic-d9c0a.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=430481926571
VITE_FIREBASE_APP_ID=1:430481926571:web:4ac32749d6b0f674868aee
VITE_FIREBASE_MEASUREMENT_ID=G-PKFMPKHVTZ
VITE_APP_ENV=development
# Add other dev-specific settings here
EOF

  echo "✅ .env file created successfully for DEVELOPMENT!"
  echo "   Project ID: clinic-d9c0a"

# --- PRODUCTION CONFIGURATION ---
elif [[ "$env_choice" == "prod" ]]; then
  echo "🌍 Setting up PRODUCTION configuration for clinicy-health..."

  cat > .env << 'EOF'
# Firebase Configuration for clinicy-health (PRODUCTION)
VITE_FIREBASE_API_KEY="AIzaSyBU9NyJYqpve2-Ac_hvKOhUtFlRtb2yJlc"
VITE_FIREBASE_AUTH_DOMAIN="clinicy-health.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="clinicy-health"
VITE_FIREBASE_STORAGE_BUCKET="clinicy-health.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="61851414075"
VITE_FIREBASE_APP_ID="1:61851414075:web:5346d6a0d537557e0d361e"
VITE_FIREBASE_MEASUREMENT_ID="G-8FP069MDN0"
VITE_APP_ENV=production
# Add other prod-specific settings here
EOF

  echo "✅ .env file created successfully for PRODUCTION!"
  echo "   Project ID: clinicy-health"

# --- INVALID INPUT ---
else
  echo "❌ Invalid choice. Please run the script again and enter 'dev' or 'prod'."
  exit 1
fi

echo ""
echo "🔄 Please restart your development server to apply the new configuration."
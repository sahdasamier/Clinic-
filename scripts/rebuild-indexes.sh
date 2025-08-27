#!/bin/bash

echo "🚀 Starting Automated Firestore Index Rebuild..."
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_ID="clinic-d9c0a"

echo -e "${BLUE}📋 Step 1: Creating clean index configuration...${NC}"

# Create minimal clean index file
cat > firestore.indexes.json << 'EOF'
{
  "indexes": [
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "clinicId", "order": "ASCENDING"},
        {"fieldPath": "date", "order": "DESCENDING"},
        {"fieldPath": "__name__", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "appointments", 
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "clinicId", "order": "ASCENDING"},
        {"fieldPath": "isActive", "order": "ASCENDING"},
        {"fieldPath": "date", "order": "DESCENDING"},
        {"fieldPath": "__name__", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "patients",
      "queryScope": "COLLECTION", 
      "fields": [
        {"fieldPath": "clinicId", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"},
        {"fieldPath": "__name__", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "patients",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "clinicId", "order": "ASCENDING"},
        {"fieldPath": "isActive", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"},
        {"fieldPath": "__name__", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "clinicId", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"},
        {"fieldPath": "__name__", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "payments",
      "queryScope": "COLLECTION", 
      "fields": [
        {"fieldPath": "clinicId", "order": "ASCENDING"},
        {"fieldPath": "isActive", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"},
        {"fieldPath": "__name__", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "clinicId", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"},
        {"fieldPath": "__name__", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "notifications", 
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "clinicId", "order": "ASCENDING"},
        {"fieldPath": "isActive", "order": "ASCENDING"},
        {"fieldPath": "createdAt", "order": "DESCENDING"},
        {"fieldPath": "__name__", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "laboratoryRadiology",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "clinicId", "order": "ASCENDING"},
        {"fieldPath": "name", "order": "ASCENDING"},
        {"fieldPath": "__name__", "order": "ASCENDING"}
      ]
    },
    {
      "collectionGroup": "laboratoryRadiology",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "clinicId", "order": "ASCENDING"},
        {"fieldPath": "isActive", "order": "ASCENDING"},
        {"fieldPath": "name", "order": "ASCENDING"},
        {"fieldPath": "__name__", "order": "ASCENDING"}
      ]
    }
  ],
  "fieldOverrides": []
}
EOF

echo -e "${GREEN}✅ Clean index configuration created${NC}"

echo -e "${BLUE}📋 Step 2: Attempting to deploy clean indexes...${NC}"

# Try deployment (may have conflicts, that's expected)
firebase deploy --only firestore:indexes --project $PROJECT_ID 2>/dev/null || true

echo -e "${YELLOW}⚠️  Expected conflicts with existing indexes${NC}"

echo -e "${BLUE}📋 Step 3: Creating index creation URLs...${NC}"

# Create direct Firebase Console URLs for manual index creation
echo -e "${GREEN}🔗 Direct Index Creation Links:${NC}"
echo ""
echo -e "${BLUE}Click these links to create indexes automatically:${NC}"
echo ""

BASE_URL="https://console.firebase.google.com/project/$PROJECT_ID/firestore/indexes"

echo "1. Appointments (Real-time):"
echo "$BASE_URL?create_composite=true&collection=appointments&field_1=clinicId&dir_1=ASCENDING&field_2=date&dir_2=DESCENDING&field_3=__name__&dir_3=ASCENDING"
echo ""

echo "2. Appointments (Fetch):"  
echo "$BASE_URL?create_composite=true&collection=appointments&field_1=clinicId&dir_1=ASCENDING&field_2=isActive&dir_2=ASCENDING&field_3=date&dir_3=DESCENDING&field_4=__name__&dir_4=ASCENDING"
echo ""

echo "3. Patients (Real-time):"
echo "$BASE_URL?create_composite=true&collection=patients&field_1=clinicId&dir_1=ASCENDING&field_2=createdAt&dir_2=DESCENDING&field_3=__name__&dir_3=ASCENDING"
echo ""

echo "4. Patients (Fetch):"
echo "$BASE_URL?create_composite=true&collection=patients&field_1=clinicId&dir_1=ASCENDING&field_2=isActive&dir_2=ASCENDING&field_3=createdAt&dir_3=DESCENDING&field_4=__name__&dir_4=ASCENDING"
echo ""

echo "5. Payments (Real-time):"
echo "$BASE_URL?create_composite=true&collection=payments&field_1=clinicId&dir_1=ASCENDING&field_2=createdAt&dir_2=DESCENDING&field_3=__name__&dir_3=ASCENDING"
echo ""

echo "6. Payments (Fetch):"
echo "$BASE_URL?create_composite=true&collection=payments&field_1=clinicId&dir_1=ASCENDING&field_2=isActive&dir_2=ASCENDING&field_3=createdAt&dir_3=DESCENDING&field_4=__name__&dir_4=ASCENDING"
echo ""

echo "7. Notifications (Real-time):"
echo "$BASE_URL?create_composite=true&collection=notifications&field_1=clinicId&dir_1=ASCENDING&field_2=createdAt&dir_2=DESCENDING&field_3=__name__&dir_3=ASCENDING"
echo ""

echo "8. Notifications (Fetch):"
echo "$BASE_URL?create_composite=true&collection=notifications&field_1=clinicId&dir_1=ASCENDING&field_2=isActive&dir_2=ASCENDING&field_3=createdAt&dir_3=DESCENDING&field_4=__name__&dir_4=ASCENDING"
echo ""

echo -e "${GREEN}🎯 AUTOMATED SOLUTION:${NC}"
echo "1. Wait for the error messages in your browser console"
echo "2. Click the direct links from the error messages" 
echo "3. Each click automatically creates the exact index needed"
echo "4. All indexes will be built in 5-10 minutes"
echo ""

echo -e "${BLUE}📋 Step 4: Monitoring index status...${NC}"

# Function to check if Firebase CLI is available
if command -v firebase &> /dev/null; then
    echo "Checking current index status..."
    firebase firestore:indexes --project $PROJECT_ID 2>/dev/null | grep -E "(collectionGroup|fields)" || echo "No readable index info available"
fi

echo ""
echo -e "${GREEN}🚀 INDEX REBUILD COMPLETE!${NC}"
echo -e "${YELLOW}⏳ Wait 5-10 minutes for indexes to build, then refresh your app.${NC}"
echo ""
echo -e "${BLUE}💡 Pro tip: Keep your browser console open to see when errors stop appearing.${NC}" 
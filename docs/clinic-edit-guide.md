# Clinic Edit Functionality Guide

## Overview
The admin panel now includes comprehensive clinic edit capabilities, allowing you to modify clinic information, subscription plans, and user limits.

## How to Edit a Clinic

### Step 1: Access Clinic Management
1. Login to admin panel at `/admin/login`
2. Navigate to **Clinics Management** tab
3. Find the clinic you want to edit in the table

### Step 2: Open Edit Dialog
1. Click the **blue edit icon** (pencil) next to the clinic
2. Edit dialog opens with current clinic information pre-filled

### Step 3: Make Changes
You can modify:
- **Clinic Name**: Update display name
- **Subscription Plan**: Basic/Premium/Enterprise
- **Max Users**: Adjust user limits

### Step 4: Save Changes
1. Click **"Update"** button
2. Changes are saved immediately
3. Clinic table refreshes with new information

## What You Can Edit

### ✅ **Editable Fields**
- **Clinic Name**: Display name for the clinic
- **Subscription Plan**: Business tier (Basic/Premium/Enterprise)
- **Max Users**: Maximum allowed users for this clinic

### ❌ **Not Editable**
- **Creation Date**: Historical information
- **Clinic ID**: System-generated identifier
- **Created By**: Original creator information
- **Status**: Use toggle switch for enable/disable

## Common Use Cases

### 1. **Business Growth**
```
Clinic expands → Upgrade plan → Increase user limits
```
- Edit clinic → Change to Premium/Enterprise → Update
- More features and users available immediately

### 2. **Plan Downgrade**
```
Budget constraints → Downgrade plan → Reduce user limits
```
- Edit clinic → Change to Basic → Reduce max users
- Features adjusted based on new plan

### 3. **Name Changes**
```
Rebranding, merger, name change
```
- Edit clinic → Update name → Save
- Clinic appears with new name throughout system

### 4. **User Limit Adjustments**
```
Team size changes → Adjust user limits
```
- Edit → Change max users → Update
- Controls how many staff can be added

## Actions Available

In the **Actions** column for clinics, you now have:

| Icon | Action | Purpose |
|------|--------|---------|
| 🔄 | **Toggle Switch** | Enable/Disable clinic |
| ✏️ | **Edit Button** | Modify clinic information |
| 🗑️ | **Delete Button** | Permanently remove clinic |

## Subscription Plans

### **Basic Plan**
- ✅ Core clinic features
- ✅ Limited user count
- ✅ Standard support

### **Premium Plan** 
- ✅ All Basic features
- ✅ Higher user limits
- ✅ Advanced features
- ✅ Priority support

### **Enterprise Plan**
- ✅ All Premium features  
- ✅ Unlimited users
- ✅ Custom features
- ✅ Dedicated support

## User Limit Management

### **Setting Limits**:
- **Basic**: Typically 5-10 users
- **Premium**: 20-50 users  
- **Enterprise**: 100+ users or unlimited

### **Enforcement**:
- System prevents adding users beyond limit
- Clear error messages when limit reached
- Upgrade prompt for additional users

## Validation Rules

### Required Fields:
- ✅ **Clinic Name** (must not be empty)
- ✅ **Subscription Plan** (must select one)
- ✅ **Max Users** (must be positive number)

### Automatic Handling:
- ✅ **Updated timestamp** automatically set
- ✅ **Form validation** before saving
- ✅ **Error messages** for invalid data

## Security Features

### Access Control:
- **Only super admins** can edit clinics
- **Immediate effect** on all clinic operations
- **Audit trail** with updated timestamps

### Data Integrity:
- **Validation**: Ensures required fields
- **Error handling**: Graceful failure management
- **Rollback**: Failed updates don't corrupt data

## Business Impact

### **Subscription Changes**:
- **Immediate**: Plan changes take effect instantly
- **Features**: Access to plan-specific features updated
- **Billing**: Should be coordinated with billing system

### **User Limit Changes**:
- **Existing Users**: No impact on current users
- **New Users**: Limited by new max count
- **Enforcement**: Prevents over-allocation

## Error Handling

### Common Issues:
- **Empty clinic name**: Form validation prevents submission
- **Invalid user limits**: Must be positive numbers
- **Network errors**: Retry mechanism with error messages

### Success Indicators:
- ✅ **Success message**: Clinic updated successfully
- ✅ **Table refresh**: New data appears immediately
- ✅ **Dialog closes**: Edit completed

## Tips for Efficient Clinic Management

1. **Plan Appropriately**: Choose plans based on actual needs
2. **Monitor Usage**: Track user counts vs limits
3. **Coordinate Changes**: Sync with billing and contracts
4. **Document Changes**: Keep records of plan changes

## Troubleshooting

### Edit Button Not Working?
- Check if you're logged in as super admin
- Verify network connection
- Refresh the page

### Changes Not Saving?
- Ensure clinic name is not empty
- Check user limit is a positive number
- Verify network connection

### Plan Changes Not Reflecting?
- Refresh browser cache
- Check if users notice feature changes
- Verify in admin panel stats

## Business Scenarios

### **Quarterly Reviews**
```
Review clinic performance → Adjust plans accordingly
```
- High-performing clinics: Upgrade to Premium/Enterprise
- Budget-conscious clinics: Maintain or downgrade plans

### **Seasonal Adjustments**
```
Busy season coming → Temporarily increase user limits
Off-season → Reduce limits to save costs
```

### **Merger/Acquisition**
```
Clinic merger → Update name and increase user limits
```
- Change name to reflect new structure
- Increase user limits for combined staff

## Future Enhancements

Planned features:
- **Bulk clinic edit** for multiple clinics
- **Plan comparison tool** to show feature differences
- **Usage analytics** to recommend plan changes
- **Automated billing integration** for plan changes 
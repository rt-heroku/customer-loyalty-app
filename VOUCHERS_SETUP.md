# Vouchers Setup Guide

## Overview
The vouchers functionality has been implemented in the loyalty page. This guide explains how to set up and test the vouchers feature.

## Database Setup

### 1. Load Sample Voucher Data
To test the vouchers functionality, you need to load sample data into your database:

```bash
# Make sure your database is running
./load_sample_vouchers.sh
```

Or manually run:
```bash
psql -h localhost -U postgres -d customer_loyalty_app -f db/sample_vouchers.sql
```

### 2. Sample Data Included
The sample data includes:
- **4 customers** with different voucher scenarios
- **Various voucher types**: Discount (percentage), Value (fixed amount)
- **Different statuses**: Issued, Redeemed, Expired
- **Proper dates**: Creation, expiration, and redemption dates

## Testing the Vouchers Feature

### 1. Access the Loyalty Page
1. Log in to the application
2. Navigate to `/loyalty`
3. Click on the "Vouchers" tab

### 2. Expected Behavior
- **Available Vouchers**: Shows vouchers with status "Issued" that haven't expired
- **Redeemed Vouchers**: Shows vouchers with status "Redeemed" (grayed out)
- **Expired Vouchers**: Shows vouchers that have expired (muted styling)

### 3. Voucher Display Features
- **Images**: Shows voucher images if available
- **Status Indicators**: Color-coded status badges
- **Value Display**: Shows discount percentage or fixed amount
- **Dates**: Displays expiration and redemption dates
- **Product Association**: Shows related product information

## API Endpoints

### GET /api/loyalty/vouchers
Returns all vouchers for the authenticated customer, grouped by status.

**Response Format:**
```json
{
  "success": true,
  "vouchers": [...],
  "groupedVouchers": {
    "issued": [...],
    "redeemed": [...],
    "expired": [...]
  },
  "total": 9
}
```

## Troubleshooting

### No Vouchers Showing
1. **Check Database**: Ensure sample data was loaded successfully
2. **Check Authentication**: Make sure you're logged in
3. **Check Console**: Look for API errors in browser console
4. **Check Server Logs**: Look for debugging output in terminal

### Debug Information
The API includes console logging to help debug issues:
- User authentication status
- Customer ID lookup
- Voucher query results
- Grouped voucher counts

## Database Schema

The vouchers use the `customer_vouchers` table with the following key fields:
- `customer_id`: Links to customers table
- `voucher_code`: Unique voucher identifier
- `name`: Display name for the voucher
- `status`: Issued, Redeemed, Expired, etc.
- `voucher_type`: Discount, Value, ProductSpecific
- `face_value`: Fixed amount for value vouchers
- `discount_percent`: Percentage for discount vouchers
- `expiration_date`: When the voucher expires
- `use_date`: When the voucher was redeemed

## Next Steps

1. Load the sample data using the provided script
2. Test the vouchers functionality in the loyalty page
3. Verify that different voucher types display correctly
4. Check that status grouping works properly
5. Test the visual styling for different voucher states

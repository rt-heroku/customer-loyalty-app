#!/bin/bash

# Script to load sample voucher data into the database
# Make sure your database is running and accessible

echo "Loading sample voucher data..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found. Please install PostgreSQL client tools."
    exit 1
fi

# Try to connect to the database and load sample data
# You may need to adjust the connection parameters based on your setup
psql -h localhost -U postgres -d customer_loyalty_app -f db/sample_vouchers.sql

if [ $? -eq 0 ]; then
    echo "Sample voucher data loaded successfully!"
    echo "You can now test the vouchers functionality in the loyalty page."
else
    echo "Error loading sample data. Please check your database connection."
    echo "Make sure your database is running and accessible."
    echo ""
    echo "You can also manually run:"
    echo "psql -h localhost -U postgres -d customer_loyalty_app -f db/sample_vouchers.sql"
fi

-- Migration: Add Paymob payment tracking fields to orders table
-- Date: 2025-10-18
-- Description: Adds three columns to track Paymob payment information

-- Add paymob_order_id column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS paymob_order_id TEXT;

-- Add paymob_transaction_id column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS paymob_transaction_id TEXT;

-- Add paymob_payment_key column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS paymob_payment_key TEXT;

-- Add indexes for better query performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_orders_paymob_order_id 
ON orders(paymob_order_id) 
WHERE paymob_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_paymob_transaction_id 
ON orders(paymob_transaction_id) 
WHERE paymob_transaction_id IS NOT NULL;

-- Verify the migration
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'paymob_order_id'
    ) THEN
        RAISE NOTICE 'Migration completed successfully! Paymob fields added to orders table.';
    ELSE
        RAISE EXCEPTION 'Migration failed! Paymob fields not found in orders table.';
    END IF;
END $$;


-- Migration: Add order management fields for Instagram integration
-- Adds tracking, admin notes, and Instagram product mapping

-- Update orders table with new fields
DO $$ 
BEGIN
    -- Add tracking code if not exists (already exists, but ensure it's there)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='trackingCode') THEN
        ALTER TABLE orders ADD COLUMN "trackingCode" VARCHAR(255);
    END IF;

    -- Add tracking URL for DTDC
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='trackingUrl') THEN
        ALTER TABLE orders ADD COLUMN "trackingUrl" VARCHAR(500);
    END IF;

    -- Add admin notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='adminNotes') THEN
        ALTER TABLE orders ADD COLUMN "adminNotes" TEXT;
    END IF;

    -- Add contact method (INSTAGRAM, EMAIL, etc.)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='contactMethod') THEN
        ALTER TABLE orders ADD COLUMN "contactMethod" VARCHAR(50) DEFAULT 'INSTAGRAM';
    END IF;

    -- Add status history to track all status changes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='statusHistory') THEN
        ALTER TABLE orders ADD COLUMN "statusHistory" JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add customer Instagram handle (optional)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='customerInstagram') THEN
        ALTER TABLE orders ADD COLUMN "customerInstagram" VARCHAR(255);
    END IF;
END $$;

-- Update products table with Instagram mapping
DO $$ 
BEGIN
    -- Add Instagram product ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='products' AND column_name='instagramProductId') THEN
        ALTER TABLE products ADD COLUMN "instagramProductId" VARCHAR(255);
    END IF;

    -- Add Instagram product URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='products' AND column_name='instagramProductUrl') THEN
        ALTER TABLE products ADD COLUMN "instagramProductUrl" VARCHAR(500);
    END IF;

    -- Add Instagram post URL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='products' AND column_name='instagramPostUrl') THEN
        ALTER TABLE products ADD COLUMN "instagramPostUrl" VARCHAR(500);
    END IF;
END $$;

-- Update order status constraint to match new statuses
-- First, check if there's an existing enum type and handle it
DO $$
BEGIN
    -- Drop existing check constraint if it exists
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
    
    -- Add new check constraint with updated statuses
    ALTER TABLE orders ADD CONSTRAINT orders_status_check 
        CHECK (status IN ('PENDING', 'PAID', 'PROCESSING', 'MANUFACTURING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'));
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not update status constraint: %', SQLERRM;
END $$;

-- Create index for tracking code lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders("trackingCode");

-- Create index for contact method
CREATE INDEX IF NOT EXISTS idx_orders_contact_method ON orders("contactMethod");

-- Create function to automatically update status history
CREATE OR REPLACE FUNCTION update_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        NEW."statusHistory" = COALESCE(NEW."statusHistory", '[]'::jsonb) || 
            jsonb_build_object(
                'status', NEW.status,
                'timestamp', CURRENT_TIMESTAMP,
                'previousStatus', OLD.status
            );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status history
DROP TRIGGER IF EXISTS trigger_update_order_status_history ON orders;
CREATE TRIGGER trigger_update_order_status_history
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_order_status_history();

-- Add comments
COMMENT ON COLUMN orders."trackingCode" IS 'DTDC tracking number';
COMMENT ON COLUMN orders."trackingUrl" IS 'Full DTDC tracking URL';
COMMENT ON COLUMN orders."adminNotes" IS 'Internal notes for order management';
COMMENT ON COLUMN orders."contactMethod" IS 'How customer prefers to be contacted';
COMMENT ON COLUMN orders."statusHistory" IS 'JSON array of all status changes with timestamps';
COMMENT ON COLUMN orders."customerInstagram" IS 'Customer Instagram handle (optional)';

COMMENT ON COLUMN products."instagramProductId" IS 'Instagram catalog product ID';
COMMENT ON COLUMN products."instagramProductUrl" IS 'Link to Instagram product page';
COMMENT ON COLUMN products."instagramPostUrl" IS 'Link to Instagram post featuring this product';

SELECT 'Order management migration completed successfully!' as message;

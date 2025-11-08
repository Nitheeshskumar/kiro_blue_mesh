-- Migration: Add enhanced customization columns to existing customizations table
-- This adds the missing columns that were added in the enhanced customization feature

-- Add the missing columns if they don't exist
DO $$ 
BEGIN
    -- Add sleeveId column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='customizations' AND column_name='sleeveId') THEN
        ALTER TABLE customizations ADD COLUMN "sleeveId" VARCHAR(255);
        RAISE NOTICE 'Added sleeveId column';
    END IF;

    -- Add customMeasurements column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='customizations' AND column_name='customMeasurements') THEN
        ALTER TABLE customizations ADD COLUMN "customMeasurements" JSONB;
        RAISE NOTICE 'Added customMeasurements column';
    END IF;

    -- Add customOptions column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='customizations' AND column_name='customOptions') THEN
        ALTER TABLE customizations ADD COLUMN "customOptions" JSONB;
        RAISE NOTICE 'Added customOptions column';
    END IF;

    -- Add priceBreakdown column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='customizations' AND column_name='priceBreakdown') THEN
        ALTER TABLE customizations ADD COLUMN "priceBreakdown" JSONB;
        RAISE NOTICE 'Added priceBreakdown column';
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customizations' 
ORDER BY ordinal_position;

SELECT 'Migration completed successfully! Enhanced customization columns added.' as message;

-- Migration: Add Saved Addresses Feature
-- This allows users to save multiple shipping addresses

-- Create saved_addresses table
CREATE TABLE IF NOT EXISTS saved_addresses (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  label VARCHAR(100) NOT NULL, -- e.g., "Home", "Office", "Parents House"
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id ON saved_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_addresses_default ON saved_addresses(user_id, is_default);

-- Trigger to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this address as default, unset all other defaults for this user
  IF NEW.is_default = true THEN
    UPDATE saved_addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_ensure_single_default_address ON saved_addresses;
CREATE TRIGGER trigger_ensure_single_default_address
  BEFORE INSERT OR UPDATE ON saved_addresses
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_address();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_saved_addresses_updated_at ON saved_addresses;
CREATE TRIGGER trigger_update_saved_addresses_updated_at
  BEFORE UPDATE ON saved_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_addresses_updated_at();

-- If user has no default address and adds first address, make it default
CREATE OR REPLACE FUNCTION set_first_address_as_default()
RETURNS TRIGGER AS $$
DECLARE
  address_count INTEGER;
BEGIN
  -- Count existing addresses for this user
  SELECT COUNT(*) INTO address_count
  FROM saved_addresses
  WHERE user_id = NEW.user_id;
  
  -- If this is the first address, make it default
  IF address_count = 0 THEN
    NEW.is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_first_address_as_default ON saved_addresses;
CREATE TRIGGER trigger_set_first_address_as_default
  BEFORE INSERT ON saved_addresses
  FOR EACH ROW
  EXECUTE FUNCTION set_first_address_as_default();

-- Grant permissions
GRANT ALL ON saved_addresses TO postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_addresses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_addresses TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Saved addresses table created successfully!';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '  - Multiple addresses per user';
  RAISE NOTICE '  - One default address per user';
  RAISE NOTICE '  - First address automatically set as default';
  RAISE NOTICE '  - Automatic timestamp updates';
END $$;

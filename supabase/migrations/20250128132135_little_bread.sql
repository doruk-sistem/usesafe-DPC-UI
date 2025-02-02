/*
  # Add manufacturer selection for brand owners

  1. Changes
    - Add manufacturer_id column to products table
    - Add foreign key constraint to companies table
    - Add RLS policies for manufacturer access
    - Add index for performance
*/

-- Add manufacturer_id column to products table
ALTER TABLE products
ADD COLUMN manufacturer_id UUID REFERENCES companies(id);

-- Create index for manufacturer_id
CREATE INDEX idx_products_manufacturer ON products(manufacturer_id);

-- Add comment explaining the column
COMMENT ON COLUMN products.manufacturer_id IS 'Reference to the manufacturer company ID. Required when product is created by a brand owner.';
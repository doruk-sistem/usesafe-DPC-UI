-- Add contract_address column to products table
ALTER TABLE products ADD COLUMN contract_address text;

-- Add index for faster lookups
CREATE INDEX idx_products_contract_address ON products(contract_address);

-- Add comment for documentation
COMMENT ON COLUMN products.contract_address IS 'The Hedera smart contract address for this product'; 
-- Allows credit card records in financial_items.type for existing databases
ALTER TABLE financial_items
  DROP CONSTRAINT IF EXISTS financial_items_type_check;

ALTER TABLE financial_items
  ADD CONSTRAINT financial_items_type_check
  CHECK (type IN ('loan', 'investment', 'asset', 'credit_card'));

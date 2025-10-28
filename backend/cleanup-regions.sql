-- Cleanup Regions Script for Cutting Board Guys Database
-- This script removes duplicate and unwanted regions

-- First, let's see what we're dealing with
SELECT "regionId", COUNT(*) as customer_count 
FROM "Customer" 
WHERE "regionId" IN ('victoria', 'victoriq', 'vistoria', 'tsawwassen', 'tssawwassen', 'langlry', 'calgary')
   OR "province" = 'AB'
GROUP BY "regionId"
ORDER BY "regionId";

-- Start transaction for safety
BEGIN;

-- 1. Merge duplicate Victoria regions into one (keep 'victoria', remove 'victoriq' and 'vistoria')
UPDATE "Customer" 
SET "regionId" = 'victoria' 
WHERE "regionId" IN ('victoriq', 'vistoria');

-- 2. Delete customers from Tsawwassen (both spellings)
DELETE FROM "Customer" 
WHERE "regionId" IN ('tsawwassen', 'tssawwassen');

-- 3. Delete customers from Langlry (the misspelled version)
DELETE FROM "Customer" 
WHERE "regionId" = 'langlry';

-- 4. Delete customers from Calgary
DELETE FROM "Customer" 
WHERE "regionId" = 'calgary';

-- 5. Delete all Alberta customers (province = 'AB')
DELETE FROM "Customer" 
WHERE "province" = 'AB';

-- Show results
SELECT 'Remaining regions:' as info;
SELECT DISTINCT "regionId", COUNT(*) as customer_count 
FROM "Customer" 
GROUP BY "regionId"
ORDER BY "regionId";

SELECT 'Total customers remaining:' as info, COUNT(*) as total FROM "Customer";

-- Commit the changes
COMMIT;
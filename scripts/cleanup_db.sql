-- Cleanup Database Script
-- Removes all data from transactional tables to ensure a clean state
-- Usage: Run this in the Supabase SQL Editor

TRUNCATE TABLE public.docs CASCADE;
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.items CASCADE;
TRUNCATE TABLE public.bounties CASCADE;

-- Optional: If you want to clear users too (CAUTION: wipes accounts)
-- TRUNCATE TABLE public.users CASCADE;

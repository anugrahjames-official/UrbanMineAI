# Supabase Schema Migration Guide

## Update: Idempotency Fixed
The `docs/supabase_schema.sql` file has been updated to use `IF NOT EXISTS` for tables and `DROP POLICY IF EXISTS` for policies. You can now re-run the script safely even if some tables already exist.

## Option 1: Manual (Recommended for MVP)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project.
3. Go to the **SQL Editor**.
4. Copy the contents of `docs/supabase_schema.sql`.
   - This file now includes SQL to create the `items` storage bucket automatically.
5. Paste and **Run** the SQL.

## Option 2: Script (Requires Credentials)
1. Add your **Transaction Connection Pooler String** to `.env.local`:
   ```bash
   DATABASE_URL=postgres://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
2. Install `pg`:
   ```bash
   npm install pg
   ```
3. Run the script:
   ```bash
   node scripts/apply-schema.js
   ```

## Fallback Behavior
If the `items` storage bucket is not created, the application will automatically fall back to using `local://preview` references for scanned items, ensuring the app handles uploads gracefully without errors.

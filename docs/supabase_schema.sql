-- Supabase Schema for UrbanMineAI

-- Enable pgvector extension
create extension if not exists vector;

-- Create storage bucket 'items' if it doesn't exist
insert into storage.buckets (id, name, public)
values ('items', 'items', true)
on conflict (id) do nothing;

-- Users Table
create table if not exists public.users (
  id uuid references auth.users not null primary key,
  email text not null,
  role text check (role in ('dealer', 'recycler', 'oem')),
  location text,
  tier text,
  trust_score integer default 30,
  trust_flags jsonb default '[]'::jsonb,
  theme_dark boolean default true,
  push_notifications boolean default true,
  email_updates boolean default false,
  security_alerts boolean default true,
  last_active_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trust History Table (Audit Log)
create table if not exists public.trust_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  amount integer not null,
  reason text not null,
  transaction_id uuid references public.transactions(id),
  is_appealable boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Appeals Table
create table if not exists public.appeals (
  id uuid default gen_random_uuid() primary key,
  history_id uuid references public.trust_history(id) not null,
  user_id uuid references public.users(id) not null,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Items Table (Graded E-Waste)
create table if not exists public.items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  image_url text not null,
  metadata jsonb not null, -- JSON from Gemini (category, subType, estimatedValue, etc.)
  embedding vector(1536), -- Vector for similarity search
  status text default 'pending' check (status in ('pending', 'listed', 'sold')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transactions Table
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  supplier_id uuid references public.users(id) not null,
  buyer_id uuid references public.users(id),
  item_ids uuid[] not null,
  price_total numeric(12, 2) not null,
  status text default 'negotiating' check (status in ('negotiating', 'agreed', 'paid', 'completed', 'cancelled')),
  payment_ref text,
  pickup_date timestamp with time zone,
  material_breakdown jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bounties Table
create table if not exists public.bounties (
  id uuid default gen_random_uuid() primary key,
  recycler_id uuid references public.users(id) not null,
  material text not null,
  min_grade text,
  quantity_kg numeric(10, 2) not null,
  price_floor numeric(10, 2),
  status text default 'open' check (status in ('open', 'filled', 'expired')),
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Docs Table (Form-6 / EPR)
create table if not exists public.docs (
  id uuid default gen_random_uuid() primary key,
  transaction_id uuid references public.transactions(id) not null,
  pdf_url text not null,
  hash text not null, -- SHA-256 for verifiability
  doc_type text not null, -- 'Form-6', 'EPR-Cert'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Users: Read own, Update own
alter table public.users enable row level security;

drop policy if exists "Users can view own data" on public.users;
create policy "Users can view own data" on public.users for select using (auth.uid() = id);

drop policy if exists "Users can update own data" on public.users;
create policy "Users can update own data" on public.users for update using (auth.uid() = id);

drop policy if exists "Users can insert own data" on public.users;
create policy "Users can insert own data" on public.users for insert with check (auth.uid() = id);

-- Items: Dealers own items, Recyclers can view listed items
alter table public.items enable row level security;

drop policy if exists "Dealers can view and manage own items" on public.items;
create policy "Dealers can view and manage own items" on public.items for all using (auth.uid() = user_id);

drop policy if exists "Recyclers can view listed items" on public.items;
create policy "Recyclers can view listed items" on public.items for select using (status = 'listed');

-- Transactions: Involved parties can view
alter table public.transactions enable row level security;

drop policy if exists "Parties can view own transactions" on public.transactions;
create policy "Parties can view own transactions" on public.transactions 
for select using (auth.uid() = supplier_id or auth.uid() = buyer_id);

-- Bounties: All can view, Recyclers manage own
alter table public.bounties enable row level security;

drop policy if exists "Anyone can view open bounties" on public.bounties;
create policy "Anyone can view open bounties" on public.bounties for select using (status = 'open');

drop policy if exists "Recyclers manage own bounties" on public.bounties;
create policy "Recyclers manage own bounties" on public.bounties for all using (auth.uid() = recycler_id);

-- Trust History: Users view own
alter table public.trust_history enable row level security;

drop policy if exists "Users view own trust history" on public.trust_history;
create policy "Users view own trust history" on public.trust_history for select using (auth.uid() = user_id);

-- A policy to allow system/admin to insert (for now, we'll allow users to insert via server actions which bypass RLS if using service role, or we can allow insert if it matches user_id but that's risky. Ideally server actions use service role.)
-- For strictly client-side safety, we only allow select. Updates happen via secure server actions.

-- Appeals: Users view and create own
alter table public.appeals enable row level security;

drop policy if exists "Users view own appeals" on public.appeals;
create policy "Users view own appeals" on public.appeals for select using (auth.uid() = user_id);

drop policy if exists "Users create own appeals" on public.appeals;
create policy "Users create own appeals" on public.appeals for insert with check (auth.uid() = user_id);

-- Tender Saathi Combined Supabase Setup
-- Run this in the Supabase SQL Editor to create all tables and setup security policies.

-- 1. Create customers table
create table if not exists public.customers (
  id uuid primary key references auth.users(id) on delete cascade,
  customer_id text unique not null,
  owner_name text not null,
  business_name text not null,
  phone text,
  email text,
  subscription_plan text default 'Free Demo',
  trial_start_date timestamptz default now(),
  trial_end_date timestamptz default (now() + interval '30 days'),
  tender_columns jsonb, -- Dynamic column configurations for Tenders
  order_columns jsonb,  -- Dynamic column configurations for Orders
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create tenders table
create table if not exists public.tenders (
  id uuid primary key default gen_random_uuid(),
  customer_user_id uuid not null references public.customers(id) on delete cascade,
  serial_no integer,
  remarks text,
  published_date date,
  submission_end_date date,
  pre_bid_date date,
  pre_bid_location text,
  to_be_applied text,
  not_applying_reason text,
  applied text,
  due_days integer,
  tender_number text,
  tender_title text,
  consignee text,
  organisation text,
  location text,
  emd_value text,
  ra text,
  tender_value text,
  our_quoted_value text,
  result text,
  winning_value text,
  tender_link text,
  current_status text,
  folder_link text,
  folder_id text, -- Unified folder ID
  custom_data jsonb default '{}'::jsonb, -- Custom spreadsheet columns data
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_user_id uuid not null references public.customers(id) on delete cascade,
  serial_no integer,
  gem_tender_reference text,
  tech_specs_reference text,
  category text,
  contract_no text,
  contract_date date,
  organisation text,
  location text,
  work text,
  total_order_value text,
  order_status text,
  bg_value text,
  bg_number text,
  bg_issue_date date,
  timeline_of_bg text,
  bg_status text,
  collected_or_not text,
  couriered text,
  crac_link text,
  folder_id text, -- Link to the tender folder
  custom_data jsonb default '{}'::jsonb, -- Custom spreadsheet columns data
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Create files table
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  customer_user_id uuid not null references public.customers(id) on delete cascade,
  tender_id uuid references public.tenders(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  folder_id text,
  folder_name text not null,
  file_name text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

-- 5. Create payments table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  customer_user_id uuid not null references public.customers(id) on delete cascade,
  plan_name text not null,
  amount text not null,
  transaction_id text unique not null,
  payment_method text not null default 'Direct UPI/Bank',
  status text not null default 'pending', -- pending, approved, rejected
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5.5 Create notes table
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  customer_user_id uuid not null references public.customers(id) on delete cascade,
  tender_id uuid references public.tenders(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  content text not null,
  assigned_to text,
  created_at timestamptz not null default now()
);

-- 6. Enable Row Level Security (RLS)
alter table public.customers enable row level security;
alter table public.tenders enable row level security;
alter table public.orders enable row level security;
alter table public.files enable row level security;
alter table public.payments enable row level security;
alter table public.notes enable row level security;

-- 7. Define RLS Policies

-- Customers policies
drop policy if exists "Customers can read own profile" on public.customers;
create policy "Customers can read own profile" on public.customers for select using (auth.uid() = id);

drop policy if exists "Customers can insert own profile" on public.customers;
create policy "Customers can insert own profile" on public.customers for insert with check (auth.uid() = id);

drop policy if exists "Customers can update own profile" on public.customers;
create policy "Customers can update own profile" on public.customers for update using (auth.uid() = id) with check (auth.uid() = id);

-- Tenders policies
drop policy if exists "Customers can read own tenders" on public.tenders;
create policy "Customers can read own tenders" on public.tenders for select using (auth.uid() = customer_user_id);

drop policy if exists "Customers can manage own tenders" on public.tenders;
create policy "Customers can manage own tenders" on public.tenders for all using (auth.uid() = customer_user_id) with check (auth.uid() = customer_user_id);

-- Orders policies
drop policy if exists "Customers can read own orders" on public.orders;
create policy "Customers can read own orders" on public.orders for select using (auth.uid() = customer_user_id);

drop policy if exists "Customers can manage own orders" on public.orders;
create policy "Customers can manage own orders" on public.orders for all using (auth.uid() = customer_user_id) with check (auth.uid() = customer_user_id);

-- Files policies
drop policy if exists "Customers can read own files" on public.files;
create policy "Customers can read own files" on public.files for select using (auth.uid() = customer_user_id);

drop policy if exists "Customers can manage own files" on public.files;
create policy "Customers can manage own files" on public.files for all using (auth.uid() = customer_user_id) with check (auth.uid() = customer_user_id);

-- Payments policies
drop policy if exists "Customers can read own payments" on public.payments;
create policy "Customers can read own payments" on public.payments for select using (auth.uid() = customer_user_id);

drop policy if exists "Customers can insert own payments" on public.payments;
create policy "Customers can insert own payments" on public.payments for insert with check (auth.uid() = customer_user_id);

-- Notes policies
drop policy if exists "Customers can read own notes" on public.notes;
create policy "Customers can read own notes" on public.notes for select using (auth.uid() = customer_user_id);

drop policy if exists "Customers can manage own notes" on public.notes;
create policy "Customers can manage own notes" on public.notes for all using (auth.uid() = customer_user_id) with check (auth.uid() = customer_user_id);

-- Run this in a NEW Query window in your Supabase SQL Editor.
-- This will safely add the new features without affecting your existing data!

-- 1. Add new columns to the existing `customers` table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'Free Demo',
ADD COLUMN IF NOT EXISTS trial_start_date timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS trial_end_date timestamptz DEFAULT (now() + interval '30 days');

-- 2. Add folder_id to the existing `tenders` table
ALTER TABLE public.tenders
ADD COLUMN IF NOT EXISTS folder_id text;

-- 3. Add folder_id to the existing `orders` table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS folder_id text;

-- 4. Create the new `notes` table
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_user_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  tender_id uuid REFERENCES public.tenders(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  content text NOT NULL,
  assigned_to text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Enable Row Level Security (RLS) on the new `notes` table
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 6. Define RLS Policies for the `notes` table
DROP POLICY IF EXISTS "Customers can read own notes" ON public.notes;
CREATE POLICY "Customers can read own notes" ON public.notes FOR SELECT USING (auth.uid() = customer_user_id);

DROP POLICY IF EXISTS "Customers can manage own notes" ON public.notes;
CREATE POLICY "Customers can manage own notes" ON public.notes FOR ALL USING (auth.uid() = customer_user_id) WITH CHECK (auth.uid() = customer_user_id);

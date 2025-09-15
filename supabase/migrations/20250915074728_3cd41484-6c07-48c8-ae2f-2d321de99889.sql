-- Add user_id to shipments table for ownership tracking
ALTER TABLE public.shipments 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update the shipments table to set user_id for existing records to admin user
-- This ensures existing shipments have ownership
UPDATE public.shipments 
SET user_id = (
  SELECT user_id FROM public.user_roles 
  WHERE role = 'admin' 
  LIMIT 1
) 
WHERE user_id IS NULL;

-- Make user_id NOT NULL after setting values for existing records
ALTER TABLE public.shipments 
ALTER COLUMN user_id SET NOT NULL;

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Shipments are viewable by everyone" ON public.shipments;

-- Create secure RLS policies
-- Admins can see all shipments
CREATE POLICY "Admins can view all shipments" 
ON public.shipments 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own shipments
CREATE POLICY "Users can view their own shipments" 
ON public.shipments 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Public tracking policy - allows tracking by specific ID (limited access)
CREATE POLICY "Public tracking by ID" 
ON public.shipments 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Update insert policy to set user_id automatically
DROP POLICY IF EXISTS "Authenticated users can insert shipments" ON public.shipments;
CREATE POLICY "Authenticated users can insert their own shipments" 
ON public.shipments 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Update other policies to include ownership checks
DROP POLICY IF EXISTS "Authenticated users can update shipments" ON public.shipments;
CREATE POLICY "Users can update their own shipments" 
ON public.shipments 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can delete shipments" ON public.shipments;
CREATE POLICY "Users can delete their own shipments" 
ON public.shipments 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Create a secure public tracking function that returns limited data
CREATE OR REPLACE FUNCTION public.track_shipment_public(tracking_id TEXT)
RETURNS TABLE(
  id TEXT,
  status TEXT,
  location TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.status, s.location, s.created_at, s.updated_at
  FROM public.shipments s
  WHERE s.id = tracking_id
  LIMIT 1;
$$;
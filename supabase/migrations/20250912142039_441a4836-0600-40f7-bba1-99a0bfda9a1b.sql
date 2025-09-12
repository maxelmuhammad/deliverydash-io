-- Create shipments table for delivery tracking
CREATE TABLE public.shipments (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'Pending',
  location TEXT NOT NULL,
  coordinates JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access for tracking
CREATE POLICY "Shipments are viewable by everyone" 
ON public.shipments 
FOR SELECT 
USING (true);

-- Create policies for authenticated users to manage shipments
CREATE POLICY "Authenticated users can insert shipments" 
ON public.shipments 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update shipments" 
ON public.shipments 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete shipments" 
ON public.shipments 
FOR DELETE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shipments_updated_at
    BEFORE UPDATE ON public.shipments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample shipments data
INSERT INTO public.shipments (id, status, location, coordinates) VALUES
('ABC123', 'In Transit', 'Lagos, Nigeria', '{"lat": 6.5244, "lng": 3.3792}'),
('XYZ789', 'Delivered', 'Abuja, Nigeria', '{"lat": 9.0765, "lng": 7.3986}'),
('DEF456', 'Pending', 'Port Harcourt, Nigeria', '{"lat": 4.8156, "lng": 7.0498}'),
('GHI321', 'In Transit', 'Kano, Nigeria', '{"lat": 12.0022, "lng": 8.5920}'),
('JKL654', 'Delayed', 'Ibadan, Nigeria', '{"lat": 7.3775, "lng": 3.9470}');

-- Create debug_logs table for storing application logs
CREATE TABLE public.debug_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - make it public for debugging purposes
ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to insert debug logs (for debugging)
CREATE POLICY "Anyone can insert debug logs" 
  ON public.debug_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows anyone to view debug logs (for debugging)
CREATE POLICY "Anyone can view debug logs" 
  ON public.debug_logs 
  FOR SELECT 
  USING (true);

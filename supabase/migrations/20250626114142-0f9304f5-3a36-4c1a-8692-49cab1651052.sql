
-- Fix the RLS policy to allow guests to join games
-- Drop the existing restrictive update policy
DROP POLICY IF EXISTS "Users can update their game sessions" ON public.game_sessions;

-- Create a new policy that allows:
-- 1. Hosts to update their own sessions
-- 2. Authenticated users to join sessions where guest_id is null (joining)
-- 3. Guests to update sessions they're already part of
CREATE POLICY "Users can update and join game sessions" 
  ON public.game_sessions 
  FOR UPDATE 
  USING (
    auth.uid() = host_id OR 
    auth.uid() = guest_id OR 
    guest_id IS NULL
  );

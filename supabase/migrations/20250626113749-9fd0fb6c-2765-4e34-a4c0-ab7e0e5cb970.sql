
-- Add RLS policies to allow users to view and join game sessions
-- First, let's make sure RLS is enabled
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to view all game sessions (needed for joining)
CREATE POLICY "Users can view all game sessions" 
  ON public.game_sessions 
  FOR SELECT 
  USING (true);

-- Allow users to create game sessions
CREATE POLICY "Users can create game sessions" 
  ON public.game_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = host_id);

-- Allow users to update game sessions they're part of (host or guest)
CREATE POLICY "Users can update their game sessions" 
  ON public.game_sessions 
  FOR UPDATE 
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- Also enable similar policies for related tables
ALTER TABLE public.game_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all game actions" 
  ON public.game_actions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create game actions" 
  ON public.game_actions 
  FOR INSERT 
  WITH CHECK (auth.uid() = player_id);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all chat messages" 
  ON public.chat_messages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create chat messages" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = player_id);

ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all game states" 
  ON public.game_states 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create and update their game states" 
  ON public.game_states 
  FOR ALL 
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

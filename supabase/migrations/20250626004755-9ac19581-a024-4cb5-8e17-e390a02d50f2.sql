
-- Update existing tables to match the new multiplayer structure
ALTER TABLE public.game_sessions ADD COLUMN host_ready BOOLEAN DEFAULT FALSE;
ALTER TABLE public.game_sessions ADD COLUMN guest_ready BOOLEAN DEFAULT FALSE;

-- Update the status constraint to include all needed statuses
ALTER TABLE public.game_sessions DROP CONSTRAINT IF EXISTS game_sessions_status_check;
ALTER TABLE public.game_sessions ADD CONSTRAINT game_sessions_status_check 
  CHECK (status IN ('waiting', 'ready', 'playing', 'finished', 'active'));

-- Add foreign key constraint for game_actions referencing game_sessions
ALTER TABLE public.game_actions DROP CONSTRAINT IF EXISTS game_actions_game_session_id_fkey;
ALTER TABLE public.game_actions ADD CONSTRAINT game_actions_game_session_id_fkey 
  FOREIGN KEY (game_session_id) REFERENCES public.game_sessions(id) ON DELETE CASCADE;

-- Add foreign key constraint for chat_messages referencing game_sessions  
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_game_session_id_fkey;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_game_session_id_fkey 
  FOREIGN KEY (game_session_id) REFERENCES public.game_sessions(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_id ON public.game_sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON public.game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_actions_game_session_id ON public.game_actions(game_session_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_timestamp ON public.game_actions(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_game_session_id ON public.chat_messages(game_session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON public.chat_messages(timestamp);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for game_sessions updated_at
DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON public.game_sessions;
CREATE TRIGGER update_game_sessions_updated_at 
  BEFORE UPDATE ON public.game_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update RLS policies to be more specific
DROP POLICY IF EXISTS "Users can view their own game sessions" ON public.game_sessions;
CREATE POLICY "Users can view their own game sessions" ON public.game_sessions
  FOR SELECT USING (auth.uid() = host_id OR auth.uid() = guest_id);

DROP POLICY IF EXISTS "Users can create game sessions" ON public.game_sessions;
CREATE POLICY "Users can create game sessions as host" ON public.game_sessions
  FOR INSERT WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Participants can update game sessions" ON public.game_sessions;
CREATE POLICY "Users can update their own game sessions" ON public.game_sessions
  FOR UPDATE USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- Update game_actions policies
DROP POLICY IF EXISTS "Players can view actions in their sessions" ON public.game_actions;
CREATE POLICY "Users can view actions from their games" ON public.game_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions 
      WHERE game_sessions.id = game_actions.game_session_id 
      AND (game_sessions.host_id = auth.uid() OR game_sessions.guest_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Players can insert actions in their sessions" ON public.game_actions;
CREATE POLICY "Users can insert actions in their games" ON public.game_actions
  FOR INSERT WITH CHECK (
    auth.uid() = player_id AND
    EXISTS (
      SELECT 1 FROM public.game_sessions 
      WHERE game_sessions.id = game_actions.game_session_id 
      AND (game_sessions.host_id = auth.uid() OR game_sessions.guest_id = auth.uid())
    )
  );

-- Update chat_messages policies
DROP POLICY IF EXISTS "Players can view chat in their sessions" ON public.chat_messages;
CREATE POLICY "Users can view chat from their games" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions 
      WHERE game_sessions.id = chat_messages.game_session_id 
      AND (game_sessions.host_id = auth.uid() OR game_sessions.guest_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Players can send chat messages in their sessions" ON public.chat_messages;
CREATE POLICY "Users can send chat in their games" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.game_sessions 
      WHERE game_sessions.id = chat_messages.game_session_id 
      AND (game_sessions.host_id = auth.uid() OR game_sessions.guest_id = auth.uid())
    )
  );

-- Update game_states policies
DROP POLICY IF EXISTS "Players can view game states in their sessions" ON public.game_states;
CREATE POLICY "Users can view game states from their games" ON public.game_states
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions 
      WHERE game_sessions.id = game_states.game_session_id 
      AND (game_sessions.host_id = auth.uid() OR game_sessions.guest_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Players can insert their own game state" ON public.game_states;
CREATE POLICY "Users can insert game states in their games" ON public.game_states
  FOR INSERT WITH CHECK (
    auth.uid() = player_id AND
    EXISTS (
      SELECT 1 FROM public.game_sessions 
      WHERE game_sessions.id = game_states.game_session_id 
      AND (game_sessions.host_id = auth.uid() OR game_sessions.guest_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Players can update their own game state" ON public.game_states;
CREATE POLICY "Users can update their own game states" ON public.game_states
  FOR UPDATE USING (
    auth.uid() = player_id AND
    EXISTS (
      SELECT 1 FROM public.game_sessions 
      WHERE game_sessions.id = game_states.game_session_id 
      AND (game_sessions.host_id = auth.uid() OR game_sessions.guest_id = auth.uid())
    )
  );

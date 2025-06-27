
-- Add Row Level Security policies for game_actions_realtime table
ALTER TABLE public.game_actions_realtime ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own game actions"
  ON public.game_actions_realtime
  FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can view game actions from their session"
  ON public.game_actions_realtime
  FOR SELECT
  USING (
    game_session_id IN (
      SELECT id FROM public.game_sessions 
      WHERE host_id = auth.uid() OR guest_id = auth.uid()
    )
  );

-- Add Row Level Security policies for game_actions table
ALTER TABLE public.game_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own actions"
  ON public.game_actions
  FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can view actions from their session"
  ON public.game_actions
  FOR SELECT
  USING (
    game_session_id IN (
      SELECT id FROM public.game_sessions 
      WHERE host_id = auth.uid() OR guest_id = auth.uid()
    )
  );

-- Add Row Level Security policies for game_states table
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own game state"
  ON public.game_states
  FOR ALL
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can view game states from their session"
  ON public.game_states
  FOR SELECT
  USING (
    game_session_id IN (
      SELECT id FROM public.game_sessions 
      WHERE host_id = auth.uid() OR guest_id = auth.uid()
    )
  );

-- Add Row Level Security policies for chat_messages table
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own chat messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can view chat messages from their session"
  ON public.chat_messages
  FOR SELECT
  USING (
    game_session_id IN (
      SELECT id FROM public.game_sessions 
      WHERE host_id = auth.uid() OR guest_id = auth.uid()
    )
  );


-- Create a table for game sessions
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id TEXT NOT NULL UNIQUE,
  host_id UUID REFERENCES auth.users,
  guest_id UUID REFERENCES auth.users,
  host_name TEXT NOT NULL,
  guest_name TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'ready', 'playing', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for real-time game state
CREATE TABLE public.game_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users,
  player_field JSONB,
  player_life_points INTEGER DEFAULT 8000,
  player_hand_count INTEGER DEFAULT 5,
  current_phase TEXT DEFAULT 'draw',
  is_player_turn BOOLEAN DEFAULT false,
  time_remaining INTEGER DEFAULT 60,
  player_ready BOOLEAN DEFAULT false,
  last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for action log
CREATE TABLE public.game_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users,
  player_name TEXT NOT NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users,
  player_name TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_sessions
CREATE POLICY "Users can view game sessions they participate in" 
  ON public.game_sessions FOR SELECT 
  USING (host_id = auth.uid() OR guest_id = auth.uid());

CREATE POLICY "Users can create game sessions" 
  ON public.game_sessions FOR INSERT 
  WITH CHECK (host_id = auth.uid());

CREATE POLICY "Participants can update game sessions" 
  ON public.game_sessions FOR UPDATE 
  USING (host_id = auth.uid() OR guest_id = auth.uid());

-- RLS Policies for game_states
CREATE POLICY "Players can view game states in their sessions" 
  ON public.game_states FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions 
      WHERE id = game_session_id 
      AND (host_id = auth.uid() OR guest_id = auth.uid())
    )
  );

CREATE POLICY "Players can insert their own game state" 
  ON public.game_states FOR INSERT 
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Players can update their own game state" 
  ON public.game_states FOR UPDATE 
  USING (player_id = auth.uid());

-- RLS Policies for game_actions
CREATE POLICY "Players can view actions in their sessions" 
  ON public.game_actions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions 
      WHERE id = game_session_id 
      AND (host_id = auth.uid() OR guest_id = auth.uid())
    )
  );

CREATE POLICY "Players can insert actions in their sessions" 
  ON public.game_actions FOR INSERT 
  WITH CHECK (
    player_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.game_sessions 
      WHERE id = game_session_id 
      AND (host_id = auth.uid() OR guest_id = auth.uid())
    )
  );

-- RLS Policies for chat_messages
CREATE POLICY "Players can view chat in their sessions" 
  ON public.chat_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.game_sessions 
      WHERE id = game_session_id 
      AND (host_id = auth.uid() OR guest_id = auth.uid())
    )
  );

CREATE POLICY "Players can send chat messages in their sessions" 
  ON public.chat_messages FOR INSERT 
  WITH CHECK (
    player_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.game_sessions 
      WHERE id = game_session_id 
      AND (host_id = auth.uid() OR guest_id = auth.uid())
    )
  );

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_states;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Set replica identity for realtime updates
ALTER TABLE public.game_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.game_states REPLICA IDENTITY FULL;
ALTER TABLE public.game_actions REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

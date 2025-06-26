
-- Verifica se la tabella esiste già e la crea se necessario
CREATE TABLE IF NOT EXISTS public.game_actions_realtime (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  player_id uuid NOT NULL,
  player_name text NOT NULL,
  action_type text NOT NULL,
  action_data jsonb NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  processed boolean DEFAULT false
);

-- Abilita RLS sulla tabella
ALTER TABLE public.game_actions_realtime ENABLE ROW LEVEL SECURITY;

-- Policy per visualizzare tutte le azioni del gioco
CREATE POLICY "Users can view game actions for their sessions" 
  ON public.game_actions_realtime 
  FOR SELECT 
  USING (
    game_session_id IN (
      SELECT id FROM public.game_sessions 
      WHERE host_id = auth.uid() OR guest_id = auth.uid()
    )
  );

-- Policy per creare azioni
CREATE POLICY "Users can create game actions" 
  ON public.game_actions_realtime 
  FOR INSERT 
  WITH CHECK (auth.uid() = player_id);

-- Abilita realtime per la tabella
ALTER TABLE public.game_actions_realtime REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_actions_realtime;

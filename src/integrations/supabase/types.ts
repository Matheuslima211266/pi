export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          game_session_id: string
          id: string
          message: string
          player_id: string
          player_name: string
          timestamp: string
        }
        Insert: {
          game_session_id: string
          id?: string
          message: string
          player_id: string
          player_name: string
          timestamp?: string
        }
        Update: {
          game_session_id?: string
          id?: string
          message?: string
          player_id?: string
          player_name?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      debug_logs: {
        Row: {
          created_at: string
          data: string | null
          id: string
          level: string
          message: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          data?: string | null
          id?: string
          level: string
          message: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          data?: string | null
          id?: string
          level?: string
          message?: string
          timestamp?: string
        }
        Relationships: []
      }
      game_actions: {
        Row: {
          action: string
          game_session_id: string
          id: string
          player_id: string
          player_name: string
          timestamp: string
        }
        Insert: {
          action: string
          game_session_id: string
          id?: string
          player_id: string
          player_name: string
          timestamp?: string
        }
        Update: {
          action?: string
          game_session_id?: string
          id?: string
          player_id?: string
          player_name?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_actions_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_actions_realtime: {
        Row: {
          action_data: Json
          action_type: string
          game_session_id: string
          id: string
          player_id: string
          player_name: string
          processed: boolean | null
          timestamp: string
        }
        Insert: {
          action_data: Json
          action_type: string
          game_session_id: string
          id?: string
          player_id: string
          player_name: string
          processed?: boolean | null
          timestamp?: string
        }
        Update: {
          action_data?: Json
          action_type?: string
          game_session_id?: string
          id?: string
          player_id?: string
          player_name?: string
          processed?: boolean | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_actions_realtime_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          created_at: string
          game_id: string
          guest_id: string | null
          guest_name: string | null
          guest_ready: boolean | null
          host_id: string | null
          host_name: string
          host_ready: boolean | null
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_id: string
          guest_id?: string | null
          guest_name?: string | null
          guest_ready?: boolean | null
          host_id?: string | null
          host_name: string
          host_ready?: boolean | null
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_id?: string
          guest_id?: string | null
          guest_name?: string | null
          guest_ready?: boolean | null
          host_id?: string | null
          host_name?: string
          host_ready?: boolean | null
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_states: {
        Row: {
          current_phase: string | null
          game_session_id: string
          id: string
          is_player_turn: boolean | null
          last_update: string
          player_field: Json | null
          player_hand_count: number | null
          player_id: string
          player_life_points: number | null
          player_ready: boolean | null
          time_remaining: number | null
        }
        Insert: {
          current_phase?: string | null
          game_session_id: string
          id?: string
          is_player_turn?: boolean | null
          last_update?: string
          player_field?: Json | null
          player_hand_count?: number | null
          player_id: string
          player_life_points?: number | null
          player_ready?: boolean | null
          time_remaining?: number | null
        }
        Update: {
          current_phase?: string | null
          game_session_id?: string
          id?: string
          is_player_turn?: boolean | null
          last_update?: string
          player_field?: Json | null
          player_hand_count?: number | null
          player_id?: string
          player_life_points?: number | null
          player_ready?: boolean | null
          time_remaining?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_states_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

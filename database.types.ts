export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      issues: {
        Row: {
          created_at: string | null
          current_balance: number | null
          deadline: string
          description: string | null
          id: string
          issue_number: number
          magazine_id: string
          published_at: string | null
          required_funding: number
          source_event_date: string | null
          source_event_id: string | null
          source_event_location: string | null
          source_event_platform: string | null
          source_event_title: string | null
          source_event_url: string | null
          status: string
          title: string | null
          treasury_address: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_balance?: number | null
          deadline: string
          description?: string | null
          id?: string
          issue_number: number
          magazine_id: string
          published_at?: string | null
          required_funding: number
          source_event_date?: string | null
          source_event_id?: string | null
          source_event_location?: string | null
          source_event_platform?: string | null
          source_event_title?: string | null
          source_event_url?: string | null
          status?: string
          title?: string | null
          treasury_address: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_balance?: number | null
          deadline?: string
          description?: string | null
          id?: string
          issue_number?: number
          magazine_id?: string
          published_at?: string | null
          required_funding?: number
          source_event_date?: string | null
          source_event_id?: string | null
          source_event_location?: string | null
          source_event_platform?: string | null
          source_event_title?: string | null
          source_event_url?: string | null
          status?: string
          title?: string | null
          treasury_address?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_magazine_id_fkey"
            columns: ["magazine_id"]
            isOneToOne: false
            referencedRelation: "magazines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_magazine_id_fkey"
            columns: ["magazine_id"]
            isOneToOne: false
            referencedRelation: "open_calls"
            referencedColumns: ["magazine_id"]
          },
        ]
      }
      magazine_editors: {
        Row: {
          added_at: string | null
          magazine_id: string
          nickname: string | null
          user_id: string
        }
        Insert: {
          added_at?: string | null
          magazine_id: string
          nickname?: string | null
          user_id: string
        }
        Update: {
          added_at?: string | null
          magazine_id?: string
          nickname?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "magazine_editors_magazine_id_fkey"
            columns: ["magazine_id"]
            isOneToOne: false
            referencedRelation: "magazines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "magazine_editors_magazine_id_fkey"
            columns: ["magazine_id"]
            isOneToOne: false
            referencedRelation: "open_calls"
            referencedColumns: ["magazine_id"]
          },
          {
            foreignKeyName: "magazine_editors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      magazines: {
        Row: {
          accent_colors: string[]
          cover_image: string | null
          created_at: string | null
          default_bounty_amount: number
          description: string
          founder_id: string
          founder_nickname: string | null
          id: string
          is_public: boolean | null
          logo_image: string | null
          name: string
          slug: string
          tagline: string | null
          theme_id: string
          treasury_address: string
          updated_at: string | null
        }
        Insert: {
          accent_colors: string[]
          cover_image?: string | null
          created_at?: string | null
          default_bounty_amount: number
          description: string
          founder_id: string
          founder_nickname?: string | null
          id?: string
          is_public?: boolean | null
          logo_image?: string | null
          name: string
          slug: string
          tagline?: string | null
          theme_id: string
          treasury_address: string
          updated_at?: string | null
        }
        Update: {
          accent_colors?: string[]
          cover_image?: string | null
          created_at?: string | null
          default_bounty_amount?: number
          description?: string
          founder_id?: string
          founder_nickname?: string | null
          id?: string
          is_public?: boolean | null
          logo_image?: string | null
          name?: string
          slug?: string
          tagline?: string | null
          theme_id?: string
          treasury_address?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "magazines_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          block_number: number | null
          created_at: string | null
          currency: string
          failed_at: string | null
          failure_reason: string | null
          id: string
          issue_id: string
          magazine_id: string
          paid_at: string | null
          recipient_id: string
          role: string
          status: string
          submission_id: string | null
          transaction_hash: string | null
        }
        Insert: {
          amount: number
          block_number?: number | null
          created_at?: string | null
          currency?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          issue_id: string
          magazine_id: string
          paid_at?: string | null
          recipient_id: string
          role: string
          status?: string
          submission_id?: string | null
          transaction_hash?: string | null
        }
        Update: {
          amount?: number
          block_number?: number | null
          created_at?: string | null
          currency?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          issue_id?: string
          magazine_id?: string
          paid_at?: string | null
          recipient_id?: string
          role?: string
          status?: string
          submission_id?: string | null
          transaction_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "open_calls"
            referencedColumns: ["issue_id"]
          },
          {
            foreignKeyName: "payments_magazine_id_fkey"
            columns: ["magazine_id"]
            isOneToOne: false
            referencedRelation: "magazines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_magazine_id_fkey"
            columns: ["magazine_id"]
            isOneToOne: false
            referencedRelation: "open_calls"
            referencedColumns: ["magazine_id"]
          },
          {
            foreignKeyName: "payments_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_approvals: {
        Row: {
          created_at: string | null
          decision: string
          editor_id: string
          id: string
          notes: string | null
          submission_id: string
        }
        Insert: {
          created_at?: string | null
          decision: string
          editor_id: string
          id?: string
          notes?: string | null
          submission_id: string
        }
        Update: {
          created_at?: string | null
          decision?: string
          editor_id?: string
          id?: string
          notes?: string | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_approvals_editor_id_fkey"
            columns: ["editor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_approvals_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          accepted_at: string | null
          author_id: string
          bounty_amount: number
          content: string
          description: string | null
          id: string
          ipfs_cid: string | null
          issue_id: string
          magazine_id: string
          media_urls: string[] | null
          paid_at: string | null
          payment_status: string
          published_at: string | null
          status: string
          submitted_at: string | null
          title: string
          topic_id: string
          transaction_hash: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          author_id: string
          bounty_amount: number
          content: string
          description?: string | null
          id?: string
          ipfs_cid?: string | null
          issue_id: string
          magazine_id: string
          media_urls?: string[] | null
          paid_at?: string | null
          payment_status?: string
          published_at?: string | null
          status?: string
          submitted_at?: string | null
          title: string
          topic_id: string
          transaction_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          author_id?: string
          bounty_amount?: number
          content?: string
          description?: string | null
          id?: string
          ipfs_cid?: string | null
          issue_id?: string
          magazine_id?: string
          media_urls?: string[] | null
          paid_at?: string | null
          payment_status?: string
          published_at?: string | null
          status?: string
          submitted_at?: string | null
          title?: string
          topic_id?: string
          transaction_hash?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "open_calls"
            referencedColumns: ["issue_id"]
          },
          {
            foreignKeyName: "submissions_magazine_id_fkey"
            columns: ["magazine_id"]
            isOneToOne: false
            referencedRelation: "magazines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_magazine_id_fkey"
            columns: ["magazine_id"]
            isOneToOne: false
            referencedRelation: "open_calls"
            referencedColumns: ["magazine_id"]
          },
          {
            foreignKeyName: "submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "open_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          bounty_amount: number | null
          created_at: string | null
          description: string | null
          due_date: string | null
          format: string
          guidelines: string | null
          id: string
          is_open_call: boolean
          issue_id: string
          position: number
          slots_needed: number
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          bounty_amount?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          format: string
          guidelines?: string | null
          id?: string
          is_open_call: boolean
          issue_id: string
          position: number
          slots_needed: number
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          bounty_amount?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          format?: string
          guidelines?: string | null
          id?: string
          is_open_call?: boolean
          issue_id?: string
          position?: number
          slots_needed?: number
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "open_calls"
            referencedColumns: ["issue_id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_contributor: boolean | null
          is_editor: boolean | null
          is_founder: boolean | null
          is_reader: boolean | null
          last_active_at: string | null
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_contributor?: boolean | null
          is_editor?: boolean | null
          is_founder?: boolean | null
          is_reader?: boolean | null
          last_active_at?: string | null
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_contributor?: boolean | null
          is_editor?: boolean | null
          is_founder?: boolean | null
          is_reader?: boolean | null
          last_active_at?: string | null
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      open_calls: {
        Row: {
          bounty_amount: number | null
          description: string | null
          due_date: string | null
          format: string | null
          guidelines: string | null
          id: string | null
          issue_id: string | null
          issue_number: number | null
          magazine_cover: string | null
          magazine_id: string | null
          magazine_name: string | null
          magazine_slug: string | null
          slots_needed: number | null
          status: string | null
          title: string | null
          total_submissions: number | null
        }
        Relationships: []
      }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

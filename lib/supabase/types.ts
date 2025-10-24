/**
 * Supabase Database Types
 * 
 * These types are generated from the database schema
 * and provide full TypeScript support for Supabase queries
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          email: string | null
          display_name: string | null
          avatar: string | null
          bio: string | null
          is_founder: boolean
          is_editor: boolean
          is_contributor: boolean
          is_reader: boolean
          created_at: string
          updated_at: string
          last_active_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          email?: string | null
          display_name?: string | null
          avatar?: string | null
          bio?: string | null
          is_founder?: boolean
          is_editor?: boolean
          is_contributor?: boolean
          is_reader?: boolean
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          email?: string | null
          display_name?: string | null
          avatar?: string | null
          bio?: string | null
          is_founder?: boolean
          is_editor?: boolean
          is_contributor?: boolean
          is_reader?: boolean
          created_at?: string
          updated_at?: string
          last_active_at?: string
        }
      }
      magazines: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          tagline: string | null
          cover_image: string | null
          logo_image: string | null
          theme_id: string
          accent_colors: string[]
          founder_id: string
          treasury_address: string
          default_bounty_amount: number
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          tagline?: string | null
          cover_image?: string | null
          logo_image?: string | null
          theme_id: string
          accent_colors: string[]
          founder_id: string
          treasury_address: string
          default_bounty_amount: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          tagline?: string | null
          cover_image?: string | null
          logo_image?: string | null
          theme_id?: string
          accent_colors?: string[]
          founder_id?: string
          treasury_address?: string
          default_bounty_amount?: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      magazine_editors: {
        Row: {
          magazine_id: string
          user_id: string
          added_at: string
        }
        Insert: {
          magazine_id: string
          user_id: string
          added_at?: string
        }
        Update: {
          magazine_id?: string
          user_id?: string
          added_at?: string
        }
      }
      issues: {
        Row: {
          id: string
          magazine_id: string
          issue_number: number
          title: string | null
          description: string | null
          source_event_id: string | null
          source_event_title: string | null
          source_event_date: string | null
          source_event_location: string | null
          source_event_url: string | null
          source_event_platform: string | null
          status: string
          deadline: string
          treasury_address: string
          required_funding: number
          current_balance: number
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          magazine_id: string
          issue_number: number
          title?: string | null
          description?: string | null
          source_event_id?: string | null
          source_event_title?: string | null
          source_event_date?: string | null
          source_event_location?: string | null
          source_event_url?: string | null
          source_event_platform?: string | null
          status?: string
          deadline: string
          treasury_address: string
          required_funding: number
          current_balance?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          magazine_id?: string
          issue_number?: number
          title?: string | null
          description?: string | null
          source_event_id?: string | null
          source_event_title?: string | null
          source_event_date?: string | null
          source_event_location?: string | null
          source_event_url?: string | null
          source_event_platform?: string | null
          status?: string
          deadline?: string
          treasury_address?: string
          required_funding?: number
          current_balance?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      topics: {
        Row: {
          id: string
          issue_id: string
          title: string
          description: string | null
          is_open_call: boolean
          format: string
          slots_needed: number
          position: number
          bounty_amount: number | null
          due_date: string | null
          guidelines: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          title: string
          description?: string | null
          is_open_call: boolean
          format: string
          slots_needed: number
          position: number
          bounty_amount?: number | null
          due_date?: string | null
          guidelines?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          issue_id?: string
          title?: string
          description?: string | null
          is_open_call?: boolean
          format?: string
          slots_needed?: number
          position?: number
          bounty_amount?: number | null
          due_date?: string | null
          guidelines?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          topic_id: string
          issue_id: string
          magazine_id: string
          author_id: string
          title: string
          description: string | null
          content: string
          media_urls: string[]
          ipfs_cid: string | null
          status: string
          payment_status: string
          bounty_amount: number
          paid_at: string | null
          transaction_hash: string | null
          submitted_at: string
          updated_at: string
          accepted_at: string | null
          published_at: string | null
        }
        Insert: {
          id?: string
          topic_id: string
          issue_id: string
          magazine_id: string
          author_id: string
          title: string
          description?: string | null
          content: string
          media_urls?: string[]
          ipfs_cid?: string | null
          status?: string
          payment_status?: string
          bounty_amount: number
          paid_at?: string | null
          transaction_hash?: string | null
          submitted_at?: string
          updated_at?: string
          accepted_at?: string | null
          published_at?: string | null
        }
        Update: {
          id?: string
          topic_id?: string
          issue_id?: string
          magazine_id?: string
          author_id?: string
          title?: string
          description?: string | null
          content?: string
          media_urls?: string[]
          ipfs_cid?: string | null
          status?: string
          payment_status?: string
          bounty_amount?: number
          paid_at?: string | null
          transaction_hash?: string | null
          submitted_at?: string
          updated_at?: string
          accepted_at?: string | null
          published_at?: string | null
        }
      }
      submission_approvals: {
        Row: {
          id: string
          submission_id: string
          editor_id: string
          decision: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          editor_id: string
          decision: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          editor_id?: string
          decision?: string
          notes?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          issue_id: string
          magazine_id: string
          recipient_id: string
          submission_id: string | null
          amount: number
          currency: string
          role: string
          status: string
          transaction_hash: string | null
          block_number: number | null
          created_at: string
          paid_at: string | null
          failed_at: string | null
          failure_reason: string | null
        }
        Insert: {
          id?: string
          issue_id: string
          magazine_id: string
          recipient_id: string
          submission_id?: string | null
          amount: number
          currency?: string
          role: string
          status?: string
          transaction_hash?: string | null
          block_number?: number | null
          created_at?: string
          paid_at?: string | null
          failed_at?: string | null
          failure_reason?: string | null
        }
        Update: {
          id?: string
          issue_id?: string
          magazine_id?: string
          recipient_id?: string
          submission_id?: string | null
          amount?: number
          currency?: string
          role?: string
          status?: string
          transaction_hash?: string | null
          block_number?: number | null
          created_at?: string
          paid_at?: string | null
          failed_at?: string | null
          failure_reason?: string | null
        }
      }
    }
    Views: {
      open_calls: {
        Row: {
          id: string | null
          title: string | null
          description: string | null
          format: string | null
          slots_needed: number | null
          bounty_amount: number | null
          due_date: string | null
          guidelines: string | null
          status: string | null
          issue_id: string | null
          issue_number: number | null
          magazine_id: string | null
          magazine_name: string | null
          magazine_slug: string | null
          magazine_cover: string | null
          total_submissions: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}


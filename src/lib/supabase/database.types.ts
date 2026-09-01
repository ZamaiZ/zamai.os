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
      exercises: {
        Row: {
          created_at: string
          equipment: string | null
          gif_path: string | null
          id: string
          muscle_group_id: string
          name: string
          slug: string
          source_exercise_id: string | null
          source_name: string | null
          target: string | null
          thumbnail_path: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment?: string | null
          gif_path?: string | null
          id?: string
          muscle_group_id: string
          name: string
          slug: string
          source_exercise_id?: string | null
          source_name?: string | null
          target?: string | null
          thumbnail_path?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment?: string | null
          gif_path?: string | null
          id?: string
          muscle_group_id?: string
          name?: string
          slug?: string
          source_exercise_id?: string | null
          source_name?: string | null
          target?: string | null
          thumbnail_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_groups: {
        Row: {
          created_at: string
          icon_svg: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon_svg?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon_svg?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      prospect_searches: {
        Row: {
          candidates: Json
          city_query: string
          created_at: string
          geocoded_label: string
          google_result_count: number
          id: string
          included_type: string
          matched_count: number
          viewport: Json
        }
        Insert: {
          candidates?: Json
          city_query: string
          created_at?: string
          geocoded_label: string
          google_result_count: number
          id?: string
          included_type: string
          matched_count: number
          viewport: Json
        }
        Update: {
          candidates?: Json
          city_query?: string
          created_at?: string
          geocoded_label?: string
          google_result_count?: number
          id?: string
          included_type?: string
          matched_count?: number
          viewport?: Json
        }
        Relationships: []
      }
      prospects: {
        Row: {
          created_at: string
          formatted_address: string
          google_maps_uri: string | null
          google_place_id: string
          id: string
          last_fetched_at: string
          name: string
          phone: string | null
          photo_name: string | null
          primary_type: string | null
          rating: number | null
          source_search_id: string | null
          status: string
          types: Json
          updated_at: string
          user_rating_count: number | null
          website_kind: string
          website_uri: string | null
        }
        Insert: {
          created_at?: string
          formatted_address: string
          google_maps_uri?: string | null
          google_place_id: string
          id?: string
          last_fetched_at?: string
          name: string
          phone?: string | null
          photo_name?: string | null
          primary_type?: string | null
          rating?: number | null
          source_search_id?: string | null
          status?: string
          types?: Json
          updated_at?: string
          user_rating_count?: number | null
          website_kind: string
          website_uri?: string | null
        }
        Update: {
          created_at?: string
          formatted_address?: string
          google_maps_uri?: string | null
          google_place_id?: string
          id?: string
          last_fetched_at?: string
          name?: string
          phone?: string | null
          photo_name?: string | null
          primary_type?: string | null
          rating?: number | null
          source_search_id?: string | null
          status?: string
          types?: Json
          updated_at?: string
          user_rating_count?: number | null
          website_kind?: string
          website_uri?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prospects_source_search_id_fkey"
            columns: ["source_search_id"]
            isOneToOne: false
            referencedRelation: "prospect_searches"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          expiration_time: string | null
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          expiration_time?: string | null
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          expiration_time?: string | null
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_buckets: {
        Row: { count: number; key: string; window_start: string }
        Insert: { count?: number; key: string; window_start: string }
        Update: { count?: number; key?: string; window_start?: string }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      check_rate_limit: {
        Args: {
          p_key: string
          p_max_requests: number
          p_window_seconds: number
        }
        Returns: boolean
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

/**
 * HouseOS Supabase Database Types
 *
 * Generated from the live PostgreSQL schema on project byzgwngxgyesqigvggxn.
 * Covers all 6 canonical tables:
 * - houses
 * - societies
 * - events
 * - announcements
 * - profiles
 * - event_registrations
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      houses: {
        Row: {
          id: string;
          created_at: string;
          name: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
        };
        Relationships: [];
      };
      societies: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string | null;
          category: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          description?: string | null;
          category?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          starts_at: string | null;
          ends_at: string | null;
          title: string;
          slug: string | null;
          description: string | null;
          organizer_type: string | null;
          organizer_name: string | null;
          format: string | null;
          status: string;
          capacity: number | null;
          house_points: number | null;
          venue: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          title: string;
          slug?: string | null;
          description?: string | null;
          organizer_type?: string | null;
          organizer_name?: string | null;
          format?: string | null;
          status?: string;
          capacity?: number | null;
          house_points?: number | null;
          venue?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          title?: string;
          slug?: string | null;
          description?: string | null;
          organizer_type?: string | null;
          organizer_name?: string | null;
          format?: string | null;
          status?: string;
          capacity?: number | null;
          house_points?: number | null;
          venue?: string | null;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          published_at: string | null;
          title: string;
          body: string | null;
          status: string;
          is_pinned: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          published_at?: string | null;
          title: string;
          body?: string | null;
          status?: string;
          is_pinned?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          published_at?: string | null;
          title?: string;
          body?: string | null;
          status?: string;
          is_pinned?: boolean;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          house_id: string | null;
          display_name: string | null;
          role: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string | null;
          house_id?: string | null;
          display_name?: string | null;
          role?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          house_id?: string | null;
          display_name?: string | null;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_house_id_fkey';
            columns: ['house_id'];
            isOneToOne: false;
            referencedRelation: 'houses';
            referencedColumns: ['id'];
          },
        ];
      };
      event_registrations: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          registered_at: string;
          status: string;
          cancelled_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          registered_at?: string;
          status?: string;
          cancelled_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          registered_at?: string;
          status?: string;
          cancelled_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'event_registrations_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_registrations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      register_for_event: {
        Args: {
          p_event_id: string;
        };
        Returns: Json;
      };
      cancel_event_registration: {
        Args: {
          p_event_id: string;
        };
        Returns: Json;
      };
      get_event_registration_stats: {
        Args: {
          p_event_id: string;
        };
        Returns: Json;
      };
      assign_student_house: {
        Args: {
          p_house_id: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

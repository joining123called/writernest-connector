
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
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string
          phone: string
          role: string
          avatar_url?: string
          bio?: string
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name: string
          phone: string
          role: string
          avatar_url?: string
          bio?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string
          phone?: string
          role?: string
          avatar_url?: string
          bio?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

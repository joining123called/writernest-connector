
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
          reference_number: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name: string
          phone: string
          role: string
          reference_number?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string
          phone?: string
          role?: string
          reference_number?: string | null
          avatar_url?: string | null
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
      platform_settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      assignment_details: {
        Row: {
          id: string
          user_id: string
          paper_type: string
          subject: string
          pages: number
          deadline: string
          topic: string | null
          instructions: string | null
          citation_style: string | null
          sources: number | null
          price_per_page: number
          total_price: number
          discount: number | null
          final_price: number
          status: string
          assignment_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paper_type: string
          subject: string
          pages: number
          deadline: string
          topic?: string | null
          instructions?: string | null
          citation_style?: string | null
          sources?: number | null
          price_per_page: number
          total_price: number
          discount?: number | null
          final_price: number
          status?: string
          assignment_code?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          paper_type?: string
          subject?: string
          pages?: number
          deadline?: string
          topic?: string | null
          instructions?: string | null
          citation_style?: string | null
          sources?: number | null
          price_per_page?: number
          total_price?: number
          discount?: number | null
          final_price?: number
          status?: string
          assignment_code?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_details_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      assignment_files: {
        Row: {
          id: string
          assignment_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          created_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          created_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_files_assignment_id_fkey"
            columns: ["assignment_id"]
            referencedRelation: "assignment_details"
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
      generate_unique_reference_number: {
        Args: {
          role_prefix: string
        }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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

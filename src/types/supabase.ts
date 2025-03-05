
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
      payment_gateways: {
        Row: {
          id: string
          gateway_name: string
          is_enabled: boolean
          is_test_mode: boolean
          config: Record<string, string>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gateway_name: string
          is_enabled?: boolean
          is_test_mode?: boolean
          config?: Record<string, string>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gateway_name?: string
          is_enabled?: boolean
          is_test_mode?: boolean
          config?: Record<string, string>
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          order_id: string
          user_id: string
          gateway: string
          amount: number
          currency: string
          status: string
          gateway_transaction_id?: string
          gateway_response?: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          gateway: string
          amount: number
          currency?: string
          status: string
          gateway_transaction_id?: string
          gateway_response?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          user_id?: string
          gateway?: string
          amount?: number
          currency?: string
          status?: string
          gateway_transaction_id?: string
          gateway_response?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

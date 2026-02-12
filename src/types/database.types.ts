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
          email: string
          role: 'dealer' | 'recycler' | 'oem'
          location: string | null
          tier: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'dealer' | 'recycler' | 'oem'
          location?: string | null
          tier?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'dealer' | 'recycler' | 'oem'
          location?: string | null
          tier?: string | null
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          user_id: string
          image_url: string
          metadata: Json
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          metadata: Json
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          metadata?: Json
          status?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          supplier_id: string
          buyer_id: string
          item_ids: string[]
          price_total: number
          status: string
          payment_ref: string | null
          pickup_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          buyer_id: string
          item_ids: string[]
          price_total: number
          status?: string
          payment_ref?: string | null
          pickup_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          buyer_id?: string
          item_ids?: string[]
          price_total?: number
          status?: string
          payment_ref?: string | null
          pickup_date?: string | null
          created_at?: string
        }
      }
    }
  }
}

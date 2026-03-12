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
                    role: 'dealer' | 'recycler' | 'oem' | null
                    location: string | null
                    tier: string | null
                    trust_score: number | null
                    trust_flags: Json | null
                    theme_dark: boolean | null
                    push_notifications: boolean | null
                    email_updates: boolean | null
                    security_alerts: boolean | null
                    last_active_at: string | null
                    created_at: string
                    business_name: string | null
                }
                Insert: {
                    id: string
                    email: string
                    role?: 'dealer' | 'recycler' | 'oem' | null
                    location?: string | null
                    tier?: string | null
                    trust_score?: number | null
                    trust_flags?: Json | null
                    theme_dark?: boolean | null
                    push_notifications?: boolean | null
                    email_updates?: boolean | null
                    security_alerts?: boolean | null
                    last_active_at?: string | null
                    created_at?: string
                    business_name?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'dealer' | 'recycler' | 'oem' | null
                    location?: string | null
                    tier?: string | null
                    trust_score?: number | null
                    trust_flags?: Json | null
                    theme_dark?: boolean | null
                    push_notifications?: boolean | null
                    email_updates?: boolean | null
                    security_alerts?: boolean | null
                    last_active_at?: string | null
                    created_at?: string
                    business_name?: string | null
                }
            }
            bounties: {
                Row: {
                    id: string
                    recycler_id: string
                    title: string | null
                    material: string
                    min_grade: string | null
                    quantity: number
                    unit: string
                    price_floor: number | null
                    status: 'open' | 'filled' | 'expired' | null
                    expires_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    recycler_id: string
                    title?: string | null
                    material: string
                    min_grade?: string | null
                    quantity: number
                    unit?: string
                    price_floor?: number | null
                    status?: 'open' | 'filled' | 'expired' | null
                    expires_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    recycler_id?: string
                    title?: string | null
                    material?: string
                    min_grade?: string | null
                    quantity?: number
                    unit?: string
                    price_floor?: number | null
                    status?: 'open' | 'filled' | 'expired' | null
                    expires_at?: string | null
                    created_at?: string
                }
            }
            market_prices: {
                Row: {
                    symbol: string
                    name: string
                    price: number
                    currency: string | null
                    unit: string | null
                    change: number | null
                    last_updated: string
                }
                Insert: {
                    symbol: string
                    name: string
                    price: number
                    currency?: string | null
                    unit?: string | null
                    change?: number | null
                    last_updated?: string
                }
                Update: {
                    symbol?: string
                    name?: string
                    price?: number
                    currency?: string | null
                    unit?: string | null
                    change?: number | null
                    last_updated?: string
                }
            }
            items: {
                Row: {
                    id: string
                    user_id: string
                    image_url: string
                    metadata: Json
                    embedding: string | null // vector treated as string or specific type if using specific client
                    status: 'pending' | 'listed' | 'sold' | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    image_url: string
                    metadata: Json
                    embedding?: string | null
                    status?: 'pending' | 'listed' | 'sold' | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    image_url?: string
                    metadata?: Json
                    embedding?: string | null
                    status?: 'pending' | 'listed' | 'sold' | null
                    created_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    supplier_id: string
                    buyer_id: string | null
                    item_ids: string[]
                    price_total: number
                    status: 'negotiating' | 'agreed' | 'paid' | 'completed' | 'cancelled' | null
                    payment_ref: string | null
                    pickup_date: string | null
                    material_breakdown: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    supplier_id: string
                    buyer_id?: string | null
                    item_ids: string[]
                    price_total: number
                    status?: 'negotiating' | 'agreed' | 'paid' | 'completed' | 'cancelled' | null
                    payment_ref?: string | null
                    pickup_date?: string | null
                    material_breakdown?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    supplier_id?: string
                    buyer_id?: string | null
                    item_ids?: string[]
                    price_total?: number
                    status?: 'negotiating' | 'agreed' | 'paid' | 'completed' | 'cancelled' | null
                    payment_ref?: string | null
                    pickup_date?: string | null
                    material_breakdown?: Json | null
                    created_at?: string
                }
            }
            trust_history: {
                Row: {
                    id: string
                    user_id: string
                    amount: number
                    reason: string
                    transaction_id: string | null
                    is_appealable: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    amount: number
                    reason: string
                    transaction_id?: string | null
                    is_appealable?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    amount?: number
                    reason?: string
                    transaction_id?: string | null
                    is_appealable?: boolean | null
                    created_at?: string
                }
            }
            appeals: {
                Row: {
                    id: string
                    history_id: string
                    user_id: string
                    reason: string
                    status: 'pending' | 'approved' | 'rejected' | null
                    admin_note: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    history_id: string
                    user_id: string
                    reason: string
                    status?: 'pending' | 'approved' | 'rejected' | null
                    admin_note?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    history_id?: string
                    user_id?: string
                    reason?: string
                    status?: 'pending' | 'approved' | 'rejected' | null
                    admin_note?: string | null
                    created_at?: string
                }
            }
            docs: {
                Row: {
                    id: string
                    transaction_id: string
                    pdf_url: string
                    hash: string
                    doc_type: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    transaction_id: string
                    pdf_url: string
                    hash: string
                    doc_type: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    transaction_id?: string
                    pdf_url?: string
                    hash?: string
                    doc_type?: string
                    created_at?: string
                }
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

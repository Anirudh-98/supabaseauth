export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AccountStatus = 'pending' | 'approved' | 'declined';
export type UserRole = 'user' | 'admin';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          advocate_full_name: string
          bar_council_enrollment_number: string
          phone_number: string
          role: UserRole
          account_status: AccountStatus
          email_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          advocate_full_name: string
          bar_council_enrollment_number: string
          phone_number: string
          role?: UserRole
          account_status?: AccountStatus
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          advocate_full_name?: string
          bar_council_enrollment_number?: string
          phone_number?: string
          role?: UserRole
          account_status?: AccountStatus
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
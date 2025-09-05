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
      clients: {
        Row: {
          id: number;
          companyName: string;
          monthlyValue: number;
          dueDay: number;
          websiteLink: string | null;
          paymentStatus: 'Pendente' | 'Pago' | 'Atrasado';
          created_at: string;
        }
        Insert: {
          companyName: string;
          monthlyValue: number;
          dueDay: number;
          websiteLink?: string | null;
          paymentStatus?: 'Pendente' | 'Pago' | 'Atrasado';
        }
        Update: {
          companyName?: string;
          monthlyValue?: number;
          dueDay?: number;
          websiteLink?: string | null;
          paymentStatus?: 'Pendente' | 'Pago' | 'Atrasado';
        }
      }
      expenses: {
        Row: {
          id: number;
          description: string;
          amount: number;
          category: string;
          date: string;
          created_at: string;
        }
        Insert: {
          description: string;
          amount: number;
          category: string;
          date: string;
        }
        Update: {
          description?: string;
          amount?: number;
          category?: string;
          date?: string;
        }
      }
      projects: {
        Row: {
          id: number;
          title: string;
          description: string;
          image: string;
          technologies: string[];
          link?: string;
          order: number;
          created_at: string;
        }
        Insert: {
          title: string;
          description: string;
          image: string;
          technologies: string[];
          link?: string;
          order?: number;
        }
        Update: {
          title?: string;
          description?: string;
          image?: string;
          technologies?: string[];
          link?: string;
          order?: number;
        }
      }
    }
  }
}

// Type aliases for easier usage
export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

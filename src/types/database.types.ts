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

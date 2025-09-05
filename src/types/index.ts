import { Database } from './database.types';

export type Client = Database['public']['Tables']['clients']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];

export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

export type ClientUpdate = Database['public']['Tables']['clients']['Update'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

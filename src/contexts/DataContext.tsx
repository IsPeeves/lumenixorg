import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Client, Expense, Project, ClientInsert, ExpenseInsert, ProjectInsert, ClientUpdate, ExpenseUpdate, ProjectUpdate } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  clients: Client[];
  expenses: Expense[];
  projects: Project[];
  loading: boolean;
  error: string | null;
  addClient: (client: ClientInsert) => Promise<void>;
  updateClient: (id: string, client: ClientUpdate) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addExpense: (expense: ExpenseInsert) => Promise<void>;
  updateExpense: (id: string, expense: ExpenseUpdate) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addProject: (project: ProjectInsert) => Promise<void>;
  updateProject: (id: string, project: ProjectUpdate) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  reorderProjects: (projects: Project[]) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setClients([]);
      setExpenses([]);
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [clientsRes, expensesRes, projectsRes] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('expenses').select('*'),
        supabase.from('projects').select('*').order('order', { ascending: true }),
      ]);

      if (clientsRes.error) throw new Error(`Clients: ${clientsRes.error.message}`);
      if (expensesRes.error) throw new Error(`Expenses: ${expensesRes.error.message}`);
      if (projectsRes.error) throw new Error(`Projects: ${projectsRes.error.message}`);

      setClients(clientsRes.data || []);
      setExpenses(expensesRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addClient = async (client: ClientInsert) => {
    const { data, error } = await supabase.from('clients').insert(client).select().single();
    if (error) throw error;
    if (data) setClients(prev => [...prev, data]);
  };

  const updateClient = async (id: string, updates: ClientUpdate) => {
    const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
    if (error) throw error;
    if (data) setClients(prev => prev.map(c => c.id === id ? data : c));
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const addExpense = async (expense: ExpenseInsert) => {
    const { data, error } = await supabase.from('expenses').insert(expense).select().single();
    if (error) throw error;
    if (data) setExpenses(prev => [...prev, data]);
  };

  const updateExpense = async (id: string, updates: ExpenseUpdate) => {
    const { data, error } = await supabase.from('expenses').update(updates).eq('id', id).select().single();
    if (error) throw error;
    if (data) setExpenses(prev => prev.map(e => e.id === id ? data : e));
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addProject = async (project: ProjectInsert) => {
    const { data, error } = await supabase.from('projects').insert(project).select().single();
    if (error) throw error;
    if (data) setProjects(prev => [...prev, data].sort((a,b) => a.order - b.order));
  };

  const updateProject = async (id: string, updates: ProjectUpdate) => {
    const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
    if (error) throw error;
    if (data) setProjects(prev => prev.map(p => p.id === id ? data : p).sort((a,b) => a.order - b.order));
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const reorderProjects = async (reorderedProjects: Project[]) => {
    const updates = reorderedProjects.map((project, index) => 
      supabase.from('projects').update({ order: index }).eq('id', project.id)
    );
    const results = await Promise.all(updates);
    const hasError = results.some(res => res.error);
    if (hasError) {
        console.error("Error reordering projects", results);
        // Optionally refetch to revert optimistic update
        fetchData();
    } else {
        setProjects(reorderedProjects.map((p, i) => ({...p, order: i})));
    }
  };

  return (
    <DataContext.Provider value={{
      clients,
      expenses,
      projects,
      loading,
      error,
      addClient,
      updateClient,
      deleteClient,
      addExpense,
      updateExpense,
      deleteExpense,
      addProject,
      updateProject,
      deleteProject,
      reorderProjects,
    }}>
      {children}
    </DataContext.Provider>
  );
};

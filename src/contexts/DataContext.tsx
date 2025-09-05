import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Client, Expense, Project, ClientInsert, ExpenseInsert, ProjectInsert, ClientUpdate, ExpenseUpdate, ProjectUpdate } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  clients: Client[];
  expenses: Expense[];
  projects: Project[];
  loading: boolean;
  error: string | null;
  detailedError: {
    clients?: string;
    expenses?: string;
    projects?: string;
  };
  addClient: (client: ClientInsert) => Promise<void>;
  updateClient: (id: string, client: ClientUpdate) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addPaymentHistory: (paymentData: {
    clientId: number;
    amountReceived: number;
    paymentDate: string;
    observations?: string;
    status: 'Pago' | 'Pendente' | 'Atrasado';
  }) => Promise<any>;
  getPaymentHistory: (clientId: number) => Promise<any[]>;
  addExpense: (expense: ExpenseInsert) => Promise<void>;
  updateExpense: (id: string, expense: ExpenseUpdate) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addProject: (project: ProjectInsert) => Promise<void>;
  updateProject: (id: string, project: ProjectUpdate) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  reorderProjects: (projects: Project[]) => Promise<void>;
  refetchData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// URL base da API - usando variável de ambiente do Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Função helper para fazer requisições com tratamento robusto
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  try {
    console.log(`🔄 API Request: ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log(`📡 API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Se não conseguir parsear JSON do erro, usa mensagem padrão
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`✅ API Success:`, data);
    return data;
  } catch (error: any) {
    console.error(`❌ API Error for ${endpoint}:`, error);
    
    // Tratamento específico para diferentes tipos de erro
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Erro de conexão: Servidor não está respondendo');
    }
    
    if (error.message.includes('404')) {
      throw new Error('Rota não encontrada');
    }
    
    throw error;
  }
};

// Função helper para retornar dados padrão em caso de erro
const getDefaultData = (type: 'clients' | 'expenses' | 'projects'): any[] => {
  console.log(`⚠️ Retornando dados padrão para ${type}`);
  return [];
};

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
  const [detailedError, setDetailedError] = useState<{
    clients?: string;
    expenses?: string;
    projects?: string;
  }>({});

  const fetchData = useCallback(async () => {
    console.log('🚀 Iniciando fetchData...');
    
    if (!user) {
      console.log('👤 Usuário não autenticado, limpando dados');
      setClients([]);
      setExpenses([]);
      setProjects([]);
      setLoading(false);
      setError(null);
      setDetailedError({});
      return;
    }

    setLoading(true);
    setError(null);
    setDetailedError({});
    
    try {
      console.log('📊 Fazendo requisições paralelas com Promise.allSettled...');
      
      // Usando Promise.allSettled para que falhas parciais não impeçam outras requisições
      const results = await Promise.allSettled([
        apiRequest('/clients'),
        apiRequest('/expenses'),
        apiRequest('/projects'),
      ]);

      const [clientsResult, expensesResult, projectsResult] = results;
      const errors: { clients?: string; expenses?: string; projects?: string } = {};
      let hasAnyData = false;

      // Processar resultado dos clientes
      if (clientsResult.status === 'fulfilled') {
        console.log('✅ Clientes carregados:', clientsResult.value?.length || 0);
        setClients(Array.isArray(clientsResult.value) ? clientsResult.value : []);
        hasAnyData = true;
      } else {
        console.error('❌ Erro ao carregar clientes:', clientsResult.reason?.message);
        errors.clients = clientsResult.reason?.message || 'Erro ao carregar clientes';
        setClients(getDefaultData('clients'));
      }

      // Processar resultado das despesas
      if (expensesResult.status === 'fulfilled') {
        console.log('✅ Despesas carregadas:', expensesResult.value?.length || 0);
        setExpenses(Array.isArray(expensesResult.value) ? expensesResult.value : []);
        hasAnyData = true;
      } else {
        console.error('❌ Erro ao carregar despesas:', expensesResult.reason?.message);
        errors.expenses = expensesResult.reason?.message || 'Erro ao carregar despesas';
        setExpenses(getDefaultData('expenses'));
      }

      // Processar resultado dos projetos
      if (projectsResult.status === 'fulfilled') {
        console.log('✅ Projetos carregados:', projectsResult.value?.length || 0);
        setProjects(Array.isArray(projectsResult.value) ? projectsResult.value : []);
        hasAnyData = true;
      } else {
        console.error('❌ Erro ao carregar projetos:', projectsResult.reason?.message);
        errors.projects = projectsResult.reason?.message || 'Erro ao carregar projetos';
        setProjects(getDefaultData('projects'));
      }

      // Definir erros detalhados
      setDetailedError(errors);

      // Definir erro geral apenas se todas as requisições falharam
      if (Object.keys(errors).length === 3) {
        setError('Falha ao carregar todos os dados. Verifique sua conexão e tente novamente.');
      } else if (Object.keys(errors).length > 0) {
        const failedServices = Object.keys(errors).join(', ');
        setError(`Alguns dados não puderam ser carregados: ${failedServices}`);
      }

      console.log('📈 Resumo do carregamento:', {
        clientes: clientsResult.status,
        despesas: expensesResult.status,
        projetos: projectsResult.status,
        erros: errors
      });
      
    } catch (err: any) {
      console.error('💥 Erro crítico no fetchData:', err);
      setError('Erro crítico ao carregar dados: ' + err.message);
      setClients(getDefaultData('clients'));
      setExpenses(getDefaultData('expenses'));
      setProjects(getDefaultData('projects'));
    } finally {
      setLoading(false);
      console.log('🏁 fetchData finalizado');
    }
  }, [user]);

  // Função para refetch manual
  const refetchData = useCallback(async () => {
    console.log('🔄 Refetch manual solicitado');
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // FUNÇÕES DE CLIENTES
  const addClient = async (client: ClientInsert) => {
    try {
      console.log('➕ Adicionando cliente:', client);
      const data = await apiRequest('/clients', {
        method: 'POST',
        body: JSON.stringify(client),
      });
      setClients(prev => [...prev, data]);
      console.log('✅ Cliente adicionado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao adicionar cliente:', error);
      throw error;
    }
  };

  const updateClient = async (id: string, updates: ClientUpdate) => {
    try {
      console.log('📝 Atualizando cliente:', id, updates);
      const data = await apiRequest(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setClients(prev => prev.map(c => c.id === parseInt(id) ? data : c));
      console.log('✅ Cliente atualizado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao atualizar cliente:', error);
      // Em caso de erro, refetch para sincronizar
      await refetchData();
      throw error;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      console.log('🗑️ Deletando cliente:', id);
      await apiRequest(`/clients/${id}`, {
        method: 'DELETE',
      });
      setClients(prev => prev.filter(c => c.id !== parseInt(id)));
      console.log('✅ Cliente deletado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao deletar cliente:', error);
      // Em caso de erro, refetch para sincronizar
      await refetchData();
      throw error;
    }
  };

  // Funções de histórico de pagamentos
  const addPaymentHistory = async (paymentData: {
    clientId: number;
    amountReceived: number;
    paymentDate: string;
    observations?: string;
    status: 'Pago' | 'Pendente' | 'Atrasado';
  }) => {
    try {
      console.log('➕ Adicionando histórico de pagamento:', paymentData);
      const data = await apiRequest('/payment-history', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
      console.log('✅ Histórico de pagamento adicionado com sucesso');
      return data;
    } catch (error: any) {
      console.error('❌ Erro ao adicionar histórico de pagamento:', error);
      throw error;
    }
  };

  const getPaymentHistory = async (clientId: number) => {
    try {
      console.log('📊 Buscando histórico de pagamentos para cliente:', clientId);
      const data = await apiRequest(`/payment-history/${clientId}`);
      console.log('✅ Histórico de pagamentos carregado com sucesso');
      return data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar histórico de pagamentos:', error);
      throw error;
    }
  };

  // FUNÇÕES DE DESPESAS
  const addExpense = async (expense: ExpenseInsert) => {
    try {
      console.log('➕ Adicionando despesa:', expense);
      const data = await apiRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify(expense),
      });
      setExpenses(prev => [...prev, data]);
      console.log('✅ Despesa adicionada com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao adicionar despesa:', error);
      throw error;
    }
  };

  const updateExpense = async (id: string, updates: ExpenseUpdate) => {
    try {
      console.log('📝 Atualizando despesa:', id, updates);
      const data = await apiRequest(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setExpenses(prev => prev.map(e => e.id === parseInt(id) ? data : e));
      console.log('✅ Despesa atualizada com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao atualizar despesa:', error);
      // Em caso de erro, refetch para sincronizar
      await refetchData();
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      console.log('🗑️ Deletando despesa:', id);
      await apiRequest(`/expenses/${id}`, {
        method: 'DELETE',
      });
      setExpenses(prev => prev.filter(e => e.id !== parseInt(id)));
      console.log('✅ Despesa deletada com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao deletar despesa:', error);
      // Em caso de erro, refetch para sincronizar
      await refetchData();
      throw error;
    }
  };

  // FUNÇÕES DE PROJETOS
  const addProject = async (project: ProjectInsert) => {
    try {
      console.log('➕ Adicionando projeto:', project);
      const data = await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(project),
      });
      setProjects(prev => [...prev, data]);
      console.log('✅ Projeto adicionado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao adicionar projeto:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: ProjectUpdate) => {
    try {
      console.log('📝 Atualizando projeto:', id, updates);
      const data = await apiRequest(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setProjects(prev => prev.map(p => p.id === parseInt(id) ? data : p));
      console.log('✅ Projeto atualizado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao atualizar projeto:', error);
      // Em caso de erro, refetch para sincronizar
      await refetchData();
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      console.log('🗑️ Deletando projeto:', id);
      await apiRequest(`/projects/${id}`, {
        method: 'DELETE',
      });
      setProjects(prev => prev.filter(p => p.id !== parseInt(id)));
      console.log('✅ Projeto deletado com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao deletar projeto:', error);
      // Em caso de erro, refetch para sincronizar
      await refetchData();
      throw error;
    }
  };

  const reorderProjects = async (reorderedProjects: Project[]) => {
    try {
      console.log('🔄 Reordenando projetos:', reorderedProjects.length);
      // Para simplificar, vamos apenas atualizar o estado local
      // Em uma implementação mais robusta, você poderia adicionar uma rota para reordenação
      setProjects(reorderedProjects);
      console.log('✅ Projetos reordenados com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao reordenar projetos:', error);
      // Recarregar dados em caso de erro
      await refetchData();
    }
  };

  return (
    <DataContext.Provider value={{
      clients,
      expenses,
      projects,
      loading,
      error,
      detailedError,
      addClient,
      updateClient,
      deleteClient,
      addPaymentHistory,
      getPaymentHistory,
      addExpense,
      updateExpense,
      deleteExpense,
      addProject,
      updateProject,
      deleteProject,
      reorderProjects,
      refetchData,
    }}>
      {children}
    </DataContext.Provider>
  );
};
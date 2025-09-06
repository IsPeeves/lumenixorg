import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, ExternalLink, Filter, AlertCircle, DollarSign, History } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Client } from '../../types/database.types';
import PaymentConfirmationModal, { PaymentConfirmationData } from './PaymentConfirmationModal';
import PaymentHistoryModal from './PaymentHistoryModal';

const ClientsModule: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient, loading, detailedError } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    monthlyValue: '',
    dueDay: '',
    websiteLink: '',
    paymentStatus: 'Pendente' as const
  });
  
  // Estados para os novos modais
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Verificação de segurança para clients (igual ao ExpensesModule)
  if (!Array.isArray(clients)) {
    console.warn('⚠️ clients não é um array:', clients);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Erro ao carregar clientes</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  // Error state específico para clients
  if (detailedError?.clients) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-red-800 font-medium">Erro ao carregar clientes</h3>
        </div>
        <p className="text-red-700 mt-2">{detailedError.clients}</p>
      </div>
    );
  }

  const filteredClients = clients.filter(client => {
    // Usar apenas companyName que é o campo correto do banco
    const clientName = client?.companyName || '';
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Verificar se formData.companyName existe antes de usar
  if (!formData.companyName || formData.companyName.trim() === '') {
    alert('Nome da empresa é obrigatório');
    return;
  }
  
  // Corrigir os dados para corresponder ao tipo ClientInsert
  const clientData = {
    companyName: formData.companyName,
    monthlyValue: parseFloat(formData.monthlyValue) || 0,
    dueDay: parseInt(formData.dueDay) || 1,
    websiteLink: formData.websiteLink || null,
    paymentStatus: formData.paymentStatus
  };

  if (editingClient) {
    updateClient(editingClient.id, clientData);
  } else {
    addClient(clientData);
  }

  resetForm();
};

const resetForm = () => {
  setFormData({
    companyName: '',
    monthlyValue: '',
    dueDay: '',
    websiteLink: '',
    paymentStatus: 'Pendente'
  });
  setEditingClient(null);
  setShowModal(false);
};

const handleEdit = (client: any) => {
  setEditingClient(client);
  setFormData({
    companyName: client.companyName,
    monthlyValue: client.monthlyValue?.toString() || '',
    dueDay: client.dueDay?.toString() || '',
    websiteLink: client.websiteLink || '',
    paymentStatus: client.paymentStatus
  });
  setShowModal(true);
};

// Funções para os novos modais
const handlePaymentConfirmation = (client: Client) => {
  setSelectedClient(client);
  setShowPaymentModal(true);
};

const handleViewHistory = (client: Client) => {
  setSelectedClient(client);
  setShowHistoryModal(true);
};

const handleConfirmPayment = async (paymentData: PaymentConfirmationData) => {
  try {
    // Atualizar o status do cliente para 'Pago'
    await updateClient(paymentData.clientId.toString(), {
      paymentStatus: 'Pago'
    });
    
    // Aqui você pode adicionar lógica para salvar o histórico de pagamento
    // Por exemplo, fazer uma chamada para uma API de histórico de pagamentos
    console.log('Pagamento confirmado:', paymentData);
    
    setShowPaymentModal(false);
    setSelectedClient(null);
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    throw error;
  }
};

  const getStatusBadge = (status: string) => {
    const styles = {
      'Pago': 'bg-green-100 text-green-800',
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Atrasado': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-600">Gerencie seus clientes e receitas mensais</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome da empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white"
            >
              <option value="all">Todos os status</option>
              <option value="Pago">Pago</option>
              <option value="Pendente">Pendente</option>
              <option value="Atrasado">Atrasado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-sm font-medium text-gray-600">Total de Clientes</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{clients.length}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-sm font-medium text-gray-600">Receita Mensal Total</h3>
          <p className="text-2xl font-bold text-green-600 mt-1">
            R$ {clients.reduce((sum, client) => {
              const value = client?.monthlyValue || 0;
              return sum + (typeof value === 'number' ? value : parseFloat(value) || 0);
            }, 0).toFixed(2).replace('.', ',')}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-sm font-medium text-gray-600">Pendentes/Atrasados</h3>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {clients.filter(c => c.paymentStatus !== 'Pago').length}
          </p>
        </motion.div>
      </div>

      {/* Clients Table - Desktop */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Mensal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client, index) => (
                <motion.tr
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{client.companyName}</div>
                      <div className="text-sm text-gray-500">
                        Cadastrado em {new Date(client.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      R$ {(typeof client?.monthlyValue === 'number' ? client.monthlyValue : parseFloat(client?.monthlyValue) || 0).toFixed(2).replace('.', ',')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Dia {client.dueDay}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(client.paymentStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* Botão de Confirmar Pagamento - apenas para status Pendente ou Atrasado */}
                      {client.paymentStatus !== 'Pago' && (
                        <button
                          onClick={() => handlePaymentConfirmation(client)}
                          className="text-green-600 hover:text-green-900"
                          title="Confirmar Pagamento"
                        >
                          <DollarSign className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Botão de Histórico */}
                      <button
                        onClick={() => handleViewHistory(client)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Ver Histórico"
                      >
                        <History className="h-4 w-4" />
                      </button>
                      
                      <a
                        href={client.websiteLink || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark"
                        title="Ver site"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteClient(client.id.toString())}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clients Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{client.companyName}</h3>
                <p className="text-sm text-gray-500">
                  Cadastrado em {new Date(client.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {getStatusBadge(client.paymentStatus)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Valor Mensal</p>
                <p className="text-lg font-semibold text-gray-900">
                  R$ {(typeof client?.monthlyValue === 'number' ? client.monthlyValue : parseFloat(client?.monthlyValue) || 0).toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Vencimento</p>
                <p className="text-lg font-semibold text-gray-900">Dia {client.dueDay}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              {/* Botão de Confirmar Pagamento - apenas para status Pendente ou Atrasado */}
              {client.paymentStatus !== 'Pago' && (
                <button
                  onClick={() => handlePaymentConfirmation(client)}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Confirmar</span>
                </button>
              )}
              
              {/* Botão de Histórico */}
              <button
                onClick={() => handleViewHistory(client)}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <History className="h-4 w-4" />
                <span>Histórico</span>
              </button>
              
              <a
                href={client.websiteLink || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Site</span>
              </a>
              
              <button
                onClick={() => handleEdit(client)}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </button>
              
              <button
                onClick={() => deleteClient(client.id.toString())}
                className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Mensal (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.monthlyValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyValue: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dia do Vencimento
                </label>
                <select
                  required
                  value={formData.dueDay}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDay: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Selecione...</option>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link do Site
                </label>
                <input
                  type="url"
                  required
                  value={formData.websiteLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, websiteLink: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="https://exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status do Pagamento
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                  <option value="Atrasado">Atrasado</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {editingClient ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* Modal de Confirmação de Pagamento */}
      <PaymentConfirmationModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onConfirm={handleConfirmPayment}
      />
      
      {/* Modal de Histórico de Pagamentos */}
      <PaymentHistoryModal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
      />
    </div>
  );
};

export default ClientsModule;

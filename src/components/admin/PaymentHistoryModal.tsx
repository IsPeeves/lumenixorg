import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, History, FileText, Download, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { Client } from '../../types/database.types';
import { useData } from '../../contexts/DataContext';

interface PaymentRecord {
  id: number;
  clientId: number;
  dueDate: string;
  amount: number;
  status: 'Pago' | 'Pendente' | 'Atrasado';
  paymentDate?: string;
  observations?: string;
  createdAt: string;
  updatedAt?: string;
}

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

type SortField = 'dueDate' | 'amount' | 'status' | 'paymentDate';
type SortOrder = 'asc' | 'desc';

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  client
}) => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);
  
  const { getPaymentHistory } = useData();

  // Fetch payment history when modal opens
  useEffect(() => {
    if (isOpen && client) {
      fetchPaymentHistory();
    }
  }, [isOpen, client]);

  const fetchPaymentHistory = async () => {
    if (!client) return;
    
    setLoading(true);
    setError('');
    
    try {
      const history = await getPaymentHistory(client.id);
      setPaymentHistory(history);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar histórico de pagamentos');
    } finally {
      setLoading(false);
    }
  };



  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedHistory = [...paymentHistory].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'dueDate' || sortField === 'paymentDate') {
      aValue = new Date(aValue || '1900-01-01').getTime();
      bValue = new Date(bValue || '1900-01-01').getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleExport = () => {
if (!client || !client.id || paymentHistory.length === 0) return;
    
    const csvContent = [
      ['Data Vencimento', 'Valor', 'Status', 'Data Pagamento', 'Observações'],
      ...sortedHistory.map(record => [
        new Date(record.dueDate).toLocaleDateString('pt-BR'),
        `R$ ${(typeof record.amount === 'number' ? record.amount : parseFloat(record.amount) || 0).toFixed(2).replace('.', ',')}`,
        record.status,
        record.paymentDate ? new Date(record.paymentDate).toLocaleDateString('pt-BR') : '-',
        record.observations || '-'
      ])
    ].map(row => row.join(';')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historico-pagamentos-${client.companyName.replace(/\s+/g, '-').toLowerCase()}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !client) return null;

  const totalPaid = paymentHistory.filter(p => p.status === 'Pago').length;
  const totalPending = paymentHistory.filter(p => p.status === 'Pendente').length;
  const totalOverdue = paymentHistory.filter(p => p.status === 'Atrasado').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-3 sm:p-6 w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
              <History className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600 flex-shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">Histórico de Pagamentos</span>
                <span className="sm:hidden">Histórico</span>
              </span>
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-1 truncate">{client.companyName}</p>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
            <button
              onClick={handleExport}
              className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              title="Exportar CSV"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-2 sm:px-3 py-2 text-xs sm:text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
              title="Imprimir"
            >
              <Printer className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total de Registros</h3>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{paymentHistory.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Pagos</h3>
            <p className="text-lg sm:text-2xl font-bold text-green-600">{totalPaid}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Pendentes</h3>
            <p className="text-lg sm:text-2xl font-bold text-yellow-600">{totalPending}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">Atrasados</h3>
            <p className="text-lg sm:text-2xl font-bold text-red-600">{totalOverdue}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando histórico...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto overflow-y-auto max-h-80 sm:max-h-96">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th 
                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('dueDate')}
                      >
                        <div className="flex items-center">
                          <span className="hidden sm:inline">Data Vencimento</span>
                          <span className="sm:hidden">Venc.</span>
                          {sortField === 'dueDate' && (
                            sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center">
                          Valor
                          {sortField === 'amount' && (
                            sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {sortField === 'status' && (
                            sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('paymentDate')}
                      >
                        <div className="flex items-center">
                          <span className="hidden sm:inline">Data Pagamento</span>
                          <span className="sm:hidden">Pag.</span>
                          {sortField === 'paymentDate' && (
                            sortOrder === 'asc' ? <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 ml-1" /> : <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-2 sm:px-4 py-6 sm:py-8 text-center">
                          <div className="flex flex-col items-center">
                            <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                            <p className="text-gray-500 text-sm sm:text-base">Nenhum registro de pagamento encontrado</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sortedHistory.map((record) => (
                        <React.Fragment key={record.id}>
                          <tr 
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                          >
                            <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                              {new Date(record.dueDate).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                              <span className="hidden sm:inline">R$ {(typeof record.amount === 'number' ? record.amount : parseFloat(record.amount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              <span className="sm:hidden">R$ {(typeof record.amount === 'number' ? record.amount : parseFloat(record.amount) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                            </td>
                            <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                              <span className={`inline-flex px-1 sm:px-2 py-1 text-xs font-medium rounded-full ${
                                record.status === 'Pago' ? 'bg-green-100 text-green-800' :
                                record.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                <span className="hidden sm:inline">{record.status}</span>
                                <span className="sm:hidden">
                                  {record.status === 'Pago' ? 'P' : record.status === 'Pendente' ? 'Pend' : 'Atr'}
                                </span>
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                              {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString('pt-BR') : '-'}
                            </td>
                            <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                              <div className="flex items-center">
                                {record.observations ? (
                                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                ) : (
                                  '-'
                                )}
                                <ChevronDown className={`ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform ${
                                  expandedRecord === record.id ? 'rotate-180' : ''
                                }`} />
                              </div>
                            </td>
                          </tr>
                          {expandedRecord === record.id && (
                            <tr>
                              <td colSpan={5} className="px-2 sm:px-4 py-3 sm:py-4 bg-gray-50">
                                <div className="space-y-2">
                                  <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-medium text-gray-700 text-xs sm:text-sm">Data de Criação:</span>
                                    <span className="sm:ml-2 text-gray-900 text-xs sm:text-sm">
                                      {new Date(record.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                  {record.observations && (
                                    <div>
                                      <span className="font-medium text-gray-700 text-xs sm:text-sm">Observações:</span>
                                      <p className="mt-1 text-gray-900 text-xs sm:text-sm break-words">{record.observations}</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentHistoryModal;
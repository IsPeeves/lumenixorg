import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { Client } from '../../types/database.types';
import { useData } from '../../contexts/DataContext';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onConfirm: (paymentData: PaymentConfirmationData) => Promise<void>;
}

export interface PaymentConfirmationData {
  clientId: number;
  amountReceived: number;
  paymentDate: string;
  observations?: string;
  status: 'Pago';
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isOpen,
  onClose,
  client,
  onConfirm
}) => {
  const [formData, setFormData] = useState({
    amountReceived: '',
    paymentDate: new Date().toISOString().split('T')[0],
    observations: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { updateClient, addPaymentHistory } = useData();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen && client) {
      setFormData({
        amountReceived: client.monthlyValue.toString(),
        paymentDate: new Date().toISOString().split('T')[0],
        observations: ''
      });
      setError('');
    }
  }, [isOpen, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setError('');
    
    // Validações
    const amount = parseFloat(formData.amountReceived);
    if (isNaN(amount) || amount <= 0) {
      setError('Valor recebido deve ser um número positivo');
      return;
    }

    if (!formData.paymentDate) {
      setError('Data de pagamento é obrigatória');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Atualizar status do cliente para 'Pago'
      await updateClient(client.id.toString(), {
        paymentStatus: 'Pago'
      });
      
      // Adicionar registro ao histórico de pagamentos
      await addPaymentHistory({
        clientId: client.id,
        amountReceived: amount,
        paymentDate: formData.paymentDate,
        observations: formData.observations.trim() || undefined,
        status: 'Pago'
      });
      
      // Chamar a função de callback
      await onConfirm({
        clientId: client.id,
        amountReceived: amount,
        paymentDate: formData.paymentDate,
        observations: formData.observations.trim() || undefined,
        status: 'Pago'
      });
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao confirmar pagamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !client) return null;

  // Calcular status baseado na data de vencimento
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const dueDate = new Date(currentYear, currentMonth, client.dueDay);
  
  // Se já passou do dia de vencimento neste mês, considerar atrasado
  const isOverdue = today > dueDate && client.paymentStatus !== 'Pago';
  const statusColor = client.paymentStatus === 'Pago' ? 'text-green-600' : 
                     isOverdue ? 'text-red-600' : 'text-yellow-600';
  const statusText = client.paymentStatus === 'Pago' ? 'Pago' : 
                    isOverdue ? 'Atrasado' : 'Pendente';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-lg shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
            Confirmar Recebimento
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 p-1"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* Client Information */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Informações do Cliente</h3>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Empresa:</span>
              <span className="font-medium text-gray-900 text-right break-words ml-2">{client.companyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor Mensal:</span>
              <span className="font-medium text-gray-900">
                R$ {(typeof client.monthlyValue === 'number' ? client.monthlyValue : parseFloat(client.monthlyValue) || 0).toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vencimento:</span>
              <span className="font-medium text-gray-900">Dia {client.dueDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status Atual:</span>
              <span className={`font-medium ${statusColor}`}>{statusText}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-xs sm:text-sm">{error}</p>
              </div>
            </div>
          )}
          {/* Amount Received */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Valor Recebido *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amountReceived}
                onChange={(e) => setFormData(prev => ({ ...prev, amountReceived: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base"
                placeholder="0,00"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Data do Pagamento *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none text-sm sm:text-base"
                rows={3}
                placeholder="Observações adicionais sobre o pagamento..."
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Confirmar Pagamento</span>
                  <span className="sm:hidden">Confirmar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PaymentConfirmationModal;
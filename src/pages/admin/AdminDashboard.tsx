import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  FolderOpen, 
  LogOut, 
  Menu, 
  X,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Logo from '../../components/Logo';
import ClientsModule from '../../components/admin/ClientsModule';
import ExpensesModule from '../../components/admin/ExpensesModule';
import PortfolioModule from '../../components/admin/PortfolioModule';
// Remove unused import

const AdminDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const { clients, expenses, loading } = useData();

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  // Verificações de segurança para evitar erros
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  // Cálculos do dashboard com verificações de segurança
  const totalRevenue = safeClients.reduce((sum, client) => {
    const value = client?.monthlyValue || 0;
    return sum + (typeof value === 'number' ? value : parseFloat(value) || 0);
  }, 0);
  
  const totalExpenses = safeExpenses
    .reduce((sum, expense) => {
      const amount = expense?.amount || 0;
      return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
    }, 0);
    
  const balance = totalRevenue - totalExpenses;
  
  const pendingClients = safeClients.filter(client => client?.paymentStatus === 'Pendente').length;
  const overdueClients = safeClients.filter(client => client?.paymentStatus === 'Atrasado').length;
  
  const upcomingExpenses = safeExpenses.filter(expense => {
    if (!expense?.date) return false;
    const dueDate = new Date(expense.date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }).length;

  // Mostrar loading enquanto os dados carregam
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }
  const menuItems = [
    { id: 'dashboard', label: 'Resumo', icon: BarChart3 },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'expenses', label: 'Despesas', icon: CreditCard },
    { id: 'portfolio', label: 'Portfólio', icon: FolderOpen },
  ];

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'clients':
        return <ClientsModule />;
      case 'expenses':
        return <ExpensesModule />;
      case 'portfolio':
        return <PortfolioModule />;
      default:
        return (
          <div className="space-y-6">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-full"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 mb-2">Receita Mensal</p>
                    <p className="text-xl font-bold text-gray-900 truncate">
                      R$ {totalRevenue.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-full"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 mb-2">Despesas Mensais</p>
                    <p className="text-xl font-bold text-gray-900 truncate">
                      R$ {totalExpenses.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-full"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 mb-2">Balanço</p>
                    <p className={`text-xl font-bold truncate ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {balance.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-4 ${
                    balance >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <DollarSign className={`h-6 w-6 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-full"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Clientes</p>
                    <p className="text-xl font-bold text-gray-900 truncate">{clients.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Alertas */}
            {(pendingClients > 0 || overdueClients > 0 || upcomingExpenses > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
              >
                <div className="flex items-center mb-4">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="text-lg font-semibold text-yellow-800">Alertas</h3>
                </div>
                <div className="space-y-2">
                  {pendingClients > 0 && (
                    <p className="text-yellow-700">
                      • {pendingClients} cliente(s) com pagamento pendente
                    </p>
                  )}
                  {overdueClients > 0 && (
                    <p className="text-yellow-700">
                      • {overdueClients} cliente(s) com pagamento atrasado
                    </p>
                  )}
                  {upcomingExpenses > 0 && (
                    <p className="text-yellow-700">
                      • {upcomingExpenses} despesa(s) vencem nos próximos 7 dias
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Resumo de Clientes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Clientes Recentes</h3>
              <div className="space-y-3">
                {safeClients.slice(0, 5).map((client) => (
                  <div key={client?.id || Math.random()} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{client?.companyName || 'Nome não informado'}</p>
                      <p className="text-sm text-gray-500">Vence dia {client?.dueDay || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        R$ {(typeof client?.monthlyValue === 'number' ? client.monthlyValue : parseFloat(client?.monthlyValue) || 0).toFixed(2).replace('.', ',')}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        client?.paymentStatus === 'Pago' ? 'bg-green-100 text-green-800' :
                        client?.paymentStatus === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {client?.paymentStatus || 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Logo />
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveModule(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeModule === item.id 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </button>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {menuItems.find(item => item.id === activeModule)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;



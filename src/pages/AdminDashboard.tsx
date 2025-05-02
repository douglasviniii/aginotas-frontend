import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CircularProgress } from '@mui/material'; // Importe CircularProgress
import { api } from '../lib/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function AdminDashboard() {

interface InvoiceByMonth {
  month: string;
  value: number;
}

interface CustomerByMonth {
  month: string;
  count: number;
}

interface SubscriptionByMonth {
  month: string;
  count: number;
}

interface Metrics {
  totalInvoices: number;
  totalInvoiceValue: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newSubscriptions: number;
  latecomers: number;
  subscriptionCancellations: number;
  totalSubscriptionRevenue: number;
  invoicesByMonth: InvoiceByMonth[];
  customersByMonth: CustomerByMonth[];
  subscriptionsByMonth: SubscriptionByMonth[];
}

const [metrics, setMetrics] = useState({
  totalInvoices: 0,
  totalInvoiceValue: 50000,
  activeCustomers: 120,
  inactiveCustomers: 30,
  newSubscriptions: 15,
  latecomers: 15,
  subscriptionCancellations: 5, // Exemplo de cancelamentos
  totalSubscriptionRevenue: 25000, // Exemplo de receita de assinaturas
  
  invoicesByMonth: [
    { month: 'Jan', value: 4000 },
    { month: 'Fev', value: 4500 },
    { month: 'Mar', value: 5000 },
    { month: 'Abr', value: 5500 },
    { month: 'Mai', value: 6000 },
    { month: 'Jun', value: 6500 },
  ],

  customersByMonth: [
    { month: 'Jan', count: 100 },
    { month: 'Fev', count: 105 },
    { month: 'Mar', count: 110 },
    { month: 'Abr', count: 115 },
    { month: 'Mai', count: 120 },
    { month: 'Jun', count: 125 },
  ],
  
  subscriptionsByMonth: [
    { month: 'Jan', count: 10 },
    { month: 'Fev', count: 12 },
    { month: 'Mar', count: 13 },
    { month: 'Abr', count: 14 },
    { month: 'Mai', count: 15 },
    { month: 'Jun', count: 16 },
  ],
});


const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [selectedChart, setSelectedChart] = useState('invoices');
const [invoice, setInvoice] = useState([]);
const [invoicePrice, setInvoicePrice] = useState(0);
const [invoicePricecancel, setInvoicePriceCancel] = useState([]);
const [users, setUsers] = useState([]);
const [plans, setPlans] = useState<Plan | null>(null);
const [subscriptions, setSubscriptions] = useState([]);

useEffect(() => {
  async function fetchMetrics() {
    try {
      setLoading(true);
      const invoice = await api.find_all_invoices();
      setInvoice(invoice.filter((inv) => inv.status === 'emitida' || inv.status === 'substituida'));

      const totalPrice = invoice
        .filter((inv) => inv.status === 'emitida' || inv.status === 'substituida')
        .reduce((sum, inv) => sum + inv.valor, 0);

      setInvoicePrice(totalPrice);

      const totalPricecancel = invoice
        .filter((inv) => inv.status === 'cancelada')
      setInvoicePriceCancel(totalPricecancel);
      
      const usersdb = await api.find_all_users();
      setUsers(usersdb);

      const response = await api.find_plans();
      setPlans(response.data[0]);

      const subscriptions = await api.Find_All_Subscriptions();
      setSubscriptions(subscriptions.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    }
  }
  fetchMetrics();
}, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Erro: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
    <h1 className="text-3xl font-bold mb-8 text-gray-800">Painel de Administração</h1>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-700">Total de Notas Emitidas (GERAL)</h2>
        <p className="text-3xl font-bold text-gray-800 mt-2">{invoice.length}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-700">Valor Total das Notas Emitidas (GERAL)</h2>
        <p className="text-3xl font-bold text-gray-800 mt-2">R$ {invoicePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-700">Total de Notas Canceladas (GERAL)</h2>
        <p className="text-3xl font-bold text-gray-800 mt-2">{invoicePricecancel.length}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-700">Clientes Ativos</h2>
        <p className="text-3xl font-bold text-gray-800 mt-2">{users.filter((user) => user.status === 'active').length}</p>
      </div>
       <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h2 className="text-lg font-semibold text-gray-700">Assinaturas canceladas</h2>
    <p className="text-3xl font-bold text-gray-800 mt-2">{subscriptions.filter((sub) => sub.status === 'canceled').length}</p>
  </div>
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h2 className="text-lg font-semibold text-gray-700">Assinaturas em atraso</h2>
    <p className="text-3xl font-bold text-gray-800 mt-2">{subscriptions.filter((sub) => sub.status === 'suspended').length}</p>
  </div>
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h2 className="text-lg font-semibold text-gray-700">Receita Total de Assinaturas</h2>
    <p className="text-3xl font-bold text-gray-800 mt-2">R$ {(((plans?.items[0].pricing_scheme.price || 0) / 100) * users.filter((user) => user.status === 'active').length).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}</p>
  </div>
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-700">Clientes Inativos</h2>
        <p className="text-3xl font-bold text-gray-800 mt-2">{users.filter((user) => user.status === 'inactive').length}</p>
      </div>
       <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-700">Quantidade de planos</h2>
        <p className="text-3xl font-bold text-gray-800 mt-2">{[plans]?.length}</p>
      </div>
    </div>
  </div>
  );
}
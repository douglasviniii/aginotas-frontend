import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CircularProgress } from '@mui/material'; // Importe CircularProgress
import { api } from '../lib/api';
import dayjs from 'dayjs';
import { toast } from 'sonner';

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


interface Plan {
  items: {
    pricing_scheme: {
      price: number;
    };
  }[];
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
const [invoicePrice, setInvoicePrice] = useState<number>(0);
const [invoicePricecancel, setInvoicePriceCancel] = useState([]);
const [selectedYear, setSelectedYear] = useState<string | null>(null);
const [users, setUsers] = useState([]);

const [plans, setPlans] = useState<Plan | null>(null);
const [subscriptions, setSubscriptions] = useState([]);

const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
const [filteredInvoices, setFilteredInvoices] = useState([]);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      try {
        const [invoice, usersdb, plansResponse, subscriptionsResponse] = await Promise.all([
          api.find_all_invoices(),
          api.find_all_users(),
          api.find_plans(),
          api.Find_All_Subscriptions(),
        ]);

        const filteredInvoicesvalid = invoice.filter(
          (inv) => inv.status === 'emitida' || inv.status === 'substituida'
        );
        setInvoice(filteredInvoicesvalid);

        const totalPrice = invoice.reduce((sum, inv) => sum + inv.valor, 0);
        setInvoicePrice(totalPrice);

        const canceledInvoices = invoice.filter((inv) => inv.status === 'cancelada');
        setInvoicePriceCancel(canceledInvoices);

        setUsers(usersdb);
        setPlans(plansResponse.data[0]);
        setSubscriptions(subscriptionsResponse.data);
      } catch (error) {
        console.error('Erro ao buscar métricas:', error);
      } finally {
        setLoading(false);
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

  const handleUpdate = () => {
    const validInvoices = filteredInvoices.filter(
      (inv) => inv.status === 'emitida' || inv.status === 'substituida'
    );
    const totalPrice = validInvoices.reduce((sum, inv) => sum + inv.valor, 0);
    setInvoicePrice(totalPrice);

    const canceledInvoices = filteredInvoices.filter((inv) => inv.status === 'cancelada');
    setInvoicePriceCancel(canceledInvoices);
  };


  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Painel de Administração</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrar Notas por Ano e Mês</h2>
      <div className="flex flex-wrap gap-4">
        <select
        className="border border-gray-300 rounded-lg p-2"
        onChange={(e) => setSelectedYear(e.target.value)}
        >
        <option value="">Selecione o Ano</option>
        {Array.from({ length: 5 }, (_, i) => dayjs().year() - i).map((year) => (
          <option key={year} value={year}>
          {year}
          </option>
        ))}
        </select>

        <select
        className="border border-gray-300 rounded-lg p-2"
        onChange={(e) => setSelectedMonth(e.target.value)}
        >
        <option value="">Selecione o Mês</option>
        {Array.from({ length: 12 }, (_, i) => i).map((month) => (
          <option key={month} value={month}>
          {dayjs().locale('pt-br').month(month).format('MMMM')}
          </option>
        ))}
        </select>

        <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        onClick={() => {
          if (selectedYear && selectedMonth) {
          const selectedDate = dayjs(`${selectedYear}-${String(Number(selectedMonth) + 1).padStart(2, '0')}-01`);
          const filtered = invoice.filter((nota) => {
            const notaDate = dayjs(nota.date);
            return notaDate.isSame(selectedDate, 'month');
          });
          setFilteredInvoices(filtered);
          handleUpdate();
          } else {
          toast.error("Por favor, selecione o ano e o mês.");
          }
        }}
        >
        Filtrar
        </button>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[
        { title: "Total de Notas Emitidas (GERAL)", value: filteredInvoices.length },
        { title: "Valor Total das Notas Emitidas (GERAL)", value: `R$ ${invoicePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { title: "Total de Notas Canceladas (GERAL)", value: invoicePricecancel.length },
        { title: "Clientes Ativos", value: users.filter((user) => user.status === 'active').length },
        { title: "Assinaturas canceladas", value: subscriptions.filter((sub) => sub.status === 'canceled').length },
        { title: "Assinaturas em atraso", value: subscriptions.filter((sub) => sub.status === 'suspended').length },
        { title: "Receita Total de Assinaturas", value: `R$ ${(((plans?.items[0].pricing_scheme.price || 0) / 100) * users.filter((user) => user.status === 'active').length).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}` },
        { title: "Clientes Inativos", value: users.filter((user) => user.status === 'inactive').length },
        { title: "Quantidade de planos", value: plans ? plans.items.length : 0 },
      ].map((card, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-700">{card.title}</h2>
        <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
        </div>
      ))}
      </div>
    </div>
  );
}
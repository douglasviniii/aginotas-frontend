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
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 p-2 sm:p-4 md:p-8 flex flex-col gap-6 sm:gap-8">

        {/* Filtros */}
        <section className="bg-white/80 p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl border border-purple-100 backdrop-blur-md flex flex-col md:flex-row items-center gap-4 sm:gap-6">
          <div className="flex flex-col gap-2 flex-1 w-full">
        <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2">
          Filtro de Ano e Mês
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
          <select
            className="border border-gray-300 rounded-lg p-2 w-full sm:w-auto"
            onChange={(e) => setSelectedYear(e.target.value)}
            value={selectedYear || ""}
          >
            <option value="">Ano</option>
            {Array.from({ length: 5 }, (_, i) => dayjs().year() - i).map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-lg p-2 w-full sm:w-auto"
            onChange={(e) => setSelectedMonth(e.target.value)}
            value={selectedMonth || ""}
          >
            <option value="">Mês</option>
            {Array.from({ length: 12 }, (_, i) => i).map((month) => (
          <option key={month} value={month}>
            {dayjs().locale('pt-br').month(month).format('MMMM')}
          </option>
            ))}
          </select>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto transition-transform font-semibold"
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
          <div className="flex flex-col gap-1 text-right w-full md:w-auto mt-2 md:mt-0">
        <span className="text-sm text-gray-400">Última atualização:</span>
        <span className="text-md text-purple-700 font-semibold">{dayjs().format('DD/MM/YYYY HH:mm')}</span>
          </div>
        </section>

        {/* Indicadores */}
        <section className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
        {
          title: "Total de Notas Emitidas",
          value: filteredInvoices.length,
          icon: (
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2V7a2 2 0 00-2-2h-1V3H9v2H8a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          color: "from-blue-100 to-blue-50"
        },
        {
          title: "Valor Total das Notas",
          value: `${invoicePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          icon: (
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
          ),
          color: "from-green-100 to-green-50"
        },
        {
          title: "Notas Canceladas",
          value: invoicePricecancel.length,
          icon: (
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          color: "from-red-100 to-red-50"
        },
        {
          title: "Clientes Ativos",
          value: users.filter((user) => user.status === 'active').length,
          icon: (
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
          color: "from-purple-100 to-purple-50"
        },
        {
          title: "Assinaturas Canceladas",
          value: subscriptions.filter((sub) => sub.status === 'canceled').length,
          icon: (
            <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2z" />
            </svg>
          ),
          color: "from-pink-100 to-pink-50"
        },
        {
          title: "Assinaturas em Atraso",
          value: subscriptions.filter((sub) => sub.status === 'suspended').length,
          icon: (
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: "from-yellow-100 to-yellow-50"
        },
        {
          title: "Receita Total de Assinaturas",
          value: `${(((plans?.items[0].pricing_scheme.price || 0) / 100) * users.filter((user) => user.status === 'active').length).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}`,
          icon: (
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            </svg>
          ),
          color: "from-green-100 to-green-50"
        },
        {
          title: "Clientes Inativos",
          value: users.filter((user) => user.status === 'inactive').length,
          icon: (
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
          color: "from-gray-100 to-gray-50"
        },
        {
          title: "Quantidade de Planos",
          value: plans ? plans.items.length : 0,
          icon: (
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 7v4a1 1 0 001 1h3v2a1 1 0 001 1h4a1 1 0 001-1v-2h3a1 1 0 001-1V7a1 1 0 00-1 1H4a1 1 0 00-1 1z" />
            </svg>
          ),
          color: "from-indigo-100 to-indigo-50"
        },
          ].map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.color} p-4 sm:p-6 rounded-2xl shadow-md flex flex-col gap-2 hover:scale-[1.03] transition-transform border border-purple-100`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-2 shadow">{card.icon}</div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-700">{card.title}</h2>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
        </div>
          ))}
        </section>

      </div>
    </>
  );
}
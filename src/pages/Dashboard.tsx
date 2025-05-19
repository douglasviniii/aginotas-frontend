import { useEffect, useState } from 'react';
import { BarChart3, Users, Receipt, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { saveAs } from 'file-saver';
//import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
//import fs from 'fs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired } from '../utils/auth';
import Cookies from "js-cookie";


dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(timezone);
dayjs.extend(utc);


interface Nota {
  customer: {
  _id: string;
  name: string;
  user: string;
  razaoSocial: string;
},
  valor: number;
  status: string;
  date: string;
}

export function Dashboard() {

  const [customer, setCustomer] = useState([]);
  const [customeractive, setCustomerActive] = useState([]);
  const [invoice, setInvoice] = useState<Nota[]>([]);
  const [dayInvoicetoday, setDayInvoiceToday] = useState(0);
  const [dayInvoicelast7days, setDayInvoiceLast7Days] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filteredInvoices, setFilteredInvoices] = useState<Nota[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const navigate = useNavigate();

  const processarNotasParaGrafico = (notas: Nota[]) => {
    const hoje = dayjs().tz('America/Sao_Paulo').startOf('day'); 
    const umMesAtras = hoje.subtract(1, 'month').startOf('day');
  
    const diasDoMes = Array.from({ length: hoje.diff(umMesAtras, 'day') + 1 }, (_, i) => 
      umMesAtras.add(i, 'day').format('DD/MM')
    );
  
    const contagemPorDia: Record<string, number> = diasDoMes.reduce((acc, dia) => {
      acc[dia] = 0;
      return acc;
    }, {} as Record<string, number>);
  
    notas.forEach((nota) => {
      const dataNota = dayjs(nota.date).tz('America/Sao_Paulo').startOf('day');
      
      if (dataNota.isValid() && dataNota.isBetween(umMesAtras, hoje, 'day', '[]')) {
        const diaFormatado = dataNota.format('DD/MM');
        contagemPorDia[diaFormatado]++;
      }
    });
  
    return Object.keys(contagemPorDia).map((dia) => ({
      name: dia,
      notas: contagemPorDia[dia],
    }));
  };

  const getNotasPorPeriodo = (notas: Nota[]) => {
    const hoje = dayjs().tz('America/Sao_Paulo').startOf('day');
    const seteDiasAtras = hoje.subtract(7, 'day').startOf('day');
    const trintaDiasAtras = hoje.subtract(30, 'day').startOf('day');
  
    const notasHoje = notas.filter((nota) => { 
      const dataNota = dayjs(nota.date).tz('America/Sao_Paulo').startOf('day'); 
      return dataNota.isSame(hoje, 'day');
    });
  
    const notasUltimos7Dias = notas.filter((nota) => {
      const dataNota = dayjs(nota.date).tz('America/Sao_Paulo').startOf('day');
      return dataNota.isBetween(seteDiasAtras, hoje, 'day', '[]');
    });

    const notasUltimos30Dias = notas.filter((nota) => {
      const dataNota = dayjs(nota.date).tz('America/Sao_Paulo').startOf('day');
      return dataNota.isBetween(trintaDiasAtras, hoje, 'day', '[]');
    });

    return {
      notasHoje,
      notasUltimos7Dias,
      notasUltimos30Dias,
    };
  };
  
  function somarValoresNotas(notas: Nota[]): number {
    return notas.reduce((acumulador, nota) => {
      if (nota.status.toLowerCase() === 'emitida' || nota.status.toLowerCase() === 'substituida') {
        const valor = Number(nota.valor) || 0;
        return acumulador + valor;
      }
      return acumulador;
    }, 0);
  }

  const data = processarNotasParaGrafico(filteredInvoices);
  const days = getNotasPorPeriodo(filteredInvoices);
  const valorAreceber = somarValoresNotas(days.notasUltimos30Dias);

  const load_data = async () => {
    setLoading(true);
    const datainvoices = await api.find_invoices();
    setInvoice(datainvoices);
    const datacustomers = await api.find_customers_user();
    setCustomer(datacustomers);
    const datacustomeractive = await api.find_customers_actives();
    setCustomerActive(datacustomeractive);
    setLoading(false);
  };

  function downloadCustomerXml(customer: any) {
    const blob = new Blob([customer.xml], { type: 'application/xml' });
    const fileName = `${customer.data.Rps.Servico.Discriminacao}_nota.xml`;
    saveAs(blob, fileName);
  }

  async function criarNotaFiscalPDF (item: any) {
      try {
        setLoading(true);
        await api.Export_Invoice_PDF(item);
        setLoading(false);
        toast.success("PDF gerado com sucesso!");
      } catch (error) {
        toast.error("Ocorreu um erro ao gerar o PDF");
        return;
      }
  }

  useEffect(()=>{
    setDayInvoiceToday(days.notasHoje.length);
    setDayInvoiceLast7Days(days.notasUltimos7Dias.length);
  },[days])

  useEffect(() => {
    const currentYear = dayjs().year().toString();
    const currentMonth = dayjs().month().toString(); // month() retorna 0-11

    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);

    const selectedDate = dayjs(`${currentYear}-${String(Number(currentMonth) + 1).padStart(2, '0')}-01`);
    const filtered = invoice.filter((nota) => {
      const notaDate = dayjs(nota.date);
      return notaDate.isSame(selectedDate, 'month');
    });
    setFilteredInvoices(filtered);
  }, [invoice]);

  useEffect(() => {
    const userToken = Cookies.get('token');
    const adminToken = Cookies.get('admin_token');

    const token = userToken || adminToken;

    if (!token || isTokenExpired(token)) {
      Cookies.remove('token');
      Cookies.remove('admin_token');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    load_data(); 
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6 tracking-tight">Painel de Controle</h1> */}

      {/* Filtro por Ano e Mês */}
      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Filtrar Notas por Ano e Mês</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <select
            className="border border-gray-300 rounded-lg p-2 w-full sm:w-auto focus:ring-2 focus:ring-blue-400 transition"
            value={selectedYear}
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
            className="border border-gray-300 rounded-lg p-2 w-full sm:w-auto focus:ring-2 focus:ring-blue-400 transition"
            value={selectedMonth}
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
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition w-full sm:w-auto"
            onClick={() => {
              if (selectedYear && selectedMonth) {           
                const selectedDate = dayjs(`${selectedYear}-${String(Number(selectedMonth) + 1).padStart(2, '0')}-01`);
                const filtered = invoice.filter((nota) => {
                  const notaDate = dayjs(nota.date);
                  return notaDate.isSame(selectedDate, 'month');
                });        
                setFilteredInvoices(filtered);
              } else {
                toast.error("Por favor, selecione o ano e o mês.");
              }
            }}
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow flex items-center gap-4">
          <div className="p-3 bg-blue-200 rounded-full">
            <Receipt className="w-7 h-7 text-blue-700" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Notas Hoje</p>
            <p className="text-2xl font-extrabold text-gray-900">{dayInvoicetoday}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow flex items-center gap-4">
          <div className="p-3 bg-green-200 rounded-full">
            <BarChart3 className="w-7 h-7 text-green-700" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Últimos 7 dias</p>
            <p className="text-2xl font-extrabold text-gray-900">{dayInvoicelast7days}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl shadow flex items-center gap-4">
          <div className="p-3 bg-purple-200 rounded-full">
            <Users className="w-7 h-7 text-purple-700" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Clientes Ativos</p>
            <p className="text-2xl font-extrabold text-gray-900">{customeractive.length}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl shadow flex items-center gap-4">
          <div className="p-3 bg-yellow-200 rounded-full">
            <TrendingUp className="w-7 h-7 text-yellow-700" />
          </div>
          <div>
            <p className="text-xs text-gray-600">Previsão Mensal</p>
            <p className="text-2xl font-extrabold text-gray-900">
              {valorAreceber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      {filteredInvoices.length > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Notas Emitidas - Últimos 30 dias</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="notas" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Status de Emails */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Status de Envio de Notas</h2>
        {/* Mobile Version */}
        <div className="block md:hidden">
          <div className="space-y-4">
        {filteredInvoices.length === 0 && (
          <div className="py-6 text-center text-gray-400">
            Nenhuma nota encontrada para o período selecionado.
          </div>
        )}
        {filteredInvoices.map((item) => (
          <div
            key={item.customer._id}
            className="border rounded-xl p-4 flex flex-col gap-2 shadow-sm"
          >
            <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              item.status.toLowerCase() === 'emitida'
            ? 'bg-green-100 text-green-700'
            : item.status.toLowerCase() === 'substituida'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-red-100 text-red-700'
            }`}
          >
            {item.status.toLowerCase() === 'emitida'
              ? '✓'
              : item.status.toLowerCase() === 'substituida'
              ? '↺'
              : '!'}{' '}
            {item.status}
          </span>
          <span className="ml-auto text-xs text-gray-500">
            {dayjs(item.date).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm')}
          </span>
            </div>
            <div className="text-gray-700 font-medium">
          {item.customer.name || item.customer.razaoSocial || ''}
            </div>
            <div className="flex gap-4 mt-2">
          <button
            onClick={() => downloadCustomerXml(item)}
            className="text-blue-600 hover:underline hover:text-blue-800 transition text-xs"
          >
            Baixar XML
          </button>
          <button
            onClick={() => criarNotaFiscalPDF(item)}
            className="text-blue-600 hover:underline hover:text-blue-800 transition text-xs"
          >
            Baixar PDF
          </button>
            </div>
          </div>
        ))}
          </div>
        </div>
        {/* Desktop Version */}
        <div className="overflow-x-auto hidden md:block">
          <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
          <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
          <th className="text-left py-3 px-4 font-semibold text-gray-600">Cliente</th>
          <th className="text-left py-3 px-4 font-semibold text-gray-600">Data/Hora</th>
          <th className="text-left py-3 px-4 font-semibold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((item) => (
          <tr key={item.customer._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
            <td className="py-3 px-4">
              <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              item.status.toLowerCase() === 'emitida'
                ? 'bg-green-100 text-green-700'
                : item.status.toLowerCase() === 'substituida'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-red-100 text-red-700'
            }`}
              >
            {item.status.toLowerCase() === 'emitida'
              ? '✓'
              : item.status.toLowerCase() === 'substituida'
              ? '↺'
              : '!'}{' '}
            {item.status}
              </span>
            </td>
            <td className="py-3 px-4 text-gray-700">
              {item.customer.name || item.customer.razaoSocial || ''}
            </td>
            <td className="py-3 px-4 text-gray-500">
              {dayjs(item.date).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm')}
            </td>
            <td className="py-3 px-4">
              <div className="flex gap-2">
            <button
              onClick={() => downloadCustomerXml(item)}
              className="text-blue-600 hover:underline hover:text-blue-800 transition"
            >
              Baixar XML
            </button>
            <button
              onClick={() => criarNotaFiscalPDF(item)}
              className="text-blue-600 hover:underline hover:text-blue-800 transition"
            >
              Baixar PDF
            </button>
              </div>
            </td>
          </tr>
            ))}
            {filteredInvoices.length === 0 && (
          <tr>
            <td colSpan={4} className="py-6 text-center text-gray-400">
              Nenhuma nota encontrada para o período selecionado.
            </td>
          </tr>
            )}
          </tbody>
        </table>
          </div>
        </div>
      </div>
    </div>
  );
}



/*   useEffect(() => {
  }, [customer,invoice,customeractive]); */


/*   const processarNotasParaGrafico = (notas: Nota[]) => {
    const hoje = dayjs().tz('America/Sao_Paulo').startOf('day'); 
    console.log(hoje);
    console.log(filteredInvoices);
    const seteDiasAtras = hoje.subtract(7, 'day').startOf('day');
  
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  
    const contagemPorDia: Record<string, number> = {
      Dom: 0, Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0, Sab: 0
    };
  
    notas.forEach((nota) => {
      const dataNota = dayjs(nota.date).tz('America/Sao_Paulo');
      
      if (dataNota.isValid() && dataNota.isBetween(seteDiasAtras, hoje, 'day', '[]')) {
        const indiceDia = dataNota.day(); 
        const nomeDia = diasSemana[indiceDia]; 
        contagemPorDia[nomeDia]++;
      }
    });
  
    return Object.keys(contagemPorDia).map((dia) => ({
      name: dia,
      notas: contagemPorDia[dia],
    }));
  }; */

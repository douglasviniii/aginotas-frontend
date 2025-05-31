import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../lib/api";
import { toast } from 'sonner';
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../utils/auth";
import Cookies from "js-cookie";

export function Financial() {
  const [view, setView] = useState("dashboard");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [value, setValue] = useState();
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState("immediate");
  const [installments, setInstallments] = useState(1);
  const [startDate, setStartDate] = useState("");
  
  type Customer = {
    _id: string;
    name?: string;
    razaoSocial?: string;
    // Add other customer fields as needed
  };

  type PaymentHistoryItem = {
    date: string;
    status: string;
  };

  type Receivable = {
    _id: string;
    customer: Customer;
    value: number;
    dueDate: string;
    status: string;
    typeofcharge: string;
    description?: string;
    isDesactivated?: boolean;
    paymentHistory?: PaymentHistoryItem[];
    // Add other receivable fields as needed
  };

  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [agrupado, setAgrupado] = useState({});
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const navigate = useNavigate();

  const toggleDetails = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  const [activeTab, setActiveTab] = useState("Vencimento Hoje");

  const [searchTerm, setSearchTerm] = useState('');

  const statusMap = {
    "Atrasado": "Atrasado",
    "Vencimento Hoje": "A Receber",
    //"A Receber": "A Receber",
    "Parcelado": "Parcelado",
    "Recorrente": "Recorrente",
    "Pago": "Pago",
  };

  const filteredReceivables = receivables
    .filter((r) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [day, month, year] = r.dueDate.split('/');
      const dueDate = new Date(`${year}-${month}-${day}`);
      dueDate.setHours(0, 0, 0, 0);

      const status = r.status;

      const isDueBeforeToday = dueDate < today;
      const isDueLastToday = dueDate > today;
      const isDueToday = dueDate.getTime() === today.getTime();
      const isNotPaid = status !== "Pago";

      switch (activeTab) {
        case "Atrasado":
          return isDueBeforeToday && isNotPaid;
        case "Vencimento Hoje":
          return isDueToday;
        case "A Receber":
          return isDueLastToday && isNotPaid && status === "A Receber";
        case "Pago":
          return status === "Pago";
        case "Parcelado":
          return (
            status === "Parcelado" &&
            !isDueToday &&
            !isDueBeforeToday
          );
        case "Recorrente":
          return (
            status === "Recorrente" &&
            !isDueToday &&
            !isDueBeforeToday
          );
        default:
          return false;
      }
    })
    .filter((r) =>
      (r.customer?.name || r.customer?.razaoSocial || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleCreateReceivable = async () => {
    if (!value){return;};
    if (!selectedCustomer || value <= 0 || !startDate) return;

    //const entries = [];
  const baseDate = new Date(startDate);
  setLoading(true);
      if (paymentType === "immediate") {
        await api.Create_Receive({
            customer: selectedCustomer,
            description:description,
            value: parseFloat(value),
            dueDate: startDate,
            status: "A Receber",
            typeofcharge: "Receber Agora",
      })       
    } else if (paymentType === "installment") {
      for (let i = 0; i < installments; i++) {
        const due = new Date(baseDate);
        due.setMonth(due.getMonth() + i);
        await api.Create_Receive({
          customer: selectedCustomer,
          description:description,
          value: parseFloat((value / installments).toFixed(0)),
          dueDate: due.toISOString().split("T")[0],
          status: "Parcelado",
          typeofcharge: "Parcelado",
        })
      }
    } else if (paymentType === "recurring") {
          const due = new Date(baseDate);  
          await api.Create_Receive({
            customer: selectedCustomer,
            description:description,
            value: parseFloat(value),
            dueDate: due.toISOString().split("T")[0],
            status: "Recorrente",
            typeofcharge: "Recorrente",
          })
    } else if (paymentType === "paid") {
      await api.Create_Receive({
          customer: selectedCustomer,
          description:description,
          value: parseFloat(value),
          dueDate: startDate,
          status: "Pago",
          typeofcharge: "Pago",
      })
    }

    Data();
    setLoading(false);
    resetForm();
    setView("receipts");
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setPaymentType("immediate");
    setInstallments(1);
    setStartDate("");
  };

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const filteredReceivables2 = receivables.filter((r) => {
    const date = new Date(r.dueDate);
    return (
      date.getMonth() === selectedMonth &&
      date.getFullYear() === selectedYear
    );
  });

  const chartData = [
    {
      name: "Pago",
      total: filteredReceivables2.filter((r) => r.status === "Pago").reduce((sum, r) => sum + r.value, 0),
    },
    {
      name: "Recorrente",
      total: filteredReceivables2.filter((r) => r.typeofcharge === "Recorrente").reduce((sum, r) => sum + r.value, 0),
    },
    {
      name: "Parcelamentos",
      total: filteredReceivables2.filter((r) => r.typeofcharge === "Parcelado").reduce((sum, r) => sum + r.value, 0),
    },
    {
      name: "Em atraso",
      total: filteredReceivables2
        .filter((r) => {
          const dueDate = new Date(r.dueDate);
          const today = new Date();
          dueDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          return new Date(dueDate) < new Date(today) && r.status !== "Pago";
        })
        .reduce((sum, r) => sum + Number(r.value), 0),
    }
  ];

  const handleMarkAsPaid = async (id: string) => {
    try {
      setLoading(true);
      const status = 'Pago';
      await api.Update_Receive(id , status);
      toast.success('Operação realizada com sucesso!');
      Data();
      setLoading(false);
    } catch (error) {
      toast.error('Erro ao realizar operação');
      return;
    }
  }

  const handleLastMonthPaid = async (id: string) => {
    try {
      setLoading(true);
      await api.LastMonthPaid(id);
      toast.success('Operação realizada com sucesso!');
      Data();
      setLoading(false);
    } catch (error) {
      toast.error('Erro ao realizar operação');
      return;
    }
  }

  const handleDesactivated = async (id: string, value: boolean) => {
    try {
      setLoading(true);

      await api.Update_IsDesactivated(id, !value);
      toast.success('Operação realizada com sucesso!');
      Data();
      setLoading(false);
    } catch (error) {
      toast.error('Erro ao realizar operação');
      return;
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await api.Delete_Receive(id);
      toast.success('Operação realizada com sucesso!');
      Data();
      setLoading(false);
    } catch (error) {
      toast.error('Erro ao realizar operação');
      return;
    }
  }

  function agruparPorStatus(faturas: any[]) {
    const resultado: any = {
      Pago: [],
      Recorrente: [],
      Parcelado: [],
      'A Receber': [],
      'Em Atraso': [],
      Outros: []
    };
  
    const hoje = new Date();
  
    for (const fatura of faturas) {
      const status = fatura.status;
      const dueDate = new Date(fatura.dueDate);
  
      if (status === 'Pago') {
        resultado.Pago.push(fatura);
      } else if (status === 'Recorrente') {
        resultado.Recorrente.push(fatura);
      } else if (status === 'Parcelado') {
        resultado.Parcelado.push(fatura);
      } else if (status === 'A Receber') {
        resultado['A Receber'].push(fatura);
      } else if (dueDate < hoje && status !== 'Pago') {
        resultado['Em Atraso'].push(fatura);
      } else {
        resultado.Outros.push(fatura);
      }
    }
  
    return resultado;
  }

  const loadReportForMonth = async (month: number) => {
    setSelectedMonth(month);
    await new Promise((resolve) => setTimeout(resolve, 500)); 
  };

  const handleExportPDF = async () => {
    setLoading(true);
    const element = reportRef.current;
    if (!element) return;
  
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");
  
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const imgWidth = pdfWidth - 2 * margin;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  
    pdf.setFontSize(16);
    pdf.text(`Relatório Financeiro - Mês ${selectedMonth} - ${new Date().getFullYear()}`, margin, 20);
    pdf.addImage(imgData, "PNG", margin, 30, imgWidth, imgHeight);
    pdf.save(`relatorio-${selectedMonth}.pdf`);
    setLoading(false);
  };

  const handleExportYearPDF = async () => {
    const element = reportRef.current;
    if (!element) return;
  
    const pdf = new jsPDF("p", "mm", "a4");
    const year = selectedYear;
    const margin = 10;
  
    for (let month = 1; month <= 12; month++) {
      // Atualiza os dados para o mês atual
      await loadReportForMonth(month); // <-- Essa função você precisa ter implementada
  
      // Espera a atualização do DOM (caso precise)
      await new Promise((resolve) => setTimeout(resolve, 500)); // ajusta o tempo se necessário
  
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
  
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 2 * margin;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  
      if (month !== 1) pdf.addPage(); // só adiciona nova página depois da primeira
  
      pdf.setFontSize(16);
      pdf.text(`Relatório Financeiro - Mês ${month} - ${year}`, margin, 20);
      pdf.addImage(imgData, "PNG", margin, 30, imgWidth, imgHeight);
    }
    pdf.save(`relatorio-anual-${year}.pdf`);
  };

  async function Data() {
    setLoading(true);
    const clientes = await api.find_customers_user();
    const Receipts = await api.Find_Receipts();

    const userData = localStorage.getItem('user');
    let userInfo = null;
    if (userData) {
      try {
      userInfo = JSON.parse(userData);
      const subscription = await api.find_subscription(userInfo.subscription_id);
      if (subscription.status !== "active" && subscription.status !== "future") {
        setIsValid(true);
      }
      if (subscription.current_cycle.status !== "billed") {
        setIsValid(true);
      }
      } catch (e) {
        userInfo = JSON.parse(userData);
        if(userInfo.email === "contato@delvind.com" || userInfo.email === "escritorio@delfoscontabilidade.com"){
          setIsValid(false);
        }else{
          setIsValid(true);
        }
      }
    }

    setReceivables(Receipts);
    setAgrupado(agruparPorStatus(Receipts));
    setCustomers(clientes);   
    setLoading(false);
  }

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
    Data();
  }, []);

  function printReceipt(receivable: any) {
    if (!receivable) return;

    function formatCNPJ(cnpj: string) {
      if (!cnpj) return "";
      return cnpj
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
    }

    const companyInfoFromStorage = localStorage.getItem("user");
    
    let companyInfo = {
      name: " ",
      cnpj: " ",
      email: " ",
      picture: " ",
      cidade: "",
      estado: "",
    };

    if (companyInfoFromStorage) {
      try {
        const parsed = JSON.parse(companyInfoFromStorage);
        companyInfo = {
          ...companyInfo,
          ...parsed,
        };
      } catch (e) {
      }
    }

    const doc = new jsPDF();

    if (companyInfo.picture) {
      try {
        doc.addImage(companyInfo.picture, "PNG", 15, 10, 30, 30);
      } catch (e) {
      }
    }

    doc.setFontSize(14);
    doc.text(companyInfo.name, 50, 18);
    doc.setFontSize(10);

    doc.text(`CNPJ: ${formatCNPJ(companyInfo.cnpj)}`, 50, 24);
    //doc.text(companyInfo.address, 50, 30);
    doc.text(`Email: ${companyInfo.email}`, 50, 30);
    doc.text(`Localidade: ${companyInfo.cidade + '-' +companyInfo.estado}`, 50, 36);

    // Título do recibo
    doc.setFontSize(18);
    doc.text("Recibo de Pagamento", 105, 50, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Data de emissão: ${new Date().toLocaleDateString("pt-BR")}`, 15, 60);

    // Corpo do recibo
    doc.setFontSize(14);
    doc.text(
      `Recebemos de: ${receivable.customer?.name || receivable.customer?.razaoSocial || "Cliente"}`,
      15,
      75
    );
    doc.text(
      `Valor: R$ ${Number(receivable.value).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      15,
      85
    );
    doc.text(`Data do pagamento: ${receivable.dueDate}`, 15, 95);

    if (receivable.description) {
      doc.text(`Descrição: ${receivable.description}`, 15, 105);
    }

    doc.text(
      "Assinatura: ___________________________________________",
      15,
      130
    );

    doc.save(
      `recibo-${receivable.customer?.name || receivable.customer?.razaoSocial || "cliente"}-${receivable.dueDate}.pdf`
    );
  }

  if (loading) return <div>Carregando...</div>;
  if (isValid) return <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded mb-4 text-center font-semibold">
    Atenção: sua assinatura está em atraso. Regularize para continuar utilizando todos os recursos.
  </div>;


  return (
    <div className="max-w-6xl mx-auto p-6">

    <div className="mb-6">
      {/* Versão Desktop - sempre visível */}
      <div className="hidden md:flex gap-4">
        <button
          onClick={() => setView("dashboard")}
          className={`px-4 py-2 rounded font-medium ${
            view === "dashboard" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setView("payments")}
          className={`px-4 py-2 rounded font-medium ${
            view === "payments" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Pagamentos
        </button>
        <button
          onClick={() => setView("receipts")}
          className={`px-4 py-2 rounded font-medium ${
            view === "receipts" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Recebimentos
        </button>
      </div>

      {/* Versão Mobile - menu dropdown */}
      <div className="md:hidden">
        {/* Botão do menu */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full px-4 py-2 rounded font-medium bg-gray-200 text-gray-700 flex justify-between items-center"
        >
          {view === "dashboard" && "Dashboard"}
          {view === "payments" && "Pagamentos"}
          {view === "receipts" && "Recebimentos"}
          <svg
            className={`w-5 h-5 ml-2 transition-transform ${
              isMobileMenuOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Itens do menu (aparecem quando o menu está aberto) */}
        {isMobileMenuOpen && (
          <div className="mt-2 space-y-2">
            <button
              onClick={() => {
                setView("dashboard");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-2 rounded font-medium text-left ${
                view === "dashboard" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setView("payments");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-2 rounded font-medium text-left ${
                view === "payments" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Pagamentos
            </button>
            <button
              onClick={() => {
                setView("receipts");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-2 rounded font-medium text-left ${
                view === "receipts" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Recebimentos
            </button>
          </div>
        )}
      </div>
    </div>  

    <div className="flex flex-col md:flex-row justify-end mb-4 gap-4 md:items-center">
    <div className="flex flex-col md:flex-row gap-4">
      <button
        onClick={() => handleExportYearPDF()}
        className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg"
      >
        Exportar PDF ANUAL
      </button>
      <button
        onClick={() => handleExportPDF()}
        className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg"
      >
        Exportar PDF MENSAL
      </button>
    </div>
    
    <div className="flex flex-col md:flex-row gap-4">
      {/* Select de mês */}
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        className="px-3 py-2 rounded border border-gray-300"
      >
        {[
          "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ].map((month, index) => (
          <option key={index} value={index}>
            {month}
          </option>
        ))}
      </select>

      {/* Select de ano */}
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        className="px-3 py-2 rounded border border-gray-300"
      >
        {Array.from({ length: 10 }, (_, i) => {
          const year = new Date().getFullYear() - i;
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
      </select>
    </div>
    </div>

    {view === "dashboard" && (
      <div
        ref={reportRef}
        className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-4 md:p-8 space-y-8 border border-blue-100"
      >
        <h2 className="text-xl md:text-2xl font-extrabold text-blue-800 flex flex-wrap items-center gap-2 break-words">
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
          <span className="break-words">Visão Geral Financeira</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 md:p-5 rounded-xl shadow flex flex-col items-center border border-blue-100 hover:shadow-lg transition min-w-0">
        <span className="text-xs text-gray-500 mb-1 text-center break-words">Total Pago R$</span>
        <span className="text-xl md:text-2xl font-bold text-green-600 break-words text-center">
          {chartData[0].total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <svg className="w-6 h-6 mt-2 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
          </div>
          <div className="bg-white p-4 md:p-5 rounded-xl shadow flex flex-col items-center border border-blue-100 hover:shadow-lg transition min-w-0">
        <span className="text-xs text-gray-500 mb-1 text-center break-words">Recorrente R$</span>
        <span className="text-xl md:text-2xl font-bold text-blue-600 break-words text-center">
          {chartData[1].total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <svg className="w-6 h-6 mt-2 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        </svg>
          </div>
          <div className="bg-white p-4 md:p-5 rounded-xl shadow flex flex-col items-center border border-blue-100 hover:shadow-lg transition min-w-0">
        <span className="text-xs text-gray-500 mb-1 text-center break-words">Em atraso R$</span>
        <span className="text-xl md:text-2xl font-bold text-red-600 break-words text-center">
          {chartData[3].total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <svg className="w-6 h-6 mt-2 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
          </div>
          <div className="bg-white p-4 md:p-5 rounded-xl shadow flex flex-col items-center border border-blue-100 hover:shadow-lg transition min-w-0">
        <span className="text-xs text-gray-500 mb-1 text-center break-words">Clientes</span>
        <span className="text-xl md:text-2xl font-bold text-blue-800 break-words text-center">{customers.length}</span>
        <svg className="w-6 h-6 mt-2 text-blue-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
          </div>
          <div className="bg-white p-4 md:p-5 rounded-xl shadow flex flex-col items-center border border-blue-100 hover:shadow-lg transition min-w-0">
        <span className="text-xs text-gray-500 mb-1 text-center break-words">Parcelamentos R$</span>
        <span className="text-xl md:text-2xl font-bold text-yellow-600 break-words text-center">
          {chartData[2].total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <svg className="w-6 h-6 mt-2 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h8" />
        </svg>
          </div>
        </div>

        <div className="h-64 md:h-72 bg-white rounded-xl shadow border border-blue-100 flex items-center justify-center p-2 md:p-4">
          <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barCategoryGap={30}>
          <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#2563eb" }} />
          <YAxis tick={{ fontSize: 13, fill: "#2563eb" }} />
          <Tooltip
            contentStyle={{ background: "#f1f5f9", borderRadius: 8, border: "1px solid #3b82f6" }}
            labelStyle={{ color: "#1e293b", fontWeight: "bold" }}
            cursor={{ fill: "#dbeafe", opacity: 0.3 }}
            formatter={(value: number) =>
          `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
            }
          />
          <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )}

    {view === "payments" && (
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center">Novo Recebimento</h2>
        <div className="space-y-4">
          <select
        required
        value={selectedCustomer?._id || ""}
        onChange={e => {
          const id = e.target.value;
          const customer = customers.find((c) => c._id === id);
          setSelectedCustomer(customer);
        }}
        className="w-full border border-blue-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 transition"
          >
        <option value="">Selecione o cliente</option>
        {customers.map((customer) => (
          <option key={customer._id} value={customer._id}>
            {customer.name || customer.razaoSocial}
          </option>
        ))}
          </select>
          <input
            type="number"
            value={value}
            placeholder="Ex: 1600,90"
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full border border-blue-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 transition"
            required
            min={0}
          />
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full border border-blue-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 transition"
            required
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border border-blue-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Descrição (opcional)"
            rows={2}
          />
          <div className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={() => setPaymentType("installment")}
          className={`px-3 py-2 rounded font-medium transition ${
            paymentType === "installment"
          ? "bg-blue-600 text-white"
          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          Parcelado
        </button>
        <button
          type="button"
          onClick={() => setPaymentType("recurring")}
          className={`px-3 py-2 rounded font-medium transition ${
            paymentType === "recurring"
          ? "bg-blue-600 text-white"
          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          Recorrente
        </button>
        <button
          type="button"
          onClick={() => setPaymentType("paid")}
          className={`px-3 py-2 rounded font-medium transition ${
            paymentType === "paid"
          ? "bg-blue-600 text-white"
          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          Valor Pago
        </button>
          </div>
          {paymentType === "installment" && (
        <input
          type="number"
          value={installments}
          onChange={e => setInstallments(Number(e.target.value))}
          min={1}
          className="w-full border border-blue-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 transition"
          placeholder="Qtd. Parcelas"
        />
          )}
        </div>
        <button
          onClick={handleCreateReceivable}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition text-lg"
        >
          Salvar
        </button>
      </div>
    )}

    {view === "receipts" && (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center">Recebimentos</h2>
        <div className="flex flex-col gap-3 md:gap-4 mb-4">
          <div className="flex flex-row flex-wrap w-full md:w-auto gap-2">
        {Object.keys(statusMap).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded font-medium transition text-sm md:text-base
          ${activeTab === tab
            ? "bg-blue-600 text-white shadow"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
            style={{ minWidth: 0, wordBreak: "break-word", flex: "1 1 45%", maxWidth: "100%" }}
          >
            <span className="whitespace-nowrap">{tab}</span>
          </button>
        ))}
          </div>
          <div className="w-full md:w-56 md:mx-auto">
        <input
          type="text"
          placeholder="Pesquisar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-blue-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 transition w-full"
        />
          </div>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredReceivables.length === 0 ? (
        <div className="text-gray-400 text-center py-12">
          <svg className="mx-auto mb-2 w-10 h-10 text-blue-200" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 018 0v2M12 7a4 4 0 110 8 4 4 0 010-8z" />
          </svg>
          Nenhum lançamento ainda.
        </div>
          ) : (
        filteredReceivables.map((r, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-4 shadow flex flex-col gap-2 border transition
          ${r.status === "Pago" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-100"}
            `}
          >
            <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-bold text-blue-800 truncate max-w-[180px]">{r.customer.name || r.customer.razaoSocial}</span>
            <span className="text-xs text-gray-500">{r.description}</span>
          </div>
          <span className="font-bold text-lg text-blue-700">
            R$ {Number(r.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
          {r.typeofcharge === "Recorrente" && r.isDesactivated === false ? (
            <button
              onClick={() => handleLastMonthPaid(r._id)}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Pago último mês
            </button>
          ) : (
            r.status !== "Pago" && r.typeofcharge !== "Recorrente" && (
              <button
            onClick={() => handleMarkAsPaid(r._id)}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
            Marcar como Pago
              </button>
            )
          )}
          {r.typeofcharge === "Recorrente" && (
            <button
              onClick={() => handleDesactivated(r._id, r.isDesactivated)}
              className={`px-3 py-1 text-xs rounded transition
            ${r.isDesactivated ? "bg-orange-300 text-orange-900" : "bg-orange-600 text-white hover:bg-orange-700"}
              `}
            >
              {r.isDesactivated ? "Ativar" : "Desativar"}
            </button>
          )}
          <button
            onClick={() => handleDelete(r._id)}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Excluir
          </button>
          {(r.typeofcharge === "Pago" || r.typeofcharge === "Receber Agora" || (r.typeofcharge === "Parcelado" && r.status === "Pago")) && (
            <button
              onClick={() => printReceipt(r)}
              className="px-3 py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-800 transition"
            >
              Baixar Recibo
            </button>
          )}
          <button
            onClick={() => toggleDetails(idx)}
            className="ml-auto px-2 py-1 text-xs text-blue-600 underline hover:text-blue-800 transition"
          >
            {expandedIndex === idx ? "Ocultar detalhes" : "Ver detalhes"}
          </button>
            </div>
            {expandedIndex === idx && (
          <div className="mt-2 bg-blue-50 rounded p-3 text-sm text-blue-900 space-y-1 border border-blue-100">
            <div>
              <strong>Valor:</strong> R$ {Number(r.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            {r.typeofcharge === "Recorrente" ? (
              <div>
            <strong>Dia:</strong> {new Date(r.dueDate).getUTCDate()}
              </div>
            ) : (
              <div>
            <strong>Vencimento:</strong> {r.dueDate}
              </div>
            )}
            <div>
              <strong>Status:</strong> {r.status}
            </div>
            <div>
              <strong>Tipo:</strong> {r.typeofcharge}
            </div>
            {r.typeofcharge === "Recorrente" && (
              <>
            <div>
              <strong>Situação:</strong> {r.isDesactivated ? "Desativado" : "Ativo"}
            </div>
            <div>
              <strong>Pagamentos:</strong> {r.paymentHistory?.filter(p => p.status === "Pago").length} de {r.paymentHistory?.length} pagos
            </div>
            <div>
              <strong>Total pago:</strong> R$ {(r.paymentHistory?.filter(p => p.status === "Pago").length * r.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <div className="max-h-24 overflow-y-auto border border-blue-100 rounded p-2 bg-white mt-2">
              {r.paymentHistory?.length > 0 ? (
                r.paymentHistory.map((item, index) => (
              <div key={index} className="flex justify-between text-xs py-0.5">
                <span>
                  <strong>Data:</strong> {new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </span>
                <span>
                  <strong>Status:</strong> {item.status}
                </span>
                {item.status === "Pago" && (
                  <button
                    onClick={() => printReceipt({ ...r, dueDate: item.date })}
                    className="ml-2 px-2 py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-800 transition"
                  >
                    Baixar Recibo
                  </button>
                )}
              </div>
                ))
              ) : (
                <div className="text-gray-400">Nenhum histórico disponível.</div>
              )}
            </div>
              </>
            )}
          </div>
            )}
          </div>
        ))
          )}
        </div>
      </div>
    )}
    </div>
  )
}
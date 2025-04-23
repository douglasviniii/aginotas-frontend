import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../lib/api";
import { toast } from "sonner";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import TooltipButton from "../components/ToolTip";

export function Financial() {
  const [view, setView] = useState("dashboard");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [value, setValue] = useState();
  const [description, setDescription] = useState("");
  const [paymentType, setPaymentType] = useState("immediate"); // immediate, installment, recurring
  const [installments, setInstallments] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [receivables, setReceivables] = useState([]);
  const [agrupado, setAgrupado] = useState({});
  const [loading, setLoading] = useState(false);
  const reportRef = useRef();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const [recurrenceTime, setRecurrenceTime] = useState("");

  const toggleDetails = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  const [activeTab, setActiveTab] = useState("Vencimento Hoje");

  const [searchTerm, setSearchTerm] = useState("");

  const statusMap = {
    Atrasado: "Atrasado",
    "Vencimento Hoje": "A Receber",
    Parcelado: "Parcelado",
    Recorrente: "Recorrente",
    Pago: "Pago",
  };

  const filteredReceivables = receivables
    .filter((r) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [day, month, year] = r.dueDate.split("/");
      const dueDate = new Date(`${year}-${month}-${day}`);
      dueDate.setHours(0, 0, 0, 0);

      const status = r.status;

      const isDueBeforeToday = dueDate < today;
      const isDueToday = dueDate.getTime() === today.getTime();
      const isNotPaid = status !== "Pago";

      switch (activeTab) {
        case "Atrasado":
          return isDueBeforeToday && isNotPaid;
        case "Vencimento Hoje":
          return isDueToday;
        case "Pago":
          return status === "Pago";
        case "Parcelado":
          return status === "Parcelado" && !isDueToday && !isDueBeforeToday;
        case "Recorrente":
          return status === "Recorrente" && !isDueToday && !isDueBeforeToday;
        default:
          return false;
      }
    })
    .filter((r) =>
      (r.customer?.name || r.customer?.razaoSocial || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const handleCreateReceivable = async () => {
    if (!value) {
      return;
    }
    if (!selectedCustomer || value <= 0 || !startDate) return;

    //const entries = [];
    const baseDate = new Date(startDate);
    setLoading(true);
    if (paymentType === "immediate") {
      await api.Create_Receive({
        customer: selectedCustomer,
        description: description,
        value: parseFloat(value),
        dueDate: startDate,
        status: "A Receber",
      });
    } else if (paymentType === "installment") {
      for (let i = 0; i < installments; i++) {
        const due = new Date(baseDate);
        due.setMonth(due.getMonth() + i);
        await api.Create_Receive({
          customer: selectedCustomer,
          description: description,
          value: parseFloat((value / installments).toFixed(0)),
          dueDate: due.toISOString().split("T")[0],
          status: "Parcelado",
        });
      }
    } else if (paymentType === "recurring") {
      for (let i = 0; i < 12; i++) {
        const due = new Date(baseDate);
        due.setMonth(due.getMonth() + i);

        await api.Create_Receive({
          customer: selectedCustomer,
          description: description,
          value: parseFloat(value),
          dueDate: due.toISOString().split("T")[0],
          status: "Recorrente",
        });
      }
    } else if (paymentType === "paid") {
      await api.Create_Receive({
        customer: selectedCustomer,
        description: description,
        value: parseFloat(value),
        dueDate: startDate,
        status: "Pago",
      });
    }

    Data();
    setLoading(false);
    resetForm();
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
      date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
    );
  });

  const groupedByRazaoSocial = receivables.reduce((acc, item) => {
    const customer = item.customer;
    const razaoSocial =
      customer?.razaoSocial || customer?.name || "Razão Social Indisponível";

    if (!acc[razaoSocial]) {
      acc[razaoSocial] = [];
    }
    acc[razaoSocial].push(item);

    return acc;
  }, {});

  const toggleGroup = (razaoSocial) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [razaoSocial]: !prev[razaoSocial], // Toggle the current group's state
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const chartData = [
    {
      name: "A Receber",
      total: filteredReceivables2
        .filter((r) => r.status === "A Receber")
        .reduce((sum, r) => sum + r.value, 0),
    },
    {
      name: "Pago",
      total: filteredReceivables2
        .filter((r) => r.status === "Pago")
        .reduce((sum, r) => sum + r.value, 0),
    },
    {
      name: "Recorrente",
      total: filteredReceivables2
        .filter((r) => r.status === "Recorrente")
        .reduce((sum, r) => sum + r.value, 0),
    },
    {
      name: "Parcelamentos",
      total: filteredReceivables2
        .filter((r) => r.status === "Parcelado")
        .reduce((sum, r) => sum + r.value, 0),
    },
    {
      name: "Em atraso",
      total: (agrupado["Em Atraso"] || []).filter((r) => {
        const date = new Date(r.dueDate);
        return date.getMonth() === selectedMonth;
      }).length,
    },
  ];

  const handleMarkAsPaid = async (id: string) => {
    try {
      setLoading(true);
      const status = "Pago";
      await api.Update_Receive(id, status);
      toast.success("Operação realizada com sucesso!");
      Data();
      setLoading(false);
    } catch (error) {
      toast.error("Erro ao realizar operação");
      return;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await api.Delete_Receive(id);
      toast.success("Operação realizada com sucesso!");
      Data();
      setLoading(false);
    } catch (error) {
      toast.error("Erro ao realizar operação");
      return;
    }
  };

  function agruparPorStatus(faturas: any[]) {
    const resultado: any = {
      Pago: [],
      Recorrente: [],
      Parcelado: [],
      "A Receber": [],
      "Em Atraso": [],
      Outros: [],
    };

    const hoje = new Date();

    for (const fatura of faturas) {
      const status = fatura.status;
      const dueDate = new Date(fatura.dueDate);

      if (status === "Pago") {
        resultado.Pago.push(fatura);
      } else if (status === "Recorrente") {
        resultado.Recorrente.push(fatura);
      } else if (status === "Parcelado") {
        resultado.Parcelado.push(fatura);
      } else if (status === "A Receber") {
        resultado["A Receber"].push(fatura);
      } else if (dueDate < hoje && status !== "Pago") {
        resultado["Em Atraso"].push(fatura);
      } else {
        resultado.Outros.push(fatura);
      }
    }

    return resultado;
  }

  async function Data() {
    const clientes = await api.find_customers_user();
    const Receipts = await api.Find_Receipts();
    setReceivables(Receipts);
    setAgrupado(agruparPorStatus(Receipts));
    setCustomers(clientes);
  }

  const loadReportForMonth = async (month: number) => {
    setSelectedMonth(month);

    // Se o relatório depende de uma chamada async (como buscar dados), aguarde ela aqui
    // Por exemplo:
    // await fetchDataForMonth(month);

    // Depois aguarde um tempo pra garantir que o DOM se atualizou
    await new Promise((resolve) => setTimeout(resolve, 500)); // ajuste esse delay se necessário
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
    pdf.text(
      `Relatório Financeiro - Mês ${selectedMonth} - ${new Date().getFullYear()}`,
      margin,
      20
    );
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

  useEffect(() => {
    setLoading(true);
    Data();
    setLoading(false);
  }, []);

  function calcularTempoDeRecorrencia(
    creationDate: string,
    dueDate: string
  ): string {
    const start = new Date(creationDate);
    const end = new Date(dueDate);

    let months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    // Se o dia do mês da data de vencimento for maior ou igual ao da criação, soma +1 mês
    if (end.getDate() >= start.getDate()) {
      months += 1;
    }

    return `${months} ${months === 1 ? "mês" : "meses"}`;
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/*     <div className="flex gap-4 mb-6">
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
      >Recebimentos
      </button>
    
    </div> */}

      <div className="mb-6">
        {/* Versão Desktop - sempre visível */}
        <div className="hidden md:flex gap-4">
          <button
            onClick={() => setView("dashboard")}
            className={`px-4 py-2 rounded font-medium ${
              view === "dashboard"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView("payments")}
            className={`px-4 py-2 rounded font-medium ${
              view === "payments"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Recebimentos
          </button>
          <button
            onClick={() => setView("receipts")}
            className={`px-4 py-2 rounded font-medium ${
              view === "receipts"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Gerenciamentos
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
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
                  view === "dashboard"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
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
                  view === "payments"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Recebimentos
              </button>
              <button
                onClick={() => {
                  setView("receipts");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2 rounded font-medium text-left ${
                  view === "receipts"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Gerenciamentos
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
              "Janeiro",
              "Fevereiro",
              "Março",
              "Abril",
              "Maio",
              "Junho",
              "Julho",
              "Agosto",
              "Setembro",
              "Outubro",
              "Novembro",
              "Dezembro",
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
          className="bg-white rounded-lg shadow p-6 space-y-6"
        >
          <h2 className="text-xl font-bold">Visão Geral Financeira</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-100 p-4 rounded shadow">
              <p className="text-sm text-gray-600">Total a Receber</p>
              <p className="text-lg font-bold">
                R${" "}
                {chartData[0].total.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <p className="text-sm text-gray-600">Total Pago</p>
              <p className="text-lg font-bold">
                R$
                {chartData[1].total.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <p className="text-sm text-gray-600">Recorrente</p>
              <p className="text-lg font-bold">
                R$
                {chartData[2].total.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <p className="text-sm text-gray-600">Em atraso</p>
              <p className="text-lg font-bold">
                R$
                {chartData[4].total.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <p className="text-sm text-gray-600">Clientes</p>
              <p className="text-lg font-bold">{customers.length}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded shadow">
              <p className="text-sm text-gray-600">Parcelamentos</p>
              <p className="text-lg font-bold">
                R$
                {chartData[3].total.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {view === "payments" && (
        <div>
          <h2 className="text-xl font-bold mb-4">Fluxo Financeiro</h2>
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cliente
              </label>
              <select
                required
                value={selectedCustomer?._id || ""}
                onChange={(e) => {
                  const id = e.target.value;
                  const customer = customers.find((c) => c._id === id);
                  setSelectedCustomer(customer);
                }}
                className="w-full border mt-1 p-2 rounded"
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name || customer.razaoSocial}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  value={value}
                  placeholder="Ex: 1600,90"
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full border mt-1 p-2 rounded [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&]:[-moz-appearance:textfield]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border mt-1 p-2 rounded"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border mt-1 p-2 rounded"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tipo de Recebimento
              </label>
              <div className="flex flex-wrap gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="immediate"
                    checked={paymentType === "immediate"}
                    onChange={() => setPaymentType("immediate")}
                  />
                  Receber Agora
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="installment"
                    checked={paymentType === "installment"}
                    onChange={() => setPaymentType("installment")}
                  />
                  Parcelado/Agendado
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="recurring"
                    checked={paymentType === "recurring"}
                    onChange={() => setPaymentType("recurring")}
                  />
                  Recorrente
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="paid"
                    checked={paymentType === "paid"}
                    onChange={() => setPaymentType("paid")}
                  />
                  Valor pago
                </label>
              </div>
            </div>

            {paymentType === "installment" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantidade de Parcelas
                  <TooltipButton
                    tooltipText="Parcelar, acima de um pagamento 
                Agendamento, uma única vez com data pré-definida "
                  />
                </label>
                <input
                  type="number"
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  min={1}
                  className="w-full border mt-1 p-2 rounded"
                />
              </div>
            )}
            <button
              onClick={handleCreateReceivable}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Criar Gerenciamento
            </button>
          </div>
          <div className="mt-8"></div>
        </div>
      )}

      {view === "receipts" && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Recebimentos</h3>

          {/* Filtros */}
          <div className="mb-4">
            <div className="md:hidden flex flex-col gap-2">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-200 text-gray-800"
              >
                {Object.keys(statusMap).map((tab) => (
                  <option key={tab} value={tab}>
                    {tab}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              />
            </div>

            <div className="hidden md:flex gap-2 items-center">
              {Object.keys(statusMap).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
          </div>

          {/* Exibição dos cartões */}
          <div className="flex flex-col gap-4">
            {Object.entries(
              filteredReceivables.reduce((acc, item) => {
                const customer = item.customer;
                const razaoSocial =
                  customer?.razaoSocial ||
                  customer?.name ||
                  "Razão Social Indisponível";

                if (!acc[razaoSocial]) {
                  acc[razaoSocial] = [];
                }
                acc[razaoSocial].push(item);

                return acc;
              }, {})
            ).map(([razaoSocial, boletos]) => {
              const pagos = boletos.filter(
                (boleto) => boleto.status === "Pago"
              );

              return (
                <div
                  key={razaoSocial}
                  className="rounded-lg shadow p-4 bg-gray-100"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-bold text-gray-800">
                      {razaoSocial}
                    </div>
                    <div className="flex gap-2">
                      {/* Exibir o botão "Pago" apenas nas abas "Vencimento Hoje" e "Atrasado" */}
                      {(activeTab === "Vencimento Hoje" ||
                        activeTab === "Atrasado") && (
                        <button
                          onClick={() => handleMarkAsPaid(boletos[0]?._id)}
                          className="text-sm px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                          style={{ borderRadius: "0.5rem", boxShadow: "black"  }}
                        >
                          Pago
                        </button>
                      )}
{/*                       <button
                        onClick={() => handleDeactivate(boletos[0]?._id)}
                        className="text-sm px-3 py-1 rounded bg-gray-600 text-white hover:bg-gray-700"
                      >
                        Desativar
                      </button> */}
                      <button
                        onClick={() => handleDelete(boletos[0]?._id)}
                        className="text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Excluir
                      </button>
                      <button
                        onClick={() => toggleGroup(razaoSocial)}
                        className="text-sm px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
                      >
                        {expandedGroups[razaoSocial] ? "▲" : "▼"}
                      </button>
                    </div>
                  </div>
                  {expandedGroups[razaoSocial] && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-700">
                        <strong>Recorrência:</strong> R${" "}
                        {boletos[0]?.value?.toFixed(2)}
                      </p>
                      <p className="text-gray-700">
                        <strong>Data de Início:</strong>{" "}
                        {formatDate(boletos[0]?.creationDate)}
                      </p>
                      <p className="text-gray-700">
                        <strong>Dia de Vencimento:</strong>{" "}
                        {formatDate(boletos[0]?.dueDate)}
                      </p>
                      <p className="text-gray-700">
                        <strong>Status:</strong> {boletos[0]?.status || "N/A"}
                      </p>
                      <div className="mt-4">
                        <p className="text-gray-800 font-bold">Pagamentos:</p>
                        {pagos.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {pagos.map((pago, index) => (
                              <li key={index} className="text-gray-600">
                                {formatDate(pago.dueDate)} - {pago.status}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">
                            Nenhum pagamento registrado.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

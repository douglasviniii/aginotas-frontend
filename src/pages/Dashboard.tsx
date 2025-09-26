import { useEffect, useState } from "react";
import { Users, Receipt, FileText } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { api } from "../lib/api";
import { isTokenExpired } from "../utils/auth";

dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

interface Nota {
  id: string;
  invoiceXML: string;
  serviceProvider: string;
  dateOfCompetence: string; // "dd-MM-yyyy"
  serviceRecipient: string;
  service: {
    values: {
      otherWithholdingsValue: number;
      otherWithholdingsRetained: boolean;
    };
    discrimination: string;
    codigoNbs: string;
    municipalCode: string;
    enforceabilityofISS: boolean;
    municipalityIncidence: string;
    serviceItemList: {
      itemListService: string;
      cnaeCode: string;
      description: string;
      taxable: boolean;
      quantity: number;
      discount: number;
      unitValue: number;
      netValue: number;
    }[];
  };
  value: number;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  status: string;
}

export function Dashboard() {
  const [invoices, setInvoices] = useState<Nota[]>([]);
  const [customers, setCustomers] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Nota[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(
    dayjs().year().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    dayjs().month().toString()
  );
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadInvoices = async () => {
    setLoading(true);
    try {
      if (user.role === "customer") {
        const data = await api.getInvoicesForCustomer();
        setInvoices(data);
      }
      if (user.role === "user") {
        const data = await api.getInvoices();
        setInvoices(data);
        const customersData = await api.getAllCustomers();
        setCustomers(customersData);
      }
    } catch (error) {
      toast.error("Erro ao carregar notas.");
    } finally {
      setLoading(false);
    }
  };

  const filterInvoicesByMonth = () => {
    if (!selectedYear || !selectedMonth) return;
    const filtered = invoices.filter((nota) => {
      const notaDate = dayjs(nota.dateOfCompetence, "YYYY-MM-DD");
      return (
        notaDate.year() === Number(selectedYear) &&
        notaDate.month() === Number(selectedMonth)
      );
    });
    setFilteredInvoices(filtered);
  };

  function handleDownloadXML(
    xmlContent: string,
    fileName: string = "nota.xml"
  ) {
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadPdf(
    invoiceXML: string,
    serviceRecipient: string
  ) {
    try {
      const invoicePDF = await api.generateInvoicePdf(
        invoiceXML,
        serviceRecipient
      );

      if (invoicePDF.size === 0) {
        throw new Error("PDF vazio ou inválido");
      }

      const url = window.URL.createObjectURL(invoicePDF);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nota_fiscal_${serviceRecipient}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      toast.error("Ocorreu um erro ao gerar o pdf da nota fiscal");
    }
  }

  const totalMonthValue = filteredInvoices.reduce((acc, nota) => {
    if (
      nota.status.toLowerCase() === "issued" ||
      nota.status.toLowerCase() === "substituida"
    ) {
      return acc + (nota.value || 0);
    }
    return acc;
  }, 0);

  useEffect(() => {
    const token = Cookies.get("token") || Cookies.get("admin_token");
    if (!token || isTokenExpired(token)) {
      Cookies.remove("token");
      Cookies.remove("admin_token");
      navigate("/login");
    } else {
      loadInvoices();
    }
  }, [navigate]);

  useEffect(() => {
    filterInvoicesByMonth();
  }, [invoices, selectedMonth, selectedYear]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Filtro de Ano/Mês */}
      <div className="bg-white p-6 rounded-2xl shadow flex flex-col sm:flex-row gap-4 items-center">
        <select
          className="border p-2 rounded-lg w-full sm:w-auto"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {Array.from({ length: 5 }, (_, i) => dayjs().year() - i).map(
            (year) => (
              <option key={year} value={year}>
                {year}
              </option>
            )
          )}
        </select>

        <select
          className="border p-2 rounded-lg w-full sm:w-auto"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {Array.from({ length: 12 }, (_, i) => i).map((month) => (
            <option key={month} value={month}>
              {dayjs().month(month).format("MMMM")}
            </option>
          ))}
        </select>

        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          onClick={filterInvoicesByMonth}
        >
          Filtrar
        </button>
      </div>

      {/* Cards resumidos */}
      {user.role === "user" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
            <div className="p-3 bg-blue-200 rounded-full">
              <Receipt className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Notas no mês</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredInvoices.length}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
            <div className="p-3 bg-green-200 rounded-full">
              <FileText className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total emitido</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalMonthValue.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
            <div className="p-3 bg-purple-200 rounded-full">
              <Users className="w-6 h-6 text-purple-700" />
            </div>

            <div>
              <p className="text-xs text-gray-600">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.length}
              </p>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {/* Tabela de Notas */}
      <div className="bg-white p-6 rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-4">Status</th>
              <th className="text-left py-2 px-4">Data</th>
              <th className="text-left py-2 px-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400">
                  Nenhuma nota encontrada para o período selecionado.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((nota) => (
                <tr
                  key={nota.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-2 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        nota.status.toLowerCase() === "issued"
                          ? "bg-green-100 text-green-700"
                          : nota.status.toLowerCase() === "substituida"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {nota.status.toLowerCase() === "issued"
                        ? "✓"
                        : nota.status.toLowerCase() === "substituida"
                        ? "↺"
                        : "!"}{" "}
                      {nota.status.toLowerCase() === "issued"
                        ? "Emitida"
                        : "Cancelada"}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    {dayjs
                      .unix(nota.createdAt._seconds)
                      .format("DD/MM/YYYY HH:mm")}
                  </td>
                  {nota.status === "issued" ? (
                    <td className="py-2 px-4 flex gap-2">
                      <button
                        onClick={() => handleDownloadXML(nota.invoiceXML, nota.service.discrimination)}
                        className="text-blue-600 hover:underline"
                      >
                        Baixar XML
                      </button>
                      <button
                        onClick={() =>
                          handleDownloadPdf(
                            nota.invoiceXML,
                            nota.serviceRecipient
                          )
                        }
                        className="text-blue-600 hover:underline"
                      >
                        Baixar PDF
                      </button>
                    </td>
                  ) : (
                    ""
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

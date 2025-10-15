import { useEffect, useState } from "react";
import { CustomerType, User } from "./types";
import { api } from "../lib/api";
import { toast } from "sonner";
import { LogoLoading } from "../components/Loading";

interface Props {
  selectedCustomer: CustomerType;
  subscriptionUser: any;
  handleCloseModal: () => void;
  handleUpdateCustomer: (customer: CustomerType) => void;
  handleDeleteCustomer: (id: string) => void;
  handleGenerateInvoice: (invoice: any) => void;
  handleScheduleInvoice: (invoice: any) => void;
}

const ModalCustomer: React.FC<Props> = ({
  selectedCustomer,
  subscriptionUser,
  handleCloseModal,
  handleUpdateCustomer,
  handleDeleteCustomer,
  handleGenerateInvoice,
  handleScheduleInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<
    | "edit"
    | "invoice"
    | "schedule"
    | "history-invoices"
    | "history-schedulings"
    | "delete"
  >("edit");
  const [customer, setCustomer] = useState(selectedCustomer);
  const [user, setUser] = useState<User>();
  const [invoiceCustomer, setInvoiceCustomer] = useState([]);
  const [schedulingCustomer, setSchedulingCustomer] = useState([]);
  const [messageError, setMessageError] = useState("");

  const fetchData = async () => {
    try {
      const userData = await api.getUserById();
      setUser(userData);
      getInvoicesByCustomer(), getSchedulingsByCustomer();
    } catch (error) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [invoice, setInvoice] = useState({
    dateOfCompetence: "",
    scheduledInvoiceDay: 0,
    dueDate: "",
    service: {
      values: {
        otherWithholdingsValue: 0,
        otherWithholdingsRetained: false,
      },
      discrimination: "",
      codigoNbs: "",
      municipalCode: "4115804",
      enforceabilityofISS: true,
      municipalityIncidence: "4115804",
      serviceItemList: user?.enterprise.economicActivity || [], // pego do usuário
    },
    serviceRecipient: customer.id || "",
    generateReceivable: false,
  });

  function formatarInputReais(valor: number) {
    if (valor === undefined || valor === null) return "";

    // Converte para centavos e depois para string
    const valorCentavos = Math.round(valor * 100);
    const str = valorCentavos.toString();

    // Formata para pt-BR
    const numero = Number(str) / 100;

    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatDateToMMYYYYDD(dateString: string) {
    const [year, month, day] = dateString.split("-");
    return `${year}-${month}-${day}`;
  }

  async function getInvoicesByCustomer() {
    try {
      const invoiceCustomerData = await api.getInvoicesByCustomer(customer.id);
      setInvoiceCustomer(invoiceCustomerData);
    } catch (error) {
      toast.error("Ocorreu um erro ao buscar as notas fiscais do customer");
    }
  }

  async function getSchedulingsByCustomer() {
    try {
      const schedulingCustomerData = await api.getSchedulingsByCustomer(
        customer.id
      );
      setSchedulingCustomer(schedulingCustomerData);
    } catch (error) {
      toast.error("Ocorreu um erro ao buscar as agendamentos do customer");
    }
  }

  async function handleDeleteScheguling(id: string) {
    try {
      await api.deletescheduling(id);
      fetchData();
    } catch (error) {
      toast.error("Ocorreu um erro ao excluir o agendamento");
    }
  }

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

  async function handleCancelInvoice(invoice: any) {
    try {
      const response = await api.cancelInvoice({
        invoiceId: invoice.id,
        invoiceXml: invoice.invoiceXML,
      });
      response.error;
      setMessageError(response.error);
      toast.error(response.error);
      fetchData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Ocorreu um erro ao cancelar a nota fiscal";
      setMessageError(errorMessage);
      toast.error(errorMessage);
    }
  }

  async function getLastInvoice() {
    try {
      const lastInvoice = await api.getLastInvoice();
      setInvoice({
        dateOfCompetence: lastInvoice.dateOfCompetence,
        scheduledInvoiceDay: lastInvoice.scheduledInvoiceDay,
        dueDate: lastInvoice.dueDate,
        service: {
          values: {
            otherWithholdingsValue: lastInvoice.service.values.otherWithholdingsValue,
            otherWithholdingsRetained: lastInvoice.service.values.otherWithholdingsRetained,
          },
          discrimination: lastInvoice.service.discrimination,
          codigoNbs: lastInvoice.service.codigoNbs,
          municipalCode: lastInvoice.service.municipalCode,
          enforceabilityofISS: lastInvoice.service.enforceabilityofISS,
          municipalityIncidence: lastInvoice.service.municipalityIncidence,
          serviceItemList: lastInvoice.service.serviceItemList,
        },
        serviceRecipient: customer.id,
        generateReceivable: lastInvoice.generateReceivable,
      });
    } catch (error) {
      toast.error("Por favor, tente novamente!");
    }
  }

  const userPlan = subscriptionUser?.items?.data?.[0]?.price?.product?.name;
  const allTabs = [
    {
      key: "edit",
      label: "Editar",
      plans: ["Plano Bronze", "Plano Prata", "Plano Ouro", "Plano Diamante"],
    },
    {
      key: "invoice",
      label: "Emitir",
      plans: ["Plano Bronze", "Plano Prata", "Plano Ouro", "Plano Diamante"],
    },
    {
      key: "history-invoices",
      label: "Emitidas",
      plans: ["Plano Bronze", "Plano Prata", "Plano Ouro", "Plano Diamante"],
    },
    {
      key: "schedule",
      label: "Programar",
      plans: ["Plano Bronze", "Plano Prata", "Plano Ouro", "Plano Diamante"],
    }, // bronze não tem
    {
      key: "history-schedulings",
      label: "Programadas",
      plans: ["Plano Bronze", "Plano Prata", "Plano Ouro", "Plano Diamante"],
    },
    {
      key: "delete",
      label: "Excluir",
      plans: ["Plano Bronze", "Plano Prata", "Plano Ouro", "Plano Diamante"],
    }, // apenas ouro
  ];
  const visibleTabs = allTabs.filter((tab) => tab.plans.includes(userPlan));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-lg">
        {/* Barra de sessões */}
        <div className="flex border-b border-gray-200">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo do modal */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === "edit" && (
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  value={customer.corporateName}
                  onChange={(e) =>
                    setCustomer({ ...customer, corporateName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Documento
                </label>
                <input
                  type="text"
                  value={customer.document.type}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      document: { ...customer.document, type: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Número do Documento
                </label>
                <input
                  type="text"
                  value={customer.document.number}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      document: {
                        ...customer.document,
                        number: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Inscrições */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Inscrição Municipal
                </label>
                <input
                  type="text"
                  value={customer.municipalRegistration}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      municipalRegistration: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Inscrição Estadual
                </label>
                <input
                  type="text"
                  value={customer.stateRegistration}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      stateRegistration: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rua
                </label>
                <input
                  type="text"
                  value={customer.address.street}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      address: { ...customer.address, street: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bairro
                </label>
                <input
                  type="text"
                  value={customer.address.neighborhood}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      address: {
                        ...customer.address,
                        neighborhood: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Número
                </label>
                <input
                  type="text"
                  value={customer.address.number}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      address: { ...customer.address, number: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cidade
                </label>
                <input
                  type="text"
                  value={customer.address.city}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      address: { ...customer.address, city: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <input
                  type="text"
                  value={customer.address.state}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      address: { ...customer.address, state: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  CEP
                </label>
                <input
                  type="text"
                  value={customer.address.zipCode}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      address: { ...customer.address, zipCode: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Código Municipal
                </label>
                <input
                  type="text"
                  value={customer.address.municipalCode}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      address: {
                        ...customer.address,
                        municipalCode: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Contato */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  DDD
                </label>
                <input
                  type="text"
                  value={customer.contact.areaCode}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      contact: {
                        ...customer.contact,
                        areaCode: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Número do Telefone
                </label>
                <input
                  type="text"
                  value={customer.contact.numberPhone}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      contact: {
                        ...customer.contact,
                        numberPhone: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
          {activeTab === "invoice" && (
            <div>
              <h2 className="text-lg font-semibold">
                Emitir Nota Avulsa para: {customer.corporateName}
              </h2>
              <button
                onClick={() => {
                  getLastInvoice();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Última nota
              </button>
              {/* Data de Competência */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data de Competência
                </label>
                <input
                  required
                  type="date"
                  value={invoice.dateOfCompetence}
                  onChange={(e) =>
                    setInvoice({ ...invoice, dateOfCompetence: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Discriminação do Serviço */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Discriminação
                </label>
                <input
                  required
                  type="text"
                  value={invoice.service.discrimination}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      service: {
                        ...invoice.service,
                        discrimination: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Código Municipal */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Código Municipal
                </label>
                <input
                  required
                  type="text"
                  value={invoice.service.municipalCode}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      service: {
                        ...invoice.service,
                        municipalCode: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Municipio Incidencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Municipio Incidencia
                </label>
                <input
                  required
                  type="text"
                  value={invoice.service.municipalityIncidence}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      service: {
                        ...invoice.service,
                        municipalityIncidence: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* ExigibilidadeISS */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exigibilidade ISS
                </label>
                <select
                  required
                  value={invoice.service.enforceabilityofISS ? "true" : "false"}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      service: {
                        ...invoice.service,
                        enforceabilityofISS: e.target.value === "true",
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>

              {/* Lista de Itens */}
              <label className="block text-sm font-medium text-gray-700 mt-4">
                Itens de Serviço
              </label>

              {invoice.service.serviceItemList.map((item, index) => (
                <div
                  key={index}
                  className="space-y-2 p-2 border rounded-lg relative"
                >
                  {/* Dropdown CNAE */}
                  <label className="block text-sm font-medium text-gray-700">
                    Cnae e Descrição
                  </label>
                  <select
                    required
                    value={item.cnaeCode}
                    onChange={async (e) => {
                      const selected = user.enterprise.economicActivity.find(
                        (act) => act.code === e.target.value
                      );
                      const newList = [...invoice.service.serviceItemList];

                      if (selected) {
                        newList[index].cnaeCode = selected.code;
                        newList[index].description = selected.description;

                        // Faz fetch para pegar o itemListService baseado no CNAE
                        try {
                          const rawCode = selected.code;
                          const sanitizedCode = rawCode.replace(/[\.\-]/g, "");

                          const response = await api.serviceByCnae(
                            sanitizedCode
                          );
                          newList[index].itemListService =
                            response[0].listaServicoVo.id;
                          newList[index].aliquot =
                            response[0].listaServicoVo.aliquota;
                        } catch (err) {
                          console.error("Erro ao buscar itemListService:", err);
                        }
                      }

                      setInvoice({
                        ...invoice,
                        service: {
                          ...invoice.service,
                          serviceItemList: newList,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {user.enterprise.economicActivity.map((act) => (
                      <option key={act.code} value={act.code}>
                        {act.code} - {act.description}
                      </option>
                    ))}
                  </select>

                  {/* Item List Service */}
                  <label className="block text-sm font-medium text-gray-700">
                    Código do Item de Serviço
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="ItemListService"
                    value={item.itemListService}
                    onChange={(e) => {
                      const newList = [...invoice.service.serviceItemList];
                      newList[index].itemListService = e.target.value;
                      setInvoice({
                        ...invoice,
                        service: {
                          ...invoice.service,
                          serviceItemList: newList,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                  />

                  {/* Quantidade */}
                  <label className="block text-sm font-medium text-gray-700">
                    Quantidade
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="Quantidade"
                    value={item.quantity}
                    onChange={(e) => {
                      const newList = [...invoice.service.serviceItemList];
                      newList[index].quantity = Number(e.target.value);
                      newList[index].netValue =
                        Number(e.target.value) * newList[index].unitValue;
                      setInvoice({
                        ...invoice,
                        service: {
                          ...invoice.service,
                          serviceItemList: newList,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  {/* Valor Unitário */}
                  <label className="block text-sm font-medium text-gray-700">
                    Valor Unitário
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Valor Unitário"
                    value={formatarInputReais(item.unitValue)}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      const numero = Number(onlyNumbers) / 100; // valor em decimal
                      const newList = [...invoice.service.serviceItemList];
                      newList[index].unitValue = numero;
                      newList[index].netValue =
                        numero * newList[index].quantity;
                      setInvoice({
                        ...invoice,
                        service: {
                          ...invoice.service,
                          serviceItemList: newList,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  {/* Discount */}
                  <label className="block text-sm font-medium text-gray-700">
                    Desconto
                  </label>
                  <input
                    type="text"
                    placeholder="Desconto"
                    value={formatarInputReais(item.discount)}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      const numero = Number(onlyNumbers) / 100;
                      const newList = [...invoice.service.serviceItemList];
                      newList[index].discount = numero;
                      setInvoice({
                        ...invoice,
                        service: {
                          ...invoice.service,
                          serviceItemList: newList,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  {/* Taxable */}
                  <label className="block text-sm font-medium text-gray-700">
                    Tributável
                  </label>
                  <select
                    value={item.taxable ? "true" : "false"}
                    onChange={(e) => {
                      const newList = [...invoice.service.serviceItemList];
                      newList[index].taxable = e.target.value === "true";
                      setInvoice({
                        ...invoice,
                        service: {
                          ...invoice.service,
                          serviceItemList: newList,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="true">Tributável</option>
                    <option value="false">Não Tributável</option>
                  </select>

                  {/* Botão para remover */}
                  <button
                    type="button"
                    onClick={() => {
                      const newList = invoice.service.serviceItemList.filter(
                        (_, i) => i !== index
                      );
                      setInvoice({
                        ...invoice,
                        service: {
                          ...invoice.service,
                          serviceItemList: newList,
                        },
                      });
                    }}
                    className="absolute top-0 right-2 text-red-600 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Botão adicionar item */}
              <button
                type="button"
                onClick={() => {
                  const firstItem = user.enterprise.economicActivity[0];
                  const newItem = {
                    itemListService: "",
                    cnaeCode: firstItem?.code || "",
                    description: firstItem?.description || "",
                    quantity: 1,
                    discount: 0,
                    unitValue: 0,
                    netValue: 0,
                    taxable: true,
                  };
                  setInvoice({
                    ...invoice,
                    service: {
                      ...invoice.service,
                      serviceItemList: [
                        ...invoice.service.serviceItemList,
                        newItem,
                      ],
                    },
                  });
                }}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                + Adicionar Item
              </button>

              {/* Checkbox para emissão do recebivel */}
              <div className="mt-6">
                {" "}
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={invoice.generateReceivable}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        generateReceivable: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Desejo emitir o recebível
                  </span>
                </label>
              </div>
            </div>
          )}

          {activeTab === "history-invoices" && (
            <div className="text-gray-700">
              <h3 className="text-lg font-semibold mb-4">
                Histórico de Notas Emitidas de: {customer.corporateName}
              </h3>

              <div className="space-y-3">
                {invoiceCustomer && invoiceCustomer.length > 0 ? (
                  invoiceCustomer.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Status:{" "}
                          {invoice.status === "issued"
                            ? "emitida"
                            : "cancelada"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Data:{" "}
                          {new Date(
                            invoice.createdAt._seconds * 1000
                          ).toLocaleDateString("pt-BR")}
                        </p>
                      </div>

                      {invoice.status !== "cancelled" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleDownloadXML(invoice.invoiceXML)
                            }
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Baixar XML
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadPdf(
                                invoice.invoiceXML,
                                invoice.serviceRecipient
                              )
                            }
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Baixar PDF
                          </button>
                          <button
                            onClick={() => handleCancelInvoice(invoice)}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    Nenhuma nota fiscal emitida encontrada.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div>
              <h2 className="text-lg font-semibold">
                Programar Emissão para: {customer.corporateName}
              </h2>

              {/* Dia de Programação da Nota */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dia para emissão automática
                </label>
                <input
                  required
                  type="number"
                  placeholder="Ex: 10"
                  value={invoice.scheduledInvoiceDay || ""}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      scheduledInvoiceDay: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Data de Competência */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Data de Competência
                </label>
                <input
                  required
                  type="date"
                  value={invoice.dateOfCompetence}
                  onChange={(e) =>
                    setInvoice({ ...invoice, dateOfCompetence: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Discriminação */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Discriminação
                </label>
                <input
                  required
                  type="text"
                  value={invoice.service.discrimination}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      service: {
                        ...invoice.service,
                        discrimination: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Código Municipal */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Código Municipal
                </label>
                <input
                  required
                  type="text"
                  value={invoice.service.municipalCode}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      service: {
                        ...invoice.service,
                        municipalCode: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Municipio Incidencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Município Incidência
                </label>
                <input
                  required
                  type="text"
                  value={invoice.service.municipalityIncidence}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      service: {
                        ...invoice.service,
                        municipalityIncidence: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Exigibilidade ISS */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exigibilidade ISS
                </label>
                <select
                  required
                  value={invoice.service.enforceabilityofISS ? "true" : "false"}
                  onChange={(e) =>
                    setInvoice({
                      ...invoice,
                      service: {
                        ...invoice.service,
                        enforceabilityofISS: e.target.value === "true",
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>

              {/* Lista de Itens (igual ao invoice) */}
              <label className="block text-sm font-medium text-gray-700 mt-4">
                Itens de Serviço
              </label>
              {invoice.service.serviceItemList.map((item, index) => (
                <div
                  key={index}
                  className="space-y-2 p-2 border rounded-lg relative"
                >
                  {/* Dropdown CNAE */}
                  <label className="block text-sm font-medium text-gray-700">
                    Cnae e Descrição
                  </label>
                  <select
                    required
                    value={item.cnaeCode}
                    onChange={async (e) => {
                      const selected = user.enterprise.economicActivity.find(
                        (act) => act.code === e.target.value
                      );
                      const newList = [...invoice.service.serviceItemList];

                      if (selected) {
                        newList[index].cnaeCode = selected.code;
                        newList[index].description = selected.description;

                        // Faz fetch para pegar o itemListService baseado no CNAE
                        try {
                          const rawCode = selected.code;
                          const sanitizedCode = rawCode.replace(/[\.\-]/g, "");

                          const response = await api.serviceByCnae(
                            sanitizedCode
                          );
                          newList[index].itemListService =
                            response[0].listaServicoVo.id; // assume que a API retorna { itemListService: "XXXX" }
                        } catch (err) {
                          console.error("Erro ao buscar itemListService:", err);
                        }
                      }

                      setInvoice({
                        ...invoice,
                        service: {
                          ...invoice.service,
                          serviceItemList: newList,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {user.enterprise.economicActivity.map((act) => (
                      <option key={act.code} value={act.code}>
                        {act.code} - {act.description}
                      </option>
                    ))}
                  </select>

                  {/* Item List Service */}
                  <label className="block text-sm font-medium text-gray-700">
                    Código do Item de Serviço
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="ItemListService"
                    value={item.itemListService}
                    onChange={(e) => {
                      const newList = [...invoice.service.serviceItemList];
                      newList[index].itemListService = e.target.value;
                      setInvoice({
                        ...invoice,
                        service: {
                          ...invoice.service,
                          serviceItemList: newList,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                  />

                  {/* Quantidade */}
                  <label className="block text-sm font-medium text-gray-700">
                    Quantidade
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="Quantidade"
                    value={item.quantity}
                    onChange={(e) => {
                      const newList = [...invoice.service.serviceItemList];
                      newList[index].quantity = Number(e.target.value);
                      newList[index].netValue =
                        Number(e.target.value) * newList[index].unitValue;
                      setInvoice({
                        ...invoice,
                        service: {
                          ...invoice.service,
                          serviceItemList: newList,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  {/* Valor Unitário */}
                  <label className="block text-sm font-medium text-gray-700">
                    Valor Unitário
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Valor Unitário"
                    value={formatarInputReais(item.unitValue)}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      const numero = Number(onlyNumbers) / 100; // valor em decimal
                      const newList = [...invoice.service.serviceItemList];
                      newList[index].unitValue = numero;
                      newList[index].netValue =
                        numero * newList[index].quantity;
                      setInvoice({
                        ...invoice,
                        service: {
                          ...invoice.service,
                          serviceItemList: newList,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  {/* Discount */}
                  <label className="block text-sm font-medium text-gray-700">
                    Desconto
                  </label>
                  <input
                    type="text"
                    placeholder="Desconto"
                    value={formatarInputReais(item.discount)}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      const numero = Number(onlyNumbers) / 100;
                      const newList = [...invoice.service.serviceItemList];
                      newList[index].discount = numero;
                      setInvoice({
                        ...invoice,
                        service: {
                          ...invoice.service,
                          serviceItemList: newList,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  {/* Taxable */}
                  <label className="block text-sm font-medium text-gray-700">
                    Tributável
                  </label>
                  <select
                    value={item.taxable ? "true" : "false"}
                    onChange={(e) => {
                      const newList = [...invoice.service.serviceItemList];
                      newList[index].taxable = e.target.value === "true";
                      setInvoice({
                        ...invoice,
                        service: {
                          ...invoice.service,
                          serviceItemList: newList,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="true">Tributável</option>
                    <option value="false">Não Tributável</option>
                  </select>

                  {/* Botão para remover */}
                  <button
                    type="button"
                    onClick={() => {
                      const newList = invoice.service.serviceItemList.filter(
                        (_, i) => i !== index
                      );
                      setInvoice({
                        ...invoice,
                        service: {
                          ...invoice.service,
                          serviceItemList: newList,
                        },
                      });
                    }}
                    className="absolute top-0 right-2 text-red-600 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Botão adicionar item */}
              <button
                type="button"
                onClick={() => {
                  const firstItem = user.enterprise.economicActivity[0];
                  const newItem = {
                    itemListService: "",
                    cnaeCode: firstItem?.code || "",
                    description: firstItem?.description || "",
                    quantity: 1,
                    discount: 0,
                    unitValue: 0,
                    netValue: 0,
                    aliquot: 0,
                    taxable: true,
                  };
                  setInvoice({
                    ...invoice,
                    service: {
                      ...invoice.service,
                      serviceItemList: [
                        ...invoice.service.serviceItemList,
                        newItem,
                      ],
                    },
                  });
                }}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                + Adicionar Item
              </button>

              {/* Checkbox para emissão do recebivel */}
              <div className="mt-6">
                {" "}
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={invoice.generateReceivable}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        generateReceivable: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Desejo emitir o recebível
                  </span>
                </label>
              </div>
            </div>
          )}

          {activeTab === "history-schedulings" && (
            <div className="text-gray-700">
              <h2 className="font-semibold mb-4">
                Histórico de Notas Agendadas de: {customer.corporateName}
              </h2>

              {schedulingCustomer && schedulingCustomer.length > 0 ? (
                <ul className="space-y-2">
                  {schedulingCustomer.map((sched, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
                    >
                      <div>
                        <p>
                          <strong>Dia para emissão automática:</strong>{" "}
                          {sched.scheduledInvoiceDay}
                        </p>
                        <p>
                          <strong>Discriminação:</strong>{" "}
                          {sched.service.discrimination}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteScheguling(sched.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Excluir
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum agendamento encontrado.</p>
              )}
            </div>
          )}

          {activeTab === "delete" && (
            <div className="text-red-600">
              {/* Confirmação de exclusão */}
              Tem certeza que deseja excluir {customer.corporateName}?
              <button
                onClick={() => handleDeleteCustomer(customer.id)}
                className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          )}
        </div>

        {/* Botão atualizar apenas na aba de edição */}
        {activeTab === "edit" && (
          <div className="p-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => handleCloseModal()}
              className="px-4 py-2 bg-transparent text-red rounded-lg hover:bg-transparent"
            >
              Fechar
            </button>
            <button
              onClick={() => handleUpdateCustomer(customer)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Atualizar
            </button>
          </div>
        )}

        {/* Botão atualizar apenas na aba de nota fiscal */}
        {activeTab === "invoice" && (
          <div className="p-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => handleCloseModal()}
              className="px-4 py-2 bg-transparent text-red rounded-lg hover:bg-transparent"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                handleGenerateInvoice({
                  ...invoice,
                  dateOfCompetence: formatDateToMMYYYYDD(
                    invoice.dateOfCompetence
                  ),
                }),
                  fetchData();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Gerar
            </button>
          </div>
        )}

        {/* Botão atualizar apenas na aba de nota fiscal */}
        {activeTab === "schedule" && (
          <div className="p-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => handleCloseModal()}
              className="px-4 py-2 bg-transparent text-red rounded-lg hover:bg-transparent"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                handleScheduleInvoice({
                  ...invoice,
                  dateOfCompetence: formatDateToMMYYYYDD(
                    invoice.dateOfCompetence
                  ),
                }),
                  fetchData();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Gerar
            </button>
          </div>
        )}

        {/* Botão atualizar apenas na aba de notas fiscais emitidas */}
        {activeTab === "history-invoices" && (
          <div className="p-4 border-t border-gray-200 flex justify-start">
            <button
              onClick={() => handleCloseModal()}
              className="px-4 py-2 bg-transparent text-red rounded-lg hover:bg-transparent"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Botão atualizar apenas na aba de notas fiscais programadas */}
        {activeTab === "history-schedulings" && (
          <div className="p-4 border-t border-gray-200 flex justify-start">
            <button
              onClick={() => handleCloseModal()}
              className="px-4 py-2 bg-transparent text-red rounded-lg hover:bg-transparent"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Botão atualizar apenas na aba de excluir cliente */}
        {activeTab === "delete" && (
          <div className="p-4 border-t border-gray-200 flex justify-start">
            <button
              onClick={() => handleCloseModal()}
              className="px-4 py-2 bg-transparent text-red rounded-lg hover:bg-transparent"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalCustomer;

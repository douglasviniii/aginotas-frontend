import * as Tabs from "@radix-ui/react-tabs";
import {
  Calendar,
  List,
  Home,
  X,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Printer,
  Filter,
  User2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { Agendamento, Customer, Recebivel, User, UserData } from "./types";
import { LogoLoading } from "../components/Loading";

export default function Financial() {
  const [recebiveis, setRecebiveis] = useState<Recebivel[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Customer[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [user, setUser] = useState<User>();
  // Filtros para dashboard
  const [anoFiltro, setAnoFiltro] = useState<number>(new Date().getFullYear());
  const [mesFiltro, setMesFiltro] = useState<number>(new Date().getMonth() + 1);

  const [clienteSelecionadoGerar, setClienteSelecionadoGerar] =
    useState<string>("");
  const [valorGerar, setValorGerar] = useState<string>("");
  const [descricaoGerar, setDescricaoGerar] = useState<string>("");
  const [tipoGerar, setTipoGerar] = useState<string>("a receber");
  const [observationsGerar, setObservationsGerar] = useState<string>("");
  const [attachmentGerar, setAttachmentGerar] = useState<string>("");
  const [parcelasGerar, setParcelasGerar] = useState<number>(1);

  const [clienteSelecionadoAgendar, setClienteSelecionadoAgendar] =
    useState<string>("");
  const [valorAgendar, setValorAgendar] = useState<string>("");
  const [descricaoAgendar, setDescricaoAgendar] = useState<string>("");
  const [observationsAgendar, setObservationsAgendar] = useState<string>("");
  const [attachmentAgendar, setAttachmentAgendar] = useState<string>("");
  const [dataAgendar, setDataAgendar] = useState<string>("");
  const [dataGerar, setDataGerar] = useState<number>(1);
  const [parcelasAgendar, setParcelasAgendar] = useState<number>(1);

  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [recebivelSelecionado, setRecebivelSelecionado] =
    useState<Recebivel | null>(null);
  const [statusAtual, setStatusAtual] = useState("");

  const tiposRecebivel = ["a receber", "pago", "parcelado"];
  const [userData, setUserData] = useState({
    sub: "",
    email: "",
    role: "",
    name: "",
    subscriptionId: "",
  });
  const [planName, setPlanName] = useState("");
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
      serviceItemList: [], // pego do usuário
    },
    serviceRecipient: "",
    generateReceivable: false,
  });
  const [emitirNotaFiscal, setEmitirNotaFiscal] = useState(false);
  const [loading, setLoading] = useState(false);
  // Verificar role do usuário
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser: UserData = JSON.parse(userData);
        setUserRole(parsedUser.role || "user");
        setUserId(parsedUser.sub || "");
        setUserData(parsedUser);
      } catch (error) {
        console.error("Erro ao parsear user data:", error);
        setUserRole("user");
      }
    }
  }, []);

  // Função para formatar valor em tempo real
  const formatarValor = (valor: string): string => {
    let valorNumerico = valor.replace(/\D/g, "");
    if (valorNumerico === "") return "";

    const valorFloat = parseFloat(valorNumerico) / 100;

    return valorFloat.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Função para converter valor formatado para número
  const converterValorParaNumber = (valorFormatado: string): number => {
    if (!valorFormatado) return 0;

    const valorNumerico = parseFloat(
      valorFormatado.replace(/\./g, "").replace(",", ".")
    );

    return isNaN(valorNumerico) ? 0 : valorNumerico;
  };

  // Função para imprimir relatório do dashboard
  const imprimirRelatorioDashboard = () => {
    const conteudo = document.querySelector(".min-h-screen");
    if (conteudo) {
      const janelaImpressao = window.open("", "_blank");
      if (janelaImpressao) {
        janelaImpressao.document.write(`
          <html>
            <head>
              <title>Relatório Financeiro - ${mesFiltro}/${anoFiltro}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .card { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; }
                .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
                .total { font-size: 1.2em; font-weight: bold; margin: 20px 0; }
                @media print {
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Relatório Financeiro</h1>
                <h2>Período: ${mesFiltro}/${anoFiltro}</h2>
                <p>Emitido em: ${new Date().toLocaleDateString("pt-BR")}</p>
              </div>
              <div class="total">
                Total em Recebíveis: R$ ${recebiveis
                  .filter((recebivel) => filtrarPorData(recebivel))
                  .reduce((acc, r) => acc + r.value, 0)
                  .toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </div>
              <div class="grid">
                <div class="card">
                  <strong>Total de Recebíveis:</strong><br/>
                  ${
                    recebiveis.filter((recebivel) => filtrarPorData(recebivel))
                      .length
                  }
                </div>
                <div class="card">
                  <strong>Pendentes:</strong><br/>
                  ${
                    recebiveis.filter(
                      (r) => r.status === "pending" && filtrarPorData(r)
                    ).length
                  }
                </div>
                <div class="card">
                  <strong>Pagos:</strong><br/>
                  ${
                    recebiveis.filter(
                      (r) => r.status === "paid" && filtrarPorData(r)
                    ).length
                  }
                </div>
                <div class="card">
                  <strong>Cancelados:</strong><br/>
                  ${
                    recebiveis.filter(
                      (r) => r.status === "canceled" && filtrarPorData(r)
                    ).length
                  }
                </div>
                <div class="card">
                  <strong>Atrasados:</strong><br/>
                  ${
                    recebiveis.filter(
                      (r) => r.status === "overdue" && filtrarPorData(r)
                    ).length
                  }
                </div>
                <div class="card">
                  <strong>Agendamentos:</strong><br/>
                  ${agendamentos.length}
                </div>
              </div>
            </body>
          </html>
        `);
        janelaImpressao.document.close();
        janelaImpressao.print();
      }
    }
  };

  // Função para imprimir informações do recebível
  const imprimirRecebivel = () => {
    if (!recebivelSelecionado) return;

    const cliente = clientes.find(
      (c) => c.id === recebivelSelecionado.serviceRecipient
    );
    const janelaImpressao = window.open("", "_blank");
    if (janelaImpressao) {
      janelaImpressao.document.write(`
        <html>
          <head>
            <title>Comprovante de Recebível</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .section { margin: 20px 0; }
              .section h3 { border-bottom: 1px solid #ddd; padding-bottom: 5px; }
              .info { margin: 10px 0; }
              .value { font-size: 1.3em; font-weight: bold; margin: 15px 0; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Comprovante de Recebível</h1>
              <p>Emitido em: ${new Date().toLocaleDateString("pt-BR")}</p>
            </div>
            
            <div class="section">
              <h3>Informações do Cliente</h3>
              <div class="info"><strong>Nome:</strong> ${
                cliente?.corporateName || "N/A"
              }</div>
              <div class="info"><strong>Email:</strong> ${
                cliente?.email || "N/A"
              }</div>
              <div class="info"><strong>Documento:</strong> ${
                cliente
                  ? `${cliente.document.type}: ${cliente.document.number}`
                  : "N/A"
              }</div>
            </div>
            
            <div class="section">
              <h3>Informações do Recebível</h3>
              <div class="value">
                <strong>Valor:</strong> R$ ${recebivelSelecionado.value.toLocaleString(
                  "pt-BR",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </div>
              <div class="info"><strong>Tipo:</strong> ${
                recebivelSelecionado.type
              }</div>
              <div class="info"><strong>Descrição:</strong> ${
                recebivelSelecionado.description
              }</div>
              <div class="info"><strong>Status:</strong> ${
                recebivelSelecionado.status
              }</div>
              <div class="info"><strong>Observações:</strong> ${
                recebivelSelecionado.observations || "Nenhuma"
              }</div>
            </div>
          </body>
        </html>
      `);
      janelaImpressao.document.close();
      janelaImpressao.print();
    }
  };

  // Função para filtrar recebíveis por data - CORRIGIDA para o formato real do Firestore
  const filtrarPorData = (recebivel: Recebivel): boolean => {
    if (!recebivel.createdAt) return true;

    let dataRecebivel: Date;

    if (
      typeof recebivel.createdAt === "object" &&
      "_seconds" in recebivel.createdAt
    ) {
      dataRecebivel = new Date(recebivel.createdAt._seconds * 1000);
    } else if (recebivel.createdAt instanceof Date) {
      dataRecebivel = recebivel.createdAt;
    } else {
      dataRecebivel = new Date(recebivel.createdAt);
    }

    if (isNaN(dataRecebivel.getTime())) {
      return true;
    }

    return (
      dataRecebivel.getFullYear() === anoFiltro &&
      dataRecebivel.getMonth() + 1 === mesFiltro
    );
  };

  const gerarRecebivel = async () => {
    try {
      const cliente = clientes.find((c) => c.id === clienteSelecionadoGerar);
      if (!cliente) {
        toast.error("Selecione um cliente!");
        return;
      }

      const valorNumerico = converterValorParaNumber(valorGerar);
      if (valorNumerico <= 0) {
        toast.error("Digite um valor válido!");
        return;
      }

      let recebiveisCriados = 0;
      let mensagemNotaFiscal = "";

      setLoading(true);

      if (tipoGerar === "parcelado") {
        if (parcelasGerar <= 0) {
          toast.error("Digite um número válido de parcelas!");
          return;
        }

        const valorParcela = valorNumerico / parcelasGerar;

        // Criar todas as parcelas primeiro
        for (let i = 1; i <= parcelasGerar; i++) {
          const parcela: Recebivel = {
            serviceRecipient: cliente.id,
            value: valorParcela,
            type: tipoGerar,
            status: "pending",
            description: `${descricaoGerar} - Parcela ${i}/${parcelasGerar}`,
            observations: observationsGerar,
            attachment: attachmentGerar,
          };

          const response = await api.createReceivable(parcela);
          recebiveisCriados++;
          // toast.success(`Parcela ${i} criada: ${response.message}`);
        }

        // Emitir nota fiscal se solicitado
        if (emitirNotaFiscal) {
          try {
            const responseNotaFiscal = await api.generateInvoice(invoice);
            mensagemNotaFiscal = ` | Nota fiscal: ${
              responseNotaFiscal.message || "Emitida com sucesso"
            }`;
          } catch (error: any) {
            mensagemNotaFiscal = ` | Erro na nota fiscal: ${
              error.response?.data?.message || error.message
            }`;
          }
        }

        toast.success(
          `Recebível parcelado em ${parcelasGerar} vezes gerado com sucesso!${mensagemNotaFiscal}`
        );
      } else {
        // Caso único
        const novo: Recebivel = {
          serviceRecipient: cliente.id,
          value: valorNumerico,
          type: tipoGerar,
          status: "pending",
          description: descricaoGerar,
          observations: observationsGerar,
          attachment: attachmentGerar,
        };

        const responseRecebivel = await api.createReceivable(novo);

        // Emitir nota fiscal se solicitado
        if (emitirNotaFiscal) {
          try {
            const responseNotaFiscal = await api.generateInvoice(invoice);
            mensagemNotaFiscal = ` | Nota fiscal: ${
              responseNotaFiscal.message || "Emitida com sucesso"
            }`;
          } catch (error: any) {
            mensagemNotaFiscal = ` | Erro na nota fiscal: ${
              error.response?.data?.message || error.message
            }`;
          }
        }

        toast.success(`Recebível gerado com sucesso!${mensagemNotaFiscal}`);
      }

      setLoading(false);
      fetchData();

      // Limpa os campos
      setValorGerar("");
      setDescricaoGerar("");
      setObservationsGerar("");
      setAttachmentGerar("");
      setParcelasGerar(1);
      setClienteSelecionadoGerar("");
      setEmitirNotaFiscal(false);
      setInvoice({
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
          serviceItemList: [],
        },
        serviceRecipient: "",
        generateReceivable: false,
      });
    } catch (error: any) {
      console.error("Erro ao gerar recebível:", error);

      // Captura a mensagem de erro da API
      const mensagemErro =
        error.response?.data?.message ||
        error.message ||
        "Ocorreu um erro ao gerar o recebível!";

      toast.error(mensagemErro);
    }
  };

  const agendarRecebivel = async () => {
    try {
      const cliente = clientes.find((c) => c.id === clienteSelecionadoAgendar);
      if (!cliente) {
        toast.error("Selecione um cliente!");
        return;
      }

      const valorNumerico = converterValorParaNumber(valorAgendar);
      if (valorNumerico <= 0) {
        toast.error("Digite um valor válido!");
        return;
      }

      if (!dataAgendar) {
        toast.error("Selecione uma data de emissão!");
        return;
      }

      const novo: Agendamento = {
        serviceRecipient: cliente.id,
        value: valorNumerico,
        type: "a receber", // Tipo fixo para agendamentos
        status: "pending",
        description: descricaoAgendar,
        observations: observationsAgendar,
        attachment: attachmentAgendar,
        billingDay: dataGerar,
      };

      await api.createSchedulingReceivable(novo);

      fetchData();
      toast.success("Recebível agendado com sucesso!");

      // Limpa os campos
      setValorAgendar("");
      setDescricaoAgendar("");
      setObservationsAgendar("");
      setAttachmentAgendar("");
      setDataAgendar("");
      setClienteSelecionadoAgendar("");
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar agendamento do recebível!");
    }
  };

  const fetchData = async () => {
    try {
      const userData = await api.getUserById();
      setUser(userData);
      if (userData.subscriptionId) {
        const data = await api.getSubscriptionById(userData.subscriptionId);
        setPlanName(data?.items?.data?.[0]?.price?.product?.name);
      }

      if (userRole === "customer" && userId) {
        const customerReceivables = await api.getAllReceivablesForCustomer();
        setRecebiveis(customerReceivables);
      } else {
        // Se for admin ou user, busca todos os dados
        const [customers, receivables, schedulings] = await Promise.all([
          api.getAllCustomers(),
          api.getAllReceivables(),
          api.getAllSchedulingReceivables(),
        ]);

        setClientes(customers);
        setRecebiveis(receivables);
        setAgendamentos(schedulings);
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao buscar dados");
    }
  };

  useEffect(() => {
    if (userRole) {
      fetchData();
    }
  }, [userRole]);

  const abrirModal = (recebivel: Recebivel) => {
    setRecebivelSelecionado(recebivel);
    setStatusAtual(recebivel.status);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setRecebivelSelecionado(null);
    setModalAberto(false);
  };

  const excluirRecebivel = async (id: string) => {
    try {
      await api.deleteReceivable(id);
      toast.success("Recebível excluído com sucesso!");
      fetchData();
      fecharModal();
    } catch (error) {
      toast.error("Ocorreu um erro ao excluir o recebível");
    }
  };

  const excluirAgendamento = async (id: string) => {
    try {
      await api.deleteSchedulingReceivable(id);
      toast.success("Agendamento excluído com sucesso!");
      fetchData();
    } catch (error) {
      toast.error("Ocorreu um erro ao excluir o agendamento");
    }
  };

  const atualizarStatusRecebivel = async () => {
    if (!recebivelSelecionado) return;

    try {
      await api.updateStatusReceivable(recebivelSelecionado.id, {
        status: statusAtual,
      });
      fetchData();
      setModalAberto(false);
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar o status!");
    }
  };

  // Função específica para customer marcar como pago
  const marcarComoPago = async (recebivelId: string) => {
    try {
      await api.updateStatusReceivable(recebivelId, {
        status: "paid",
      });
      fetchData();
      toast.success("Recebível marcado como pago!");
    } catch (error) {
      toast.error("Erro ao atualizar o status!");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "canceled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "canceled":
        return "text-red-600 bg-red-50 border-red-200";
      case "overdue":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

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

  if (loading) return <LogoLoading size={100} text="Carregando..." />;

  // Se for customer, mostra apenas a visualização simplificada
  if (userRole === "customer") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Meus Recebíveis
                    </h1>
                    <p className="text-blue-100">
                      Visualize e gerencie seus recebíveis
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="bg-white rounded-2xl border border-blue-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <List className="w-6 h-6 text-blue-600" />
                  Meus Recebíveis
                </h2>

                {recebiveis.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg">Nenhum recebível encontrado.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recebiveis.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-lg ${
                              getStatusColor(r.status).split(" ")[1]
                            }`}
                          >
                            {getStatusIcon(r.status)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              R${" "}
                              {r.value.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                            <p className="text-sm text-gray-600">
                              {r.description}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                  r.status
                                )}`}
                              >
                                {r.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                {r.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        {r.status === "pending" && (
                          <button
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            onClick={() => marcarComoPago(r.id)}
                          >
                            Marcar como Pago
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*   if (planName === "Plano Bronze" || planName === "Plano Prata") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta área.
          </p>
        </div>
      </div>
    );
  } */

  // Se for admin ou user, mostra o financeiro completo
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Gestão Financeira
                  </h1>
                  <p className="text-blue-100">
                    Gerencie recebíveis e agendamentos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">Total em Recebíveis</p>
                <p className="text-2xl font-bold text-white">
                  R${" "}
                  {recebiveis
                    .filter((recebivel) => filtrarPorData(recebivel))
                    .reduce((acc, r) => acc + r.value, 0)
                    .toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <Tabs.Root defaultValue="dashboard" className="space-y-6">
              <Tabs.List className="flex space-x-1 bg-blue-50 p-1 rounded-2xl">
                <Tabs.Trigger
                  value="dashboard"
                  className="flex items-center gap-3 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600 hover:text-blue-700"
                >
                  <Home size={18} /> Dashboard
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="gerar"
                  className="flex items-center gap-3 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600 hover:text-blue-700"
                >
                  <User2 size={18} /> Gerar Recebível
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="agendamento"
                  className="flex items-center gap-3 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600 hover:text-blue-700"
                >
                  <Calendar size={18} /> Agendar Recebível
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="visualizacao"
                  className="flex items-center gap-3 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600 hover:text-blue-700"
                >
                  <List size={18} /> Visualização
                </Tabs.Trigger>
              </Tabs.List>

              {/* Dashboard */}
              <Tabs.Content value="dashboard" className="space-y-6">
                {/* Filtros e Botão de Imprimir */}
                <div className="flex justify-between items-center bg-white rounded-2xl border border-blue-100 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Filtrar por:
                      </span>
                    </div>
                    <select
                      className="border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={anoFiltro}
                      onChange={(e) => setAnoFiltro(Number(e.target.value))}
                    >
                      {Array.from(
                        { length: 5 },
                        (_, i) => new Date().getFullYear() - 2 + i
                      ).map((ano) => (
                        <option key={ano} value={ano}>
                          {ano}
                        </option>
                      ))}
                    </select>
                    <select
                      className="border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      value={mesFiltro}
                      onChange={(e) => setMesFiltro(Number(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (mes) => (
                          <option key={mes} value={mes}>
                            {mes.toString().padStart(2, "0")}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    onClick={imprimirRelatorioDashboard}
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir Relatório
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Total de Recebíveis */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">
                          Total de Recebíveis
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          {
                            recebiveis.filter((recebivel) =>
                              filtrarPorData(recebivel)
                            ).length
                          }
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-200" />
                    </div>
                  </div>

                  {/* Valor Total */}
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100 text-sm font-medium">
                          Valor Total
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          R${" "}
                          {recebiveis
                            .filter((recebivel) => filtrarPorData(recebivel))
                            .reduce((acc, r) => acc + r.value, 0)
                            .toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-indigo-200" />
                    </div>
                  </div>

                  {/* Total de Agendamentos */}
                  <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-cyan-100 text-sm font-medium">
                          Agendamentos
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          {agendamentos.length}
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-cyan-200" />
                    </div>
                  </div>

                  {/* Recebíveis Pendentes */}
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm font-medium">
                          Pendentes
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          {
                            recebiveis.filter(
                              (r) => r.status === "pending" && filtrarPorData(r)
                            ).length
                          }
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-200" />
                    </div>
                  </div>

                  {/* Recebíveis Pagos */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">
                          Pagos
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          {
                            recebiveis.filter(
                              (r) => r.status === "paid" && filtrarPorData(r)
                            ).length
                          }
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-200" />
                    </div>
                  </div>

                  {/* Recebíveis Cancelados */}
                  <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm font-medium">
                          Cancelados
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          {
                            recebiveis.filter(
                              (r) =>
                                r.status === "canceled" && filtrarPorData(r)
                            ).length
                          }
                        </p>
                      </div>
                      <XCircle className="w-8 h-8 text-red-200" />
                    </div>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="gerar" className="space-y-6">
                {/* Conteúdo da aba Gerar Recebível */}
                <div className="bg-white rounded-2xl border border-blue-100 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <User2 className="w-6 h-6 text-blue-600" />
                    Gerar Novo Recebível
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-sm font-medium text-gray-700">
                          Cliente *
                        </span>
                        <select
                          className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={clienteSelecionadoGerar}
                          onChange={(e) => {
                            setClienteSelecionadoGerar(e.target.value),
                              setInvoice({
                                ...invoice,
                                serviceRecipient: e.target.value,
                              });
                          }}
                        >
                          <option value="">Selecione um cliente</option>
                          {clientes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.corporateName}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-gray-700">
                          Tipo *
                        </span>
                        <select
                          className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={tipoGerar}
                          onChange={(e) => setTipoGerar(e.target.value)}
                        >
                          {tiposRecebivel.map((t) => (
                            <option key={t} value={t}>
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </option>
                          ))}
                        </select>
                      </label>

                      {tipoGerar === "parcelado" && (
                        <label className="block">
                          <span className="text-sm font-medium text-gray-700">
                            Parcelas *
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={parcelasGerar}
                            onChange={(e) =>
                              setParcelasGerar(Number(e.target.value))
                            }
                          />
                        </label>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-sm font-medium text-gray-700">
                          Valor *
                        </span>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={valorGerar}
                          onChange={(e) =>
                            setValorGerar(formatarValor(e.target.value))
                          }
                          placeholder="0,00"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-gray-700">
                          Descrição *
                        </span>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={descricaoGerar}
                          onChange={(e) => setDescricaoGerar(e.target.value)}
                          placeholder="Descrição do recebível"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-gray-700">
                          Observações
                        </span>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={observationsGerar}
                          onChange={(e) => setObservationsGerar(e.target.value)}
                          placeholder="Observações adicionais"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Checkbox para emissão de nota fiscal */}
{/*                   <div className="mt-6">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={emitirNotaFiscal}
                        onChange={(e) => setEmitirNotaFiscal(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Desejo emitir a nota fiscal
                      </span>
                    </label>
                  </div> */}

                  {/* Formulário para nota fiscal */}
                  {emitirNotaFiscal && (
                    <div className="mt-6 p-6 border border-gray-200 rounded-xl bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Dados para Nota Fiscal
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Data de Competência */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Data de Competência *
                          </label>
                          <input
                            required
                            type="date"
                            value={invoice.dateOfCompetence}
                            onChange={(e) =>
                              setInvoice({
                                ...invoice,
                                dateOfCompetence: e.target.value,
                              })
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        {/* Código Municipal */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Código Municipal *
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
                            className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        {/* Discriminação do Serviço */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Discriminação do Serviço *
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
                            className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        {/* Municipio Incidencia */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Municipio Incidência *
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
                            className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        {/* Exigibilidade ISS */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Exigibilidade ISS *
                          </label>
                          <select
                            required
                            value={
                              invoice.service.enforceabilityofISS
                                ? "true"
                                : "false"
                            }
                            onChange={(e) =>
                              setInvoice({
                                ...invoice,
                                service: {
                                  ...invoice.service,
                                  enforceabilityofISS:
                                    e.target.value === "true",
                                },
                              })
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="true">Sim</option>
                            <option value="false">Não</option>
                          </select>
                        </div>
                      </div>

                      {/* Lista de Itens de Serviço */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Itens de Serviço
                        </label>

                        {invoice.service.serviceItemList.map((item, index) => (
                          <div
                            key={index}
                            className="space-y-4 p-4 border border-gray-200 rounded-lg relative mb-4 bg-white"
                          >
                            {/* Dropdown CNAE */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                CNAE e Descrição *
                              </label>
                              <select
                                required
                                value={item.cnaeCode}
                                onChange={async (e) => {
                                  const selected =
                                    user.enterprise.economicActivity.find(
                                      (act) => act.code === e.target.value
                                    );
                                  const newList = [
                                    ...invoice.service.serviceItemList,
                                  ];

                                  if (selected) {
                                    newList[index].cnaeCode = selected.code;
                                    newList[index].description =
                                      selected.description;

                                    // Faz fetch para pegar o itemListService baseado no CNAE
                                    try {
                                      const rawCode = selected.code;
                                      const sanitizedCode = rawCode.replace(
                                        /[\.\-]/g,
                                        ""
                                      );

                                      const response = await api.serviceByCnae(
                                        sanitizedCode
                                      );
                                      newList[index].itemListService =
                                        response[0].listaServicoVo.id;
                                      newList[index].aliquot =
                                        response[0].listaServicoVo.aliquota;
                                    } catch (err) {
                                      console.error(
                                        "Erro ao buscar itemListService:",
                                        err
                                      );
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
                                className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              >
                                {user.enterprise.economicActivity.map((act) => (
                                  <option key={act.code} value={act.code}>
                                    {act.code} - {act.description}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Item List Service */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Código do Item de Serviço *
                                </label>
                                <input
                                  required
                                  type="text"
                                  placeholder="ItemListService"
                                  value={item.itemListService}
                                  onChange={(e) => {
                                    const newList = [
                                      ...invoice.service.serviceItemList,
                                    ];
                                    newList[index].itemListService =
                                      e.target.value;
                                    setInvoice({
                                      ...invoice,
                                      service: {
                                        ...invoice.service,
                                        serviceItemList: newList,
                                      },
                                    });
                                  }}
                                  className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>

                              {/* Tributável */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Tributável
                                </label>
                                <select
                                  value={item.taxable ? "true" : "false"}
                                  onChange={(e) => {
                                    const newList = [
                                      ...invoice.service.serviceItemList,
                                    ];
                                    newList[index].taxable =
                                      e.target.value === "true";
                                    setInvoice({
                                      ...invoice,
                                      service: {
                                        ...invoice.service,
                                        serviceItemList: newList,
                                      },
                                    });
                                  }}
                                  className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                  <option value="true">Tributável</option>
                                  <option value="false">Não Tributável</option>
                                </select>
                              </div>

                              {/* Quantidade */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Quantidade *
                                </label>
                                <input
                                  required
                                  type="number"
                                  placeholder="Quantidade"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newList = [
                                      ...invoice.service.serviceItemList,
                                    ];
                                    newList[index].quantity = Number(
                                      e.target.value
                                    );
                                    newList[index].netValue =
                                      Number(e.target.value) *
                                      newList[index].unitValue;
                                    setInvoice({
                                      ...invoice,
                                      service: {
                                        ...invoice.service,
                                        serviceItemList: newList,
                                      },
                                    });
                                  }}
                                  className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>

                              {/* Valor Unitário */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Valor Unitário *
                                </label>
                                <input
                                  required
                                  type="text"
                                  placeholder="Valor Unitário"
                                  value={formatarInputReais(item.unitValue)}
                                  onChange={(e) => {
                                    const onlyNumbers = e.target.value.replace(
                                      /\D/g,
                                      ""
                                    );
                                    const numero = Number(onlyNumbers) / 100;
                                    const newList = [
                                      ...invoice.service.serviceItemList,
                                    ];
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
                                  className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>

                              {/* Desconto */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Desconto
                                </label>
                                <input
                                  type="text"
                                  placeholder="Desconto"
                                  value={formatarInputReais(item.discount)}
                                  onChange={(e) => {
                                    const onlyNumbers = e.target.value.replace(
                                      /\D/g,
                                      ""
                                    );
                                    const numero = Number(onlyNumbers) / 100;
                                    const newList = [
                                      ...invoice.service.serviceItemList,
                                    ];
                                    newList[index].discount = numero;
                                    setInvoice({
                                      ...invoice,
                                      service: {
                                        ...invoice.service,
                                        serviceItemList: newList,
                                      },
                                    });
                                  }}
                                  className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                            </div>

                            {/* Botão para remover item */}
                            <button
                              type="button"
                              onClick={() => {
                                const newList =
                                  invoice.service.serviceItemList.filter(
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
                              className="absolute top-2 right-2 text-red-600 font-bold text-lg hover:text-red-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        {/* Botão adicionar item */}
                        <button
                          type="button"
                          onClick={() => {
                            const firstItem =
                              user.enterprise.economicActivity[0];
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
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200"
                        >
                          + Adicionar Item
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      onClick={gerarRecebivel}
                    >
                      Gerar Recebível
                    </button>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="agendamento" className="space-y-6">
                {/* Conteúdo da aba Agendamento */}
                <div className="bg-white rounded-2xl border border-blue-100 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    Agendar Recebível
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-sm font-medium text-gray-700">
                          Cliente *
                        </span>
                        <select
                          className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={clienteSelecionadoAgendar}
                          onChange={(e) =>
                            setClienteSelecionadoAgendar(e.target.value)
                          }
                        >
                          <option value="">Selecione um cliente</option>
                          {clientes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.corporateName}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-gray-700">
                          Data de Emissão *
                        </span>
                        <input
                          type="date"
                          className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={dataAgendar}
                          onChange={(e) => {
                            setDataAgendar(e.target.value);
                            const dia = Number(e.target.value.split("-")[2]);
                            setDataGerar(dia);
                          }}
                        />
                      </label>
                    </div>

                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-sm font-medium text-gray-700">
                          Valor *
                        </span>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={valorAgendar}
                          onChange={(e) =>
                            setValorAgendar(formatarValor(e.target.value))
                          }
                          placeholder="0,00"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-gray-700">
                          Descrição *
                        </span>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={descricaoAgendar}
                          onChange={(e) => setDescricaoAgendar(e.target.value)}
                          placeholder="Descrição do agendamento"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-gray-700">
                          Observações
                        </span>
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={observationsAgendar}
                          onChange={(e) =>
                            setObservationsAgendar(e.target.value)
                          }
                          placeholder="Observações adicionais"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      onClick={agendarRecebivel}
                    >
                      Agendar Recebível
                    </button>
                  </div>
                </div>

                {/* Lista de Agendamentos */}
                <div className="bg-white rounded-2xl border border-blue-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Agendamentos Futuros
                  </h3>
                  {agendamentos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p>Nenhum agendamento futuro.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {agendamentos.map((a, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-50 p-2 rounded-lg">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                R${" "}
                                {a.value.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                              <p className="text-sm text-gray-600">
                                {a.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                Dia {a.billingDay} de cada mês
                              </p>
                            </div>
                          </div>
                          <button
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                            onClick={() => excluirAgendamento(a.id as string)}
                          >
                            Excluir
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Tabs.Content>

              <Tabs.Content value="visualizacao" className="space-y-6">
                {/* Conteúdo da aba Visualização */}
                <div className="bg-white rounded-2xl border border-blue-100 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <List className="w-6 h-6 text-blue-600" />
                    Recebíveis Gerados
                  </h2>

                  {recebiveis.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-lg">Nenhum recebível gerado.</p>
                      <p className="text-sm">
                        Comece gerando seu primeiro recebível!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recebiveis.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors group"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`p-2 rounded-lg ${
                                getStatusColor(r.status).split(" ")[1]
                              }`}
                            >
                              {getStatusIcon(r.status)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                R${" "}
                                {r.value.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                              <p className="text-sm text-gray-600">
                                {r.description}
                              </p>
                              <div className="flex items-center space-x-3 mt-1">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                    r.status
                                  )}`}
                                >
                                  {r.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {r.type}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium opacity-0 group-hover:opacity-100"
                            onClick={() => abrirModal(r)}
                          >
                            Gerenciar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </div>

        {/* Modal */}
        {modalAberto && recebivelSelecionado && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    Gerenciar Recebível
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium text-sm"
                      onClick={imprimirRecebivel}
                    >
                      <Printer className="w-4 h-4" />
                      Imprimir
                    </button>
                    <button
                      className="text-white hover:text-blue-200 transition-colors"
                      onClick={fecharModal}
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informações do Cliente */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">
                      Informações do Cliente
                    </h3>
                    {clientes
                      .filter(
                        (c) => c.id === recebivelSelecionado.serviceRecipient
                      )
                      .map((cliente) => (
                        <div key={cliente.id} className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Nome
                            </label>
                            <div className="mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200">
                              {cliente.corporateName}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Email
                            </label>
                            <div className="mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200">
                              {cliente.email}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-600">
                              Documento
                            </label>
                            <div className="mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200">
                              {`${cliente.document.type}: ${cliente.document.number}`}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Informações do Recebível */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">
                      Informações do Recebível
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Valor
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 font-semibold">
                          R${" "}
                          {recebivelSelecionado.value.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Tipo
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200">
                          {recebivelSelecionado.type}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Descrição
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200">
                          {recebivelSelecionado.description}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Status Atual
                        </label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2">
                          {getStatusIcon(recebivelSelecionado.status)}
                          <span className="capitalize">
                            {recebivelSelecionado.status}
                          </span>
                        </div>
                      </div>

                      {/* Atualizar Status */}
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Alterar Status
                        </label>
                        <div className="mt-1 flex gap-2">
                          <select
                            className="flex-1 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            value={statusAtual}
                            onChange={(e) => setStatusAtual(e.target.value)}
                          >
                            <option value="pending">Pendente</option>
                            <option value="paid">Pago</option>
                            <option value="canceled">Cancelado</option>
                            <option value="overdue">Atrasado</option>
                          </select>
                          <button
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                            onClick={atualizarStatusRecebivel}
                          >
                            Atualizar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3 pt-6 border-t">
                  <button
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
                    onClick={fecharModal}
                  >
                    Fechar
                  </button>
                  <button
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                    onClick={() => excluirRecebivel(recebivelSelecionado.id)}
                  >
                    Excluir Recebível
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

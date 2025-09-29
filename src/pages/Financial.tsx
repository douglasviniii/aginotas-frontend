import * as Tabs from "@radix-ui/react-tabs";
import { User, Calendar, List, Home, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { Agendamento, Customer, Recebivel } from "./types";

const tiposRecebivel = ["a receber", "pago", "cancelado", "pendente"];

export default function Financial() {
  const [recebiveis, setRecebiveis] = useState<Recebivel[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer[]>([]);

  const [clienteSelecionadoGerar, setClienteSelecionadoGerar] =
    useState<string>("");
  const [valorGerar, setValorGerar] = useState<number>(0);
  const [descricaoGerar, setDescricaoGerar] = useState<string>("");
  const [tipoGerar, setTipoGerar] = useState<string>(tiposRecebivel[0]);
  const [observationsGerar, setObservationsGerar] = useState<string>("");
  const [attachmentGerar, setAttachmentGerar] = useState<string>("");

  const [clienteSelecionadoAgendar, setClienteSelecionadoAgendar] =
    useState<string>("");
  const [valorAgendar, setValorAgendar] = useState<number>(0);
  const [descricaoAgendar, setDescricaoAgendar] = useState<string>("");
  const [tipoAgendar, setTipoAgendar] = useState<string>(tiposRecebivel[0]);
  const [observationsAgendar, setObservationsAgendar] = useState<string>("");
  const [attachmentAgendar, setAttachmentAgendar] = useState<string>("");
  const [dataAgendar, setDataAgendar] = useState<string>("");
  const [dataGerar, setDataGerar] = useState<number>(1);

  // Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [recebivelSelecionado, setRecebivelSelecionado] =
    useState<Recebivel | null>(null);
  const [statusAtual, setStatusAtual] = useState("");

  const gerarRecebivel = async () => {
    try {
      const cliente = clientes.find((c) => c.id === clienteSelecionadoGerar);
      if (!cliente) return alert("Selecione um cliente!");

      const novo: Recebivel = {
        serviceRecipient: cliente.id,
        value: valorGerar,
        type: tipoGerar,
        status: "pending",
        description: descricaoGerar,
        observations: observationsGerar,
        attachment: attachmentGerar,
      };

      await api.createReceivable(novo);
      fetchData();
      toast.success("Recebível gerado!");
    } catch (error) {
      toast.error("Ocorreu um erro ao gerar o recebível!");
    }
  };

  const agendarRecebivel = async () => {
    try {
      const cliente = clientes.find((c) => c.id === clienteSelecionadoAgendar);
      if (!cliente) return alert("Selecione um cliente!");

      const novo: Agendamento = {
        serviceRecipient: cliente.id,
        value: valorAgendar,
        type: tipoAgendar,
        status: "pending",
        description: descricaoAgendar,
        observations: observationsAgendar,
        attachment: attachmentAgendar,
        billingDay: dataGerar,
      };

      await api.createSchedulingReceivable(novo);
      fetchData();
      toast.success("Recebível agendado!");
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar agendamento do recebível!");
    }
  };

  const fetchData = async () => {
    try {
      const customers = await api.getAllCustomers();
      setClientes(customers);
      const receivables = await api.getAllReceivables();
      setRecebiveis(receivables);
      const schedulings = await api.getAllSchedulingReceivables();
      setAgendamentos(schedulings);
    } catch (error) {
      toast.error("Ocorreu um erro ao buscar dados");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const abrirModal = (recebivel: Recebivel) => {
    setRecebivelSelecionado(recebivel);
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
      toast.success("Ocorreu um erro ao excluir o recebível");
    }
  };

  const excluirAgendamento = async (id: string) => {
    try {
      await api.deleteSchedulingReceivable(id);
      toast.success("Agendamento excluído com sucesso!");
      fetchData();
      fecharModal();
    } catch (error) {
      toast.success("Ocorreu um erro ao excluir o agendamento");
    }
  };

  const atualizarStatusRecebivel = async () => {
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <Tabs.Root defaultValue="dashboard">
          <Tabs.List className="flex border-b border-gray-200 mb-4">
            <Tabs.Trigger
              value="dashboard"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-t-md"
            >
              <Home size={18} /> Dashboard
            </Tabs.Trigger>
            <Tabs.Trigger
              value="gerar"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-t-md"
            >
              <User size={18} /> Gerar Recebível
            </Tabs.Trigger>
            <Tabs.Trigger
              value="agendamento"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-t-md"
            >
              <Calendar size={18} /> Agendar Recebível
            </Tabs.Trigger>
            <Tabs.Trigger
              value="visualizacao"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-t-md"
            >
              <List size={18} /> Visualização
            </Tabs.Trigger>
          </Tabs.List>

          {/* Dashboard */}
          <Tabs.Content value="dashboard" className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Dashboard</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Total de Recebíveis */}
              <div className="bg-blue-600 text-white rounded-lg shadow p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium">Total de Recebíveis</h3>
                  <p className="text-2xl font-bold mt-2">{recebiveis.length}</p>
                </div>
              </div>

              {/* Valor Total de Recebíveis */}
              <div className="bg-indigo-600 text-white rounded-lg shadow p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium">
                    Valor Total de Recebíveis
                  </h3>
                  <p className="text-2xl font-bold mt-2">
                    R${" "}
                    {recebiveis.reduce((acc, r) => acc + r.value, 0).toFixed(2)}
                  </p>
                </div>
              </div>
              {/* Total de Agendamentos */}
              <div className="bg-green-600 text-white rounded-lg shadow p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium">Total de Agendamentos</h3>
                  <p className="text-2xl font-bold mt-2">
                    {agendamentos.length}
                  </p>
                </div>
              </div>

              {/* Total de Recebíveis Pendentes */}
              <div className="bg-yellow-500 text-white rounded-lg shadow p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium">Recebíveis Pendentes</h3>
                  <p className="text-2xl font-bold mt-2">
                    {recebiveis.filter((r) => r.status === "pending").length}
                  </p>
                </div>
              </div>

              {/* Recebíveis Pagos */}
              <div className="bg-purple-600 text-white rounded-lg shadow p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium">Recebíveis Pagos</h3>
                  <p className="text-2xl font-bold mt-2">
                    {recebiveis.filter((r) => r.status === "paid").length}
                  </p>
                </div>
              </div>

              {/* Recebíveis Cancelados */}
              <div className="bg-red-600 text-white rounded-lg shadow p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium">Recebíveis Cancelados</h3>
                  <p className="text-2xl font-bold mt-2">
                    {recebiveis.filter((r) => r.status === "canceled").length}
                  </p>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* Gerar Recebível */}
          <Tabs.Content value="gerar" className="space-y-4">
            <h2 className="text-xl font-bold">Gerar Recebível</h2>
            <label className="block">
              Cliente:
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={clienteSelecionadoGerar}
                onChange={(e) => setClienteSelecionadoGerar(e.target.value)}
              >
                <option value="">-- Selecione --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.corporateName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              Tipo:
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={tipoGerar}
                onChange={(e) => setTipoGerar(e.target.value)}
              >
                {tiposRecebivel.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              Valor:
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={valorGerar}
                onChange={(e) => setValorGerar(Number(e.target.value))}
              />
            </label>

            <label className="block">
              Descrição:
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={descricaoGerar}
                onChange={(e) => setDescricaoGerar(e.target.value)}
              />
            </label>

            <label className="block">
              Observações:
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={observationsGerar}
                onChange={(e) => setObservationsGerar(e.target.value)}
              />
            </label>

            <label className="block">
              Attachment:
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={attachmentGerar}
                onChange={(e) => setAttachmentGerar(e.target.value)}
              />
            </label>

            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={gerarRecebivel}
            >
              Gerar
            </button>
          </Tabs.Content>

          {/* Agendamento */}
          <Tabs.Content value="agendamento" className="space-y-4">
            <h2 className="text-xl font-bold">Agendar Recebível</h2>

            <label className="block">
              Cliente:
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={clienteSelecionadoAgendar}
                onChange={(e) => setClienteSelecionadoAgendar(e.target.value)}
              >
                <option value="">-- Selecione --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.corporateName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              Tipo:
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={tipoAgendar}
                onChange={(e) => setTipoAgendar(e.target.value)}
              >
                {tiposRecebivel.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              Valor:
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={valorAgendar}
                onChange={(e) => setValorAgendar(Number(e.target.value))}
              />
            </label>

            <label className="block">
              Descrição:
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={descricaoAgendar}
                onChange={(e) => setDescricaoAgendar(e.target.value)}
              />
            </label>

            <label className="block">
              Observações:
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={observationsAgendar}
                onChange={(e) => setObservationsAgendar(e.target.value)}
              />
            </label>

            <label className="block">
              Attachment:
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={attachmentAgendar}
                onChange={(e) => setAttachmentAgendar(e.target.value)}
              />
            </label>

            <label className="block">
              Data de Emissão:
              <input
                type="date"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={dataAgendar}
                onChange={(e) => {
                  setDataAgendar(e.target.value);
                  const dia = Number(e.target.value.split("-")[2]);
                  setDataGerar(dia);
                }}
              />
            </label>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              onClick={agendarRecebivel}
            >
              Agendar
            </button>

            {/* Lista de Agendamentos */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Agendamentos</h3>
              {agendamentos.length === 0 && <p>Nenhum agendamento.</p>}
              {agendamentos.map((a, idx) => (
                <div
                  key={idx}
                  className="border p-2 rounded mb-2 flex justify-between items-center"
                >
                  <div>
                    <p>
                      <strong>Valor:</strong> {a.value}
                    </p>
                    <p>
                      <strong>Descrição:</strong> {a.description}
                    </p>
                    <p>
                      <strong>Data de Emissão:</strong> {a.billingDay}
                    </p>
                  </div>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => excluirAgendamento(a.id as string)}
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </Tabs.Content>

          {/* Visualização de Recebíveis */}
          <Tabs.Content value="visualizacao" className="space-y-4">
            <h2 className="text-xl font-bold">Recebíveis Gerados</h2>
            {recebiveis.length === 0 && <p>Nenhum recebível gerado.</p>}
            {recebiveis.map((r) => (
              <div
                key={r.id}
                className="border p-2 rounded mb-2 flex justify-between items-center"
              >
                <div>
                  <p>
                    <strong>Valor:</strong> {r.value}
                  </p>
                  <p>
                    <strong>Status:</strong> {r.status}
                  </p>
                </div>
                <button
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => {
                    abrirModal(r);
                  }}
                >
                  Gerenciar
                </button>
              </div>
            ))}
          </Tabs.Content>
        </Tabs.Root>

        {/* Modal */}
        {modalAberto && recebivelSelecionado && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                onClick={fecharModal}
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-bold mb-4">Gerenciar Recebível</h2>

              {/* Formulário do Cliente */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Informações do Cliente</h3>
                {clientes
                  .filter((c) => c.id === recebivelSelecionado.serviceRecipient)
                  .map((cliente) => (
                    <div key={cliente.id} className="space-y-2">
                      <label className="block">
                        Nome:
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={cliente.corporateName}
                          readOnly
                        />
                      </label>

                      <label className="block">
                        Email:
                        <input
                          type="email"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={cliente.email}
                          readOnly
                        />
                      </label>

                      <label className="block">
                        Documento:
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={`${cliente.document.type}: ${cliente.document.number}`}
                          readOnly
                        />
                      </label>

                      <label className="block">
                        Inscrição Municipal:
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={cliente.municipalRegistration}
                          readOnly
                        />
                      </label>

                      <label className="block">
                        Inscrição Estadual:
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={cliente.stateRegistration}
                          readOnly
                        />
                      </label>

                      <label className="block">
                        Endereço:
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={`${cliente.address.street}, ${cliente.address.number}, ${cliente.address.neighborhood}, ${cliente.address.city} - ${cliente.address.state}, CEP: ${cliente.address.zipCode}`}
                          readOnly
                        />
                      </label>

                      <label className="block">
                        Código Municipal:
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={cliente.address.municipalCode}
                          readOnly
                        />
                      </label>

                      <label className="block">
                        Contato:
                        <input
                          type="text"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                          value={`(${cliente.contact.areaCode}) ${cliente.contact.numberPhone}`}
                          readOnly
                        />
                      </label>
                    </div>
                  ))}
              </div>

              {/* Informações do Recebível */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Informações do Recebível</h3>
                <p>
                  <strong>Valor:</strong> {recebivelSelecionado.value}
                </p>
                <p>
                  <strong>Tipo:</strong> {recebivelSelecionado.type}
                </p>
                <p>
                  <strong>Descrição:</strong> {recebivelSelecionado.description}
                </p>
                <p>
                  <strong>Status:</strong> {recebivelSelecionado.status}
                </p>
                <p>
                  <strong>Observações:</strong>{" "}
                  {recebivelSelecionado.observations || "-"}
                </p>
                <p>
                  <strong>Attachment:</strong>{" "}
                  {recebivelSelecionado.attachment || "-"}
                </p>

                {/* Atualizar Status */}
                <div className="mt-4 flex items-center gap-2">
                  <select
                    className="border border-gray-300 rounded-md p-2"
                    value={statusAtual}
                    onChange={(e) => setStatusAtual(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="canceled">Canceled</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <button
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={atualizarStatusRecebivel}
                  >
                    Atualizar
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  onClick={fecharModal}
                >
                  Fechar
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => excluirRecebivel(recebivelSelecionado.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

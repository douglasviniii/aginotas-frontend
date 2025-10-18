import { useEffect, useState } from "react";
import { User } from "./types";
import { Edit } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { LogoLoading } from "../components/Loading";
import ModalUser from "./ModalUsers";

export function AdminUsers() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const customers = await api.getAllUsers();
      customers.sort((a, b) => {
        const nameA = (a.name || a.corporateName || "").toLowerCase();
        const nameB = (b.name || b.corporateName || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setCustomers(customers);
      setLoading(false);
    } catch (error) {
      toast.error("Ocorreu um erro ao buscar dados");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.corporateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.enterprise.document.number.includes(searchTerm)
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  const handleOpenModal = (customer: User) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(false);
  };

  const handleUpdateCustomer = async (customer: User) => {
    handleCloseModal();
    try {
      setLoading(true);
      await api.updateUserById(customer.id, customer);
      fetchData();
      setLoading(false);
    } catch (error) {
      toast.error("Ocorreu um erro ao atualizar cliente");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      const confirmDelete = window.confirm(
        "Tem certeza que deseja excluir este cliente?"
      );
      if (confirmDelete) {
        setLoading(true);
        handleCloseModal();
        await api.deleteCustomer(id);
        fetchData();
        setLoading(false);
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao atualizar cliente");
    }
  };

  const handleGenerateInvoice = async (data: any) => {
    try {
      setLoading(true);
      setMessage("");
      const response = await api.generateInvoice(data);
      setLoading(false);
      setMessage(response.message);
      toast.error(response.message);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erro ao gerar nota fiscal";
      setLoading(false);
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleScheduleInvoice = async (data: any) => {
    try {
      setLoading(true);
      await api.scheduleInvoice(data);
      setLoading(false);
      toast.success("Agendamento de emissão criado com sucesso!");
    } catch (error) {
      toast.error("Ocorreu um erro ao agendar emissão da nota fiscal");
    }
  };

  if (loading) return <LogoLoading size={100} text="Carregando..." />;

  return (
    <div className="space-y-6">
      {/* Título e filtro */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Clientes</h1>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar por CNPJ ou nome..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Lista de clientes - desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-4 px-6 text-left text-sm font-semibold">
                  Nome
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold">
                  CNPJ/CPF
                </th>
                <th className="py-4 px-6 text-center text-sm font-semibold">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-10 text-center text-gray-400 text-sm"
                  >
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.enterprise.document.number}
                    className="border-t border-gray-200 hover:bg-blue-50 transition"
                  >
                    <td className="py-4 px-6 text-gray-900 font-medium text-sm">
                      {customer.corporateName || customer.name}
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">
                      {customer.enterprise.document.number}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleOpenModal(customer)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-medium mx-auto"
                      >
                        <Edit className="w-4 h-4" /> Gerenciar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Mobile - cards */}
        <div className="md:hidden grid grid-cols-1 gap-4 p-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.enterprise.document.number}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-gray-900 font-semibold text-base">
                    {customer.corporateName || customer.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {customer.enterprise.document.number}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenModal(customer)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-1 text-sm font-medium"
                >
                  <Edit className="w-4 h-4" /> Gerenciar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedCustomer && (
        <ModalUser
          selectedCustomer={selectedCustomer}
          handleCloseModal={handleCloseModal}
          handleUpdateCustomer={handleUpdateCustomer}
          handleDeleteCustomer={handleDeleteCustomer}
          handleGenerateInvoice={handleGenerateInvoice}
          handleScheduleInvoice={handleScheduleInvoice}
        />
      )}
    </div>
  );
}

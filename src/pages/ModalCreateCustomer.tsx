import { useState } from "react";
import { CustomerType } from "./types";
const API_URL = import.meta.env.VITE_API_URL;

interface ModalCreateCustomerProps {
  handleCloseCreateModal: () => void;
  handleCreateCustomer: (newCustomer: CustomerType) => void;
}

export function ModalCreateCustomer({
  handleCloseCreateModal,
  handleCreateCustomer,
}: ModalCreateCustomerProps) {
  const [newCustomer, setNewCustomer] = useState<CustomerType>({
    id: "",
    corporateName: "",
    email: "",
    document: {
      type: "CNPJ",
      number: "",
    },
    municipalRegistration: "",
    stateRegistration: "",
    address: {
      street: "",
      neighborhood: "",
      number: "",
      city: "",
      state: "",
      zipCode: "",
      municipalCode: "",
    },
    contact: {
      areaCode: "",
      numberPhone: "",
    },
  });

  const handleSubmit = () => {
    handleCreateCustomer(newCustomer);
  };

  const fetchCNPJData = async (cnpjNumber: string) => {
    try {
      const cleanCNPJ = cnpjNumber.replace(/\D/g, "");

      if (cleanCNPJ.length !== 14) {
        alert("CNPJ deve ter 14 dígitos");
        return;
      }

      const response = await fetch(
        `${API_URL}/user/receitaws/${cleanCNPJ}`
      );

      if (!response.ok) {
        throw new Error("Erro ao consultar a API");
      }

      const data = await response.json();

      if (data.status === "ERROR" || data.message) {
        throw new Error(data.message || "CNPJ não encontrado");
      }

      setNewCustomer((prev) => ({
        ...prev,
        corporateName: data.nome || "",
        email: data.email || "",
        document: {
          ...prev.document,
          number: cnpjNumber,
        },
        municipalRegistration: data.municipalRegistration || "",
        stateRegistration:
          data.estabelecimento?.inscricoes_estaduais?.[0]?.inscricao_estadual ||
          "",
        address: {
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          number: data.numero || "",
          city: data.municipio || "",
          state: data.uf || "",
          zipCode: data.cep
            ? data.cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")
            : "",
          municipalCode: data.municipalCode || "",
        },
        contact: {
          areaCode: data.telefone ? data.telefone.substring(0, 2) : "",
          numberPhone: data.telefone ? data.telefone.substring(2) : "",
        },
      }));
    } catch (error) {
      console.error("Erro ao buscar dados do CNPJ:", error);
      alert("Não foi possível buscar os dados do CNPJ. Preencha manualmente.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-lg">
        {/* Topo */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Criar Cliente</h2>
          <button
            onClick={handleCloseCreateModal}
            className="text-gray-500 hover:text-gray-800 font-bold text-xl"
          >
            ×
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome*
            </label>
            <input
              required
              type="text"
              value={newCustomer.corporateName}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  corporateName: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email*
            </label>
            <input
              required
              type="email"
              value={newCustomer.email}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Documento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tipo (CNPJ ou CPF)*
              </label>
              <select
                required
                value={newCustomer.document.type}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    document: { ...newCustomer.document, type: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="CNPJ">CNPJ</option>
                <option value="CPF">CPF</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Número*
              </label>
              <div className="flex gap-2">
                <input
                  required
                  type="text"
                  value={newCustomer.document.number}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewCustomer({
                      ...newCustomer,
                      document: {
                        ...newCustomer.document,
                        number: value,
                      },
                    });

                    // Busca automática quando o CNPJ atinge 14 dígitos
                    if (
                      newCustomer.document.type === "CNPJ" &&
                      value.replace(/\D/g, "").length === 14
                    ) {
                      fetchCNPJData(value);
                    }
                  }}
                  onBlur={() => {
                    if (
                      newCustomer.document.type === "CNPJ" &&
                      newCustomer.document.number
                    ) {
                      fetchCNPJData(newCustomer.document.number);
                    }
                  }}
                  placeholder={
                    newCustomer.document.type === "CNPJ"
                      ? "00.000.000/0000-00"
                      : "000.000.000-00"
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                {newCustomer.document.type === "CNPJ" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (newCustomer.document.number) {
                        fetchCNPJData(newCustomer.document.number);
                      }
                    }}
                    disabled={
                      !newCustomer.document.number ||
                      newCustomer.document.number.replace(/\D/g, "").length !==
                        14
                    }
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Buscar CNPJ
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Inscrições */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Inscrição Municipal
              </label>
              <input
                type="text"
                value={newCustomer.municipalRegistration}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
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
                value={newCustomer.stateRegistration}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    stateRegistration: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Endereço*</h3>
            <input
              required
              type="text"
              placeholder="Rua"
              value={newCustomer.address.street}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  address: { ...newCustomer.address, street: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              required
              type="text"
              placeholder="Bairro"
              value={newCustomer.address.neighborhood}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  address: {
                    ...newCustomer.address,
                    neighborhood: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              required
              type="text"
              placeholder="Número"
              value={newCustomer.address.number}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  address: { ...newCustomer.address, number: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              required
              type="text"
              placeholder="Cidade"
              value={newCustomer.address.city}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  address: { ...newCustomer.address, city: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              required
              type="text"
              placeholder="Estado"
              value={newCustomer.address.state}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  address: { ...newCustomer.address, state: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              required
              type="text"
              placeholder="CEP"
              value={newCustomer.address.zipCode}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  address: { ...newCustomer.address, zipCode: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              required
              type="text"
              placeholder="Código Municipal"
              value={newCustomer.address.municipalCode}
              onChange={(e) =>
                setNewCustomer({
                  ...newCustomer,
                  address: {
                    ...newCustomer.address,
                    municipalCode: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Contato */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                DDD*
              </label>
              <input
                required
                type="text"
                value={newCustomer.contact.areaCode}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    contact: {
                      ...newCustomer.contact,
                      areaCode: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Telefone*
              </label>
              <input
                required
                type="text"
                value={newCustomer.contact.numberPhone}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    contact: {
                      ...newCustomer.contact,
                      numberPhone: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Botão */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}

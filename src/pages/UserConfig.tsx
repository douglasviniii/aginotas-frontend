import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { User } from "./types";
import { LogoLoading } from "../components/Loading";

export function UserConfig() {
  const [user, setUser] = useState<User>();
  const [file, setFile] = useState<File>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem("user");
      if (!stored) throw new Error("Usuário não encontrado");
      const parsed = JSON.parse(stored);
      const responseUser = await api.getUserById();
      setUser(responseUser);
      setLoading(false);
    } catch (err) {
      toast.error("Erro ao carregar usuário.");
    }
  };

  const handleChange = (path: string, value: any) => {
    setUser((prev: any) => {
      const updated = { ...prev };
      const keys = path.split(".");
      let current = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast.error("Apenas JPG ou PNG são permitidos.");
      e.target.value = "";
      return;
    }
    setFile(file);
  };

  const handleSave = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      await api.updateUser(user, file);
      toast.success("Configurações salvas com sucesso!");
      loadUser();
      setLoading(false);
    } catch (err) {
      toast.error("Erro ao salvar configurações.");
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

  if (!user) return null;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-10">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="flex-shrink-0">
            {user.enterprise.logoEnterprise ? (
              <img
                src={user.enterprise.logoEnterprise}
                alt="Logo Empresa"
                className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-100 border-4 border-blue-500 flex items-center justify-center text-2xl text-blue-500 font-bold shadow-lg">
                {user.name ? user.name[0] : "U"}
              </div>
            )}
          </div>
          <div className="ml-6 flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700 leading-tight">
              Configurações de Usuário
            </h1>
            <p className="text-gray-500 text-lg truncate">{user.name}</p>
          </div>
        </div>

        {/* Upload logo */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Alterar Logo da Empresa
          </label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleLogoUpload}
            className="w-full p-2 border border-gray-300 rounded-md bg-blue-50 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Informações de contato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              DDD
            </label>
            <input
              type="text"
              value={user.contact.areaCode}
              onChange={(e) => handleChange("contact.areaCode", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Telefone
            </label>
            <input
              type="text"
              value={user.contact.numberPhone}
              onChange={(e) =>
                handleChange("contact.numberPhone", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Rua
            </label>
            <input
              type="text"
              value={user.address.street}
              onChange={(e) => handleChange("address.street", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Número
            </label>
            <input
              type="text"
              value={user.address.number}
              onChange={(e) => handleChange("address.number", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Bairro
            </label>
            <input
              type="text"
              value={user.address.neighborhood}
              onChange={(e) =>
                handleChange("address.neighborhood", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Cidade
            </label>
            <input
              type="text"
              value={user.address.city}
              onChange={(e) => handleChange("address.city", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Estado
            </label>
            <input
              type="text"
              value={user.address.state}
              onChange={(e) => handleChange("address.state", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              CEP
            </label>
            <input
              type="text"
              value={user.address.zipCode}
              onChange={(e) => handleChange("address.zipCode", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
        </div>

        {/* Dados da empresa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Documento
            </label>
            <input
              type="text"
              value={user.enterprise.document.number}
              onChange={(e) =>
                handleChange("enterprise.document.number", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Tipo Documento
            </label>
            <input
              type="text"
              value={user.enterprise.document.type}
              onChange={(e) =>
                handleChange("enterprise.document.type", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Senha WebService
            </label>
            <input
              type="text"
              value={user.enterprise.passwordWebserviceInvoice}
              onChange={(e) =>
                handleChange(
                  "enterprise.passwordWebserviceInvoice",
                  e.target.value
                )
              }
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Homologação
            </label>
            <select
              value={user.enterprise.homologation}
              onChange={(e) =>
                handleChange("enterprise.homologation", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Inscrição Municipal
            </label>
            <input
              type="text"
              value={user.enterprise.municipalRegistration}
              onChange={(e) =>
                handleChange("enterprise.municipalRegistration", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Inscrição Estadual
            </label>
            <input
              type="text"
              value={user.enterprise.stateRegistration}
              onChange={(e) =>
                handleChange("enterprise.stateRegistration", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Receita Bruta acumulada Rtb12
            </label>
            <input
              type="text"
              value={formatarInputReais(
                Number(user.enterprise.accumulatedGrossRevenueRtb12)
              )}
              onChange={(e) => {
                const valorLimpo = e.target.value.replace(/\D/g, "");
                const numero = Number(valorLimpo) / 100;
                handleChange(
                  "enterprise.accumulatedGrossRevenueRtb12",
                  isNaN(numero) ? 0 : numero
                );
              }}
              className="w-full p-3 border border-gray-300 rounded-md bg-blue-50"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            FAIXA: {user.enterprise.annexToTheSimpleNationalSystem}
          </label>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Aliquotas %
          </label>
          <p>Aliquota: {(user.enterprise.aliquot * 100).toFixed(2)}%</p>
          <p>Iss: {(user.enterprise.Iss.Aliquot * 100).toFixed(2)}%</p>
          <p>Cofins: {(user.enterprise.Cofins.Aliquot * 100).toFixed(2)}%</p>
          <p>IR: {(user.enterprise.IR.Aliquot * 100).toFixed(2)}%</p>
          <p>PIS: {(user.enterprise.PIS.Aliquot * 100).toFixed(2)}%</p>
          <p>CSLL: {(user.enterprise.CSLL.Aliquot * 100).toFixed(2)}%</p>
          <p>CPP: {(user.enterprise.CPP.Aliquot * 100).toFixed(2)}%</p>
        </div>
        {/* Botão salvar */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold shadow-md hover:from-blue-700 hover:to-blue-600 transition text-lg"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}

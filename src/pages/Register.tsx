import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Receipt } from "lucide-react";
import { api } from "../lib/api.ts";
import nomelogodelvind from "../public/logodelvind.png";
import { toast } from "sonner";
const API_URL = import.meta.env.VITE_API_URL;

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [numberPhone, setNumberPhone] = useState("");
  const [street, setStreet] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [number, setNumber] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [accumulatedGrossRevenueRtb12, setAccumulatedGrossRevenueRtb12] =
    useState(0);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function cleanCNPJ(cnpj: string): string {
    return cnpj.replace(/\D/g, "");
  }

  const isStep1Valid = () => {
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      password !== confirmPassword
    )
      return false;
    if (
      !areaCode ||
      !numberPhone ||
      !street ||
      !neighborhood ||
      !number ||
      !city ||
      !state ||
      !zipCode
    )
      return false;
    if (!cnpj || !accumulatedGrossRevenueRtb12) return false;
    return true;
  };

  const fetchCNPJData = async (cnpjValue: string) => {
    const cleanCnpj = cnpjValue.replace(/\D/g, "");

    if (cleanCnpj.length !== 14) return;

    try {
      const response = await fetch(`${API_URL}/user/receitaws/${cleanCnpj}`);
      const data = await response.json();

      if (data.status === "OK") {
        setName(data.nome || "");
        setEmail(data.email || "");

        // Endereço
        setStreet(data.logradouro || "");
        setNumber(data.numero || "");
        setNeighborhood(data.bairro || "");
        setCity(data.municipio || "");
        setState(data.uf || "");
        setZipCode(data.cep || "");

        // Telefone
        if (data.telefone) {
          const phone = data.telefone.replace(/\D/g, "");
          if (phone.length >= 10) {
            setAreaCode(phone.substring(0, 2));
            setNumberPhone(phone.substring(2));
          }
        }
      } else {
        console.error("Erro ao buscar CNPJ:", data.message);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  useEffect(() => {
    if (cnpj.length === 18 || cnpj.replace(/\D/g, "").length === 14) {
      const timer = setTimeout(() => {
        fetchCNPJData(cnpj);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [cnpj]);

  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    }

    return value;
  };

  const handleCnpjChange = (e) => {
    const formattedValue = formatCNPJ(e.target.value);
    setCnpj(formattedValue);
  };

  const handleStep1Submit = async () => {
    if (!isStep1Valid()) {
      toast.error("Preencha todos os campos corretamente.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let dataReceitaWs;
      try {
        dataReceitaWs = await api.receitaWs(cleanCNPJ(cnpj));
        if (!dataReceitaWs?.atividade_principal) {
          throw new Error("Dados da Receita WS incompletos ou inválidos");
        }
      } catch (receitaError: any) {
        throw new Error(
          `Falha ao consultar CNPJ: ${
            receitaError.message || "Tente novamente"
          }`
        );
      }
      const economicActivity = [
        ...(dataReceitaWs.atividade_principal || []).map((item: any) => ({
          code: item.code,
          description: item.text,
        })),
        ...(dataReceitaWs.atividades_secundarias || []).map((item: any) => ({
          code: item.code,
          description: item.text,
        })),
      ];

      if (economicActivity.length === 0) {
        throw new Error("Nenhuma atividade econômica encontrada para o CNPJ");
      }

      const userData = {
        name,
        email,
        password,
        contact: { areaCode, numberPhone },
        address: {
          street,
          neighborhood,
          number,
          city,
          state,
          zipCode,
        },
        enterprise: {
          document: { type: "CNPJ", number: cnpj },
          accumulatedGrossRevenueRtb12: Number(accumulatedGrossRevenueRtb12),
          economicActivity,
        },
      };

      let user;
      try {
        user = await api.create_user(userData);

        if (!user?.id) {
          throw new Error("Resposta inválida ao criar usuário");
        }
      } catch (userError: any) {
        if (
          userError.message?.includes("email") ||
          userError.message?.includes("Email")
        ) {
          throw new Error("Este email já está em uso. Tente outro.");
        }
        throw new Error(
          `Falha ao criar usuário: ${userError.message || "Tente novamente"}`
        );
      }

      const priceId = localStorage.getItem("selectedPlanId");

      if (!priceId) {
        throw new Error(
          "Plano selecionado não encontrado. Por favor, selecione um plano novamente."
        );
      }

      let checkoutResponse;
      try {
        checkoutResponse = await api.create_checkout({
          id: user.id,
          email: user.email,
          priceId: priceId,
        });

        if (!checkoutResponse?.url) {
          throw new Error("URL de checkout não gerada");
        }
      } catch (checkoutError: any) {
        throw new Error(
          `Falha ao gerar checkout: ${
            checkoutError.message || "Tente novamente"
          }`
        );
      }

      localStorage.removeItem("selectedPlanId");
      window.location.href = checkoutResponse.url;
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao processar solicitação";

      setError(errorMessage);
      toast.error(errorMessage);

      if (process.env.NODE_ENV === "development") {
        console.error("Erro no handleStep1Submit:", err);
      }
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="bg-gray-800 shadow-2xl rounded-3xl p-10 w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <img
            src={nomelogodelvind}
            alt="Logo"
            className="h-24 w-32 object-contain mb-4"
          />
          <h1 className="text-2xl font-bold text-white text-center">
            {step === 1 ? "Crie sua conta" : "Finalize com o Checkout"}
          </h1>
        </div>

        {error && (
          <div className="bg-red-600 bg-opacity-20 text-red-600 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {step === 1 && (
          <form className="space-y-4">
            <input
              placeholder="CNPJ"
              value={cnpj}
              onChange={handleCnpjChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-3">
              <input
                placeholder="DDD"
                value={areaCode}
                onChange={(e) => setAreaCode(e.target.value)}
                className="w-20 px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Telefone"
                value={numberPhone}
                onChange={(e) => setNumberPhone(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <input
              placeholder="Rua"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Bairro"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Número"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Cidade"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="Estado"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="CEP"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-white text-sm mb-1 block">
              Informe a sua Receita Bruta Acumulada dos últimos 12 meses (RTB12)
            </span>
            <input
              placeholder="Receita bruta acumulada"
              type="text"
              value={formatarInputReais(accumulatedGrossRevenueRtb12)}
              onChange={(e) => {
                const valorDigitado = e.target.value;
                const apenasDigitos = valorDigitado.replace(/\D/g, "");
                const valorNumerico = apenasDigitos
                  ? Number(apenasDigitos) / 100
                  : 0;
                setAccumulatedGrossRevenueRtb12(valorNumerico);
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={handleStep1Submit}
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "Avançar"
              )}
            </button>
          </form>
        )}
        <div className="mt-6 text-center text-gray-400">
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-500 transition-colors"
          >
            Já tem uma conta? Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}

import Cookies from "js-cookie";
import React, { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { HiOutlineQuestionMarkCircle, HiEye, HiEyeOff } from "react-icons/hi";
import { usePopper } from "react-popper";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ApiUrl = import.meta.env.VITE_API_URL;

export function UserConfig() {
  const [user, setUser] = useState("");
  const [senhaElotech, setSenhaElotech] = useState("");
  const [homologacao, setHomologacao] = useState('');
  const [regimeEspecialTributacao, setRegimeEspecialTributacao] = useState(0);//valores padrões 
  const [incentivoFiscal, setIncentivoFiscal] = useState(0); //valores padrões 
  const [showPopover, setShowPopover] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const referenceRef = useRef(null);
  const popperRef = useRef(null);
  const [base64Image, setBase64Image] = useState("");

  const [anexo, setAnexo] = useState("Anexo III");
  const [receitaBruta12Meses, setReceitaBruta12Meses] = useState(0);
  const [receitaMes, setReceitaMes] = useState(0);
  const [resultado, setResultado] = useState(null);

  const navigate = useNavigate();
  
  const { styles, attributes } = usePopper(referenceRef.current, popperRef.current, {
    placement: "bottom",
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        referenceRef.current &&
        popperRef.current &&
        !referenceRef.current.contains(event.target) &&
        !popperRef.current.contains(event.target)
      ) {
        setShowPopover(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [referenceRef, popperRef]);

  
  const loadUserSettings = async () => {
    const user = localStorage.getItem("user");
    if (!user) throw new Error("Usuário não encontrado");
    const userConvertido = JSON.parse(user);

    let verify = '';
    if(userConvertido.homologa === true){
      verify = 'Sim';
    }else{
      verify = 'Não';
    }
    setUser(userConvertido);
    setHomologacao(verify);
    setSenhaElotech(userConvertido.senhaelotech);
    setRegimeEspecialTributacao(userConvertido.RegimeEspecialTributacao);
    setIncentivoFiscal(userConvertido.IncentivoFiscal); //
  };

  const handleSaveSettings = async () => {
    try {
      let verify = false;

      if(homologacao === 'Sim'){
        verify = true;
      }else{
        verify = false;
      }

      const updatedSettings = {
        homologa: verify,
        senhaelotech: senhaElotech,        
        RegimeEspecialTributacao: regimeEspecialTributacao,
        IncentivoFiscal: incentivoFiscal,
      };

      await api.update_user(updatedSettings);
      loadUserSettings();
      navigate('/login');
      console.log("Configurações salvas com sucesso");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    }
  };

  const handleImageUpload = (e:any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setBase64Image(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateUser = async () => {
    try {
      await api.update_user({picture:base64Image});
      toast.success("Imagem atualizada com sucesso!");
      navigate('/login');
    } catch (error) {
      toast.error("Ocorreu um erro ao realizar essa atualização!");
      return;
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-10 relative">
      <div className="flex items-center mb-8">
        <div className="flex-shrink-0">
        {user && user.picture ? (
          <img
          src={user.picture}
          alt="User"
          className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-lg object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-100 border-4 border-blue-500 flex items-center justify-center text-3xl text-blue-500 font-bold shadow-lg">
          {user && user.nome ? user.nome[0] : "U"}
          </div>
        )}
        </div>
        <div className="ml-6 flex-1 min-w-0">
        <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700 mb-1 leading-tight break-words">
          Configurações{/* &nbsp;de&nbsp;Usuário */}
        </h1>
        <p className="text-gray-500 text-lg truncate">{user && user.nome}</p>
        <p className="text-gray-400 text-sm truncate">{user && user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">Alterar Foto</label>
        <input
          type="file"
          accept="image/jpeg,image/jpg"
          className="w-full p-2 border border-gray-300 rounded-md bg-blue-50 focus:ring-2 focus:ring-blue-400"
          onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && !["image/jpeg", "image/jpg"].includes(file.type)) {
            toast.error("Apenas arquivos JPG são permitidos.");
            e.target.value = "";
            return;
          }
          handleImageUpload(e);
          }}
        />
        {base64Image && (
          <div className="mt-4 flex flex-col items-center">
          <img
            src={base64Image as string}
            alt="Preview"
            className="max-h-32 rounded border mb-2"
          />
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            onClick={handleUpdateUser}
          >
            Enviar imagem
          </button>
          </div>
        )}
        </div>
        <div className="bg-blue-50 rounded-xl p-4 flex flex-col gap-2">
        <span className="text-blue-700 font-semibold">Informações da Empresa</span>
        <div className="text-gray-700 text-sm">
          <div><span className="font-bold">CNPJ:</span> {user?.cnpj || "-"}</div>
          <div><span className="font-bold">Inscrição Municipal:</span> {user?.inscricaoMunicipal || "-"}</div>
          <div><span className="font-bold">Número do Lote:</span> {user?.numeroLote || "-"}</div>
          <div><span className="font-bold">Identificação RPS:</span> {user?.identificacaoRpsnumero || "-"}</div>
          <div><span className="font-bold">Estado:</span> {user?.estado || "-"}</div>
          <div><span className="font-bold">Cidade:</span> {user?.cidade || "-"}</div>
          <div><span className="font-bold">Criado em:</span> {user?.date_created ? new Date(user.date_created).toLocaleDateString() : "-"}</div>
        </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">Senha Elotech</label>
        <div className="relative">
          <input
          type={showPassword ? "text" : "password"}
          className="w-full p-3 border border-gray-300 rounded-md bg-blue-50 focus:ring-2 focus:ring-blue-400"
          value={senhaElotech}
          onChange={(e) => setSenhaElotech(e.target.value)}
          />
          <button
          type="button"
          className="absolute inset-y-0 right-3 flex items-center text-blue-500"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
          >
          {showPassword ? <HiEyeOff size={22} /> : <HiEye size={22} />}
          </button>
        </div>
        </div>
        <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center">
          Homologação
          <button
          ref={referenceRef}
          className="ml-2 text-blue-400 hover:text-blue-600"
          onClick={() => setShowPopover(!showPopover)}
          type="button"
          tabIndex={-1}
          >
          <HiOutlineQuestionMarkCircle size={18} />
          </button>
        </label>
        <select
          className="w-full p-3 border border-gray-300 rounded-md bg-blue-50 focus:ring-2 focus:ring-blue-400"
          value={homologacao}
          onChange={(e) => setHomologacao(e.target.value)}
        >
          <option value="Sim">Sim</option>
          <option value="Não">Não</option>
        </select>
        {showPopover && (
          <div
          ref={popperRef}
          style={styles.popper}
          {...attributes.popper}
          className="z-20 bg-white border border-blue-200 rounded-md p-3 shadow-lg mt-2 text-sm text-gray-700"
          >
          <p>
            <strong>Sim:</strong> Modo de teste.
          </p>
          <p>
            <strong>Não:</strong> Modo real.
          </p>
          </div>
        )}
        </div>
        <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">Regime Especial de Tributação</label>
        <input
          type="number"
          className="w-full p-3 border border-gray-300 rounded-md bg-blue-50 focus:ring-2 focus:ring-blue-400"
          value={regimeEspecialTributacao}
          onChange={(e) => setRegimeEspecialTributacao(parseInt(e.target.value, 10))}
        />
        </div>
        <div>
        <label className="block text-sm font-semibold text-gray-600 mb-1">Incentivo Fiscal</label>
        <input
          type="number"
          className="w-full p-3 border border-gray-300 rounded-md bg-blue-50 focus:ring-2 focus:ring-blue-400"
          value={incentivoFiscal}
          onChange={(e) => setIncentivoFiscal(parseInt(e.target.value, 10))}
        />
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button
        onClick={handleSaveSettings}
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold shadow-md hover:from-blue-700 hover:to-blue-600 transition text-lg"
        >
        Salvar Configurações
        </button>
      </div>
      </div>
    </div>
  );
}
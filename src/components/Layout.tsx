import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import nomelogodelvind from "../public/logodelvindlayout.svg";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogOut,
  ShieldCheck,
  UserCog,
  MessageSquare,
  MessageCircleCode,
  Menu,
  X,
  Settings,
  User2,
  NotepadText,
} from "lucide-react";
import Cookies from "js-cookie";
import { api } from "../lib/api";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({
    sub: "",
    email: "",
    role: "",
    name: "",
    subscriptionId: "",
  });
  const [subscriptionData, setSubscriptionData] = useState({
    items: {
      data: [
        {
          price: {
            product: {
              name: "",
            },
          },
        },
      ],
    },
  });
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const isMobile = windowSize.width < 1024;

  useEffect(() => {
    const userLocalStorage = localStorage.getItem("user");
    if (userLocalStorage) {
      try {
        const userObj = JSON.parse(userLocalStorage);
        setUserData(userObj);
      } catch (error) {
        console.error("Erro ao parsear usuário do localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (userData.subscriptionId) {
      handleGetSubscription(userData.subscriptionId);
    }
  }, [userData.subscriptionId]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function handleGetSubscription(id: string) {
    if (!id) return;
    try {
      const data = await api.getSubscriptionById(id);
      setSubscriptionData(data);
    } catch (error) {
      console.error("Erro ao buscar assinatura:", error);
    }
  }

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.clear();
    navigate("/");
  };

  const planNavItems = {
    "Plano Bronze": [
      { icon: User2, label: `Olá, ${userData.name}. Seja bem vindo!🥉` },
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: NotepadText, label: "Financeiro", path: "/financial" },
      { icon: Users, label: "Clientes", path: "/customers" },
      { icon: MessageSquare, label: "Chat com Suporte", path: "/chat" },
      { icon: CreditCard, label: "Assinaturas", path: "/subscriptions" },
      { icon: Settings, label: "Configurações", path: "/UserConfig" },
    ],
    "Plano Prata": [
      { icon: User2, label: `Olá, ${userData.name}. Seja bem vindo!🥈` },
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: Users, label: "Clientes", path: "/customers" },
      { icon: MessageSquare, label: "Chat com Suporte", path: "/chat" },
      { icon: CreditCard, label: "Assinaturas", path: "/subscriptions" },
      { icon: Settings, label: "Configurações", path: "/UserConfig" },
    ],
    "Plano Ouro": [
      { icon: User2, label: `Olá, ${userData.name}. Seja bem vindo!🥇` },
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: NotepadText, label: "Financeiro", path: "/financial" },
      { icon: Users, label: "Clientes", path: "/customers" },
      { icon: MessageSquare, label: "Chat com Suporte", path: "/chat" },
      { icon: CreditCard, label: "Assinaturas", path: "/subscriptions" },
      { icon: Settings, label: "Configurações", path: "/UserConfig" },
    ],
    "Plano Diamante": [
      { icon: User2, label: `Olá, ${userData.name}. Seja bem vindo!💎` },
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: NotepadText, label: "Financeiro", path: "/financial" },
      { icon: Users, label: "Clientes", path: "/customers" },
      { icon: MessageSquare, label: "Chat com Suporte", path: "/chat" },
      { icon: CreditCard, label: "Assinaturas", path: "/subscriptions" },
      { icon: Settings, label: "Configurações", path: "/UserConfig" },
    ],
  };

  const allowedStatuses = ["active", "past_due", "trialing"];
  const hasValidSubscription = allowedStatuses.includes(
    subscriptionData?.status
  );
  const hasAnySubscription = subscriptionData && subscriptionData.status;
  const planName = subscriptionData?.items?.data?.[0]?.price?.product?.name;

  let navItems;

  if (!hasAnySubscription && userData.role !== "admin") {
    // Usuário SEM NENHUMA assinatura - mostra apenas Dashboard
    navItems = [
      { icon: User2, label: `Olá, ${userData.name}. Seja bem vindo!` },
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: NotepadText, label: "Financeiro", path: "/financial" },
    ];
  } else if (!hasAnySubscription && userData.role === "admin") {
    // Acesso para Administrador
    navItems = [
      { icon: User2, label: `Olá, ${userData.name}. Seja bem vindo!` },
      { icon: MessageSquare, label: "Chat com Suporte", path: "/chat" },
      { icon: Settings, label: "Configurações", path: "/UserConfig" },
    ];
  } else if (!hasValidSubscription) {
    // Usuário TEM assinatura mas NÃO é válida - mostra Dashboard + Assinaturas
    navItems = [
      { icon: User2, label: `Olá, ${userData.name}. Seja bem vindo!` },
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: CreditCard, label: "Assinaturas", path: "/subscriptions" },
    ];
  } else {
    // Usuário TEM assinatura VÁLIDA - mostra todas as abas do plano
    navItems = planNavItems[planName] || [
      { icon: User2, label: `Olá, ${userData.name}. Seja bem vindo!` },
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    ];
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Botão de menu para mobile */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded shadow-md text-gray-600"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {isDropdownOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      )}

      {/* Navegação lateral */}
      <nav
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 p-4 flex flex-col overflow-y-auto transition-transform duration-300 scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent ${
          isMobile
            ? isDropdownOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "transparent transparent",
        }}
      >
        <div className="flex items-center gap-2 mb-8">
          <img
            src={nomelogodelvind}
            alt="Nome Logo Delvind"
            className="max-h-[150px] px-8 object-contain"
          />
        </div>

        {/* Espaço para os itens de navegação crescerem e empurrar o botão sair para baixo */}
        <div
          className="space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "transparent transparent",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return item.path ? (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => isMobile && setIsDropdownOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ) : (
              <div
                key={item.label}
                className="flex items-center gap-3 px-4 py-2 text-gray-400 cursor-default"
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-6 text-xs text-gray-400 text-center">
          Sistema versão 1.0.0
        </div>

        <button
          className="mt-4 flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </nav>

      {/* Conteúdo principal */}
      <main
        className={`p-8 flex-1 min-w-0 overflow-auto transition-all duration-300 ${
          isMobile ? "ml-0" : "ml-64"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}

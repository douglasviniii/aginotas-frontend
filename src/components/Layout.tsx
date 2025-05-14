import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import nomelogodelvind from '../public/logodelvindlayout.svg';
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
  NotepadText
} from 'lucide-react';
import Cookies from 'js-cookie';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('Usuário');

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const isMobile = windowSize.width < 1024;

  useEffect(() => {
    const adminToken = Cookies.get('admin_token');
    setIsAdmin(!!adminToken);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    navigate('/');
    Cookies.remove('token');
    Cookies.remove('admin_token');
    localStorage.clear();
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.name || 'Usuário');
    }
  }, []);

  const navItems = [
    ...(isAdmin
      ? [
          { icon: ShieldCheck, label: 'Admin Dashboard', path: '/admin/dashboard' },
          { icon: UserCog, label: 'Admin Users', path: '/admin/users' },
          { icon: MessageCircleCode, label: 'Admin Reports', path: '/admin/reports' },
          { icon: Settings, label: 'Admin Subscriptions', path: '/admin/subscriptions' },
          { icon: Settings, label: 'Configurações', path: '/AdminConfig' },
        ]
      : [
          { icon: User2, label: `Olá, ${userName}. Seja bem vindo!` },
          { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
          { icon: NotepadText, label: 'Financeiro', path: '/financial' },
          { icon: Users, label: 'Clientes', path: '/customers' },
          { icon: MessageSquare, label: 'Chat com Suporte', path: '/chat' },
          { icon: Settings, label: 'Configurações', path: '/UserConfig' },
          { icon: CreditCard, label: 'Assinaturas', path: '/subscriptions' },
        ]),
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Botão de menu para mobile */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded shadow-md text-gray-600"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {isDropdownOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Navegação lateral */}
      <nav
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto transition-transform duration-300 ${
          isMobile ? (isDropdownOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2 mb-8">
          <img
            src={nomelogodelvind}
            alt="Nome Logo Delvind"
            className="max-h-[150px] px-8 object-contain"
          />
        </div>

        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return item.path ? (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
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

        <button
          className="absolute bottom-4 left-4 right-4 flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </nav>

      {/* Conteúdo principal */}
      <main
        className={`p-8 flex-1 min-w-0 overflow-auto transition-all duration-300 ${
          isMobile ? 'ml-0' : 'ml-64'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}

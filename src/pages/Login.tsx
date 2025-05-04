import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api.ts';
import Cookies from "js-cookie";
import nomelogodelvind from '../public/aginotaslogoescura.svg';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      
      const data = await api.login_user({ email, password });
      Cookies.set("token", data.token, { secure: true, sameSite: 'Strict', expires: 1 });
      localStorage.setItem("user", JSON.stringify(data.userdb)); //Nova implementação

      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
        {/* <Receipt className="w-12 h-12 text-blue-600 mb-4" /> */}
        <div className="flex items-center">
          
            <img
              src={nomelogodelvind}
              alt="Nome Logo Delvind"
              className="h-24 w-32 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo ao AgiNotas</h1>
          <p className="text-gray-500">Entre para gerenciar suas notas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a onClick={() => navigate('/recover')} className="cursor-pointer text-sm text-black-600 hover:text-blue-700">
            Esqueceu sua senha?
          </a>
        </div>

        {/* <div className="mt-2 text-center">
          <a onClick={() => navigate('/admin/login')} className="cursor-pointer text-sm text-black-600 hover:text-blue-700">
            Acesso administrativo
          </a>
        </div> */}
      </div>
    </div>
  );
}
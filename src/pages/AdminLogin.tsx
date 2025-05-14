import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import Cookies from "js-cookie";

export function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = await api.login_admin({ email, password });
            localStorage.setItem("admin", JSON.stringify(token.userdb)); //Nova implementação
            Cookies.set("admin_token", token.token, { secure: true, sameSite: 'Strict', expires: 1 });
            toast.success('Login de administrador realizado com sucesso!');
            navigate('/admin/dashboard');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Erro ao fazer login de administrador');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <ShieldCheck className="w-12 h-12 text-gray-400 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-200">Login de Administrador</h1>
                    <p className="text-gray-500">Acesso restrito</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-700 text-gray-200 focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-700 text-gray-200 focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                
                <div className="mt-2 text-center">
                    <a onClick={() => navigate('/login')} className="cursor-pointer text-sm text-gray-400 hover:text-gray-300">
                        Voltar para login de usuário
                    </a>
                </div>
            </div>
        </div>
    );
}
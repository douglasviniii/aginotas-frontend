import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api.ts';
import nomelogodelvind from '../public/aginotaslogoescura.svg';

export function Recover() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStep1, setIsStep1] = useState(true);
  const [isStep2, setIsStep2] = useState(false);
  const [isStep3, setIsStep3] = useState(false);
  const [code, setCode] = useState('');

  function generateRandomCode(length: number, chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"): string {
    let result = "";
    const charsLength = chars.length;

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charsLength);
        result += chars[randomIndex];
    }

    return result;
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try{
      const user = await api.find_user({email})
      if(user){
        const verificador = await generateRandomCode(4);
        setCode(verificador);
        const send = await api.recover_send_email_user({email, verificador});
        if(send){
          toast.success('Email enviado com sucesso!');
          setIsStep1(false);
          setIsStep2(true);
        }
      }
    }catch(err){
      toast.error('Email não existe');
    }finally {
      setIsLoading(false);
    }
  };

  const handleSubmitcode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try{
      if(codigo === code){
        toast.success('Código verificado com sucesso!');
        setIsStep2(false);
        setIsStep3(true);
      }else{
        toast.error('Código incorreto');
      }
    }catch(err){
      toast.error('Por favor, Tente novamente!');
    }finally {
      setIsLoading(false);
    }
  };

  const handleSubmitpassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try{
      if(email != ''){
        const recover = await api.recover_password_user({password,email});
        if(recover){
          toast.success('Senha atualizada com sucesso!');
          setIsStep3(false);
          navigate('/login');
        }
      }
    }catch(err){
      toast.error('Erro ao atualizar a senha');
    }finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
        <div className="flex items-center">
          
            <img
              src={nomelogodelvind}
              alt="Nome Logo Delvind"
              className="h-24 w-32 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Recuperação</h1>
        </div>
        {isStep1 && (
          <>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a onClick={()=> navigate('/login')} className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
            Fazer Login
          </a>
        </div>
        </>
        )}

        {isStep2 && (
          <>
        <form onSubmit={handleSubmitcode} className="space-y-4">
          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
              Codigo
            </label>
            <input
              id="codigo"
              type="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a onClick={()=> navigate('/login')} className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
            Voltar
          </a>
        </div>
        </>
        )}

        {isStep3 && (
          <>
        <form onSubmit={handleSubmitpassword} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Nova Senha
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
            {isLoading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a onClick={()=> navigate('/login')} className="cursor-pointer text-sm text-blue-600 hover:text-blue-700">
            Voltar
          </a>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Receipt, AlertCircle, XCircle, FileText } from 'lucide-react';
import { api } from '../lib/api';

interface Subscription {
  id: string; 
  billing_day: number;
  card: {
    brand: string;
    exp_month: number;
    exp_year: number;
    first_six_digits: string;
    holder_name: string;
    last_four_digits: string;
    status: string;
    type: string;
  },
  items: {
    name: string;
    description: string;
    pricing_scheme: {
      price: number;
    },
    status: string;
  }[], 
  status: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export function Subscriptions() {
  const [showInvoices, setShowInvoices] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) throw new Error("Usuário não encontrado");

      const userConvertido = JSON.parse(user);
      if (!userConvertido.subscription_id) throw new Error("ID de assinatura não encontrado");

      const response = await api.find_subscription(userConvertido.subscription_id);

      const subscriptionsData = Array.isArray(response) ? response : [response];
      setSubscriptions(subscriptionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar assinaturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (subscriptions.every(subscription => subscription.status === 'canceled')) {
    return <div>Nenhuma assinatura encontrada</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8 tracking-tight">
      <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
        Minha Assinatura
      </span>
      </h1>

      {subscriptions.map((subscription) => (
      <div
        className="relative bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-2xl transition-shadow"
        key={subscription.id}
      >
        <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Receipt className="w-6 h-6 text-blue-600" />
          {subscription.items[0]?.name || 'Assinatura'}
          </h2>
          <p className="text-gray-500 text-sm">{subscription.items[0]?.description}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
          {`R$ ${(subscription.items[0]?.pricing_scheme.price / 100 || 0).toFixed(2)}`.replace('.', ',')}
          </span>
          <span className="text-gray-500 text-xs">/mês</span>
        </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
          <FileText className="w-4 h-4" />
          Notas Fiscais Ilimitadas
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          Cobrança: dia {subscription.billing_day} de cada mês
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          subscription.status === 'active' || subscription.status === 'future'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-red-100 text-red-700'
          }`}
        >
          <XCircle className="w-4 h-4" />
          Status: {subscription.status === 'active' || subscription.status === 'future' ? 'Ativo' : 'Inativo'}
        </div>
        </div>
      </div>
      ))}

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Cartão de Crédito</span>
      </h2>
      {subscriptions[0]?.card ? (
        <div className="flex items-center gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-gray-700">
          <span className="font-semibold">Nome:</span> {subscriptions[0].card.holder_name}
          </p>
          <p className="text-gray-700">
          <span className="font-semibold">Número:</span> **** **** **** {subscriptions[0].card.last_four_digits}
          </p>
          <p className="text-gray-700">
          <span className="font-semibold">Validade:</span> {subscriptions[0].card.exp_month}/
          {subscriptions[0].card.exp_year}
          </p>
          <p
          className={`font-semibold ${
            subscriptions[0].card.status === 'active' ? 'text-blue-600' : 'text-red-600'
          }`}
          >
          Status: {subscriptions[0].card.status === 'active' ? 'Ativo' : 'Inativo'}
          </p>
        </div>
        <div className="ml-auto">
          {/* Botão de atualizar cartão pode ser adicionado aqui */}
        </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-600">
        Nenhum cartão cadastrado.
        {/* Botão de cadastrar novo cartão pode ser adicionado aqui */}
        </div>
      )}
      </div>
    </div>
  );
}

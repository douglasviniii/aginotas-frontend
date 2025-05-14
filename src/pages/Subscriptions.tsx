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
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Minha Assinatura</h1>

      {subscriptions.map((subscription) =>
          <div className="bg-white rounded-xl shadow-sm p-6" key={subscription.id}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {subscription.items[0]?.name || 'Assinatura'}
                </h2>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {`R$ ${subscription.items[0]?.pricing_scheme.price / 100 || 0}`.replace('.', ',')}
                  </span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Receipt className="w-5 h-5" />
                    <span>Notas Fiscais Ilimitadas</span>
                  </div>
{/*                   <div className="flex items-center gap-2 text-gray-600">
                    <AlertCircle className="w-5 h-5" />
                    <span>Cobrança realizada no dia {subscription.billing_day} de cada mês</span>
                  </div> */}
                  <div
                    className={`flex items-center gap-2 ${
                      subscription.status === 'active' || subscription.status === 'future' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Status: {subscription.status === 'active' || subscription.status === 'future' ? 'Ativo' : 'Inativo'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cartão de Crédito</h2>
        {subscriptions[0]?.card ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                <span className="font-semibold">Nome:</span> {subscriptions[0].card.holder_name}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Número:</span> **** **** **** {subscriptions[0].card.last_four_digits}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Validade:</span> {subscriptions[0].card.exp_month}/
                {subscriptions[0].card.exp_year}
              </p>
              <p
                className={`text-gray-600 ${
                  subscriptions[0].card.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <span className="font-semibold">Status:</span>{' '}
                {subscriptions[0].card.status === 'active' ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">
            Nenhum cartão cadastrado.
            <button
              onClick={() => alert('Abrir modal para cadastrar novo cartão')}
              className="text-blue-600 hover:text-blue-700 ml-2"
            >
              Cadastrar Novo Cartão
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

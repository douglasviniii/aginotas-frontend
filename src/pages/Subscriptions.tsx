import React, { useState, useEffect } from "react";
import {
  Receipt,
  AlertCircle,
  XCircle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
import { api } from "../lib/api";
import { StripeInvoice, StripeSubscription } from "./types";
import { LogoLoading } from "../components/Loading";

export function Subscriptions() {
  const [subscription, setSubscription] = useState<StripeSubscription | null>(
    null
  );
  const [nextInvoice, setNextInvoice] = useState<StripeInvoice | null>(null);
  const [invoices, setInvoices] = useState<StripeInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) throw new Error("Usuário não encontrado");

      const userConvertido = JSON.parse(user);

      const [subscriptionResponse, nextInvoiceResponse, invoicesResponse] =
        await Promise.all([
          api.getSubscription(userConvertido.subscriptionId),
          api.getNextInvoice(userConvertido.subscriptionId),
          api.getInvoices(userConvertido.stripeCustomerId),
        ]);

      setSubscription(subscriptionResponse);
      setNextInvoice(nextInvoiceResponse);

      // Verifica se é a lista ou array direto
      if (invoicesResponse.object === "list") {
        setInvoices(invoicesResponse.data);
      } else if (Array.isArray(invoicesResponse)) {
        setInvoices(invoicesResponse);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar assinatura"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "open":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "draft":
        return <FileText className="w-4 h-4 text-gray-600" />;
      default:
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      paid: "Paga",
      open: "Aberta",
      draft: "Rascunho",
      uncollectible: "Inadimplente",
      void: "Cancelada",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      paid: "text-green-600 bg-green-50",
      open: "text-yellow-600 bg-yellow-50",
      draft: "text-gray-600 bg-gray-50",
      uncollectible: "text-red-600 bg-red-50",
      void: "text-red-400 bg-red-25",
    };
    return colorMap[status] || "text-gray-600 bg-gray-50";
  };

  const formatCurrency = (amount: number, currency: string = "BRL") => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency,
    }).format(amount / 100); // Divide por 100 pois o Stripe usa centavos
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("pt-BR");
  };

if (loading) return <LogoLoading size={100} text="Carregando..." />;

  if (error)
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
          {error}
        </div>
      </div>
    );

  if (!subscription)
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-700">Nenhuma assinatura encontrada</p>
        </div>
      </div>
    );

  const item = subscription.items.data[0];
  const nextBillingDate = subscription.current_period_end
    ? formatDate(subscription.current_period_end)
    : "Data não disponível";

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold text-center mb-8">
        <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Minha Assinatura
        </span>
      </h1>

      {/* Card da Assinatura */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <Receipt className="w-6 h-6 text-blue-600" />
              {item?.price?.product?.name || "Plano Bronze"}
            </h2>
            <p className="text-gray-600">
              {item?.price?.product?.description || "Descrição do plano"}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              subscription.status === "active"
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {subscription.status === "active" ? "Ativa" : "Inativa"}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Próxima cobrança</p>
              <p className="font-semibold text-lg">{nextBillingDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Intervalo</p>
              <p className="font-semibold text-lg">
                {item?.price?.recurring?.interval_count || 1}/
                {item?.price?.recurring?.interval === "month"
                  ? "mês"
                  : item?.price?.recurring?.interval === "year"
                  ? "ano"
                  : item?.price?.recurring?.interval}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500 mb-2">Valor atual</p>
            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              {nextInvoice?.amount_due
                ? formatCurrency(nextInvoice.amount_due)
                : "R$ 0,00"}
            </span>
          </div>
        </div>
      </div>

      {/* Card da Próxima Fatura */}
      {nextInvoice && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 border border-blue-200 mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Próxima Fatura
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Valor estimado</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(nextInvoice.amount_due)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Data de vencimento</p>
              <p className="text-lg font-semibold">
                {nextInvoice.next_payment_attempt
                  ? formatDate(nextInvoice.next_payment_attempt)
                  : "Não definida"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold capitalize">
                {nextInvoice.status}
              </p>
            </div>
          </div>

          {nextInvoice.lines.data[0]?.description && (
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <p className="text-sm text-gray-600">Descrição</p>
              <p className="font-medium">
                {nextInvoice.lines.data[0].description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Histórico de Faturas */}
      {/*       <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-gray-700" />
          Histórico de Faturas
        </h3>

        {invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma fatura encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  {getStatusIcon(invoice.status)}
                  
                  <div>
                    <p className="font-semibold">
                      {invoice.number || `Fatura ${invoice.id.slice(-8)}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {invoice.status_transitions?.paid_at 
                        ? formatDate(invoice.status_transitions.paid_at)
                        : formatDate(invoice.created)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                    {getStatusText(invoice.status)}
                  </span>
                  
                  <span className="font-bold text-lg">
                    {formatCurrency(invoice.amount_paid > 0 ? invoice.amount_paid : invoice.amount_due)}
                  </span>

                  <div className="flex gap-2">
                    {invoice.invoice_pdf && (
                      <a 
                        href={invoice.invoice_pdf} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Baixar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    
                    {invoice.hosted_invoice_url && (
                      <a 
                        href={invoice.hosted_invoice_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver online"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
}

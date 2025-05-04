import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../lib/api';

interface Invoice {
  id: string;
  number: string;
  customer: string;
  issuedAt: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  date: string;
}

/* const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'NF-001',
    customer: 'Empresa ABC Ltda',
    amount: 1500.00,
    status: 'paid',
    date: '2024-02-20'
  },
  // Adicione mais notas mock aqui para testes
]; */

export function History() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);;
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('7days');
  
  useEffect(() => {
    loadInvoices();
  }, []); 

    const loadInvoices = async () => {
    try {
      const invoices = await api.find_invoices();
      console.log(invoices);
      //setInvoices(invoices || []);
    } catch (error) {
      console.log(error);
    }
  };  

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Histórico de Notas</h1>

      <div className="flex gap-4">
        {/* Barra de Pesquisa */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar nota..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filtro de Data */}
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7days">Últimos 7 dias</option>
          <option value="30days">Últimos 30 dias</option>
          <option value="90days">Últimos 90 dias</option>
          <option value="all">Todos</option>
        </select>
      </div>

      {/* Lista de Notas */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Número</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Valor</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-gray-100">
                  <td className="py-3 px-4 text-gray-900">{invoice.amount}</td>
                  <td className="py-3 px-4 text-gray-600">{invoice.customer}</td>
                  <td className="py-3 px-4 text-gray-600">{invoice.issuedAt}</td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(invoice.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : invoice.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {invoice.status === 'paid' ? 'Paga' : 
                       invoice.status === 'pending' ? 'Pendente' : 'Cancelada'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
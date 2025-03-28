import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, XCircle, Calendar, File, Check, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { FaEye } from 'react-icons/fa';
import { api } from '../lib/api.ts';

interface Customer {
  _id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  user: {
    _id: string;
    email: string;
    senhaelotech: string;
  };
  address: {
    street: string;
    number: string;
    neighborhood: string;
    cityCode: string;
    city: string;
    state: string;
    zipCode: string;
  };
  inscricaoMunicipal?: string;
}

interface Schedule {
  customer_id: string;
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [schedulings, setSchedulings] = useState<Schedule[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGerating, setIsGerating] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<'none' | 'invoice' | 'replace' | 'subscription' | 'scheduling' | 'history'>('none');
  
  const [handleinvoice, setHandleInvoice] = useState({
    _id: '',
    customer: '',
    numeroLote: 0,
    identificacaoRpsnumero: 0,
    xml: '',
    data:{
      Rps: {
        Servico: {
          Discriminacao: '',
          descricao: '',
          item_lista: '',
          cnae: '',
          quantidade: 0,
          valor_unitario: 0,
          desconto: 0,
          ListaItensServico:[
            {
              Discriminacao: '',
              Descricao: '',
              ItemListaServico: '',
              CodigoCnae: '',
              Quantidade: 0,
              ValorUnitario: 0,
              ValorLiquido: 0,
              ValorDesconto: 0
            }
          ]
        }
      }
    }
  });

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    inscricaoMunicipal: '',
    user: {
      _id: '',
      email: '',
    },
    address: {
      street: '',
      number: '',
      neighborhood: '',
      cityCode: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  //Agendando NF
  const [subscription, setSubscription] = useState({
    billingDay: 1,
    amount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    description: '',
    itemListaServico: '',
    codigoCnae: ''
  });

  //Criando NF na hora
  const [invoice, setInvoice] = useState({
    discriminacao: 'CONTRATO MENSAL',
    descricao: 'Descrição do serviço',
    item_lista: '104',
    cnpj: selectedCustomer?.cnpj || "",
    cnae: '6201501',
    quantidade: 1,
    valor_unitario: 100,
    desconto: 0.00,
    iss_retido: false,
    aliquota_iss: 4.41,
    retencoes: {
      irrf: false,
      pis: false,
      cofins: false,
    },
    amount: 0,
    description: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    observations: '',
    razao_social: '',
    nome_fantasia: '',
    endereco: '',
    logradouro: '',
    numero: '',

  });

  const handleViewInvoiceHistory = async (customer: Customer) => {
    try {
      const response = await api.find_all_invoices_customer(customer._id);
      setInvoiceHistory(response || []);
      setActiveModal('history'); 
      setSelectedCustomer(customer);
    } catch (error) {
      toast.error('Erro ao buscar notas fiscais do cliente');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleViewScheduleHistory = async () => {
    setActiveModal('scheduling');
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.create_customer(newCustomer);
      toast.success('Cliente adicionado com sucesso!');
      location.reload();
    } catch (error) {
      toast.error('Erro ao adicionar cliente');
      console.error('Erro ao adicionar cliente:', error);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esse cliente?")) {
      return;
    }

    try {
      await api.delete_customer(id);
      setCustomers(customers.filter(c => c._id !== id));
      toast.success('Cliente removido com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover cliente');
      console.error('Erro ao remover cliente:', error);
    }
  };

  const handleDeactivateCustomer = async (id: string) => {
    try {
      const status = 'inactive';
      await api.changestatus_customer(id, status);
      location.reload();
      toast.success('Cliente desativado com sucesso!');
    } catch (error) {
      toast.error('Erro ao desativar cliente');
      console.error('Erro ao desativar cliente:', error);
    }
  };

  const handleActiveCustomer = async (id: string) => {
    try {
      const status = 'active';
      await api.changestatus_customer(id, status);
      location.reload();
      toast.success('Cliente ativado com sucesso!');
    } catch (error) {
      toast.error('Erro ao ativar cliente');
      console.error('Erro ao ativar cliente:', error);
    }
  };

  const handleCancelSchedule = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja cancelar o agendamento?")) {
      return;
    }

    try {
      await api.delete_schedule(id);
      toast.success('Agendamento cancelado com sucesso!');
      location.reload();
    } catch (error) {
      toast.error('Erro ao cancelar agendamento');
      console.error('Erro ao cancelar agendamento:', error);
    }
  };

  const handleConfigureSubscription = (customer: Customer) => {
    setActiveModal('subscription');  // Alterando para 'subscription' ao abrir o modal de assinatura
    setSelectedCustomer(customer);
  };
  const handleConfigureInvoice = (customer: Customer) => {
    setActiveModal('invoice');  // Alterando para 'invoice' ao abrir o modal de gerar NF
    setSelectedCustomer(customer);
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) return;
    
    if(selectedCustomer!.user.senhaelotech === 'undefined') return;

    const data = {
      customer_id: selectedCustomer._id,
      billing_day: subscription.billingDay,
      start_date: subscription.startDate,
      end_date: subscription.endDate,
      data: {
        servico: {
          Discriminacao: invoice.discriminacao,
          descricao: invoice.descricao,
          item_lista: parseInt(invoice.item_lista),
          cnae: parseInt(invoice.cnae),
          quantidade: invoice.quantidade,
          valor_unitario: invoice.valor_unitario,
          desconto: invoice.desconto
        }
      },
      valor: invoice.quantidade * invoice.valor_unitario,          
  }  

    try {
      if (selectedCustomer.status === 'active') {
        setIsGerating(true);
        await api.create_scheduling(data);
        toast.success('Agendamento configurado com sucesso!');
        setIsSubscriptionModalOpen(false);
        setIsGerating(false);
      } else {
        toast.success('O contrato está inativo!');
      }
    } catch (error) {
      toast.error('Erro ao agendar emissão');
      console.error('Erro ao agendar emissão:', error);
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    if(selectedCustomer!.user.senhaelotech === 'undefined') return;

      const data = {
          customer_id: selectedCustomer._id,
          servico: {
            Discriminacao: invoice.discriminacao,
            descricao: invoice.descricao,
            item_lista: invoice.item_lista,
            cnae: invoice.cnae,
            quantidade: invoice.quantidade,
            valor_unitario: invoice.valor_unitario,
            desconto: invoice.desconto
          }        
      }   

  try {
    if (selectedCustomer.status === 'active') {
          setIsGerating(true);
          const response = await api.create_invoice(data);
          toast.success(response.message);
          setActiveModal('none');
          setIsGerating(false);
        } else {
          toast.success('O contrato está inativo!');
        }
  } catch (error: any) {
      setIsGerating(false);
    }
  };

  function parseNfseXml(xmlString: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
    const nsResolver = (prefix: string | null) => (prefix === "ns2" ? "http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd" : null);
  
    const getValue = (xpath: string) => {
        const result = xmlDoc.evaluate(xpath, xmlDoc, nsResolver, XPathResult.STRING_TYPE, null);
        return result.stringValue || null;
    };
  
    return {
        numeroNota: getValue("//ns2:InfNfse/ns2:Numero"),
        cpfCnpj: getValue("//ns2:PrestadorServico/ns2:IdentificacaoPrestador/ns2:CpfCnpj/ns2:Cnpj"),
        inscricaoMunicipal: getValue("//ns2:PrestadorServico/ns2:IdentificacaoPrestador/ns2:InscricaoMunicipal"),
        codigoMunicipio: getValue("//ns2:PrestadorServico/ns2:Endereco/ns2:CodigoMunicipio"),
        chaveAcesso: getValue("//ns2:InfNfse/ns2:ChaveAcesso"),
        codigoVerificacao: getValue("//ns2:InfNfse/ns2:CodigoVerificacao"),
    };
}

  const handleCancelInvoice = async (invoice: any) => {

    if (!window.confirm("Tem certeza que deseja cancelar esta nota fiscal?")) {
      return;
    }

    try {
      const nfseData = parseNfseXml(invoice.xml);
      const data = {
        IdInvoice: invoice._id,
        NumeroNfse: nfseData.numeroNota,
        CpfCnpjNfse: nfseData.cpfCnpj,
        InscricaoMunicipalNfse: nfseData.inscricaoMunicipal,
        CodigoMunicipioNfse: nfseData.codigoMunicipio, 
        ChaveAcesso: nfseData.chaveAcesso, 
      }

      const response = await api.cancel_invoice(data);
      toast.success('Nota fiscal cancelada com sucesso!');
    } catch (error) {
      toast.error('Erro ao cancelar nota fiscal');
      console.error('Erro ao cancelar nota fiscal:', error);
    }
  }

  const handleModalReplaceInvoice = async (invoice: any) => {
    setActiveModal('replace'); 
    setHandleInvoice(invoice);
  }

  const handleReplaceInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!window.confirm("Tem certeza que deseja substituir esta nota fiscal?")) {
      return;
    }

    try {
    const nfseData = await parseNfseXml(handleinvoice.xml);

    const data = {
    IdInvoice: handleinvoice._id,
    customer_id: handleinvoice.customer, 
    servico:{
      Discriminacao: invoice.discriminacao,
      descricao: invoice.descricao,
      item_lista: invoice.item_lista,
      cnae: invoice.cnae,
      quantidade: invoice.quantidade,
      valor_unitario: invoice.valor_unitario,
      desconto: invoice.desconto
    },
    numeroNfse: nfseData.numeroNota,
    CodigoMunicipio: nfseData.codigoMunicipio,
    ChaveAcesso: nfseData.chaveAcesso,
    NumeroLote: handleinvoice.numeroLote,
    IdentificacaoRpsnumero: handleinvoice.identificacaoRpsnumero,
    }

    const response = await api.replace_invoice(data);
    toast.success('Nota fiscal substituida com sucesso!');
  } catch (error) {
    toast.error('Erro ao substituir nota fiscal');
    console.error('Erro ao substituir nota fiscal:', error);
  }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.cnpj.includes(searchTerm) ||
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  const closeAllModals = () => {
    setActiveModal('none');  // Fechando todos os modais
  };

  const loadCustomers = async () => {
    try {
      const data = await api.find_customers();
      const scheduledata = await api.find_schedulings();
      setCustomers(data || []);
      setSchedulings(scheduledata || []);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
  }, [schedulings]);


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por CNPJ ou nome..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">CNPJ</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Telefone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="border-t border-gray-100">
                  <td className="py-3 px-4 text-gray-900">{customer.name}</td>
                  <td className="py-3 px-4 text-gray-600">{customer.cnpj}</td>
                  <td className="py-3 px-4 text-gray-600">{customer.email}</td>
                  <td className="py-3 px-4 text-gray-600">{customer.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${customer.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                      }`}>
                      {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() => handleConfigureInvoice(customer)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Gerar Nota Fiscal"
                      >
                        <File className="w-5 h-5" />
                      </button>

                      {/* BOTAO AGENDAR */}
                      <button
                        onClick={() => handleConfigureSubscription(customer)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Emissão automizada"
                      >
                        <Calendar className="w-5 h-5" />
                      </button>

                        {schedulings.some(schedule => schedule.customer_id === customer._id) && (
                        <button
                          onClick={() => handleViewScheduleHistory()}
                          className="text-blue-600 hover:text-blue-700"
                          title="Cancelar agendamento"
                        >
                          <Ban className="w-5 h-5" />
                        </button>
                        )}


                      <button
                        onClick={() => handleViewInvoiceHistory(customer)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Ver Histórico"
                      >
                        <FaEye /> {/* Ícone de olho */}
                      </button>


                      {customer.status === 'active' ? (
                        <button
                          onClick={() => handleDeactivateCustomer(customer._id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Finalizar Contrato"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActiveCustomer(customer._id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Ativar Contrato"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteCustomer(customer._id)}
                        className="text-red-600 hover:text-red-700"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Novo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Novo Cliente</h2>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="newCustomerForm" onSubmit={handleAddCustomer} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                    <input
                      type="text"
                      value={newCustomer.cnpj}
                      onChange={(e) => setNewCustomer({ ...newCustomer, cnpj: e.target.value })}
                      /* onBlur={handleCnpjBlur} */
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Endereço</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                    <input
                      type="text"
                      value={newCustomer.address.street}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, street: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                    <input
                      type="text"
                      value={newCustomer.address.number}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, number: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={newCustomer.address.neighborhood}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, neighborhood: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={newCustomer.address.city}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, city: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <input
                      type="text"
                      value={newCustomer.address.state}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, state: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <input
                      type="text"
                      value={newCustomer.address.zipCode}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, zipCode: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código do Município
                    </label>
                    <input
                      type="text"
                      value={newCustomer.address.cityCode}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, cityCode: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="newCustomerForm"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Histórico de Notas Fiscais */}
      {selectedCustomer && activeModal === 'history' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[60%]">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Histórico de Notas Fiscais</h2>
              <button onClick={closeAllModals} className="text-gray-500 hover:text-gray-700">
          <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800">{selectedCustomer.name}</h3>
              <table className="mt-4 w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Descrição</th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Valor</th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Data</th>
            </tr>
          </thead>
          <tbody>
            {invoiceHistory.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-2 px-4 text-center text-sm text-gray-500">Nenhuma nota fiscal encontrada</td>
              </tr>
            ) : (
              invoiceHistory.map((invoice) => (
                <tr key={invoice.id} className="border-b">
            <td className="py-2 px-4 text-sm text-gray-700">{invoice.status || ''}</td>
            <td className="py-2 px-4 text-sm text-gray-700">{invoice.data.Rps.Servico.Discriminacao || ''}</td>
            <td className="py-2 px-4 text-sm text-gray-700">{invoice.valor * invoice.data.Rps.Servico.ListaItensServico[0].Quantidade}</td>
            <td className="py-2 px-4 text-sm text-gray-700">
              {new Date(invoice.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }) || ''}
            </td>
            <td className="py-3 px-4 text-sm text-gray-700">
              <button
                onClick={() => handleModalReplaceInvoice(invoice)}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Substituir Nota Fiscal"
              >
                <File className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCancelInvoice(invoice)}
                className="text-red-600 hover:text-red-800 ml-2 p-1"
                title="Cancelar Nota Fiscal"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </td>
                </tr>
              ))
            )}
          </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração de Assinatura */}
      {activeModal === 'subscription' && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Emita suas Notas de Forma Programada</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="subscriptionForm" onSubmit={handleSaveSubscription} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discriminação do Serviço</label>
                  <input
                    type="text"
                    value={invoice.discriminacao || ''}
                    onChange={(e) => setInvoice({ ...invoice, discriminacao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNAE</label>
                  <input
                  type="text"
                  value={invoice.cnae || ''}
                  onChange={(e) => setInvoice({ ...invoice, cnae: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item da Lista de Serviço</label>
                  <input
                    type="text"
                    value={invoice.item_lista || ''} // Posição do item, se necessário
                    onChange={(e) => setInvoice({ ...invoice, item_lista: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço</label>
                  <textarea
                    value={invoice.descricao || ''} // Passa a descrição da CNAE para o campo de texto
                    onChange={(e) => setInvoice({ ...invoice, descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    value={invoice.quantidade || 0}
                    onChange={(e) => setInvoice({ ...invoice, quantidade: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoice.valor_unitario || 0.00}
                    onChange={(e) => setInvoice({ ...invoice, valor_unitario: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoice.desconto || 0.00}
                    onChange={(e) => setInvoice({ ...invoice, desconto: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dia do Faturamento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={subscription.billingDay}
                    onChange={(e) => setSubscription({ ...subscription, billingDay: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={subscription.startDate}
                    onChange={(e) => setSubscription({ ...subscription, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Término</label>
                  <input
                    type="date"
                    value={subscription.endDate}
                    onChange={(e) => setSubscription({ ...subscription, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </form>


              {/* Campos para configurar assinatura */}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={closeAllModals} className="px-4 py-2 text-gray-700 hover:text-gray-900">
                Cancelar
              </button>
              <button
                type="submit"
                form="subscriptionForm"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={isGerating}
              >
                {isGerating ? 'Agendando...' : 'Agendar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerar Nota Fiscal */}
      {activeModal === 'invoice' && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Gerar Nota Fiscal</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="invoiceForm" onSubmit={handleGenerateInvoice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discriminação do Serviço</label>
                  <input
                    type="text"
                    value={invoice.discriminacao || ''}
                    onChange={(e) => setInvoice({ ...invoice, discriminacao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNAE</label>
                  <input
                  type="text"
                  value={invoice.cnae || ''}
                  onChange={(e) => setInvoice({ ...invoice, cnae: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item da Lista de Serviço</label>
                  <input
                  type="text"
                  value={invoice.item_lista}
                  onChange={(e) => setInvoice({ ...invoice, item_lista: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço</label>
                  <textarea
                    value={invoice.descricao || ''} 
                    onChange={(e) => setInvoice({ ...invoice, descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    value={invoice.quantidade || 0}
                    onChange={(e) => setInvoice({ ...invoice, quantidade: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoice.valor_unitario || 0.00}
                    onChange={(e) => setInvoice({ ...invoice, valor_unitario: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoice.desconto || 0.00}
                    onChange={(e) => setInvoice({ ...invoice, desconto: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão</label>
                  <input
                    type="date"
                    value={invoice.issueDate}
                    onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={closeAllModals} className="px-4 py-2 text-gray-700 hover:text-gray-900">
                Cancelar
              </button>
              <button
                type="submit"
                form="invoiceForm"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={isGerating}
              >
                {isGerating ? 'Gerando...' : 'Gerar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Substituir Nota Fiscal */}
      {activeModal === 'replace' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Substituir Nota Fiscal</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="invoiceReplaceForm" onSubmit={handleReplaceInvoice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discriminação do Serviço</label>
                  <input
                    type="text"
                    placeholder={handleinvoice.data.Rps.Servico.Discriminacao || ''}
                    onChange={(e) => setInvoice({ ...invoice, discriminacao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNAE</label>
                  <input
                  type="text"
                  placeholder={handleinvoice.data.Rps.Servico.ListaItensServico[0].CodigoCnae || ''}
                  onChange={(e) => setInvoice({ ...invoice, cnae: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item da Lista de Serviço</label>
                  <input
                  type="text"
                  placeholder={handleinvoice.data.Rps.Servico.ListaItensServico[0].ItemListaServico}
                  onChange={(e) => setInvoice({ ...invoice, item_lista: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  
                />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço</label>
                  <textarea
                    placeholder={handleinvoice.data.Rps.Servico.ListaItensServico[0].Descricao || ''}
                    onChange={(e) => setInvoice({ ...invoice, descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    placeholder={(handleinvoice.data.Rps.Servico.ListaItensServico[0].Quantidade).toString()}
                    onChange={(e) => setInvoice({ ...invoice, quantidade: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={(handleinvoice.data.Rps.Servico.ListaItensServico[0].ValorUnitario || 0.00).toString()}
                    onChange={(e) => setInvoice({ ...invoice, valor_unitario: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={(handleinvoice.data.Rps.Servico.ListaItensServico[0].ValorDesconto || 0.00).toString()}
                    onChange={(e) => setInvoice({ ...invoice, desconto: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão</label>
                  <input
                    type="date"
                    value={invoice.issueDate}
                    onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    
                  />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={closeAllModals} className="px-4 py-2 text-gray-700 hover:text-gray-900">
                Cancelar
              </button>
              <button
                type="submit"
                form="invoiceReplaceForm"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={isGerating}
              >
                {isGerating ? 'Substituindo...' : 'Substituir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agendamentos de Emissão Automatizada */}
      {activeModal === 'scheduling' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Agendamentos de Emissão Automatizada</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {schedulings.length === 0 ? (
                <div className="text-center text-gray-500">Nenhum agendamento encontrado.</div>
              ) : (
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Cliente</th>
                      <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Descrição</th>
                      <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Dia do Faturamento</th>
                      <th className="py-2 px-4 text-right text-sm font-medium text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedulings.map((schedule) => {
                      const customer = customers.find(c => c._id === schedule.customer_id);
                      return (
                        <tr key={schedule.customer_id} className="border-b">
                          <td className="py-2 px-4 text-sm text-gray-700">{customer?.name || 'Cliente não encontrado'}</td>
                          <td className="py-2 px-4 text-sm text-gray-700">{schedule.data.servico.Discriminacao}</td>
                          <td className="py-2 px-4 text-sm text-gray-700">{schedule.billing_day}</td>
                          <td className="py-2 px-4 text-right">
                            <button
                              onClick={() => handleCancelSchedule(schedule.customer_id)}
                              className="text-red-600 hover:text-red-800"
                              title="Cancelar Agendamento"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={closeAllModals}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
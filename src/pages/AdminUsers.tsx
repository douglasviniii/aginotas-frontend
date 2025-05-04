import React, { useState, useEffect } from 'react';
import { Copy, File, FileCodeIcon, Loader2, ToggleRight, Trash2, XCircle } from 'lucide-react';
import { CircularProgress, Modal, Box, Typography, Button, ButtonGroup } from '@mui/material';
import { Visibility as VisibilityIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';

interface User {
  id: number;
  cnpj: string;
  name: string;
  email: string;
  subscription: string;
  paymentStatus: 'paid' | 'unpaid';
  active: boolean;
  registrationDate: string;
  usageTime: string;
  _id: string;
  cpf: string;
  razaoSocial: string;
  nomeFantasia: string;
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
  inscricaoEstadual?: string;
}

interface UserDB {
  _id: string;
  subscription_id: string;
  senhaelotech: string;
  name: string;
  inscricaoMunicipal: string;
  id_client_pagarme: string;
  homologa: boolean;
  estado: string;
  email: string;
  date_created: string;
  cnpj: string;
  cidade: string;
  RegimeEspecialTributacao: number;
  IncentivoFiscal: number;
  status: string;
}

interface Schedule {
  customer_id: string;
}

export function AdminUsers() {

  const [usersDB, setUsersDB] = useState<UserDB[]>([]);
  const [cnaes, setCnaes] = useState<any[]>([]);
  const [itemservico, setItemServico] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [infoSubscription, setInfoSubscription] = useState<any>(null);
  const [isGerating, setIsGerating] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'edit' | 'editpessoafisica' | 'invoice' | 'replace' | 'subscription' | 'scheduling' | 'history'> ('none');
  const open = Boolean(anchorEl);
  const [cnpjError, setCnpjError] = useState('');
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([]);
  const [schedulings, setSchedulings] = useState<Schedule[]>([]);
  const adminDataString = localStorage.getItem('admin');
  const adminData = adminDataString ? JSON.parse(adminDataString) : null;

  const handleClick = (event:any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const [invoice, setInvoice] = useState({
    discriminacao: '',
    descricao: '',
    item_lista: '',
    aliquota_item_lista: 0,
    cnpj: selectedUser?.cnpj || "",
    cnae: '',
    quantidade: 1,
    valor_unitario: '',
    valor_deducao: '0',
    desconto: '0',
    DescontoIncondicionado: '0',
    DescontoCondicionado: '0',
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
    dateOfCompetence: new Date().toISOString().split('T')[0],
    observations: '',
    razao_social: '',
    nome_fantasia: '',
    endereco: '',
    logradouro: '',
    numero: '',

    tomador:{
      _id: selectedUser?._id || '',
      cnpjcpf: '',
      InscricaoMunicipal:'',
      RazaoSocial: '',
      Endereco:'',
      Numero:'',
      Bairro:'',
      CodigoMunicipio:'',
      Uf:'',
      Cep:'',
      Telefone:'',
      Email:'',
    },
    // Novos campos adicionados:
    anexo: '',
    rbt12: '',
    aliquotas: {
      aliquota: 0,
      iss: '',
      cofins: '',
      ir: '',
      cpp: '',
      pis: '',
      inss: '',
      csll: '',
      outras: ''
    },
    valores: {
      iss: '',
      cofins: '',
      ir: '',
      cpp: '',
      pis: '',
      inss: '',
      csll: '',
      outras: ''
    },
    retido: {
      iss: false,
      cofins: false,
      ir: false,
      cpp: false,
      pis: false,
      inss: false,
      csll: false,
      outras: false
    },
  });  

  const [subscription, setSubscription] = useState({
    billingDay: 1,
    amount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    description: '',
    itemListaServico: '',
    codigoCnae: ''
  });  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Erro: {error}</p>;
  }

  const handleOpenModal = async (user: any) => {
    try {
      const infoSubscription = await api.find_subscription(user.subscription_id);
      setInfoSubscription(infoSubscription);
      setSelectedUser(user);
      setOpenModal(true); 

    } catch (error) {
      console.error('Error fetching subscription info:', error);
      setOpenModal(false);
    }
  
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser({});
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const loadData = async () => {
    const allusers = await api.find_all_users();
    setUsersDB(allusers);
    const cnaes = await api.Find_CNAES_ELOTECH();
    setCnaes(cnaes || []);
  }

  const handleUpdateUser = async (user:any) => {
    try {
      if(user.status === 'active'){
        await api.update_user_byID(user._id, {status: 'inactive'});
        toast.success("Usuário atualizado com sucesso!");
        loadData();
      }
      if(user.status === 'inactive'){
        await api.update_user_byID(user._id, {status: 'active'});
        toast.success("Usuário atualizado com sucesso!");
        loadData();
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao atualizar!");
    }
  }

  const handleViewGenerateNfse = async (data:any) =>{
    setOpenModal(false);
    setActiveModal('invoice');
    invoice.tomador.cnpjcpf = formatCnpj(selectedUser!.cnpj);
  }

  const closeAllModals = () => {
    setActiveModal('none');  // Fechando todos os modais
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminData) return;

    if (adminData!.senhaelotech === 'undefined') { toast.error('Chave de homologação/Produção inválida!'); return; };
    if (adminData!.inscricaoMunicipal === '') { toast.error('Inscrição Municipal inválida!'); return; };

    const data = {
      customer: invoice.tomador,
      servico: {
        Discriminacao: invoice.discriminacao,
        descricao: invoice.descricao,
        item_lista: parseFloat(invoice.item_lista),
        cnae: parseFloat(invoice.cnae),
        quantidade: parseFloat(invoice.quantidade.toString()),
        valor_unitario: parseFloat(invoice.valor_unitario.toString()),
        desconto: parseFloat(invoice.desconto.toString()),
        issueDate: invoice.issueDate,
        dateOfCompetence: invoice.dateOfCompetence,
        ValorDeducoes: parseFloat(invoice.valor_deducao),
        AliquotaPis:  parseFloat(invoice.aliquotas.pis),
        RetidoPis: invoice.retido.pis ? 1 : 2,
        ValorPis: parseFloat(invoice.valores.pis), 
        AliquotaCofins: parseFloat(invoice.aliquotas.cofins),
        RetidoCofins: invoice.retido.cofins ? 1 : 2,
        ValorCofins: parseFloat(invoice.valores.cofins), 
        AliquotaInss: parseFloat(invoice.aliquotas.inss),
        RetidoInss: invoice.retido.inss ? 1 : 2,
        ValorInss: parseFloat(invoice.valores.inss),
        AliquotaIr: parseFloat(invoice.aliquotas.ir), 
        RetidoIr: invoice.retido.ir ? 1 : 2, 
        ValorIr: parseFloat(invoice.valores.ir),
        AliquotaCsll: parseFloat(invoice.aliquotas.csll),
        RetidoCsll: invoice.retido.csll ? 1 : 2,
        ValorCsll: parseFloat(invoice.valores.csll),
        AliquotaCpp: parseFloat(invoice.aliquotas.cpp),
        RetidoCpp: invoice.retido.cpp ? 1 : 2,
        ValorCpp: parseFloat(invoice.valores.cpp),
        RetidoOutrasRetencoes: invoice.retido.outras ? 1 : 2,
        Aliquota: invoice.aliquotas.aliquota,
        DescontoIncondicionado: parseFloat(invoice.DescontoIncondicionado),
        DescontoCondicionado: parseFloat(invoice.DescontoCondicionado),
        IssRetido: invoice.retido.iss ? 1 : 2, 
      }
    }

    try {
      if (adminData) {
        setIsGerating(true);
        const response = await api.create_invoice_admin(data);
        toast.success(response.message);
        setActiveModal('none');
        setIsGerating(false);
        loadData();
      } else {
        toast.success('O contrato está inativo!');
      }
    } catch (error: any) {
      setIsGerating(false);
    }
  };

  const validateCnpj = (cnpj: string): boolean => {
    const cleanedCnpj = cnpj.replace(/\D/g, '');

    if (cleanedCnpj.length !== 14) {
      setCnpjError('CNPJ deve ter 14 dígitos');
      return false;
    }

    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/;
    if (cnpj.length > 0 && !cnpjRegex.test(cnpj) && cnpj.length >= 14) {
      setCnpjError('Formato inválido. Use 00.000.000/0000-00');
      return false;
    }

    setCnpjError('');
    return true;
  };

  const formatCnpj = (value: string) => {
    const cleaned = value.replace(/[.\/-]/g, '');

    let formatted = cleaned;
    if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    if (cleaned.length > 5) formatted = `${formatted.slice(0, 6)}.${formatted.slice(6)}`;
    if (cleaned.length > 8) formatted = `${formatted.slice(0, 10)}/${formatted.slice(10)}`;
    if (cleaned.length > 12) formatted = `${formatted.slice(0, 15)}-${formatted.slice(15, 17)}`;

    return formatted.slice(0, 18);
  };

  const fetchCompanyData = async () => {
    const cleanedCnpj = invoice.tomador.cnpjcpf.replace(/\D/g, '');

    if (!validateCnpj(invoice.tomador.cnpjcpf) || cleanedCnpj.length !== 14) return;

    setLoadingCnpj(true);
    setCnpjError('');

    try {
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cleanedCnpj}`);

      if (!response.ok) throw new Error('Erro na consulta');

      const data = await response.json();

      if (data.status === 'ERROR' || data.error) {
        throw new Error(data.message || 'CNPJ não encontrado');
      }
      setInvoice({
        ...invoice,
        tomador:{
          /* cnpjcpf: invoice.tomador.cnpjcpf ? invoice.tomador.cnpjcpf.replace(/[.\/-]/g, '') : '', */
          _id: selectedUser?._id || '',
          cnpjcpf: invoice.tomador.cnpjcpf || '',
          InscricaoMunicipal: invoice.tomador.InscricaoMunicipal || '',
          RazaoSocial: data.razao_social || '',
          Endereco: data.estabelecimento.logradouro|| '',
          Numero: data.estabelecimento.numero|| '',
          Bairro: data.estabelecimento.bairro|| '',
          CodigoMunicipio: data.estabelecimento.cidade.ibge_id|| '',
          Uf: data.estabelecimento.estado.sigla|| '',
          Cep: data.estabelecimento.cep|| '',
          Telefone: data.estabelecimento.telefone1|| '',
          Email: data.estabelecimento.email || '',          
        }
      })

    } catch (err) {
      console.error('Erro na consulta:', err);
      setCnpjError('Dados não encontrados. Preencha manualmente');

      setInvoice({
        ...invoice,
        tomador:{
          _id: '',
          cnpjcpf: '',
          InscricaoMunicipal: '',
          RazaoSocial: '',
          Endereco: '',
          Numero:'',
          Bairro:'',
          CodigoMunicipio:'',
          Uf:'',
          Cep:'',
          Telefone:'',
          Email:'',          
        }
      })

    } finally {
      setLoadingCnpj(false);
    }
  };

  const handleConfigureSubscription = () => {
    setOpenModal(false);
    setActiveModal('subscription'); 
    invoice.tomador.cnpjcpf = formatCnpj(selectedUser!.cnpj);

  };

  const handleViewInvoiceHistory = async () => {
    try {
      const response = await api.find_all_invoices_customer_admin(selectedUser!._id);
      setInvoiceHistory(response || []);
      setOpenModal(false);
      setActiveModal('history');
    } catch (error) {
      toast.error('Erro ao buscar notas fiscais do cliente');
    }
  };

  function downloadCustomerXml(customer: any) {
    const blob = new Blob([customer.xml], { type: 'application/xml' });
    const fileName = `${customer.data.Rps.Servico.Discriminacao}_nota.xml`;
    saveAs(blob, fileName);
  }

  async function criarNotaFiscalPDF (item: any) {
    try {
        await api.Export_Invoice_PDF_ADMIN(item);
        toast.success("PDF gerado com sucesso!");
    } catch (error) {
        toast.error("Ocorreu um erro ao gerar o PDF");
    }
  }

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
          invoice:{
            IdInvoice: invoice._id,
            NumeroNfse: nfseData.numeroNota,
            CpfCnpjNfse: nfseData.cpfCnpj,
            InscricaoMunicipalNfse: nfseData.inscricaoMunicipal,
            CodigoMunicipioNfse: nfseData.codigoMunicipio,
            ChaveAcesso: nfseData.chaveAcesso,
          },
          user:adminData,
        }
  
        const response = await api.cancel_invoice_admin(data);
        toast.success(response.message);
        loadData();
      } catch (error) {
        toast.error('Erro ao cancelar nota fiscal');
        console.error('Erro ao cancelar nota fiscal:', error);
      }
  }

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminData) return;

    if (adminData!.senhaelotech === 'undefined') { toast.error('Chave de homologação/Produção inválida!'); return; };
    if (adminData!.inscricaoMunicipal === '') { toast.error('Inscrição Municipal inválida!'); return; };

    const data = {
      customer: invoice.tomador,
      billing_day: subscription.billingDay,
      start_date: subscription.startDate,
      end_date: subscription.endDate,
      data: {
        servico: {
          Discriminacao: invoice.discriminacao,
          descricao: invoice.descricao,
          item_lista: parseFloat(invoice.item_lista),
          cnae: parseFloat(invoice.cnae),
          quantidade: parseFloat(invoice.quantidade.toString()),
          valor_unitario: parseFloat(invoice.valor_unitario.toString()),
          desconto: parseFloat(invoice.desconto.toString()),
          issueDate: invoice.issueDate,
          dateOfCompetence: invoice.dateOfCompetence,
          ValorDeducoes: parseFloat(invoice.valor_deducao),
          AliquotaPis:  parseFloat(invoice.aliquotas.pis),
          RetidoPis: invoice.retido.pis ? 1 : 2,
          ValorPis: parseFloat(invoice.valores.pis), 
          AliquotaCofins: parseFloat(invoice.aliquotas.cofins),
          RetidoCofins: invoice.retido.cofins ? 1 : 2,
          ValorCofins: parseFloat(invoice.valores.cofins), 
          AliquotaInss: parseFloat(invoice.aliquotas.inss),
          RetidoInss: invoice.retido.inss ? 1 : 2,
          ValorInss: parseFloat(invoice.valores.inss),
          AliquotaIr: parseFloat(invoice.aliquotas.ir), 
          RetidoIr: invoice.retido.ir ? 1 : 2, 
          ValorIr: parseFloat(invoice.valores.ir),
          AliquotaCsll: parseFloat(invoice.aliquotas.csll),
          RetidoCsll: invoice.retido.csll ? 1 : 2,
          ValorCsll: parseFloat(invoice.valores.csll),
          AliquotaCpp: parseFloat(invoice.aliquotas.cpp),
          RetidoCpp: invoice.retido.cpp ? 1 : 2,
          ValorCpp: parseFloat(invoice.valores.cpp),
          RetidoOutrasRetencoes: invoice.retido.outras ? 1 : 2,
          Aliquota: invoice.aliquotas.aliquota,
          DescontoIncondicionado: parseFloat(invoice.DescontoIncondicionado),
          DescontoCondicionado: parseFloat(invoice.DescontoCondicionado),
          IssRetido: invoice.retido.iss ? 1 : 2,
        }
      },
      valor: parseFloat(invoice.quantidade.toString()) * parseFloat(invoice.valor_unitario.toString()),
      admin: adminData,
    }

    try {
      if (adminData) {
        setIsGerating(true);
        await api.create_scheduling_admin(data);
        toast.success('Agendamento configurado com sucesso!');
        setIsGerating(false);
      } else {
        toast.success('O contrato está inativo!');
      }
    } catch (error) {
      toast.error('Erro ao agendar emissão');
      console.error('Erro ao agendar emissão:', error);
    }
  };  

  const loadInvoiceHistory = async (id: string) => {
    try {
      const scheduledata = await api.find_schedulings_byUserId(id);
      setSchedulings(scheduledata || []);
    } catch (error) {
      toast.error('Erro ao buscar agendamentos do cliente');
    }
  }

  const handleViewScheduleHistory = async () => {
    setOpenModal(false);
    setActiveModal('scheduling');
    loadInvoiceHistory(selectedUser!._id);
  }

  const handleCancelSchedule = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja cancelar o agendamento?")) {
      return;
    }

    try {
      await api.delete_schedule_ById(id);
      toast.success('Agendamento cancelado com sucesso!');
      location.reload();
    } catch (error) {
      toast.error('Erro ao cancelar agendamento');
      console.error('Erro ao cancelar agendamento:', error);
    }
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      if (invoice.tomador.cnpjcpf.replace(/\D/g, '').length === 14) {
        fetchCompanyData();
      }
/*       if (newCustomer.cpf.replace(/\D/g, '').length === 11) {
        fetchPersonData();
      } */
    }, 1500);

    return () => clearTimeout(timer);
  }, [invoice.tomador.cnpjcpf]);

  useEffect(()=>{
    loadData();
  },[])

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(()=>{
    const fetchItemServico = async () => {
      try {
        if(!invoice.cnae) return;
        const response = await api.Find_SERVICO_POR_CNAE(invoice.cnae);
        setItemServico(response || []);
      } catch (error) {
        toast.error('Erro ao buscar item de serviço');
      }
    };

    fetchItemServico();
  },[invoice.cnae])

  useEffect(()=> {
    async function FetchTaxation() {
      if(invoice.anexo && invoice.rbt12){

        setInvoice(prevState => ({
          ...prevState, // Mantém todos os outros campos do estado
          aliquotas: {
            aliquota: 0,
            iss: '',
            cofins: '',
            ir: '',
            cpp: '',
            pis: '',
            inss: '',
            csll: '',
            outras: ''
          },
          valores: {
            iss: '',
            cofins: '',
            ir: '',
            cpp: '',
            pis: '',
            inss: '',
            csll: '',
            outras: ''
          },
        }));

      const response = await api.Calculate_Taxation({anexo:invoice.anexo, receitaBruta12Meses:invoice.rbt12});

      if(response){
      setInvoice(prevState => ({
        ...prevState, // Mantém todos os outros campos do estado
        aliquotas: {
          aliquota: invoice.aliquota_item_lista || 0,
          iss: ((response.distribuicao.ISS * response.aliquotaEfetiva) / 100).toString() || '0',
          cofins: ((response.distribuicao.COFINS * response.aliquotaEfetiva) / 100).toString() || '0',
          ir: ((response.distribuicao.IRPJ * response.aliquotaEfetiva)/ 100).toString() || '0',
          cpp: ((response.distribuicao.CPP * response.aliquotaEfetiva) / 100).toString() || '0',
          pis: ((response.distribuicao.PIS * response.aliquotaEfetiva) / 100).toString() || '0',
          inss: invoice.aliquotas.inss || '0',
          csll: ((response.distribuicao.CSLL * response.aliquotaEfetiva) / 100).toString() || '0',
          outras: invoice.aliquotas.outras || '0',
        },
        valores: {
          iss: (parseFloat(invoice.valor_unitario) * (response.distribuicao.ISS * response.aliquotaEfetiva) / 10000).toFixed(2).toString() || '0',
          cofins: (parseFloat(invoice.valor_unitario) * (response.distribuicao.COFINS * response.aliquotaEfetiva) / 10000).toFixed(2).toString() || '0',
          ir: (parseFloat(invoice.valor_unitario) * (response.distribuicao.IRPJ * response.aliquotaEfetiva) / 10000).toFixed(2).toString() || '0',
          cpp: (parseFloat(invoice.valor_unitario) * (response.distribuicao.CPP * response.aliquotaEfetiva) / 10000).toFixed(2).toString() || '0',
          pis: (parseFloat(invoice.valor_unitario) * (response.distribuicao.PIS * response.aliquotaEfetiva) / 10000).toFixed(2).toString() || '0',
          inss: invoice.valores.inss || '0',
          csll: (parseFloat(invoice.valor_unitario) * (response.distribuicao.CSLL * response.aliquotaEfetiva) / 10000).toFixed(2).toString() || '0',
          outras: invoice.valores.outras || '0',
        }
      }));
    }
    }
    }
    FetchTaxation();
  },[invoice.rbt12, invoice.anexo, invoice.valor_unitario])
  

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="p-4 md:p-8">
    <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-gray-800">Gerenciamento de Usuários</h1>

    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 md:p-4 text-left">Nome</th>
            <th className="p-2 md:p-4 text-left hidden sm:table-cell">Email</th>
            <th className="p-2 md:p-4 text-left">Status</th>
            <th className="p-2 md:p-4 text-left">Ações</th>
            <th className="p-2 md:p-4 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {usersDB.map((user) => (
            <tr key={user._id} className="border-b border-gray-200">
              <td className="p-2 md:p-4">{user.name}</td>
              <td className="p-2 md:p-4 hidden sm:table-cell">{user.email}</td>      
              <td className="p-2 md:p-4">
                {user.status === 'active' ? (
                    <button onClick={()=> handleUpdateUser(user)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                    Desativar
                  </button>
                ) : (
                  <button onClick={()=> handleUpdateUser(user)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                  Ativar
                </button>
                )}
              </td>
                <td className="p-2 md:p-4">
                <IconButton
                  aria-label="more"
                  aria-controls={`user-menu-${user._id}`}
                  aria-haspopup="true"
                  onClick={(event) => handleMenuOpen(event, user._id)}
                >
                  <MoreVertIcon />               
                </IconButton>
                <Menu
                  id={`user-menu-${user._id}`}
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl) && selectedUserId === user._id}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                  onClick={() => {
                    handleOpenModal(user);
                    handleMenuClose();
                  }}
                  >
                  <VisibilityIcon sx={{ mr: 1 }} />
                  Ver Detalhes
                  </MenuItem>               
                </Menu>
                </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>

      {/* Modal Gerar Nota Fiscal */}
      {activeModal === 'invoice' && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Gerar Nota Fiscal</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="invoiceForm" onSubmit={handleGenerateInvoice} className="space-y-4">
              
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ tomador {loadingCnpj && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}</label>
                  {cnpjError && <p className="mt-1 text-sm text-red-600">{cnpjError}</p>}
                  <input
                    type="text"
                    placeholder='00.000.000/0000-00'
                    value={invoice.tomador.cnpjcpf || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        cnpjcpf: e.target.value
                      }
                    })}                  
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required                   
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">InscricaoMunicipal tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.InscricaoMunicipal || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        InscricaoMunicipal: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RazaoSocial tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.RazaoSocial || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        RazaoSocial: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereco tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Endereco || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Endereco: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>     
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numero tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Numero || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Numero: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Bairro || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Bairro: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>     
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CodigoMunicipio tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.CodigoMunicipio || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        CodigoMunicipio: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UF tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Uf || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Uf: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>   
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cep tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Cep || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Cep: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div> 
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Telefone || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Telefone: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>        
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Email || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Email: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>                                                                           
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNAE</label>
                    <input
                    type="text"
                    list="cnae-options"
                    value={invoice.cnae || ''}
                    onChange={(e) => setInvoice({ ...invoice, cnae: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite ou selecione um CNAE"
                    required
                    />
                    <datalist id="cnae-options">
                    {cnaes.map((cnae) => (
                      <option key={cnae.codigo} value={cnae.codigo}>
                      {cnae.codigo} - {cnae.descricao}
                      </option>
                    ))}
                    </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Serviço</label>
                  <select
                  value={invoice.item_lista}
                  onChange={(e) => {
                    const selectedItem = itemservico.find(item => item.listaServicoVo.id === e.target.value);
                    setInvoice({ 
                      ...invoice, 
                      item_lista: e.target.value,
                      aliquota_item_lista: selectedItem.listaServicoVo.aliquota // Armazena a descrição
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  >
                  <option value="" disabled>Selecione um serviço</option>
                  {itemservico.map((item, index) => (
                    <option key={index} value={item.listaServicoVo.id}>
                    {item.listaServicoVo.id}
                    </option>
                  ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço</label>
                    <input
                    type="text"
                    list="descricao-options"
                    value={invoice.descricao}
                    onChange={(e) => setInvoice({ ...invoice, descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite ou selecione uma descrição"
                    required
                    />
                    <datalist id="descricao-options">
                    {itemservico.map((item, index) => (
                      <option key={index} value={item.listaServicoVo.descricao}>
                      {item.listaServicoVo.descricao}
                      </option>
                    ))}
                    </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discriminação</label>
                  <input
                    type="text"
                    value={invoice.discriminacao || ''}
                    onChange={(e) => setInvoice({ ...invoice, discriminacao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    value={invoice.quantidade}
                    onChange={(e) => setInvoice({ ...invoice, quantidade: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário</label>
                  <input
                    type="text"
                    value={invoice.valor_unitario}
                    placeholder='ex: 1600.90'
                    onChange={(e) => {
                      const sanitizedValue = e.target.value.replace(/,/g, ''); // Remove commas
                      setInvoice({ ...invoice, valor_unitario: sanitizedValue });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dedução</label>
                  <input
                    type="text"
                    value={invoice.valor_deducao}
                    placeholder='ex: 00.00'
                    onChange={(e) => {
                      const sanitizedValue = e.target.value.replace(/,/g, ''); 
                      setInvoice({ ...invoice, valor_deducao: sanitizedValue });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                  <input
                    type="text"
                    value={invoice.desconto}
                    onChange={(e) => setInvoice({ ...invoice, desconto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder='ex: 00.00'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto Condicionado</label>
                  <input
                    type="text"
                    value={invoice.DescontoCondicionado}
                    onChange={(e) => setInvoice({ ...invoice, DescontoCondicionado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder='ex: 00.00'                       
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto Incondicionado</label>
                  <input
                    type="text"
                    value={invoice.DescontoIncondicionado}
                    onChange={(e) => setInvoice({ ...invoice, DescontoIncondicionado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder='ex: 00.00'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Competência</label>
                  <input
                    type="date"
                    value={invoice.dateOfCompetence}
                    onChange={(e) => setInvoice({ ...invoice, dateOfCompetence: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anexo do Simples Nacional</label>
                  <select
                    value={invoice.anexo}
                    onChange={(e) => setInvoice({ ...invoice, anexo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>Selecione o Anexo</option>
                    <option value="III">ANEXO III</option>
                    <option value="IV">ANEXO IV</option>
                    <option value="V">ANEXO V</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receita Bruta dos últimos 12 meses (RBT12)</label>
                  <input
                    type="text"
                    value={invoice.rbt12}
                    onChange={(e) => setInvoice({ ...invoice, rbt12: e.target.value })}
                    placeholder="ex: 180000.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tributo</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Alíquota (%)</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Valor</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Retido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { nome: 'ISS', campo: 'iss' },
                        { nome: 'Cofins', campo: 'cofins' },
                        { nome: 'IR', campo: 'ir' },
                        { nome: 'CPP', campo: 'cpp' },
                        { nome: 'PIS', campo: 'pis' },
                        { nome: 'INSS', campo: 'inss' },
                        { nome: 'CSLL', campo: 'csll' },
                        { nome: 'Outras', campo: 'outras' }
                      ].map(({ nome, campo }) => (
                        <tr key={campo} className="border-t border-gray-200">
                          <td className="px-4 py-2 text-sm text-gray-700">{nome}</td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={invoice.aliquotas?.[campo] || ''}
                              onChange={(e) => setInvoice({
                                ...invoice,
                                aliquotas: { ...invoice.aliquotas, [campo]: e.target.value }
                              })}
                              placeholder="%"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-400"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={invoice.valores?.[campo] || ''}
                              onChange={(e) => setInvoice({
                                ...invoice,
                                valores: { ...invoice.valores, [campo]: e.target.value }
                              })}
                              placeholder="R$"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-400"
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={invoice.retido?.[campo] || false}
                              onChange={(e) => setInvoice({
                                ...invoice,
                                retido: { ...invoice.retido, [campo]: e.target.checked }
                              })}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

      {/* Modal Histórico de Notas Fiscais */}
      {selectedUser && activeModal === 'history' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto px-2">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-[95%] sm:w-[90%] md:w-[70%] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Histórico de Notas Fiscais</h2>
              <button onClick={closeAllModals} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

          <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800">{selectedUser.name}</h3>
          <div className="overflow-x-auto shadow border rounded-lg mt-2">
          <div className="max-h-[60vh] overflow-y-auto">
          {/* Versão Desktop (mostrada em telas médias/grandes) */}
          <table className="w-full table-auto text-sm hidden sm:table">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b">
                <th className="py-3 px-2 text-left font-medium text-gray-600">Status</th>
                <th className="py-3 px-2 text-left font-medium text-gray-600">Descrição</th>
                <th className="py-3 px-2 text-left font-medium text-gray-600">Valor</th>
                <th className="py-3 px-2 text-left font-medium text-gray-600">Data</th>
                <th className="py-3 px-2 text-left font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
          {invoiceHistory.length === 0 ? (
            <tr className="border-b">
              <td colSpan={5} className="py-4 px-2 text-center text-gray-500">Nenhuma nota fiscal encontrada</td>
            </tr>
          ) : (
            invoiceHistory.map((invoice) => (               
              <tr key={invoice.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2 text-gray-700">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    invoice.status === 'emitida' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                    invoice.status === 'substituida' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status || ''}
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-700 max-w-[80px] sm:max-w-[300px] truncate" title={invoice.data.Rps.Servico.Discriminacao || ''}>
                  {invoice.data.Rps.Servico.Discriminacao || ''}
                </td>
                <td className="py-3 px-2 text-gray-700">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(invoice.valor * invoice.data.Rps.Servico.ListaItensServico[0].Quantidade)}
                </td>
                <td className="py-3 px-2 text-gray-700">
                  {new Date(invoice.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  }) || ''}
                </td>
                <td className="py-3 px-2 text-gray-700">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => downloadCustomerXml(invoice)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Baixar XML"
                    >
                      <FileCodeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => criarNotaFiscalPDF(invoice)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Baixar PDF"
                    >
                      <File className="w-4 h-4" />
                    </button>
{/*                     <button
                      onClick={() => handleModalReplaceInvoice(invoice)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Substituir NFSE"
                    >
                      <ListRestart className="w-4 h-4" />
                    </button> */}
                    {(invoice.status === 'emitida' || invoice.status === 'substituida') && (
                      <button
                        onClick={() => handleCancelInvoice(invoice)}
                        className="text-red-600 hover:text-red-800"
                        title="Cancelar Nota Fiscal"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://www.aginotas.com.br/detalhesNfse/${invoice._id}`);
                        toast.success('Link copiado para a área de transferência!');
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Copiar Link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>                   
            ))
          )}
        </tbody>
      </table>

      {/* Versão Mobile (mostrada em telas pequenas) */}
      <div className="sm:hidden">
        {invoiceHistory.length === 0 ? (
          <div className="py-4 px-2 text-center text-gray-500">Nenhuma nota fiscal encontrada</div>
        ) : (
          <div className="divide-y">
            {invoiceHistory.map((invoice) => (
              <div key={invoice.id} className="p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      invoice.status === 'emitida' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                      invoice.status === 'substituida' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status || ''}
                    </span>
                    <p className="font-medium mt-1 truncate" title={invoice.data.Rps.Servico.Discriminacao || ''}>
                      {invoice.data.Rps.Servico.Discriminacao || ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(invoice.valor * invoice.data.Rps.Servico.ListaItensServico[0].Quantidade)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(invoice.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      }) || ''}
                    </p>
                  </div>
                </div>
                
                {/* Ações em mobile */}
                <div className="flex justify-between mt-2 pt-2 border-t">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => downloadCustomerXml(invoice)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Baixar XML"
                    >
                      <FileCodeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => criarNotaFiscalPDF(invoice)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Baixar PDF"
                    >
                      <File className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://www.aginotas.com.br/detalhesNfse/${invoice._id}`);
                        toast.success('Link copiado para a área de transferência!');
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Copiar Link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {(invoice.status === 'emitida' || invoice.status === 'substituida') && (
                    <button
                      onClick={() => handleCancelInvoice(invoice)}
                      className="text-red-600 hover:text-red-800"
                      title="Cancelar Nota Fiscal"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
  </div>
  </div>
  </div>
      )}    

      {/* Modal de Configuração de Agendamento */}
      {activeModal === 'subscription' && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Emita suas Notas de Forma Programada</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="subscriptionForm" onSubmit={handleSaveSubscription} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ tomador {loadingCnpj && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}</label>
                  {cnpjError && <p className="mt-1 text-sm text-red-600">{cnpjError}</p>}
                  <input
                    type="text"
                    placeholder='00.000.000/0000-00'
                    value={invoice.tomador.cnpjcpf || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        cnpjcpf: e.target.value
                      }
                    })}                  
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required                   
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">InscricaoMunicipal tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.InscricaoMunicipal || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        InscricaoMunicipal: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RazaoSocial tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.RazaoSocial || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        RazaoSocial: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereco tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Endereco || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Endereco: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>     
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numero tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Numero || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Numero: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Bairro || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Bairro: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>     
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CodigoMunicipio tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.CodigoMunicipio || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        CodigoMunicipio: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UF tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Uf || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Uf: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>   
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cep tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Cep || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Cep: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div> 
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Telefone || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Telefone: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>        
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Email || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Email: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>                 
              <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNAE</label>
                    <input
                    type="text"
                    list="cnae-options"
                    value={invoice.cnae || ''}
                    onChange={(e) => setInvoice({ ...invoice, cnae: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite ou selecione um CNAE"
                    required
                    />
                    <datalist id="cnae-options">
                    {cnaes.map((cnae) => (
                      <option key={cnae.codigo} value={cnae.codigo}>
                      {cnae.codigo} -- {cnae.descricao}
                      </option>
                    ))}
                    </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Serviço</label>
                  <select
                  value={invoice.item_lista}
                  onChange={(e) => {
                    const selectedItem = itemservico.find(item => item.listaServicoVo.id === e.target.value);
                    setInvoice({ 
                      ...invoice, 
                      item_lista: e.target.value,
                      aliquota_item_lista: selectedItem.listaServicoVo.aliquota // Armazena a descrição
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  >
                  <option value="" disabled>Selecione um serviço</option>
                  {itemservico.map((item, index) => (
                    <option key={index} value={item.listaServicoVo.id}>
                    {item.listaServicoVo.id}
                    </option>
                  ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço</label>
                    <input
                    type="text"
                    list="descricao-options"
                    value={invoice.descricao}
                    onChange={(e) => setInvoice({ ...invoice, descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite ou selecione uma descrição"
                    required
                    />
                    <datalist id="descricao-options">
                    {itemservico.map((item, index) => (
                      <option key={index} value={item.listaServicoVo.descricao}>
                      {item.listaServicoVo.descricao}
                      </option>
                    ))}
                    </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discriminação</label>
                  <input
                    type="text"
                    value={invoice.discriminacao || ''}
                    onChange={(e) => setInvoice({ ...invoice, discriminacao: e.target.value })}
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
                    type="text"
                    value={invoice.valor_unitario}
                    placeholder='ex: 1600.90'
                    onChange={(e) => {
                      const sanitizedValue = e.target.value.replace(/,/g, ''); // Remove commas
                      setInvoice({ ...invoice, valor_unitario: sanitizedValue });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dedução</label>
                  <input
                    type="text"
                    value={invoice.valor_deducao}
                    placeholder='ex: 00.00'
                    onChange={(e) => {
                      const sanitizedValue = e.target.value.replace(/,/g, ''); 
                      setInvoice({ ...invoice, valor_deducao: sanitizedValue });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                  <input
                    type="text"
                    value={invoice.desconto}
                    onChange={(e) => setInvoice({ ...invoice, desconto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder='ex: 00.00'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto Condicionado</label>
                  <input
                    type="text"
                    value={invoice.DescontoCondicionado}
                    onChange={(e) => setInvoice({ ...invoice, DescontoCondicionado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder='ex: 00.00'                       
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto Incondicionado</label>
                  <input
                    type="text"
                    value={invoice.DescontoIncondicionado}
                    onChange={(e) => setInvoice({ ...invoice, DescontoIncondicionado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder='ex: 00.00'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                  <input
                    type="text"
                    value={invoice.desconto}
                    placeholder='0'
                    onChange={(e) => setInvoice({ ...invoice, desconto: e.target.value })}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Competência</label>
                  <input
                    type="date"
                    value={invoice.dateOfCompetence}
                    onChange={(e) => setInvoice({ ...invoice, dateOfCompetence: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anexo do Simples Nacional</label>
                  <select
                    value={invoice.anexo}
                    onChange={(e) => setInvoice({ ...invoice, anexo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>Selecione o Anexo</option>
                    <option value="III">ANEXO III</option>
                    <option value="IV">ANEXO IV</option>
                    <option value="V">ANEXO V</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receita Bruta dos últimos 12 meses (RBT12)</label>
                  <input
                    type="text"
                    value={invoice.rbt12}
                    onChange={(e) => setInvoice({ ...invoice, rbt12: e.target.value })}
                    placeholder="ex: 180000.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tributo</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Alíquota (%)</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Valor</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Retido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { nome: 'ISS', campo: 'iss' },
                        { nome: 'Cofins', campo: 'cofins' },
                        { nome: 'IR', campo: 'ir' },
                        { nome: 'CPP', campo: 'cpp' },
                        { nome: 'PIS', campo: 'pis' },
                        { nome: 'INSS', campo: 'inss' },
                        { nome: 'CSLL', campo: 'csll' },
                        { nome: 'Outras', campo: 'outras' }
                      ].map(({ nome, campo }) => (
                        <tr key={campo} className="border-t border-gray-200">
                          <td className="px-4 py-2 text-sm text-gray-700">{nome}</td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={invoice.aliquotas?.[campo] || ''}
                              onChange={(e) => setInvoice({
                                ...invoice,
                                aliquotas: { ...invoice.aliquotas, [campo]: e.target.value }
                              })}
                              placeholder="%"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-400"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={invoice.valores?.[campo] || ''}
                              onChange={(e) => setInvoice({
                                ...invoice,
                                valores: { ...invoice.valores, [campo]: e.target.value }
                              })}
                              placeholder="R$"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-400"
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={invoice.retido?.[campo] || false}
                              onChange={(e) => setInvoice({
                                ...invoice,
                                retido: { ...invoice.retido, [campo]: e.target.checked }
                              })}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                      {/* <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Cliente</th> */}
                      <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Descrição</th>
                      <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Dia do Faturamento</th>
                      <th className="py-2 px-4 text-right text-sm font-medium text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedulings.map((schedule) => (
                      <tr key={schedule.user_id} className="border-b">
                        {/* <td className="py-2 px-4 text-sm text-gray-700">{schedule?.name || schedule?.razaoSocial}</td> */}
                        <td className="py-2 px-4 text-sm text-gray-700">{schedule.data?.servico?.Discriminacao || ''}</td>
                        <td className="py-2 px-4 text-sm text-gray-700">{schedule.billing_day}</td>
                        <td className="py-2 px-4 text-right">
                        <button
                          onClick={() => handleCancelSchedule(schedule._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Cancelar Agendamento"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        </td>
                      </tr>
                    ))}
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

    <Modal open={openModal} onClose={handleCloseModal}>
      <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 4,
      }}
      >
      <Typography variant="h5" component="h2" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
        Detalhes do Usuário
      </Typography>
      {infoSubscription ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', pb: 1 }}>
          Informações da Assinatura
        </Typography>
        <Typography><strong>ID da Assinatura:</strong> {infoSubscription.id}</Typography>
        <Typography><strong>Status:</strong> {infoSubscription.status}</Typography>
        <Typography><strong>Data de Criação:</strong> {new Date(infoSubscription.created_at).toLocaleDateString()}</Typography>
        <Typography><strong>Plano:</strong> {infoSubscription.plan?.name}</Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', mt: 3, pb: 1 }}>
          Detalhes do Cliente
        </Typography>
        <Typography><strong>Nome:</strong> {infoSubscription.customer?.name}</Typography>
        <Typography><strong>Email:</strong> {infoSubscription.customer?.email}</Typography>
        <Typography><strong>Documento:</strong> {infoSubscription.customer?.document}</Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', mt: 3, pb: 1 }}>
          Detalhes do Cartão
        </Typography>
        <Typography><strong>Marca:</strong> {infoSubscription.card?.brand}</Typography>
        <Typography><strong>Últimos Dígitos:</strong> {infoSubscription.card?.last_four_digits}</Typography>
        <Typography><strong>Nome do Titular:</strong> {infoSubscription.card?.holder_name}</Typography>
        </Box>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'gray' }}>
        Nenhuma informação disponível.
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4 }}>
        <div>
          <Button 
            variant="contained" 
            color="success"
            onClick={handleClick}
            aria-controls="actions-menu"
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            Ações NFSE
          </Button>
          
          <Menu
            id="actions-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenu}
            MenuListProps={{
              'aria-labelledby': 'actions-button',
            }}
          >
            <MenuItem onClick={() => {
              handleCloseMenu();
              handleViewGenerateNfse(selectedUserId);
            }}>
              Emitir NFSE
            </MenuItem>
            <MenuItem onClick={() => {
              handleCloseMenu();
              handleConfigureSubscription();
            }}>
              NFSE Recorrente
            </MenuItem>
            <MenuItem onClick={() => {
              handleCloseMenu();
              handleViewInvoiceHistory();
            }}>
              Histórico NFSE
            </MenuItem>
            <MenuItem onClick={() => {
              handleCloseMenu();
              handleViewScheduleHistory();
            }}>
              Agendamento NFSE
            </MenuItem>            
          </Menu>
        </div>

        <Button variant="contained" color="primary" onClick={handleCloseModal}>
          Fechar
        </Button>
      </Box>
      </Box>
    </Modal>
  </div>
);
}
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Receipt, Loader2 } from 'lucide-react';
import { api } from '../lib/api.ts';
import nomelogodelvind from '../public/aginotaslogoescura.svg';
import { toast } from 'sonner';

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [municipalRegistration, setMunicipalRegistration] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [states, setStates] = useState<{ sigla: string, nome: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState({
    line_1: '',
    line_2: '',
    zip_code: '',
    city: '',
    state: '',
    country: 'BR',
  });
  const [telefone, setTelefone] = useState({
    country_code: '', 
    area_code: '', 
    number: ''
  });
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [cnpjError, setCnpjError] = useState('');
  const [subscription, setSubscription] = useState(true);
  const [subscriptionstep2, setSubscriptionstep2] = useState(false);
  const [subscriptionstep3, setSubscriptionstep3] = useState(false);

/*   const [user, setUser] = useState({
    _id: '',
    id_client_pagarme: '',
  }); */

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    holderName: '',
    expMonth: '',
    expYear: '',
    cvv: '',
  });

  // Fetch da lista de estados
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        const data = await response.json();
        const stateNames = data.map((state: any) => ({
          sigla: state.sigla,
          nome: state.nome,
        }));
        setStates(stateNames);
      } catch (err) {
        console.error('Erro ao carregar estados:', err);
      }
    };
    fetchStates();
  }, []);

  // Fetch das cidades quando estado muda
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedState) return;
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`
        );
        const data = await response.json();
        const cityNames = data.map((city: any) => city.nome);
        setCities(cityNames);
        setSelectedCity(''); // Reseta a cidade selecionada
      } catch (err) {
        console.error('Erro ao carregar cidades:', err);
      }
    };
    fetchCities();
  }, [selectedState]);

  // Validação básica de CNPJ
  const validateCnpj = (cnpj: string): boolean => {
    const cleanedCnpj = cnpj.replace(/\D/g, '');

    if (cleanedCnpj.length !== 14) {
      setCnpjError('CNPJ deve ter 14 dígitos');
      return false;
    }

    // Padrão básico de CNPJ válido (pode implementar validação completa depois)
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/;
    if (cnpj.length > 0 && !cnpjRegex.test(cnpj) && cnpj.length >= 14) {
      setCnpjError('Formato inválido. Use 00.000.000/0000-00');
      return false;
    }

    setCnpjError('');
    return true;
  };

  // Formata o CNPJ enquanto digita
  const formatCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, '');

    // Aplica a formatação do CNPJ
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    if (cleaned.length > 5) formatted = `${formatted.slice(0, 6)}.${formatted.slice(6)}`;
    if (cleaned.length > 8) formatted = `${formatted.slice(0, 10)}/${formatted.slice(10)}`;
    if (cleaned.length > 12) formatted = `${formatted.slice(0, 15)}-${formatted.slice(15, 17)}`;

    return formatted.slice(0, 18); // Limita ao tamanho máximo
  };

  // Busca dados da empresa quando CNPJ muda
  // Função para buscar dados da empresa quando o CNPJ muda
  useEffect(() => {
    const fetchCompanyData = async () => {
      const cleanedCnpj = cnpj.replace(/\D/g, '');

      if (!validateCnpj(cnpj) || cleanedCnpj.length !== 14) return;

      setLoadingCnpj(true);
      setError('');
      setCnpjError('');

      try {
        const response = await fetch(`https://publica.cnpj.ws/cnpj/${cleanedCnpj}`);

        if (!response.ok) throw new Error('Erro na consulta');

        const data = await response.json();

        if (data.status === 'ERROR' || data.error) {
          throw new Error(data.message || 'CNPJ não encontrado');
        }

        // Preenche os campos automaticamente com os dados retornados
        setName(data.razao_social || '');
        setMunicipalRegistration(data.inscricao_municipal || '');
        setEmail(data.estabelecimento.email || '');
        setAddress(`${data.estabelecimento.tipo_logradouro || ''} ${data.estabelecimento.logradouro || ''}`.trim());

        // Preenche estado e cidade
        if (data.estabelecimento.estado) {
          setSelectedState(data.estabelecimento.estado.sigla);
          // Aguarda o carregamento das cidades antes de definir a cidade selecionada
          setTimeout(() => {
            if (data.estabelecimento.cidade.nome) {
              setSelectedCity(data.estabelecimento.cidade.nome);
            }
          }, 800);
        }

      } catch (err) {
        console.error('Erro na consulta:', err);
        setCnpjError('Dados não encontrados. Preencha manualmente');
        // Mantém o CNPJ mas limpa outros campos
        setName('');
        setMunicipalRegistration('');
        setSelectedState('');
        setSelectedCity('');
        setAddress('');
      } finally {
        setLoadingCnpj(false);
      }
    };

    const timer = setTimeout(() => {
      if (cnpj.replace(/\D/g, '').length === 14) {
        fetchCompanyData();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [cnpj]);


/*   const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    if (!validateCnpj(cnpj)) {
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    try {
      const user_created = await api.create_user({
        name,
        cnpj,
        municipalRegistration,
        email,
        telefone,
        password,
        selectedState,
        selectedCity,
        address
      });

      setUser(user_created);


      setSubscriptionstep3(true);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setIsLoading(true);
    setError('');

    const idPlan = document.cookie
      .split('; ')
      .find((row) => row.startsWith('idPlan='))
      ?.split('=')[1];

    if (!idPlan) {
      setError('Plano não encontrado. Por favor, tente novamente.');
      setIsLoading(false);
      return;
    }

    if (!user) {
      setError('Usuário não encontrado. Por favor, tente novamente.');
      setIsLoading(false);
      return;
    }

    if (!cardDetails) {
      setError('Dados do cartão nulos. Por favor, tente novamente.');
      setIsLoading(false);
      return;
    }

    const data = {
      idUser: user._id,
      name,
      cnpj,
      municipalRegistration,
      email,
      telefone,
      selectedState,
      selectedCity,
      id_plan: idPlan,
      address,
      id_customer: user.id_client_pagarme,
      cardNumber: cardDetails.cardNumber,
      holderName: cardDetails.holderName,
      expMonth: cardDetails.expMonth,
      expYear: cardDetails.expYear,
      cvv: cardDetails.cvv,
    };

    try {
      //await api.create_subscription_user(data);
      //navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
      alert('Ocorreu um erro ao criar a conta do usuário!');
      setIsLoading(false);
      console.error('Ocorreu um erro ao criar a conta do usuário!');
      return;
    }
  }

  //ONDE VAI CHAMAR TUDO
  const handleSubmitSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !cardDetails.cardNumber ||
      !cardDetails.holderName ||
      !cardDetails.expMonth ||
      !cardDetails.expYear ||
      !cardDetails.cvv
    ) {
      setError("Por favor, preencha todos os campos.");
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    try {
      await handleSubmit();
      await handleCreateAccount();
    } catch (error) {
      toast.error("Não foi possível realizar essa operação!");
    }
  } */

  const handleRegisterAndSubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validação dos campos do cartão (se etapa 3)
    if (subscriptionstep3) {
      if (
        !cardDetails.cardNumber ||
        !cardDetails.holderName ||
        !cardDetails.expMonth ||
        !cardDetails.expYear ||
        !cardDetails.cvv
      ) {
        setError("Por favor, preencha todos os campos do cartão.");
        toast.error("Por favor, preencha todos os campos do cartão.");
        setIsLoading(false);
        return;
      }
    }

    // Validação do CNPJ
    if (!validateCnpj(cnpj)) {
      setIsLoading(false);
      return;
    }

    // Validação das senhas
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    // Criação do usuário
    try {
      const user_created = await api.create_user({
        name,
        cnpj,
        municipalRegistration,
        email,
        telefone,
        password,
        selectedState,
        selectedCity,
        address
      });

      // Se não for etapa 3, só avança para etapa 3
      if (!subscriptionstep3) {
        setSubscriptionstep3(true);
        setIsLoading(false);
        return;
      }

      // Se for etapa 3, faz a assinatura
      const idPlan = document.cookie
        .split('; ')
        .find((row) => row.startsWith('idPlan='))
        ?.split('=')[1];

      if (!idPlan) {
        setError('Plano não encontrado. Por favor, tente novamente.');
        setIsLoading(false);
        return;
      }

      if (!user_created) {
        setError('Usuário não encontrado. Por favor, tente novamente.');
        setIsLoading(false);
        return;
      }

      const data = {
        idUser: user_created._id,
        name,
        cnpj,
        municipalRegistration,
        email,
        telefone,
        selectedState,
        selectedCity,
        id_plan: idPlan,
        address,
        id_customer: user_created.id_client_pagarme,
        cardNumber: cardDetails.cardNumber,
        holderName: cardDetails.holderName,
        expMonth: cardDetails.expMonth,
        expYear: cardDetails.expYear,
        cvv: cardDetails.cvv,
      };
      await api.create_subscription_user(data);
      navigate('/login');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
      toast.error("Não foi possível realizar essa operação!");
    } finally {
      setIsLoading(false);
    }
  };


    return subscriptionstep3 ? (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
        <Receipt className="w-12 h-12 text-blue-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Adicione seu cartão de crédito</h1>
        <p className="text-gray-500">Complete o cadastro para ativar sua assinatura.</p>
          </div>
          <form
            onSubmit={handleRegisterAndSubscribe}
            className="space-y-4"
          >
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Número do Cartão
              </label>
              <input
                id="cardNumber"
                type="text"
                maxLength={16}
                value={cardDetails.cardNumber}
                onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="0000 0000 0000 0000"
              />
            </div>

            <div>
              <label htmlFor="holderName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Titular
              </label>
              <input
                id="holderName"
                type="text"
                value={cardDetails.holderName}
                onChange={(e) => setCardDetails({ ...cardDetails, holderName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Nome como está no cartão"
              />
            </div>

            <div className="flex space-x-4">
              <div>
                <label htmlFor="expMonth" className="block text-sm font-medium text-gray-700 mb-1">
                  Mês de Expiração
                </label>
                <input
                  id="expMonth"
                  type="number"
                  min={1}
                  max={12}
                  value={cardDetails.expMonth}
                  onChange={(e) => setCardDetails({ ...cardDetails, expMonth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="MM"
                />
              </div>

              <div>
                <label htmlFor="expYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Ano de Expiração
                </label>
                <input
                  id="expYear"
                  type="number"
                  min={23}
                  max={99}
                  value={cardDetails.expYear}
                  onChange={(e) => setCardDetails({ ...cardDetails, expYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="YY"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                id="cvv"
                type="password"
                maxLength={3}
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="CVV"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" size={18} />
                Carregando...
              </span>
              ) : (
              'Finalizar cadastro'
              )}
            </button>
          </form>
        </div>
    </div>
    ) : (
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
          <h1 className="text-2xl font-bold text-gray-900">Crie sua conta</h1>
          <p className="text-gray-500">Comece seu teste grátis de 7 dias</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Etapa 1*/}
        {subscription && (
          <form className="space-y-4">
            <div>
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ {loadingCnpj && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
            </label>
            <input
              id="cnpj"
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(formatCnpj(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                cnpjError ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              placeholder="00.000.000/0000-00"
            />
            {cnpjError && (
              <p className="mt-1 text-sm text-red-600">{cnpjError}</p>
            )}
          </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Empresa
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="municipalRegistration" className="block text-sm font-medium text-gray-700 mb-1">
                Inscrição Municipal
              </label>
              <input
                id="municipalRegistration"
                type="text"
                value={municipalRegistration}
                onChange={(e) => setMunicipalRegistration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

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
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
              </label>
              <div className="flex space-x-2">
              <input
                id="country_code"
                type="text"
                value={telefone.country_code}
                onChange={(e) => setTelefone({ ...telefone, country_code: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="55"
                maxLength={2}
              />
              <input
                id="area_code"
                type="text"
                value={telefone.area_code}
                onChange={(e) => setTelefone({ ...telefone, area_code: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="DDD"
                maxLength={2}
              />
              <input
                id="number"
                type="text"
                value={telefone.number}
                onChange={(e) => setTelefone({ ...telefone, number: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Número"
                maxLength={9}
              />
              </div>
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
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
              // Verifica se todos os campos obrigatórios estão preenchidos
              if (
                !cnpj ||
                !!cnpjError ||
                !name ||
                !municipalRegistration ||
                !email ||
                !telefone.country_code ||
                !telefone.area_code ||
                !telefone.number ||
                !password ||
                !confirmPassword
              ) {
                setError('Por favor, preencha todos os campos obrigatórios corretamente.');
                return;
              }
              setError('');
              setSubscriptionstep2(true);
              setSubscription(false);
              }}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" size={18} />
                Carregando...
              </span>
              ) : (
              'Avançar'
              )}
            </button>
          </form>
        )}

        {/* Etapa 2*/}
        {subscriptionstep2 && (
          <form className="space-y-4 mt-6">
            <div>
              <label htmlFor="address_line_1" className="block text-sm font-medium text-gray-700 mb-1">
              Endereço (Rua, Avenida, etc.)
              </label>
              <input
              id="address_line_1"
              type="text"
              value={address.line_1}
              onChange={(e) => setAddress({ ...address, line_1: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Ex: Rua das Flores, 123"
              />
            </div>

            <div>
              <label htmlFor="address_line_2" className="block text-sm font-medium text-gray-700 mb-1">
              Complemento (opcional)
              </label>
              <input
              id="address_line_2"
              type="text"
              value={address.line_2}
              onChange={(e) => setAddress({ ...address, line_2: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Apartamento, bloco, etc."
              />
            </div>

            <div>
              <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
              CEP
              </label>
              <input
              id="zip_code"
              type="text"
              value={address.zip_code}
              onChange={(e) => setAddress({ ...address, zip_code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="00000-000"
              maxLength={9}
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
              </label>
              <select
              id="state"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setAddress({ ...address, state: e.target.value });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              >
              <option value="" disabled>
                Selecione um estado
              </option>
              {states.map((state) => (
                <option key={state.sigla} value={state.sigla}>
                {state.nome} ({state.sigla})
                </option>
              ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
              </label>
              <select
              id="city"
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setAddress({ ...address, city: e.target.value });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!selectedState}
              >
              <option value="" disabled>
                {selectedState ? 'Selecione uma cidade' : 'Selecione um estado primeiro'}
              </option>
              {cities.map((city) => (
                <option key={city} value={city}>
                {city}
                </option>
              ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
              // Verifica se todos os campos obrigatórios estão preenchidos
              if (
                !address.line_1 ||
                !address.zip_code ||
                !selectedState ||
                !selectedCity
              ) {
                setError('Por favor, preencha todos os campos obrigatórios do endereço.');
                return;
              }
              setError('');
              setSubscriptionstep3(true);
              setSubscriptionstep2(false);
              }}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" size={18} />
                Carregando...
              </span>
              ) : (
              'Avançar'
              )}
            </button>
            </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
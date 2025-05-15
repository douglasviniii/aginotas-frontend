import React, { useState, useEffect } from 'react';
import { CircularProgress, Typography} from '@mui/material';
import { api } from '../lib/api';


export function SubscriptionManagement() {

    const [loading, setLoading] = useState(false);

    const [tab, setTab] = useState('');
 
    const [plans, setPlans] = useState([
        {
            _id: '',
            id: '',
            created_at: '',
            statement_descriptor: '',
            trial_period_days: '',
            billing_type: '',
            status: '',
            items: [
                {
                    id: '',
                    name: '',
                    created_at: '',
                    status: '',
                    pricing_scheme:{
                        price: 0,
                    }
                }
            ],
            name: '',
            description: '',
            price: 0,
        }
    ]);

    const [subscriptions, setSubscriptions] = useState([
        {
            id: '',    
            status: '',
            customer: {
                document: '',
                email: '',
                id: '',
                name: '',
            },
            plan:{
                id: '',
                status: '',
            },
            current_cycle:{
                billing_at: '',
                status:'',
            }
        }
    ]);

    const [error, setError] = useState(null);

    const [modalEditPlan, setModalEditPlan] = useState('');

    const [item, setItem] = useState({
        id_plan: '',
        id_item: '',
        price: '',
        name :'',
        description: '',
        quantity: '',
        status: '',
    })

    const [plan, setPlan] = useState()

    const handleViewEditPlan = (plan: any) => {
        setPlan(plan);
        setModalEditPlan('editplan');

        item.id_plan = plan.id;
        item.id_item = plan.items[0].id;
        item.name = plan.items[0].name;
        item.description = plan.items[0].description;
        item.quantity = plan.items[0].quantity;
        item.status = plan.items[0].status;
        item.price = plan.items[0].pricing_scheme.price;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!window.confirm("Tem certeza que deseja modificar?")) {
            return;
        }

        const data = {
            plan_id: item.id_plan,
            item_id: item.id_item,
            price: parseInt(item.price),
            name : item.name,
            description: item.description || '',
            quantity: parseInt(item.quantity),
            status: item.status,            
        }

        try {
            await api.Edit_Plan(data);
            loadData();
        } catch (error) {
            alert('Ocorreu um erro!');
            return;
        }
    }

    const handleCancelSubscription = async (subscriptionId: string) => {

        if (!window.confirm("Tem certeza que deseja cancelar a assinatura?")) {
            return;
        }

        try {
            await api.Cancel_Subscription(subscriptionId);
            loadData();
        } catch (error) {   
            alert('Ocorreu um erro!');
            return;    
        }
    }

    async function loadData() {
        setLoading(true);

        const planos = await api.find_plans();
        setPlans(planos.data);
        const subscriptions = await api.Find_All_Subscriptions();
        setSubscriptions(subscriptions.data);

        setLoading(false);
    }

    useEffect(()=>{
        loadData();
    },[])

    
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

    //console.log(subscriptions);

    return (
        <>
            <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div className="flex space-x-4 mb-8">
                    <button
                        className={`px-6 py-2 rounded-full font-semibold shadow transition-all duration-200 ${
                            tab === 'plans'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white scale-105'
                                : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
                        }`}
                        onClick={() => setTab('plans')}
                    >
                        Planos
                    </button>
                    <button
                        className={`px-6 py-2 rounded-full font-semibold shadow transition-all duration-200 ${
                            tab === 'subscriptions'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white scale-105'
                                : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
                        }`}
                        onClick={() => setTab('subscriptions')}
                    >
                        Assinaturas
                    </button>
                </div>
                {tab === 'plans' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
                        {plans.map((plan) => (
                            <div
                                key={plan._id}
                                className="relative bg-white rounded-2xl shadow-xl p-6 flex flex-col items-start border border-blue-100 hover:shadow-2xl transition-all duration-200"
                            >
                                <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                                    {plan.billing_type}
                                </span>
                                <Typography variant="h6" className="text-indigo-900 font-bold mb-1 truncate w-full">
                                    {plan.items[0].name}
                                </Typography>
                                <Typography className="text-gray-500 mb-2">
                                    {plan.description}
                                </Typography>
                                <Typography className="text-gray-400 text-xs mb-2">
                                    Criado em: {new Date(plan.items[0].created_at).toLocaleDateString('pt-BR')}
                                </Typography>
                                <div className="flex items-center mb-2">
                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${plan.items[0].status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    <span className="text-sm text-gray-600">Status: {plan.items[0].status}</span>
                                </div>
                                <Typography className="text-gray-600 mb-2">
                                    {plan.statement_descriptor}
                                </Typography>
                                <Typography className="text-gray-600 mb-2">
                                    <span className="font-semibold">Período gratuito:</span> {plan.trial_period_days} dias
                                </Typography>
                                <Typography className="text-2xl font-extrabold text-indigo-700 mb-4">
                                    R$ {(plan.items[0].pricing_scheme.price / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Typography>
                                <button
                                    onClick={() => handleViewEditPlan(plan)}
                                    className="mt-auto px-5 py-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold shadow hover:scale-105 transition-all duration-200"
                                >
                                    Editar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {tab === 'subscriptions' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
                        {subscriptions.map((subscription) => (
                            <div
                                key={subscription.id}
                                className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-start border border-indigo-100 hover:shadow-2xl transition-all duration-200"
                            >
                                <div className="flex items-center mb-3 w-full">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg mr-3 shadow">
                                        {subscription.customer.name?.charAt(0) || 'C'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <Typography variant="h6" className="text-indigo-900 font-bold truncate w-full">
                                            {subscription.customer.name}
                                        </Typography>
                                        <Typography className="text-xs text-gray-400 truncate w-full">
                                            {subscription.customer.email}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="space-y-1 mb-2 w-full">
                                    <Typography className="text-gray-600 text-sm">
                                        <strong>ID Cliente:</strong> {subscription.customer.id}
                                    </Typography>
                                    <Typography className="text-gray-600 text-sm">
                                        <strong>Documento:</strong> {subscription.customer.document}
                                    </Typography>
                                    <Typography className="text-gray-600 text-sm">
                                        <strong>ID Plano:</strong> {subscription.plan.id}
                                    </Typography>
                                    <Typography className="text-gray-600 text-sm">
                                        <strong>Status Plano:</strong> {subscription.plan.status}
                                    </Typography>
                                    <Typography className="text-gray-600 text-sm">
                                        <strong>Status Assinatura:</strong> {subscription.status}
                                    </Typography>
                                    {subscription.status !== 'canceled' ? (
                                        <Typography className="text-gray-600 text-sm">
                                            <strong>Faturamento em:</strong>{' '}
                                            {new Date(
                                                new Date(subscription?.current_cycle?.billing_at).setDate(
                                                    new Date(subscription?.current_cycle?.billing_at).getDate() + 1
                                                )
                                            ).toLocaleDateString('pt-BR')}
                                            <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                                {subscription?.current_cycle?.status}
                                            </span>
                                        </Typography>
                                    ) : (
                                        <Typography className="text-gray-400 text-sm italic">
                                            Assinatura cancelada
                                        </Typography>
                                    )}
                                </div>
                                <div className="mt-4 flex space-x-2 w-full">
                                    {subscription.status !== 'canceled' && (
                                        <button
                                            onClick={() => handleCancelSubscription(subscription.id)}
                                            className="flex-1 px-4 py-2 rounded-full bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold shadow hover:scale-105 transition-all duration-200"
                                        >
                                            Desativar Assinatura
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {modalEditPlan === 'editplan' && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                                onClick={() => setModalEditPlan('')}
                                aria-label="Fechar"
                            >
                                &times;
                            </button>
                            <h2 className="text-2xl font-extrabold text-indigo-700 mb-6 text-center">Editar Plano</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                    <input
                                        onChange={(e) => setItem({ ...item, name: e.target.value })}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        value={item.name}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                    <textarea
                                        onChange={(e) => setItem({ ...item, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        value={item.description}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                                    <input
                                        type="number"
                                        onChange={(e) => setItem({ ...item, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        value={item.price}
                                        min={0}
                                        onKeyDown={(e) => {
                                            if (e.key === '.' || e.key === ',') {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                                    <input
                                        type="number"
                                        onChange={(e) => setItem({ ...item, quantity: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        value={item.quantity}
                                        min={1}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        onChange={(e) => setItem({ ...item, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        value={item.status}
                                    >
                                        <option value="active">Ativo</option>
                                        <option value="inactive">Inativo</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3 pt-2">
                                    <button
                                        type="button"
                                        className="px-5 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                                        onClick={() => setModalEditPlan('')}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold shadow hover:scale-105 transition-all duration-200"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95);}
                    to { opacity: 1; transform: scale(1);}
                }
                .animate-fadeIn {
                    animation: fadeIn 0.25s ease;
                }
                `}
            </style>
        </>
    );

}
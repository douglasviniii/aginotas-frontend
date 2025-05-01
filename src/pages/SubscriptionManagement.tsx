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

    console.log(plans);

    return (
        <>
        <div className="flex flex-col items-center h-screen p-4">
            <div className="flex space-x-4 mb-6">
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setTab('plans')}
            >
                Planos
            </button>
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setTab('subscriptions')}
            >
                Assinaturas
            </button>
{/*             <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => alert('Modal em construção!')}
            >
                Criar Plano
            </button> */}
            </div>
            {tab === 'plans' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {plans.map((plan) => (
                <div
                    key={plan._id}
                    className="p-4 border rounded shadow-md flex flex-col items-start"
                >
                    <p>{plan.id}</p>
                    <Typography variant="h6" className="text-gray-800">
                    {plan.items[0].name}
                    </Typography>
                    <Typography className="text-gray-600">
                     {new Date(plan.items[0].created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                     })}
                    </Typography>
                    <Typography className="text-gray-600">
                    {plan.statement_descriptor}
                    </Typography>
                    <Typography className="text-gray-600">
                    {plan.billing_type}
                    </Typography>
                    <Typography className="text-gray-600">
                    Tempo gratuito {plan.trial_period_days} dias
                    </Typography>
                    <Typography className="text-gray-600">
                    status: {plan.items[0].status}
                    </Typography>
                    <Typography className="text-gray-800 font-bold">
                    R$ {plan.items[0].pricing_scheme.price / 100}
                    </Typography>
                    <div className="mt-4 flex space-x-2">
                    <button onClick={()=> handleViewEditPlan(plan)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                        Editar
                    </button>
                    </div>
                </div>
                ))}
            </div>
            )}
            {tab === 'subscriptions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {subscriptions.map((subscription) => (
                <div
                    key={subscription.id}
                    className="p-4 border rounded shadow-md flex flex-col items-start"
                >
                    <p>Cliente</p>
                    <div className="space-y-2">
                        <Typography variant="h6" className="text-gray-800 font-bold">
                            {subscription.customer.name}
                        </Typography>
                        <Typography className="text-gray-600">
                            <strong>ID do Cliente:</strong> {subscription.customer.id}
                        </Typography>
                        <Typography className="text-gray-600">
                            <strong>Email:</strong> {subscription.customer.email}
                        </Typography>
                        <Typography className="text-gray-600">
                            <strong>Documento:</strong> {subscription.customer.document}
                        </Typography>
                        <Typography className="text-gray-600">
                            <strong>ID do Plano:</strong> {subscription.plan.id}
                        </Typography>
                        <Typography className="text-gray-600">
                            <strong>Status do Plano:</strong> {subscription.plan.status}
                        </Typography>
                        <Typography className="text-gray-600">
                            <strong>Status da Assinatura:</strong> {subscription.status}
                        </Typography>
                    </div>
                    <div className="mt-4 flex space-x-2">
{/*                     <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                        Editar
                    </button>*/}
                    {subscription.status !== 'canceled' && (
                        <button onClick={()=> handleCancelSubscription(subscription.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                            Desativar Assinatura
                        </button>
                    )}
                    </div>
                </div>
                ))}
            </div>
            )}
            {modalEditPlan === 'editplan' && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Editar Plano</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Nome</label>
                                <input
                                    onChange={(e) => setItem({ ...item, name: e.target.value })}
                                    type="text"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={item.name}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                                <textarea
                                    onChange={(e) => setItem({ ...item, description: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={item.description}
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Preço</label>
                                <input
                                    type="number"
                                    onChange={(e) => setItem({ ...item, price: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={item.price}
                                    onKeyDown={(e) => {
                                        if (e.key === '.' || e.key === ',') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Quantidade</label>
                                <input
                                    type="number"
                                    onChange={(e) => setItem({ ...item, quantity: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={item.quantity}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    onChange={(e) => setItem({ ...item, status: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={item.status}
                                >
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>                                  
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    onClick={() => setModalEditPlan('')}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
        </>
    );

}
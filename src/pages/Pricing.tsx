import { useNavigate } from "react-router-dom";

export function Pricing() {
  const navigate = useNavigate();

  const plan = {
    id: "price_1SDB30PP263QZBqWLTTOvWPh",
    name: "Plano Bronze",
    price: 2999,
    interval: "mês",
  };

  const features = [
    "Até 10 notas - R$ 29,90/mês",
    "Até 30 notas - R$ 69,90/mês",
    "Acima disso - R$ 4,90/por nota",
    "Ordem de serviço via Whatsapp/plataforma, equipe aginotas",
    "Relátorio básico",
    "Suporte via Chat/Email",
  ];

  const handleSelectPlan = () => {
    localStorage.setItem("selectedPlanId", plan.id);
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-10">
          Escolha seu Plano
        </h1>

        <div className="bg-gray-800 rounded-3xl p-10 max-w-md w-full mx-auto shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">{plan.name}</h2>

          <div className="flex justify-center items-baseline gap-2 mb-6">
            <span className="text-5xl font-bold text-white">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(plan.price / 100)}
            </span>
            <span className="text-gray-400 text-lg">/{plan.interval}</span>
          </div>

          <button
            onClick={handleSelectPlan}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors mb-8"
          >
            Começar
          </button>

          <div>
            <ul className="space-y-2 text-gray-300 text-left">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-blue-500">•</span> {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

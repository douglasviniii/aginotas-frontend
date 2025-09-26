// src/pages/Landing.tsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaFileInvoiceDollar,
  FaChartLine,
  FaUsers,
  FaBars,
  FaTimes,
  FaDownload,
  FaChevronRight,
  FaCheck,
} from "react-icons/fa";
import Chat from "../components/Chat";

// Images - você precisará importar as imagens ou ajustar os caminhos
import lpheroimg from "../public/lpheroimg.png";
import logodelvind from "../public/logodelvind.png";
import nomelogodelvind from "../public/nomelogodelvind.png";
import logocomnome from "../public/logocomnome.png";
import cardimg from "../public/cardimg.png";
import delvindapp from "../public/delvindapp.png";

// Helper components
function Logo() {
  return (
    <div className="flex items-center gap-1">
      <img
        src={logodelvind}
        alt="Logo AgiNotas"
        className="h-8 w-10 sm:h-10 sm:w-14 object-contain"
      />
      <img
        src={nomelogodelvind}
        alt="Texto do logo AgiNotas"
        className="w-16 h-16 sm:w-19 sm:h-20 object-contain"
      />
    </div>
  );
}

function LogoWithName() {
  return (
    <img
      src={logocomnome}
      alt="Logo com nome AgiNotas"
      className="h-16 w-16 sm:h-20 sm:w-20 object-contain bg-background rounded-md p-0"
    />
  );
}

// Main sections
const sections = [
  { id: "hero", label: "Início" },
  { id: "features", label: "Recursos" },
  { id: "pricing", label: "Preços" },
  { id: "mission", label: "Missão" },
  { id: "simplicity", label: "Como Funciona" },
];

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);

      let currentSection = "";
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = section.id;
            break;
          }
        }
      }
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80; // Reduzido para mobile
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
    setMobileMenuOpen(false);
  };

  const NavLinks = ({
    isMobile = false,
    onLinkClick,
  }: {
    isMobile?: boolean;
    onLinkClick?: () => void;
  }) => (
    <>
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => {
            scrollToSection(section.id);
            onLinkClick?.();
          }}
          className={`px-2 py-1 rounded-md font-medium transition-colors ${
            isMobile ? "text-lg w-full text-right py-3" : "text-sm"
          } ${
            activeSection === section.id
              ? "text-white font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {section.label}
        </button>
      ))}
      <Link
        to="/login"
        onClick={onLinkClick}
        className={`px-2 py-1 rounded-md font-medium transition-colors ${
          isMobile ? "text-lg w-full text-right py-3" : "text-sm"
        } text-gray-400 hover:text-white`}
      >
        Login
      </Link>
    </>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-2 bg-[#161e2e]/95 backdrop-blur-sm ${
        isScrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden lg:flex space-x-2 items-center">
          <NavLinks />
          <Link
            to="/#pricing"
            className="bg-white text-[#0D47A1] px-4 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors text-sm"
            onClick={() => scrollToSection("pricing")}
          >
            Teste Grátis
          </Link>
        </nav>

        <div className="lg:hidden flex items-center gap-3">
          {/* Botão Teste Grátis visível no mobile */}
          <Link
            to="/#pricing"
            className="bg-white text-[#0D47A1] px-3 py-1.5 rounded-full font-semibold hover:bg-gray-200 transition-colors text-xs whitespace-nowrap"
            onClick={() => scrollToSection("pricing")}
          >
            Teste Grátis
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-300 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - FIXO e estático */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 flex flex-col bg-[#0f172a] h-screen z-50 overflow-hidden">
          <div className="relative h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#0f172a]">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <Logo />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white transition-colors p-2"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <nav className="flex-grow flex flex-col items-end p-4 space-y-1 bg-[#0f172a] overflow-y-auto">
              <NavLinks isMobile onLinkClick={() => setMobileMenuOpen(false)} />
            </nav>

            <div className="p-4 border-t border-gray-700 bg-[#0f172a]">
              <Link
                to="/#pricing"
                className="bg-[#2962FF] w-full text-white px-4 py-3 rounded-full font-semibold hover:bg-[#1E50D9] transition-colors text-center block text-sm"
                onClick={() => scrollToSection("pricing")}
              >
                Teste Grátis
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const Bubble = ({ className }: { className?: string }) => (
  <div className={`absolute rounded-full bg-[#2962FF] ${className}`} />
);

function Hero() {
  const scrollToMission = () => {
    const element = document.getElementById("mission");
    if (element) {
      const headerOffset = 80;
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="container mx-auto px-5 pt-24 pb-16 md:pt-32 relative"
    >
      {/* Linha azul fixa abaixo da navbar */}
      <div className="absolute top-500  right-0 w-full left-0 w-full h-1 bg-[#2962FF] z-1" />

      {/* Bolinhas azuis aleatórias */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-4 h-3 bg-[#2962FF] rounded-full z-10"
          style={{
            top: `${Math.random() * 1000 + 20}px`,
            left: `${Math.random() * 600}px`,
          }}
        />
      ))}

      <div className="flex flex-col-reverse lg:flex-row items-center justify-between min-h-[70vh] relative z-20">
        {/* Coluna Texto */}
        <div className="w-full lg:w-1/2 text-center lg:text-left mt-8 lg:mt-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            O jeito fácil e automático de emitir NFS-E para sua empresa!
          </h1>
          <p className="text-sm sm:text-base lg:text-lg mb-6 text-gray-300 max-w-lg mx-auto lg:mx-0">
            Automatize a emissão de notas fiscais de serviços, eliminando
            burocracias e otimizando seu fluxo de trabalho de forma ágil e
            eficiente.
          </p>
          <button
            onClick={scrollToMission}
            className="bg-[#2962FF] text-white px-6 py-2.5 lg:px-8 lg:py-3 rounded-full font-semibold hover:bg-[#1E50D9] transition-colors text-sm lg:text-base"
          >
            SAIBA MAIS
          </button>
        </div>

        {/* Coluna Imagem */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end mb-8 lg:mb-0">
          <div className="relative w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] md:w-[350px] md:h-[350px]">
            <Bubble className="w-full h-full opacity-40 blur-3xl" />
            <img
              src={lpheroimg}
              alt="Dashboard de aplicação em um tablet"
              className="object-contain rounded-lg z-10 absolute inset-0 w-full h-full"
              style={{
                maskImage:
                  "linear-gradient(to top, transparent 5%, #000000 25%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const featuresList = [
  {
    icon: <FaFileInvoiceDollar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />,
    title: "Faturamento Automático",
    description:
      "Configure cobranças recorrentes e deixe nosso sistema fazer o resto.",
  },
  {
    icon: <FaChartLine className="w-6 h-6 sm:w-8 sm:h-8 text-white" />,
    title: "Acompanhamento Inteligente",
    description: "Monitore pagamentos e receba notificações de atualizações.",
  },
  {
    icon: <FaUsers className="w-6 h-6 sm:w-8 sm:h-8 text-white" />,
    title: "Portal do Cliente",
    description: "Ofereça aos clientes acesso ao histórico de notas fiscais.",
  },
];

function Features() {
  return (
    <section
      id="features"
      className="py-12 sm:py-16 lg:py-20 bg-[#161e2e] relative"
    >
      <div className="absolute right-0 bottom-0 w-20 h-20 rounded-full bg-[#2962FF] opacity-20 blur-2xl"></div>
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold py-4 text-center mb-6 lg:mb-8">
          Uma plataforma inovadora pra facilitar a gestão de NFS-E
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {featuresList.map((feature, index) => (
            <div
              key={index}
              className="bg-[#1e293b] rounded-xl overflow-hidden text-center flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-[#2962FF]/20 hover:shadow-lg"
            >
              <div className="flex justify-center pt-6 lg:pt-8">
                <div className="bg-[#2962FF] p-3 lg:p-4 rounded-full">
                  {feature.icon}
                </div>
              </div>
              <div className="flex-grow flex flex-col items-center p-4 lg:p-6">
                <h3 className="text-lg lg:text-xl font-semibold mb-2 lg:mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-xs lg:text-sm flex-grow">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-start mt-8 lg:mt-12">
          <Link
            to="/#pricing"
            className="bg-[#2962FF] text-white px-6 py-2.5 lg:px-8 lg:py-3 rounded-full font-semibold hover:bg-[#1E50D9] transition-colors relative inline-block text-sm lg:text-base"
            onClick={() => {
              const element = document.getElementById("pricing");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full"></span>
            TESTE GRÁTIS
          </Link>
        </div>
      </div>
    </section>
  );
}

function Mission() {
  return (
    <section
      id="mission"
      className="py-12 sm:py-16 lg:py-20 bg-[#161e2e] relative"
    >
      <div className="absolute left-10 w-7 h-7 rounded-full bg-[#2962FF] opacity-20 blur-md"></div>
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl py-4 lg:py-8 font-bold text-center lg:text-left">
          AUTOMATIZE SUA NFS-E E ESQUEÇA A BUROCRACIA!
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center">
          <div className="w-full lg:w-2/3 flex flex-col md:flex-row gap-6 lg:gap-8">
            <div className="w-full md:w-1/2">
              <div className="mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-5">
                  NOSSA MISSÃO
                </h2>
                <p className="text-sm lg:text-base text-justify text-gray-400">
                  Oferecer uma plataforma inovadora que facilite a gestão de
                  NFS-E para empresas que prestam serviços contínuos, eliminando
                  burocracias e otimizando processos.
                </p>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <div className="mb-6 lg:mb-8">
                <h2 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4">
                  NOSSO PROPÓSITO
                </h2>
                <p className="text-sm lg:text-base text-justify text-gray-400 mb-6 lg:mb-8">
                  Automatizar a emissão de NFS-E recorrentes, tornando o
                  processo mais ágil, simples e eficiente.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3 flex justify-center lg:justify-end">
            <img
              src={cardimg}
              alt="Imagem decorativa em formato de bola"
              className="w-48 h-48 lg:w-64 lg:h-64 xl:w-80 xl:h-80 rounded-full object-cover opacity-70"
            />
          </div>
        </div>

        <div className="w-full flex mt-8 lg:mt-10 justify-center lg:justify-start">
          <Link
            to="/#pricing"
            className="bg-[#2962FF] text-white px-6 py-2.5 lg:px-8 lg:py-3 rounded-full font-semibold hover:bg-[#1E50D9] transition-colors relative inline-block text-sm lg:text-base"
            onClick={() => {
              const element = document.getElementById("pricing");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full"></span>
            TESTE GRÁTIS
          </Link>
        </div>
      </div>
    </section>
  );
}

const bronzeFeatures = [
  "Emissão de notas realizada por nossa equipe",
  "Envio de Ordem de Serviço via WhatsApp ou Plataforma",
  "Relatórios básicos (quantidade de notas e valores)",
  "Suporte via chat e e-mail",
];

function Pricing() {
  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-20 bg-[#161e2e]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Plano de Assinatura
          </h2>
          <p className="text-gray-400 mt-2 max-w-2xl mx-auto text-sm lg:text-base">
            Com o Plano Bronze, a equipe AgiNotas cuida da emissão para você.
            Basta nos enviar os dados e nós fazemos o resto. O plano se adapta à
            sua necessidade.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="max-w-md w-full bg-[#1e293b] border-2 border-[#2962FF] rounded-xl shadow-lg shadow-[#2962FF]/20 animate-float">
            <div className="text-center pb-4 p-4 lg:p-6">
              <h3 className="text-xl lg:text-2xl font-bold">Plano Bronze</h3>
              <p className="text-gray-400 text-sm lg:text-base">
                Nós emitimos as notas por você!
              </p>
            </div>
            <div className="space-y-4 p-4 lg:p-6">
              <ul className="space-y-3 pt-4 border-t border-gray-700">
                {bronzeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <FaCheck className="h-4 w-4 lg:h-5 lg:w-5 text-[#2962FF] mr-2 lg:mr-3 flex-shrink-0 mt-1" />
                    <span className="text-sm lg:text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div className="p-3 lg:p-4 rounded-lg bg-[#0f172a] text-center">
                  <p className="font-bold text-sm lg:text-base">
                    Até 10 notas/mês
                  </p>
                  <span className="text-2xl lg:text-3xl font-bold">
                    R$29,90
                  </span>
                  <span className="text-gray-400 text-sm lg:text-base">
                    /mês
                  </span>
                </div>

                <div className="p-3 lg:p-4 rounded-lg bg-[#0f172a] text-center">
                  <p className="font-bold text-sm lg:text-base">
                    Até 30 notas/mês
                  </p>
                  <span className="text-2xl lg:text-3xl font-bold">
                    R$69,90
                  </span>
                  <span className="text-gray-400 text-sm lg:text-base">
                    /mês
                  </span>
                </div>

                <div className="p-3 lg:p-4 rounded-lg bg-[#0f172a] text-center">
                  <p className="font-bold text-sm lg:text-base">Nota extra</p>
                  <span className="text-2xl lg:text-3xl font-bold">R$4,90</span>
                  <span className="text-gray-400 text-sm lg:text-base">
                    /nota
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:gap-4 p-4 lg:p-6">
              <Link
                to="/register"
                onClick={() => {
                  localStorage.setItem(
                    "selectedPlanId",
                    "price_1SBOna2KqGFwEjvkD0oKKjlD"
                  );
                }}
                className="bg-[#2962FF] text-white px-4 py-2.5 lg:px-8 lg:py-3 rounded-md font-semibold hover:bg-[#1E50D9] transition-colors text-center text-sm lg:text-base"
              >
                Contratar Plano Bronze
              </Link>
              <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 lg:h-4 lg:w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                Comece com o plano inicial. Se emitir mais notas, seu plano é
                atualizado automaticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ManualModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const pdfUrl = "/manual.pdf";
  const svgUrl = "/manual.svg";
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        ref={modalRef}
        className="bg-[#1e293b] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-700">
          <h3 className="text-lg sm:text-xl font-bold">Manual do Usuário</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white p-1"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-auto p-2 sm:p-4">
          <div className="flex justify-center items-center h-full min-h-[200px] sm:min-h-[300px] bg-[#0f172a] rounded">
            <iframe
              src={pdfUrl}
              className="w-full h-[50vh] sm:h-[60vh] border-none"
              title="Visualizador do Manual"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-3 sm:p-4 border-t border-gray-700">
          <a
            href={pdfUrl}
            download="Manual_Delvind.pdf"
            className="bg-[#2962FF] hover:bg-[#1E50D9] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <FaDownload size={14} /> Baixar PDF
          </a>
          <a
            href={svgUrl}
            download="Manual_Delvind.svg"
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <FaDownload size={14} /> Baixar SVG
          </a>
          <button
            onClick={() => setIsOpen(false)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md transition-colors text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function Simplicity() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <section
        id="simplicity"
        className="bg-[#161e2e] relative py-12 sm:py-16 lg:py-20"
      >
        <div className="absolute left-20 top-1/2 w-6 h-6 rounded-full bg-[#2962FF] opacity-30"></div>
        <div className="absolute right-32 bottom-32 w-20 h-20 rounded-full bg-[#2962FF] opacity-20 blur-xl"></div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6 text-white">
                  VEJA COMO É SIMPLES
                </h2>
                <p className="text-sm lg:text-base text-gray-300 text-center lg:text-justify">
                  O AgiNotas é simples de usar. Basta assinar o teste grátis,
                  preencher algumas informações de autenticação com sua
                  prefeitura e pronto, você já pode usar.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 flex items-center justify-center">
              <img
                src={delvindapp}
                alt="Dashboard do app AgiNotas em um tablet"
                className="w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px] mx-auto lg:mx-0"
              />
            </div>
          </div>

          <div className="flex justify-center mt-8 lg:mt-12">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 text-black hover:bg-gray-300 transition-colors duration-200 h-auto p-2 rounded-md w-full max-w-xs sm:max-w-sm"
            >
              <div className="flex items-center">
                <div className="mr-3 sm:mr-4">
                  <LogoWithName />
                </div>
                <div className="flex flex-col items-start flex-grow text-left">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base sm:text-lg font-medium">
                      MANUAL
                    </span>
                    <FaChevronRight className="ml-2" />
                  </div>
                  <span className="text-xs sm:text-sm opacity-70 mt-1">
                    Visualizar ou Baixar
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>
      <ManualModal isOpen={showModal} setIsOpen={setShowModal} />
    </>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0f172a] py-8 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <Logo />
            <p className="text-gray-400 text-xs lg:text-sm mt-3 lg:mt-4">
              Solução completa para gestão de NFS-E para serviços contínuos.
            </p>
          </div>

          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <h3 className="text-white font-semibold mb-3 lg:mb-4 flex items-center gap-2 text-sm lg:text-base">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 lg:h-5 lg:w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 010-2.828z"
                  clipRule="evenodd"
                />
              </svg>
              Links Rápidos
            </h3>
            <Link
              to="/cookies"
              className="text-gray-400 hover:text-white transition-colors duration-200 mb-2 flex items-center gap-2 text-xs lg:text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 lg:h-4 lg:w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              Política de Cookies
            </Link>
            <Link
              to="/politicas"
              className="text-gray-400 hover:text-white transition-colors duration-200 mb-2 flex items-center gap-2 text-xs lg:text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 lg:h-4 lg:w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Política de Privacidade
            </Link>
            <Link
              to="/termos"
              className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 text-xs lg:text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 lg:h-4 lg:w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              Termos de Uso
            </Link>
          </div>

          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <h3 className="text-white font-semibold mb-3 lg:mb-4 flex items-center gap-2 text-sm lg:text-base">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 lg:h-5 lg:w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Contato
            </h3>
            <p className="text-gray-400 mb-2 flex items-center gap-2 text-xs lg:text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 lg:h-4 lg:w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              contato@aginotas.com.br
            </p>
            <p className="text-gray-400 flex items-center gap-2 text-xs lg:text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 lg:h-4 lg:w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              (45) 9 9962-1241
            </p>
          </div>

          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <h3 className="text-white font-semibold mb-3 lg:mb-4 flex items-center gap-2 text-sm lg:text-base">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 lg:h-5 lg:w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              Redes Sociais
            </h3>

            <div className="flex space-x-3 lg:space-x-4">
              <a
                href="https://www.instagram.com/aginotas/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg
                  className="h-5 w-5 lg:h-6 lg:w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm6.406-1.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.439-.645 1.439-1.44-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href="https://www.facebook.com/share/1CgvhbKcSz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg
                  className="h-5 w-5 lg:h-6 lg:w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.675 0h-21.35c-.731 0-1.325.593-1.325 1.324v21.351c0 .73.593 1.324 1.324 1.324h11.495v-9.294h-3.123v-3.622h3.123v-2.671c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.31h3.587l-.467 3.622h-3.12v9.294h6.116c.73 0 1.324-.594 1.324-1.324v-21.35c0-.731-.594-1.324-1.324-1.324z" />
                </svg>
              </a>

              <a
                href="https://wa.me/5545999621241"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg
                  className="h-5 w-5 lg:h-6 lg:w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.52 3.48a11.946 11.946 0 00-17 0c-4.686 4.686-4.686 12.28 0 16.966a11.946 11.946 0 0017 0c4.686-4.686 4.686-12.28 0-16.966zm-8.52 18.02c-2.108 0-4.156-.616-5.873-1.77l-.42-.25-3.49.92.93-3.39-.27-.44a9.926 9.926 0 01-1.67-5.86c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.44-7.87c-.3-.15-1.772-.874-2.048-.973-.274-.1-.474-.15-.674.15s-.774.973-.948 1.174c-.173.2-.347.224-.64.074-.293-.15-1.236-.454-2.356-1.455-.872-.776-1.46-1.73-1.63-2.023-.173-.293-.018-.45.13-.6.134-.133.3-.347.45-.52.15-.173.2-.293.3-.487.1-.195.05-.365-.025-.515-.075-.15-.674-1.63-.924-2.236-.244-.586-.492-.508-.674-.518-.173-.01-.37-.012-.567-.012s-.52.074-.792.365c-.274.293-1.047 1.02-1.047 2.488 0 1.468 1.073 2.89 1.223 3.089.15.2 2.113 3.22 5.123 4.515.717.31 1.274.494 1.71.63.718.227 1.37.195 1.885.118.575-.084 1.772-.724 2.022-1.42.25-.695.25-1.29.175-1.42-.074-.132-.272-.21-.574-.36z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 lg:mt-8 pt-6 lg:pt-8 text-center">
          <p className="text-gray-400 text-xs lg:text-sm">
            © 2025 AgiNotas. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden">
      <Header />
      <main className="relative">
        <Hero />
        <Features />
        <Mission />
        <Simplicity />
        <Pricing />
      </main>
      <Footer />
      <Chat />
    </div>
  );
}

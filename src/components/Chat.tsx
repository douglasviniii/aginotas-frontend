import { useState, useEffect, useRef } from "react";
import { FaComments, FaTimes, FaPaperPlane, FaUser, FaTag, FaWhatsapp } from "react-icons/fa";

interface Message {
  sender: "bot" | "user";
  text: string;
  type?: "text" | "info";
}

export default function ChatDelvi() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<"initial" | "name" | "subject" | "ready">("initial");
  const [clientName, setClientName] = useState("");
  const [subject, setSubject] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const whatsappNumber = "5545999621241";

  // Mensagem inicial automática
  useEffect(() => {
    setTimeout(() => {
      setMessages([{ 
        sender: "bot", 
        text: "👋 Olá! Eu sou o Delvi, seu assistente virtual. Antes de começarmos, qual é o seu nome?",
        type: "info"
      }]);
      setStep("name");
      setOpen(true);
    }, 1500);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Processa de acordo com o passo atual
    switch (step) {
      case "name":
        setClientName(input);
        setMessages(prev => [
          ...prev, 
          { sender: "user", text: input },
          { 
            sender: "bot", 
            text: `Prazer em conhecê-lo, ${input}! 📝 Qual é o assunto da sua mensagem?`,
            type: "info"
          }
        ]);
        setStep("subject");
        setInput("");
        break;

      case "subject":
        setSubject(input);
        setMessages(prev => [
          ...prev, 
          { sender: "user", text: input },
          { 
            sender: "bot", 
            text: `Perfeito! Agora você pode digitar sua mensagem e eu encaminharei para o WhatsApp com todas as informações. ✨`,
            type: "info"
          }
        ]);
        setStep("ready");
        setInput("");
        break;

      case "ready":
        const userMessage = { sender: "user", text: input };
        setMessages(prev => [...prev, userMessage]);
        
        // Prepara mensagem para WhatsApp
        const whatsappMessage = `*Assunto:* ${subject}\n*Cliente:* ${clientName}\n*Mensagem:* ${input}`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        
        // Mensagem de confirmação do bot
        setTimeout(() => {
          setMessages(prev => [
            ...prev, 
            { 
              sender: "bot", 
              text: "✅ Mensagem enviada para o WhatsApp! Em breve nossa equipe entrará em contato.",
              type: "info"
            }
          ]);
        }, 500);
        
        window.open(whatsappUrl, "_blank");
        setInput("");
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const resetChat = () => {
    setMessages([{ 
      sender: "bot", 
      text: "👋 Olá! Vamos recomeçar. Qual é o seu nome?",
      type: "info"
    }]);
    setStep("name");
    setClientName("");
    setSubject("");
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end z-50">
      {open ? (
        <div className="flex flex-col w-80 h-96 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-bold text-lg">Agi</span>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-900 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] ${
                    msg.sender === "user" 
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" 
                      : msg.type === "info"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                      : "bg-gray-800 text-white border border-gray-700"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 bg-gray-800 p-3">
            {(step === "name" || step === "subject") && (
              <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                {step === "name" ? <FaUser size={12} /> : <FaTag size={12} />}
                <span>{step === "name" ? "Digite seu nome" : "Digite o assunto"}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 p-3 bg-gray-700 text-white rounded-xl outline-none border border-gray-600 focus:border-blue-500 transition-colors"
                placeholder={
                  step === "name" ? "Seu nome..." :
                  step === "subject" ? "Assunto da mensagem..." :
                  "Digite sua mensagem..."
                }
              />
              <button
                onClick={handleSend}
                className="bg-gradient-to-r from-green-500 to-green-600 px-4 rounded-xl flex items-center gap-1 text-white font-semibold hover:from-green-600 hover:to-green-700 transition-all"
              >
                <FaPaperPlane size={16} />
              </button>
            </div>

            {/* Info Bar */}
            <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
              <button 
                onClick={resetChat}
                className="hover:text-blue-400 transition-colors"
              >
                Reiniciar chat
              </button>
              <div className="flex items-center gap-1">
                <FaWhatsapp size={10} />
                <span>Conectado ao WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full text-white shadow-2xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-110"
        >
          <FaComments size={24} />
        </button>
      )}
    </div>
  );
}

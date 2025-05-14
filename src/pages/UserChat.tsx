import React, { useState, useEffect, useRef } from 'react';
import { Send as SendIcon } from 'lucide-react';
import io from 'socket.io-client';
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

const socket = io(API_URL); 

interface Message {
  text: string;
  sender: 'admin' | 'user';
  timestamp: number;
}

interface Ticket {
  _id: string;
  userId: string;
  messages: Message[];
  status: 'open' | 'closed';
}

export function UserChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;

      const message: Message = {
        sender: 'user',  // O remetente é o usuário
        text: newMessage,
        timestamp: Date.now(),
      };

      if (!ticket) {
        // Abre um novo ticket se não existir
        handleOpenTicket();
      } else {
        // Envia a mensagem para o servidor
        socket.emit('send_message', {
          ticketId: ticket._id,
          sender: userId,
          message: newMessage,
        });

        // Adiciona a mensagem à lista de mensagens localmente
        setMessages((prevMessages) => [...prevMessages, message]);
      }

      setNewMessage('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && newMessage.trim()) {
      handleSendMessage();
      event.preventDefault();
    }
  };

  const handleOpenTicket = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user._id;

    if (newMessage.trim()) {
      socket.emit('open_ticket', { userId, message: newMessage });
      setNewMessage('');
    }
  };

  const pollData = async () => {
    try {
      const response = await fetch(`${API_URL}/user/tickets`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar tickets');
      }

      const tickets: Ticket[] = await response.json();
      if (tickets.length > 0) {
        setTicket(tickets[0]);
        setMessages(tickets[0].messages);
      }
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      setTimeout(pollData, 3000);
    }
  };

  useEffect(() => {
    pollData();
    // Verifica a conexão do socket
    socket.on('connect', () => {
      console.log('Conectado ao servidor');
    });

    return () => {
      socket.off('connect');
    };
  }, []);

  useEffect(() => {
    socket.on('update_ticket', (updatedTicket: Ticket) => {
      setTicket(updatedTicket);
      setMessages(updatedTicket.messages);
    });

    return () => {
      socket.off('update_ticket');
    };
  }, []);

  // Componente de pré-atendimento simples
/*   interface ChatbotPreAtendimentoProps {
    onFinish: (info: { nome: string; email: string; assunto: string }) => void;
  }

  function ChatbotPreAtendimento({ onFinish }: ChatbotPreAtendimentoProps) {
    const [step, setStep] = useState(0);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [assunto, setAssunto] = useState('');

    const handleNext = () => {
      if (step === 0 && nome.trim()) setStep(1);
      else if (step === 1 && email.trim()) setStep(2);
      else if (step === 2 && assunto.trim()) {
        onFinish({ nome, email, assunto });
      }
    };

  const handleSendMessageBot = () => {
    if (newMessage.trim()) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user._id;

      const message: Message = {
        sender: 'user',  // O remetente é o usuário
        text: newMessage,
        timestamp: Date.now(),
      };

      if (!ticket) {
        // Abre um novo ticket se não existir
        handleOpenTicket();
      } else {
        // Envia a mensagem para o servidor
        socket.emit('send_message', {
          ticketId: ticket._id,
          sender: userId,
          message: nome,
        });

        // Adiciona a mensagem à lista de mensagens localmente
        setMessages((prevMessages) => [...prevMessages, message]);
      }

      setNewMessage('');
    }
  };

    return (
      <div className="space-y-3">
        {step === 0 && (
          <div>
            <label className="block mb-1 font-medium">Qual seu nome?</label>
            <input
              className="w-full p-2 border rounded"
              value={nome}
              onChange={e => setNome(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
              autoFocus
            />
            <button
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleNext}
              disabled={!nome.trim()}
            >
              Avançar
            </button>
          </div>
        )}
        {step === 1 && (
          <div>
            <label className="block mb-1 font-medium">Qual seu e-mail?</label>
            <input
              className="w-full p-2 border rounded"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
              type="email"
              autoFocus
            />
            <button
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleNext}
              disabled={!email.trim()}
            >
              Avançar
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <label className="block mb-1 font-medium">Qual o assunto?</label>
            <input
              className="w-full p-2 border rounded"
              value={assunto}
              onChange={e => setAssunto(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
              autoFocus
            />
            <button
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleSendMessageBot}
              disabled={!assunto.trim()}
            >
              Enviar
            </button>
          </div>
        )}
      </div>
    );
  } */

  return (
    <div className="flex flex-col h-[90vh] bg-gray-100">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <h1 className="text-lg font-semibold">Chat de Suporte</h1>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full inline-block" title="Online"></span>
          <span className="text-sm">Suporte Online</span>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {messages.map((message, index) => (
          <div
            key={`${message.timestamp}-${index}`}
            className={`max-w-xs p-3 rounded-lg shadow-md ${
              message.sender === 'admin' ? 'bg-blue-100 self-start' : 'bg-gray-200 self-end'
            }`}
          >
            {message.sender === 'admin' && (
              <div className="flex items-center mb-1 gap-2">
                <span className="font-bold text-blue-700">Atendente</span>
                <span className="w-2 h-2 bg-green-500 rounded-full" title="Online"></span>
                <span className="text-xs text-green-600">Online</span>
              </div>
            )}
            {message.sender === 'user' && (
              <div className="mb-1">
                <span className="font-bold text-gray-700">Você</span>
              </div>
            )}
            <p className="text-sm">{message.text}</p>
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

{/*       {!ticket && (
        <div className="p-4 bg-yellow-50 border-t border-yellow-200">
          <ChatbotPreAtendimento
            onFinish={(info) => {
              // Você pode salvar info no backend ou localStorage se quiser
              handleOpenTicket();
            }}
          />
        </div>
      )} */}

      <div className="flex items-center p-3 border-t border-gray-300 bg-gray-50">
{/*         <label className="flex items-center cursor-pointer mr-2">
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && ticket) {
                // Implemente o upload do arquivo aqui
                // Exemplo: uploadFile(file, ticket._id);
              }
            }}
          />
          <span className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg">
            📎
          </span>
        </label> */}
        <input
          type="text"
          className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring focus:border-blue-300"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          onKeyDown={handleKeyDown}
          //disabled={!ticket}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r-lg"
          onClick={handleSendMessage}
          //disabled={!ticket}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
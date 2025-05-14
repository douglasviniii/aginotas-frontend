import React, { useState, useEffect, useRef } from 'react';
import { Send as SendIcon } from 'lucide-react';
import io from 'socket.io-client';
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

const socket = io(API_URL);

interface Media {
  imageBase64: string;
}

interface Message {
  text: string;
  sender: 'admin' | 'user';
  senderName?: string;
  timestamp: number;
  media?: Media;
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
  const [media, setMedia] = useState<Media | null>(null);
  const [mediaName, setMediaName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user._id;
  const senderName = user.name || user.nome || 'Usuário';

  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotStep, setChatbotStep] = useState(0);
  const [supportReason, setSupportReason] = useState('');
  const [problemDescription, setProblemDescription] = useState('');


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setMedia({ imageBase64: reader.result as string });
        setMediaName(file.name);
      };
      reader.readAsDataURL(file);
    } else {
      setMedia(null);
      setMediaName(null);
    }
  };

  const handleSendMessage = async () => {

    if (newMessage.trim() || media) {
      const message: Message = {
        sender: 'user',
        text: newMessage,
        senderName,
        timestamp: Date.now(),
        ...(media ? { media } : {}),
      };

      if (!ticket) {
        handleOpenTicket(newMessage, media!); // Passe newMessage explicitamente
      } else {
        socket.emit('send_message', {
          ticketId: ticket._id,
          sender: 'user',
          message: newMessage,
          media,
          senderName,
        });
        setMessages((prevMessages) => [...prevMessages, message]);
      }

      setNewMessage('');
      setMedia(null);
      setMediaName(null);
    }
  };

  const handleOpenTicket = (messageText: string, mediaData?: Media) => {
    if (messageText.trim() || mediaData) {
      socket.emit('open_ticket', {
        userId,
        message: messageText,
        media: mediaData,
        senderName,
      });
      setNewMessage('');
      setMedia(null);
      setMediaName(null);
    }
  };


  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && (newMessage.trim() || media)) {
      handleSendMessage();
      event.preventDefault();
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
        //throw new Error('Erro ao buscar tickets');
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


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  useEffect(()=>{
      setShowChatbot(messages.length <= 0 ? true : false);
  },[messages])

  const chatbotQuestions = [
    {
      label: `Olá, ${senderName}! 👋 Seja bem-vindo ao suporte. Qual o motivo do seu contato?`,
      placeholder: 'Ex: Dúvida, Problema técnico, Sugestão...',
      value: supportReason,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSupportReason(e.target.value),
    },
    {
      label: 'Por favor, descreva o problema ou dúvida com mais detalhes:',
      placeholder: 'Descreva aqui...',
      value: problemDescription,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setProblemDescription(e.target.value),
    },
  ];

  const handleChatbotNext = async () => {
    if (chatbotStep < chatbotQuestions.length - 1) {
      setChatbotStep(chatbotStep + 1);
    } else {
      const chatbotMessage = `Motivo do suporte: ${supportReason} | Descrição: ${problemDescription}`;
      setNewMessage(chatbotMessage);
      setShowChatbot(false);
      await handleSendMessage();
    }
  };

  const handleChatbotKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && chatbotQuestions[chatbotStep].value.trim()) {
      handleChatbotNext();
    }
  };

  if (showChatbot) {
    return (
      <div className="flex flex-col h-[90vh] bg-gradient-to-br from-blue-100 via-white to-blue-200 items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-blue-200 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
            <span className="animate-bounce">🤖</span> Assistente Virtual
          </h2>
          <label className="block mb-3 text-gray-700 text-lg">{chatbotQuestions[chatbotStep].label}</label>
          <input
            type="text"
            className="w-full p-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 mb-6 transition"
            placeholder={chatbotQuestions[chatbotStep].placeholder}
            value={chatbotQuestions[chatbotStep].value}
            onChange={chatbotQuestions[chatbotStep].onChange}
            onKeyDown={handleChatbotKeyDown}
            autoFocus
          />
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition disabled:opacity-50"
            onClick={handleChatbotNext}
            disabled={!chatbotQuestions[chatbotStep].value.trim()}
          >
            {chatbotStep < chatbotQuestions.length - 1 ? 'Próximo' : 'Iniciar Atendimento'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[90vh] bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-5 rounded-t-2xl flex items-center justify-between shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span className="animate-pulse">💬</span> Chat de Suporte
        </h1>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-400 rounded-full inline-block animate-pulse" title="Online"></span>
          <span className="text-base font-medium">Suporte Online</span>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-transparent">
        {messages.map((message, index) => (
          <div
            key={`${message.timestamp}-${index}`}
            className={`max-w-[70%] p-4 rounded-2xl shadow-md relative ${
              message.sender === 'admin'
                ? 'bg-gradient-to-br from-blue-200 to-blue-100 self-start rounded-bl-none'
                : 'bg-gradient-to-br from-gray-200 to-gray-100 self-end rounded-br-none'
            } animate-fade-in`}
            style={{ marginLeft: message.sender === 'admin' ? 0 : 'auto' }}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className={`font-bold ${message.sender === 'admin' ? 'text-blue-700' : 'text-gray-700'}`}>
                {message.sender === 'admin' ? (message.senderName || 'Atendente') : (message.senderName || 'Você')}
              </span>
              {message.sender === 'admin' && (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full" title="Online"></span>
                  <span className="text-xs text-green-600">Online</span>
                </>
              )}
            </div>
            {message.media && message.media.imageBase64 && (
              <div className="mb-2">
                <img
                  src={message.media.imageBase64}
                  alt="imagem"
                  className="max-w-[180px] rounded-xl border border-blue-200 shadow"
                />
              </div>
            )}
            <p className="text-base">{message.text}</p>
            <span className="text-xs text-gray-500 absolute bottom-2 right-4">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center p-4 border-t border-blue-200 bg-white rounded-b-2xl shadow-lg">
        <label className="flex items-center cursor-pointer mr-3">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <span className="bg-blue-100 hover:bg-blue-200 p-3 rounded-xl text-blue-600 text-xl transition shadow">
            📎
          </span>
        </label>
        <input
          type="text"
          className="flex-grow p-3 border-2 border-blue-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-base transition"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          onKeyDown={handleKeyDown}
        />
        <button
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-r-xl shadow font-bold transition"
          onClick={handleSendMessage}
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </div>
      {media && (
        <div className="p-3 bg-blue-50 text-sm text-blue-700 flex items-center gap-3 border-t border-blue-100">
          <span>Arquivo selecionado: <span className="font-semibold">{mediaName}</span></span>
          <button
            className="text-red-500 font-semibold hover:underline"
            onClick={() => { setMedia(null); setMediaName(null); }}
          >
            Remover
          </button>
        </div>
      )}
    </div>
  );
}

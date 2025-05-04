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



  return (
    <div className="flex flex-col h-[90vh] bg-gray-100">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h1 className="text-lg font-semibold">Chat de Suporte</h1>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {messages.map((message, index) => (
          <div
            key={`${message.timestamp}-${index}`}
            className={`max-w-xs p-3 rounded-lg shadow-md ${
              message.sender === 'admin' ? 'bg-blue-100 self-start' : 'bg-gray-200 self-end'
            }`}
          >
            <strong className="block mb-1">
              {message.sender === 'admin' ? 'Suporte' : 'Você'}:
            </strong>
            <p className="text-sm">{message.text}</p>
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center p-3 border-t border-gray-300 bg-gray-50">
        <input
          type="text"
          className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring focus:border-blue-300"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          onKeyDown={handleKeyDown}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r-lg"
          onClick={handleSendMessage}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
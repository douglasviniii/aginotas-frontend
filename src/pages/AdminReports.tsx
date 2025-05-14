import React, { useState, useEffect, useRef } from 'react';
import { Send as SendIcon, Image as ImageIcon } from 'lucide-react';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;

const socket = io(API_URL);

interface User {
  _id: string;
  name: string;
  // outros campos se necessário
}

interface Message {
  text: string;
  sender: 'admin' | 'user';
  senderName?: string;
  timestamp?: number;
  media?: {
    imageBase64?: string;
  };
}

interface Ticket {
  _id: string;
  userId: User | string;
  messages: Message[];
  status: 'open' | 'closed';
}

export function AdminReports() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  // Carregar tickets e configurar sockets
  useEffect(() => {
    fetchTickets();

    socket.on('new_ticket', (ticket: Ticket) => {
      setTickets((prev) => [...prev, ticket]);
    });

    socket.on('update_ticket', (updatedTicket: Ticket) => {
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === updatedTicket._id ? updatedTicket : ticket
        )
      );
      if (selectedTicket?._id === updatedTicket._id) {
        setSelectedTicket(updatedTicket);
      }
    });

    return () => {
      socket.off('new_ticket');
      socket.off('update_ticket');
    };
    // eslint-disable-next-line
  }, [selectedTicket]);

  async function fetchTickets() {
    try {
      const response = await fetch(`${API_URL}/admin/tickets`);
      if (!response.ok) throw new Error('Erro ao buscar tickets');
      const data: Ticket[] = await response.json();
      setTickets(data);
    } catch (error) {
      setTimeout(fetchTickets, 3000);
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() && !imageBase64) return;
    if (!selectedTicket) return;

    const adminName = 'Admin'; // Troque pelo nome real do admin se disponível

    const message: Message = {
      sender: 'admin',
      text: newMessage,
      senderName: adminName,
      timestamp: Date.now(),
      media: imageBase64 ? { imageBase64 } : undefined,
    };

    socket.emit('send_message', {
      ticketId: selectedTicket._id,
      sender: 'admin',
      message: newMessage,
      media: imageBase64 ? { imageBase64 } : undefined,
      senderName: adminName,
    });

    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, message],
    });
    setNewMessage('');
    setImageBase64(null);
  };

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(selectedTicket?._id === ticket._id ? null : ticket);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && (newMessage.trim() || imageBase64)) {
      handleSendMessage();
      event.preventDefault();
    }
  };

  const handleCloseTicket = (ticketId: string) => {
    socket.emit('close_ticket', ticketId);
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket._id === ticketId ? { ...ticket, status: 'closed' } : ticket
      )
    );
    if (selectedTicket?._id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: 'closed' });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col min-h-screen h-screen overflow-hidden bg-gradient-to-br from-blue-100 via-white to-blue-200" style={{ minHeight: '90vh', height: '90vh' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 md:p-6 shadow-lg flex items-center justify-between rounded-b-3xl">
      <h1 className="text-lg md:text-2xl font-bold tracking-wide flex items-center gap-2">
        <SendIcon className="w-6 h-6 md:w-7 md:h-7" />
        Admin - Chat de Suporte
      </h1>
      <span className="text-xs md:text-sm opacity-80">Atendimento em tempo real</span>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
      {/* Sidebar - Tickets */}
      <aside className="w-full md:w-80 bg-white/80 border-b md:border-b-0 md:border-r border-blue-200 p-2 md:p-4 overflow-y-auto flex flex-col gap-4 shadow-lg max-h-48 md:max-h-none">
        <h2 className="text-base md:text-lg font-semibold mb-2 text-blue-700">Tickets Abertos</h2>
        {tickets.length === 0 && (
        <div className="text-gray-400 text-center mt-6 md:mt-10">Nenhum ticket aberto.</div>
        )}
        {tickets.map((ticket) => (
        <div
          key={ticket._id}
          className={`p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-200 shadow-sm border-2 ${
          selectedTicket?._id === ticket._id
            ? 'border-blue-500 bg-blue-50'
            : 'border-transparent hover:bg-blue-100'
          }`}
          onClick={() => handleTicketSelect(ticket)}
        >
          <div className="flex items-center justify-between">
          <p className="font-semibold text-blue-800 truncate text-sm md:text-base">
            {typeof ticket.userId === 'object' && 'name' in ticket.userId
            ? ticket.userId.name
            : ticket.userId}
          </p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
            ticket.status === 'open'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 text-gray-500'
            }`}
          >
            {ticket.status === 'open' ? 'Aberto' : 'Fechado'}
          </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Ticket: {ticket._id}</p>
          <button
          className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition-all duration-200 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            handleCloseTicket(ticket._id);
          }}
          >
          Excluir Ticket
          </button>
        </div>
        ))}
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col justify-between bg-white/70 rounded-none md:rounded-l-3xl shadow-inner min-h-0">
        {selectedTicket ? (
        <>
          {/* Chat Header */}
          <div className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white rounded-tl-none md:rounded-tl-3xl">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-base md:text-lg">
            {typeof selectedTicket.userId === 'object' && 'name' in selectedTicket.userId
            ? selectedTicket.userId.name.charAt(0).toUpperCase()
            : 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 text-base md:text-lg">
            {typeof selectedTicket.userId === 'object' && 'name' in selectedTicket.userId
              ? selectedTicket.userId.name
              : selectedTicket.userId}
            </h3>
            <span className="text-xs text-gray-500">Ticket: {selectedTicket._id}</span>
          </div>
          <span
            className={`ml-auto text-xs px-3 py-1 rounded-full ${
            selectedTicket.status === 'open'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 text-gray-500'
            }`}
          >
            {selectedTicket.status === 'open' ? 'Aberto' : 'Fechado'}
          </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-2 md:px-8 py-3 md:py-6 space-y-3 md:space-y-4 bg-gradient-to-b from-white via-blue-50 to-blue-100 min-h-0">
          {selectedTicket.messages.length === 0 && (
            <div className="text-gray-400 text-center mt-6 md:mt-10">Nenhuma mensagem ainda.</div>
          )}
          {selectedTicket.messages.map((message, index) => (
            <div
            key={index}
            className={`flex ${
              message.sender === 'admin' ? 'justify-end' : 'justify-start'
            }`}
            >
            <div
              className={`max-w-[80vw] md:max-w-xs p-3 md:p-4 rounded-2xl shadow-md flex flex-col relative ${
              message.sender === 'admin'
                ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-tr-none'
                : 'bg-gray-200 text-gray-800 rounded-tl-none'
              }`}
            >
              <span className="block font-semibold mb-1 text-xs opacity-80">
              {message.senderName || (message.sender === 'admin' ? 'Você' : 'Usuário')}
              </span>
              {message.media?.imageBase64 && (
              <img
                src={message.media.imageBase64}
                alt="imagem"
                className="mb-2 max-w-[150px] md:max-w-[200px] rounded-lg border border-blue-200 shadow"
              />
              )}
              <p className="text-sm break-words">{message.text}</p>
              <span className="text-[10px] text-gray-200 mt-1 self-end opacity-70">
              {message.timestamp
                ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''}
              </span>
            </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex items-center px-2 md:px-8 py-2 md:py-4 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-white gap-2 rounded-bl-none md:rounded-bl-3xl">
          <input
            type="text"
            className="flex-grow p-2 md:p-3 border border-blue-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white shadow text-sm"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyDown={handleKeyDown}
          />
          <label className="cursor-pointer flex items-center bg-blue-100 px-2 md:px-3 py-2 rounded hover:bg-blue-200 transition">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            />
          </label>
          {imageBase64 && (
            <img
            src={imageBase64}
            alt="preview"
            className="w-8 h-8 md:w-10 md:h-10 object-cover rounded border border-blue-300 shadow"
            />
          )}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 md:p-3 rounded-r-xl shadow transition disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() && !imageBase64}
          >
            <SendIcon className="w-5 h-5" />
          </button>
          </div>
        </>
        ) : (
        <div className="flex flex-1 items-center justify-center text-blue-400 text-base md:text-xl font-semibold px-2 text-center">
          Selecione um ticket para iniciar o atendimento.
        </div>
        )}
      </main>
      </div>
    </div>
  );
}

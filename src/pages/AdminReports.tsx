import React, { useState, useEffect, useRef } from 'react';
import { Send as SendIcon } from 'lucide-react';
import io from 'socket.io-client';

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

export function AdminReports() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const handleSendMessage = () => {
    if (newMessage.trim() && selectedTicket) {
      const message = {
        sender: 'admin',
        text: newMessage,
        timestamp: Date.now(),
      };

      socket.emit('send_message', {
        ticketId: selectedTicket._id,
        sender: 'admin',
        message: newMessage,
      });

      setSelectedTicket({
        ...selectedTicket,
        messages: [...selectedTicket.messages, message as Message],
      });
      setNewMessage('');
    }
  };

  const handleTicketSelect = (ticket: Ticket) => {
    if (selectedTicket?._id === ticket._id) {
      setSelectedTicket(null); // Deselect if the same ticket is clicked again
    } else {
      setSelectedTicket(ticket); // Select the clicked ticket
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && newMessage.trim()) {
      handleSendMessage();
      event.preventDefault();
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    socket.emit('close_ticket', ticketId);
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket._id === ticketId ? { ...ticket, status: 'closed' } : ticket
      )
    );
    if (selectedTicket?._id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: 'closed' });
    }
  };

  const pollData = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/tickets`);
      if (!response.ok) {
        throw new Error('Erro ao buscar tickets');
      }
      const data: Ticket[] = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      setTimeout(pollData, 3000); 
    }
  };

  useEffect(() => {
    pollData(); 
    socket.on('new_ticket', (ticket: Ticket) => {
      setTickets((prevTickets) => [...prevTickets, ticket]);
    });

    socket.on('update_ticket', (updatedTicket: Ticket) => {
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
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
  }, [selectedTicket]);


  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h1 className="text-lg font-semibold">Admin - Chat de Suporte</h1>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        <h2 className="text-lg font-semibold mb-4">Tickets Abertos</h2>
        {tickets.map((ticket) => (
          <div
            key={ticket._id}
            className="bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200"
            onClick={() => handleTicketSelect(ticket)}
          >
            <p className="font-semibold">Ticket: {ticket._id}</p>
            <p className="text-sm">Status: {ticket.status}</p>
            <button
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition-all duration-200"
              onClick={() => handleCloseTicket(ticket._id)}
            >
              Excluir Ticket
            </button>
          </div>
        ))}
        {selectedTicket && (
          <>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Chat com o Usuário</h3>
              {selectedTicket.messages.map((message, index) => (
                <div
                  key={index}
                  className={`max-w-xs p-3 rounded-lg shadow-md ${
                    message.sender === 'admin' ? 'bg-blue-100 self-start' : 'bg-gray-200 self-end'
                  }`}
                >
                  <strong className="block mb-1">
                    {message.sender === 'admin' ? 'Você' : 'Usuário'}:
                  </strong>
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>

      {selectedTicket && (
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
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { Send as SendIcon } from "lucide-react";
import { api } from "../lib/api";

interface Message {
  senderId: string;
  senderName: string;
  senderRole: "user" | "admin";
  type: "text";
  content: string;
  timestamp?: number;
}

interface Chat {
  id: string;
  userName: string;
}

export function AdminChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const adminId = "admin"; // ID fixo do admin
  const adminName = "Admin";

  // Buscar chats existentes
  useEffect(() => {
    async function fetchChats() {
      try {
        //const data = await api.getChats();
        const data = [];
        setChats(data);
      } catch (err) {
        console.error("Erro ao buscar chats:", err);
      }
    }
    fetchChats();
  }, []);

  // Buscar mensagens do chat selecionado
  useEffect(() => {
    if (!selectedChat) return;

    async function fetchMessages() {
      try {
        const data = await api.getMessages(selectedChat.id);
        setMessages(data);
      } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const msg: Message = {
      senderId: adminId,
      senderName: adminName,
      senderRole: "admin",
      type: "text",
      content: newMessage,
    };

    try {
      await api.sendMessage({ chatId: selectedChat.id, ...msg });
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-[90vh] max-w-4xl mx-auto bg-white border rounded-lg shadow">
      {/* Sidebar de chats */}
      <aside className="w-80 border-r overflow-y-auto p-2">
        <h2 className="font-bold mb-2">Chats Ativos</h2>
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`p-2 rounded cursor-pointer ${
              selectedChat?.id === chat.id ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedChat(chat)}
          >
            {chat.userName}
          </div>
        ))}
      </aside>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
          {selectedChat ? (
            messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded max-w-[70%] ${
                  m.senderRole === "admin"
                    ? "bg-blue-200 ml-auto"
                    : "bg-gray-200 mr-auto"
                }`}
              >
                <p className="text-sm font-semibold">{m.senderName}</p>
                <p>{m.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center mt-10">
              Selecione um chat para iniciar.
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {selectedChat && (
          <div className="flex border-t p-2">
            <input
              type="text"
              className="flex-grow border rounded-l-lg p-2"
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-4 rounded-r-lg"
            >
              <SendIcon size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { Send as SendIcon, Image as ImageIcon } from "lucide-react";
import { api } from "../lib/api";

interface Message {
  senderId: string;
  senderName: string;
  senderRole: "user" | "support";
  type: "text" | "image";
  content: string;
  timestamp?: number;
}

export function UserChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.sub;
  const senderName = user.name || user.nome || "Usuário";

  useEffect(() => {
    async function initChat() {
      try {
        if (chatId) return;
        const data = await api.createChat({
          userId: userId,
          userName: senderName,
        });
        setChatId(data.chatId);
      } catch (err) {
        console.error("Erro ao criar chat:", err);
      }
    }
    initChat();
  }, [userId, senderName]);

  useEffect(() => {
    if (!chatId) return;

    async function fetchMessages() {
      try {
        const data = await api.getMessages(chatId);
        setMessages(data);
      } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !chatId) return;

    try {
      let msg: Message;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("chatId", chatId);
        formData.append("senderId", userId);
        formData.append("senderName", senderName);
        formData.append("senderRole", user.role || "user");
        formData.append("type", "image");
        formData.append("file", selectedFile);
        await api.sendMessage(formData);
        setSelectedFile(null);
      } else {
        msg = {
          senderId: userId,
          senderName,
          senderRole: "user",
          type: "text",
          content: newMessage,
        };

        await api.sendMessage({ chatId, ...msg });
        setNewMessage("");
      }

      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  const handleDeleteChat = async () => {
    await api.deleteChat(chatId as string);
    location.reload();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[90vh] max-w-md mx-auto bg-white border rounded-lg shadow">
      <div className="bg-blue-600 text-white p-4 font-bold rounded-t-lg flex justify-between items-center">
        <span>Chat de Suporte</span>
        {chatId && (
          <button
            onClick={handleDeleteChat}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
          >
            Excluir Chat
          </button>
        )}
      </div>

      {/* Mensagens */}
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-[80%] ${
              m.senderRole === "user"
                ? "bg-blue-100 ml-auto"
                : "bg-gray-200 mr-auto"
            }`}
          >
            <p className="text-sm font-semibold">{m.senderName}</p>
            {m.type === "text" ? (
              <p>{m.content}</p>
            ) : (
              <img
                src={m.content}
                alt="imagem"
                className="max-w-[200px] rounded-lg mt-1"
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex p-2 border-t gap-2 items-center">
        <input
          type="text"
          className="flex-grow border rounded-lg p-2"
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <label className="cursor-pointer">
          <ImageIcon size={24} className="text-blue-600" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              setSelectedFile(e.target.files ? e.target.files[0] : null)
            }
          />
        </label>
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 text-white px-4 rounded-lg"
        >
          <SendIcon size={20} />
        </button>
      </div>
    </div>
  );
}

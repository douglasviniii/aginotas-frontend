import React, { useState, useEffect, useRef } from "react";
import { Send as SendIcon, Image as ImageIcon } from "lucide-react";
import { api } from "../lib/api";
import { Message } from "./types";
import { LogoLoading } from "../components/Loading";

export function UserChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState<string | null>(() =>
    localStorage.getItem("chatId")
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chatStarted, setChatStarted] = useState(!!chatId);
  const [allChats, setAllChats] = useState<
    { chatId: string; userName: string }[]
  >([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.sub;
  const senderName = user.name || user.nome || "Usuário";
  const isAdmin = user.role === "admin";
  const [loading, setLoading] = useState(false);

  // Start chat para usuário normal
  const startChat = async () => {
    try {
      if (!chatId) {
        setLoading(true);
        const data = await api.createChat({
          userId: userId,
          userName: senderName,
        });
        localStorage.setItem("chatId", data.chatId);
        setChatId(data.chatId);
        setSelectedChatId(data.chatId);
        setLoading(false);
      } else {
        setSelectedChatId(chatId);
      }
      setChatStarted(true);
    } catch (err) {
      console.error("Erro ao criar chat:", err);
    }
  };

  // Buscar todos os chats para admin
  const fetchAllChats = async () => {
    try {
      setLoading(true);
      const data = await api.getAllChats();
      const mapped = data.map((chat: any) => {
        const userParticipant = chat.participants.find(
          (p: any) => p.role === "user"
        );
        return {
          chatId: chat.id,
          userName: userParticipant ? userParticipant.name : "Usuário",
        };
      });
      setAllChats(mapped);
      setLoading(false);
    } catch (err) {
      console.error("Erro ao buscar todos os chats:", err);
    }
  };

  // Buscar mensagens do chat selecionado
  useEffect(() => {
    if (!selectedChatId) return;

    const fetchMessages = async () => {
      try {
        const data = await api.getMessages(selectedChatId);
        setMessages(data);
      } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedChatId]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedChatId) return;

    try {
      let msg: Message;
      const role = isAdmin ? "support" : "user";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("chatId", selectedChatId);
        formData.append("senderId", userId);
        formData.append("senderName", senderName);
        formData.append("senderRole", role);
        formData.append("type", "image");
        formData.append("file", selectedFile);
        await api.sendMessage(formData);
        setSelectedFile(null);
      } else {
        msg = {
          senderId: userId,
          senderName,
          senderRole: role,
          type: "text",
          content: newMessage,
        };

        setLoading(true);
        await api.sendMessage({ chatId: selectedChatId, ...msg });
        setNewMessage("");
        setLoading(false);
      }

      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  const handleDeleteChat = async (id: string) => {
    setLoading(true);
    await api.deleteChat(id);
    setLoading(false);
    if (!isAdmin) {
      localStorage.removeItem("chatId");
      setChatId(null);
      setChatStarted(false);
      setMessages([]);
    } else {
      fetchAllChats();
      if (selectedChatId === id) {
        setSelectedChatId(null);
        setMessages([]);
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) return <LogoLoading size={100} text="Carregando..." />;

  // Layout usuário
  if (!chatStarted && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <button
          onClick={startChat}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold"
        >
          Iniciar conversa
        </button>
      </div>
    );
  }

  // Layout admin (painel split)
  if (isAdmin) {
    return (
      <div className="flex h-[90vh] max-w-6xl mx-auto bg-white border rounded-lg shadow overflow-hidden">
        {/* Lista de chats */}
        <div className="w-1/3 border-r overflow-y-auto p-4">
          <h2 className="text-xl font-bold mb-4">Painel de Suporte</h2>
          <button
            onClick={fetchAllChats}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4"
          >
            Carregar Chats
          </button>
          {allChats.length > 0 && (
            <ul className="space-y-2">
              {allChats.map((chat) => (
                <li
                  key={chat.chatId}
                  className={`flex justify-between items-center border p-2 rounded cursor-pointer ${
                    selectedChatId === chat.chatId ? "bg-gray-100" : ""
                  }`}
                >
                  <span
                    onClick={() => setSelectedChatId(chat.chatId)}
                    className="flex-1"
                  >
                    {chat.userName}
                  </span>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDeleteChat(chat.chatId)}
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chat selecionado */}
        <div className="flex-1 flex flex-col">
          {selectedChatId ? (
            <>
              {/* Renderiza chat normalmente */}
              <div className="bg-blue-600 text-white p-4 font-bold flex justify-between items-center">
                <span>
                  Chat:{" "}
                  {allChats.find((c) => c.chatId === selectedChatId)
                    ?.userName || "Selecionado"}
                </span>
                <button
                  onClick={() => handleDeleteChat(selectedChatId)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                >
                  Excluir Chat
                </button>
              </div>

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
            </>
          ) : (
            <div className="flex items-center justify-center flex-1">
              <span className="text-gray-500">
                Selecione um chat para visualizar
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Layout chat user
  return (
    <div className="flex flex-col h-[90vh] max-w-md mx-auto bg-white border rounded-lg shadow">
      <div className="bg-blue-600 text-white p-4 font-bold rounded-t-lg flex justify-between items-center">
        <span>Chat de Suporte</span>
        {selectedChatId && (
          <button
            onClick={() => handleDeleteChat(selectedChatId)}
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

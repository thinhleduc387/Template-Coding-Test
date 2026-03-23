import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import { getConversations } from "./config/conversationAPI";

function ChatLayout({ conversations, setConversations }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incomingMessages, setIncomingMessages] = useState(null);
  const [pendingUserMsg, setPendingUserMsg] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleConversationCreated = (conversation) => {
    setConversations((prev) => [conversation, ...prev]);
    navigate(`/c/${conversation._id}`);
  };

  const handleConversationUpdated = (conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c._id === conversation._id ? conversation : c))
    );
  };

  const handleConversationDeleted = (deletedId) => {
    setConversations((prev) => prev.filter((c) => c._id !== deletedId));
    if (id === deletedId) navigate("/");
  };

  const handleBeforeSend = (msg) => {
    setPendingUserMsg(msg);
    setIsTyping(true);
  };

  const handleSendComplete = (msgs, conversation, skipLoad = false) => {
    setPendingUserMsg(null);
    setIsTyping(false);
    setIncomingMessages({ messages: msgs, skipLoad });
    if (conversation) handleConversationUpdated(conversation);
    setTimeout(() => setIncomingMessages(null), 200);
  };

  const handleSendError = () => {
    setPendingUserMsg(null);
    setIsTyping(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={id}
        onSelect={(cid) => navigate(`/c/${cid}`)}
        onConversationCreated={handleConversationCreated}
        onConversationDeleted={handleConversationDeleted}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <ChatWindow
          conversationId={id}
          incomingMessages={incomingMessages}
          pendingUserMsg={pendingUserMsg}
          isTyping={isTyping}
        />
        <ChatInput
          conversationId={id}
          onBeforeSend={handleBeforeSend}
          onSendComplete={handleSendComplete}
          onSendError={handleSendError}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    getConversations().then((res) => setConversations(res.metadata || []));
  }, []);

  return (
    <Routes>
      <Route path="/" element={<ChatLayout conversations={conversations} setConversations={setConversations} />} />
      <Route path="/c/:id" element={<ChatLayout conversations={conversations} setConversations={setConversations} />} />
    </Routes>
  );
}

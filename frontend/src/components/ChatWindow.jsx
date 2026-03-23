import { useEffect, useRef, useState } from "react";
import { getMessages } from "../config/messageAPI";
import MessageBubble from "./MessageBubble";

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3.5 shadow-sm">
        <div className="flex gap-1.5 items-center">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:160ms]" />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:320ms]" />
        </div>
      </div>
    </div>
  );
}

export default function ChatWindow({ conversationId, incomingMessages, pendingUserMsg, isTyping }) {
  const [messages, setMessages] = useState([]);
  const [streamingContent, setStreamingContent] = useState(null);
  const skipLoadRef = useRef(false);
  const bottomRef = useRef(null);

  // IMPORTANT: must be declared before conversationId effect so it runs first
  useEffect(() => {
    if (!incomingMessages) return;
    const { messages: newMsgs, skipLoad } = incomingMessages;
    if (skipLoad) skipLoadRef.current = true;
    const [userMsg, aiMsg] = newMsgs;
    setMessages((prev) => [...prev, userMsg]);
    setStreamingContent({ msg: aiMsg, displayedText: "" });
  }, [incomingMessages]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setStreamingContent(null);
      return;
    }
    if (skipLoadRef.current) {
      skipLoadRef.current = false;
      return;
    }
    setStreamingContent(null);
    getMessages(conversationId).then((res) => setMessages(res.metadata || []));
  }, [conversationId]);

  useEffect(() => {
    if (!streamingContent) return;
    const { msg, displayedText } = streamingContent;
    const fullText = msg.content;

    if (displayedText.length >= fullText.length) {
      setMessages((prev) => [...prev, msg]);
      setStreamingContent(null);
      return;
    }

    const charsPerTick = Math.max(1, Math.ceil(fullText.length / 150));
    const timer = setTimeout(() => {
      setStreamingContent((prev) =>
        prev ? { ...prev, displayedText: fullText.slice(0, prev.displayedText.length + charsPerTick) } : null
      );
    }, 15);
    return () => clearTimeout(timer);
  }, [streamingContent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, pendingUserMsg, isTyping]);

  const showEmpty = !conversationId && !pendingUserMsg && !isTyping && !streamingContent;

  if (showEmpty) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        <p>Select or create a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 flex flex-col gap-3">
      {messages.map((m) => (
        <MessageBubble key={m._id} message={m} />
      ))}
      {pendingUserMsg && <MessageBubble key="pending" message={pendingUserMsg} />}
      {streamingContent && (
        <MessageBubble
          key="streaming"
          message={{ ...streamingContent.msg, content: streamingContent.displayedText }}
          showCursor
        />
      )}
      {isTyping && !streamingContent && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}

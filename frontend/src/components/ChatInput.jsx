import { useRef, useState } from "react";
import { sendMessage, uploadFile } from "../config/messageAPI";
import { startConversation } from "../config/conversationAPI";

const Spinner = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

export default function ChatInput({ conversationId, onBeforeSend, onSendComplete, onSendError, onConversationCreated }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  // Each item: { id, status: 'loading'|'done', name, isImage, localUrl?, metadata? }
  const [pendingFiles, setPendingFiles] = useState([]);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  const uploadOneFile = async (file) => {
    const id = `${Date.now()}-${Math.random()}`;
    const isImage = file.type.startsWith("image/");
    const localUrl = isImage ? URL.createObjectURL(file) : null;

    setPendingFiles((prev) => [...prev, { id, status: "loading", name: file.name, isImage, localUrl }]);

    try {
      const res = await uploadFile(file);
      setPendingFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "done", metadata: res.metadata } : f))
      );
    } catch (err) {
      setPendingFiles((prev) => prev.filter((f) => f.id !== id));
      setError("Upload failed: " + err);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) uploadOneFile(file);
    e.target.value = "";
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) uploadOneFile(file);
        break;
      }
    }
  };

  const removeFile = (id) => setPendingFiles((prev) => prev.filter((f) => f.id !== id));

  const isUploading = pendingFiles.some((f) => f.status === "loading");
  const doneFiles = pendingFiles.filter((f) => f.status === "done");
  const canSend = (text.trim() || doneFiles.length > 0) && !loading && !isUploading;

  const handleSend = async () => {
    if (!canSend) return;

    const content = text.trim();
    const attachments = doneFiles.map((f) => f.metadata);
    const optimisticAttachments = doneFiles.map((f) => ({ ...f.metadata, localUrl: f.localUrl }));

    setText("");
    setPendingFiles([]);
    setLoading(true);
    setError(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    onBeforeSend({
      _tempId: `temp-${Date.now()}`,
      senderType: "user",
      content,
      attachments: optimisticAttachments,
      createdAt: new Date().toISOString(),
    });

    try {
      if (!conversationId) {
        const res = await startConversation(content, attachments);
        onConversationCreated(res.metadata.conversation);
        onSendComplete([res.metadata.userMessage, res.metadata.aiMessage], null, true);
      } else {
        const res = await sendMessage(conversationId, content, attachments);
        onSendComplete([res.metadata.userMessage, res.metadata.aiMessage], res.metadata.conversation, false);
      }
    } catch (err) {
      setText(content);
      setPendingFiles(doneFiles);
      setError(typeof err === "string" ? err : "Failed to send message.");
      onSendError();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && canSend) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3.5">
      {error && <div className="text-red-500 text-xs mb-1.5">{error}</div>}

      {pendingFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {pendingFiles.map((f) =>
            f.isImage ? (
              <div key={f.id} className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                <img src={f.localUrl} alt={f.name} className="w-full h-full object-cover" />
                {f.status === "loading" ? (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                    <Spinner className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <button
                    onClick={() => removeFile(f.id)}
                    className="absolute top-0.5 right-0.5 w-4.5 h-4.5 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-[10px] leading-none transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ) : (
              <div key={f.id} className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1.5 max-w-45">
                {f.status === "loading" ? (
                  <Spinner className="w-3 h-3 text-indigo-500 shrink-0" />
                ) : (
                  <span className="text-xs shrink-0">📎</span>
                )}
                <span className="text-xs text-indigo-600 truncate">{f.name}</span>
                {f.status === "done" && (
                  <button onClick={() => removeFile(f.id)} className="text-gray-400 hover:text-gray-600 text-xs shrink-0 leading-none">×</button>
                )}
              </div>
            )
          )}
        </div>
      )}

      <div className="flex items-end gap-2.5">
        <button
          onClick={() => fileRef.current.click()}
          title="Upload file"
          className="bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-600 rounded-xl w-10.5 h-10.5 text-xl cursor-pointer shrink-0 flex items-center justify-center transition-colors"
        >
          +
        </button>
        <input type="file" ref={fileRef} className="hidden" onChange={handleFile} />
        <textarea
          className="flex-1 bg-gray-50 border border-gray-200 focus:border-indigo-400 rounded-xl px-3.5 py-2.5 text-gray-800 text-sm resize-none outline-none max-h-40 min-h-10.5 leading-relaxed placeholder:text-gray-400 transition-colors"
          placeholder="Type a message... (Shift+Enter for new line)"
          value={text}
          ref={textareaRef}
          onChange={(e) => {
            setText(e.target.value);
            const ta = textareaRef.current;
            ta.style.height = "auto";
            ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          rows={1}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="bg-indigo-500 hover:bg-indigo-600 text-white border-0 rounded-xl w-10.5 h-10.5 cursor-pointer shrink-0 flex items-center justify-center hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <Spinner />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { deleteConversation, createConversation } from "../config/conversationAPI";

export default function Sidebar({ conversations, activeId, onSelect, onConversationCreated, onConversationDeleted, collapsed, onToggle }) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleNew = async () => {
    const res = await createConversation("New Conversation");
    onConversationCreated(res.metadata);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteConversation(deleteTarget);
    onConversationDeleted(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <>
      <aside className={`${collapsed ? "w-0 min-w-0" : "w-65 min-w-65"} bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300`}>
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
          <span className="font-semibold text-sm text-gray-800">Chats</span>
          <button
            onClick={onToggle}
            title="Hide sidebar"
            className="bg-transparent hover:bg-gray-100 border-0 text-gray-400 hover:text-gray-600 rounded-lg w-7.5 h-7.5 cursor-pointer flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto p-2 list-none m-0">
          <li
            onClick={handleNew}
            className="flex items-center justify-center px-3 py-2.5 rounded-xl cursor-pointer gap-2 transition-colors border border-dashed border-gray-300 hover:bg-indigo-50 hover:border-indigo-300 mb-1"
          >
            <span className="text-xs text-gray-500">+ New conversation</span>
          </li>
          {conversations.map((c) => (
            <li
              key={c._id}
              onClick={() => onSelect(c._id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer gap-2 transition-colors group ${
                activeId === c._id
                  ? "bg-indigo-50 border border-indigo-200"
                  : "hover:bg-gray-100 border border-transparent"
              }`}
            >
              <span className="text-xs flex-1 whitespace-nowrap overflow-hidden text-ellipsis text-gray-700">
                {c.title}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(c._id); }}
                className="bg-transparent border-0 cursor-pointer text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-0.5"
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {collapsed && (
        <button
          onClick={onToggle}
          title="Show sidebar"
          className="fixed top-4 left-3 z-50 bg-white hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Xoá cuộc trò chuyện?</h3>
            <p className="text-xs text-gray-500 mb-5">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 cursor-pointer transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs rounded-lg border-0 bg-red-500 hover:bg-red-600 text-white cursor-pointer transition-colors"
              >
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

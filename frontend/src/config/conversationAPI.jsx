import api from "./axios_custom";

export const getConversations = () => api.get("/conversations");

export const createConversation = (title) =>
  api.post("/conversations", { title });

export const deleteConversation = (id) => api.delete(`/conversations/${id}`);

export const startConversation = (content, attachments = []) =>
  api.post("/conversations/start", { content, attachments });

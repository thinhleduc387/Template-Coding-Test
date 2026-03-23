import api from "./axios_custom";
import axios from "axios";

export const getMessages = (conversationId) =>
  api.get(`/conversations/${conversationId}/messages`);

export const sendMessage = (conversationId, content, attachments = []) =>
  api.post(`/conversations/${conversationId}/messages`, { content, attachments });

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post("http://localhost:8080/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((res) => res.data);
};

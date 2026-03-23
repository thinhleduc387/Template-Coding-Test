import Message from "../models/Message.model.js";
import Conversation from "../models/Conversation.model.js";
import { generateAIResponse } from "./ai.service.js";
import { BadRequestError } from "../core/error.response.js";

export const getMessagesByConversation = async (conversationId) => {
  return Message.find({ conversationId }).sort({ createdAt: 1 });
};

const buildTitle = (content) => {
  const trimmed = content.trim();
  return trimmed.length > 40 ? trimmed.slice(0, 40).trimEnd() + "..." : trimmed;
};

export const sendMessage = async (conversationId, { content, attachments = [] }) => {
  const trimmedContent = content?.trim() || "";
  if (!trimmedContent && attachments.length === 0) throw new BadRequestError("Content or attachment is required");

  const displayContent = trimmedContent || "(sent a file)";

  const history = await Message.find({ conversationId }).sort({ createdAt: 1 });
  const isFirstMessage = history.length === 0;

  const contextMessages = [
    ...history.map((msg) => ({
      role: msg.senderType === "user" ? "user" : "assistant",
      content: msg.content,
      attachments: msg.attachments || [],
    })),
    { role: "user", content: displayContent, attachments },
  ];

  const aiText = await generateAIResponse(contextMessages);

  const userMessage = await Message.create({
    conversationId,
    senderType: "user",
    content: displayContent,
    attachments,
  });

  const aiMessage = await Message.create({
    conversationId,
    senderType: "ai",
    content: aiText,
  });

  const updateData = { updatedAt: new Date() };
  if (isFirstMessage) updateData.title = buildTitle(displayContent);

  const conversation = await Conversation.findByIdAndUpdate(conversationId, updateData, { returnDocument: "after" });

  return { userMessage, aiMessage, conversation };
};

export const startConversation = async ({ content, attachments = [] }) => {
  const trimmedContent = content?.trim() || "";
  if (!trimmedContent && attachments.length === 0) throw new BadRequestError("Content or attachment is required");

  const displayContent = trimmedContent || "(sent a file)";

  const aiText = await generateAIResponse([{ role: "user", content: displayContent, attachments }]);

  const conversation = await Conversation.create({ title: buildTitle(displayContent) });

  const userMessage = await Message.create({
    conversationId: conversation._id,
    senderType: "user",
    content: displayContent,
    attachments,
  });

  const aiMessage = await Message.create({
    conversationId: conversation._id,
    senderType: "ai",
    content: aiText,
  });

  return { conversation, userMessage, aiMessage };
};

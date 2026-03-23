import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import { Ok, CREATED } from "../core/success.response.js";
import * as MessageService from "../services/message.service.js";

export const createConversation = async (req, res, next) => {
  try {
    const { title } = req.body;
    const conversation = await Conversation.create({ title: title || "New Conversation" });
    new CREATED({ message: "Conversation created", metadata: conversation }).send(res);
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find().sort({ updatedAt: -1 });
    new Ok({ message: "OK", metadata: conversations }).send(res);
  } catch (error) {
    next(error);
  }
};

export const startConversation = async (req, res, next) => {
  try {
    const result = await MessageService.startConversation(req.body);
    new CREATED({ message: "Conversation started", metadata: result }).send(res);
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    await Conversation.findByIdAndDelete(req.params.id);
    await Message.deleteMany({ conversationId: req.params.id });
    new Ok({ message: "Conversation deleted", metadata: null }).send(res);
  } catch (error) {
    next(error);
  }
};

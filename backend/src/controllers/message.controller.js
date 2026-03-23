import { Ok, CREATED } from "../core/success.response.js";
import * as MessageService from "../services/message.service.js";

export const getMessages = async (req, res, next) => {
  try {
    const messages = await MessageService.getMessagesByConversation(req.params.id);
    new Ok({ message: "OK", metadata: messages }).send(res);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const result = await MessageService.sendMessage(req.params.id, req.body);
    new CREATED({ message: "Message sent", metadata: result }).send(res);
  } catch (error) {
    next(error);
  }
};

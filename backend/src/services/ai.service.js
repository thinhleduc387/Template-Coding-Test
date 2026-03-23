import { GoogleGenAI } from "@google/genai";

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
]);

const buildParts = async (msg) => {
  const parts = [{ text: msg.content }];

  for (const attachment of msg.attachments || []) {
    const { fileUrl, fileType, fileName } = attachment;

    if (IMAGE_MIME_TYPES.has(fileType)) {
      const res = await fetch(fileUrl);
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      parts.push({ inlineData: { mimeType: fileType, data: base64 } });
    } else if (fileType.startsWith("text/")) {
      const res = await fetch(fileUrl);
      const text = await res.text();
      parts.push({ text: `[File: ${fileName}]\n${text}` });
    } else {
      parts.push({ text: `[Attached file: ${fileName} (${fileType})]` });
    }
  }

  return parts;
};

export const generateAIResponse = async (messages) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const contents = await Promise.all(
    messages.map(async (msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: await buildParts(msg),
    }))
  );

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    contents,
  });

  return response.text;
};


import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPTS } from "../constants.tsx";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getVocabulary = async (language: string, count: number = 5) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: SYSTEM_PROMPTS.VOCAB_GEN(language, count),
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            translation: { type: Type.STRING },
            example: { type: Type.STRING }
          },
          required: ["word", "translation", "example"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const generateChallenge = async (language: string, level: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: SYSTEM_PROMPTS.CHALLENGE_GEN(language, level),
    config: {
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateLesson = async (language: string, level: string, topic: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: SYSTEM_PROMPTS.LESSON_GEN(language, level, topic),
    config: {
      responseMimeType: "application/json"
    }
  });
  return { ...JSON.parse(response.text || '{}'), id: `lesson-${Date.now()}` };
};

export const analyzeConversation = async (message: string, language: string) => {
  const prompt = `Analyze this message from a ${language} learner: "${message}". 
  Briefly explain mistakes in English or say "Excellent grammar!". Max 20 words.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text || '';
};

export const chatWithTutor = async (history: {role: 'user' | 'model', text: string}[], currentMessage: string, language: string, level: string) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
    config: {
      systemInstruction: SYSTEM_PROMPTS.CHAT_TUTOR(language, level),
    },
  });
  const response = await chat.sendMessage({ message: currentMessage });
  return response.text || '';
};

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getGeminiResponse(prompt: string, history: { role: string, parts: { text: string }[] }[] = []) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history,
      { role: "user", parts: [{ text: prompt }] }
    ],
    config: {
      systemInstruction: "You are a helpful academic assistant for the SVCE Project Submission Portal. You help students with project ideas, methodology, and documentation. You also help supervisors with evaluation criteria and feedback phrasing. Keep responses professional, encouraging, and structured.",
    }
  });

  const response = await model;
  return response.text;
}

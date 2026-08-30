import { GoogleGenAI } from "@google/genai";

export default async function generateEmbedding(text) {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const result = await genAI.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });
  return result.embeddings[0].values;
}

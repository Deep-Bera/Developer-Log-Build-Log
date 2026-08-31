import Log from "../models/logModel.js";
import generateEmbedding from "../helper/embeddingGenerator.js";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";

const askController = {};

askController.askAI = async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Query cannot be empty" });
  }
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    // embed the user question to vectors .....
    const queryVector = await generateEmbedding(query);

    // run vector search — scoped to this user's logs only..
    const relevantLogs = await Log.aggregate([
      {
        $vectorSearch: {
          index: "logs_vector_index",
          path: "embedding",
          queryVector,
          numCandidates: 100,
          limit: 8,
          filter: {
            userId: { $eq: new mongoose.Types.ObjectId(req.userId) },
          },
        },
      },
      {
        $project: {
          content: 1,
          entryType: 1,
          tags: 1,
          projectId: 1,
          createdAt: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    if (relevantLogs.length === 0) {
      return res.status(200).json({
        answer: "I couldn't find any relevant logs to answer your question.",
        sources: [],
      });
    }

    // build context from retrieved logs..
    const context = relevantLogs
      .map(
        (log, i) =>
          `Log ${i + 1} [${log.entryType}] (${new Date(log.createdAt).toLocaleDateString()}):
${log.content}`,
      )
      .join("\n\n");

    // build the prompt..
    const prompt = `You are an AI assistant helping a developer reflect on their project journey.
Based on the following log entries from the developer's build log, answer their question concisely and accurately.
Only use information from the provided logs. If the logs don't contain enough information, say so.

Developer's question: ${query}

Relevant log entries:
${context}

Answer:`;

    // call gemini..
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const answer = result.text;

    res.status(200).json({
      answer,
      sources: relevantLogs.map((log) => ({
        logId: log._id,
        projectId: log.projectId,
        entryType: log.entryType,
        createdAt: log.createdAt,
        score: log.score,
      })),
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

export default askController;

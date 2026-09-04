import Log from "../models/logModel.js";
import Project from "../models/projectModel.js";
import generateEmbedding from "../helper/embeddingGenerator.js";
import findFunctionCall from "../helper/findFunctionCall.js";
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
    const queryVector = await generateEmbedding(query);

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

    const context = relevantLogs
      .map(
        (log, i) =>
          `Log ${i + 1} [${log.entryType}] (${new Date(log.createdAt).toLocaleDateString()}):
${log.content}`,
      )
      .join("\n\n");

    const prompt = `You are an AI assistant helping a developer reflect on their project journey.
Based on the following log entries from the developer's build log, answer their question concisely and accurately.
Only use information from the provided logs. If the logs don't contain enough information, say so.

Developer's question: ${query}

Relevant log entries:
${context}

Answer:`;

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const answer = result.text;
    const noInfoRegex =
      /do not contain|no information|could not find|not mentioned/i;
    const finalSources = noInfoRegex.test(answer)
      ? []
      : relevantLogs.map((log) => ({
          logId: log._id,
          projectId: log.projectId,
          entryType: log.entryType,
          createdAt: log.createdAt,
          score: log.score,
        }));

    res.status(200).json({ answer, sources: finalSources });
  } catch (err) {
    console.log("in the ask AI controller ", err.message);
    if (err.message?.includes("503") || err.message?.includes("UNAVAILABLE")) {
      return res.status(503).json({
        message: "AI service is currently busy. Please try again in a moment.",
      });
    }
    res.status(500).json({ message: err.message });
  }
};

// tool definitions for the create log flow..
const tools = [
  {
    functionDeclarations: [
      {
        name: "get_git_diff",
        description:
          "Gets the latest git diff from the user's local repository",
        parameters: { type: "object", properties: {}, required: [] },
      },
      {
        name: "create_log",
        description: "Creates a log entry in the Build Log platform",
        parameters: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
              description: "The project ID to attach the log to",
            },
            entryType: {
              type: "string",
              enum: ["Decision", "Blocker", "Win", "Learn"],
              description: "Type of log entry",
            },
            content: {
              type: "string",
              description: "The log content describing what happened",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Relevant tags for this log entry",
            },
          },
          required: ["projectId", "entryType", "content", "tags"],
        },
      },
    ],
  },
];

// first turn — send query to gemini with tools, detect if it wants get_git_diff..
askController.askAIWithTools = async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Query cannot be empty" });
  }
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // fetch user's projects so gemini knows which ones exist..
    const projects = await Project.find({ userId: req.userId }).select(
      "_id name",
    );

    if (projects.length === 0) {
      return res.status(200).json({
        type: "answer",
        answer:
          "You don't have any projects yet. Create a project first before logging.",
        sources: [],
      });
    }

    const systemPrompt = `You are an AI assistant for Build Log, a developer journaling platform.
The user wants to create a log entry from their latest git commit.
Available projects: ${projects.map((p) => `${p.name} (id: ${p._id})`).join(", ")}
If the user mentions a project name, match it flexibly — partial matches, different casing, or similar names are fine. Pick the closest match.

Your job:
1. Use the get_git_diff tool to read the user's local git changes
2. Analyze the diff carefully — understand what was changed, why it might have been changed, and what kind of work it represents
3. Based on your analysis, call create_log with:
   - entryType: one of "Decision", "Blocker", "Win", "Learn" — pick the most appropriate based on the nature of the changes
   - content: a clear, human-readable summary of what was changed and why — NOT the raw diff. Write it as a developer would describe their work in a journal. 2-4 sentences.
   - tags: 2-4 relevant lowercase tags based on the files and technologies changed
   - projectId: the correct project ID from the available projects

Never use raw diff content as the log content. Always summarize it in plain English.`;

    const contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt + "\n\nUser request: " + query }],
      },
    ];

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: { tools },
    });

    const candidate = result.candidates[0];
    const parts = candidate.content.parts;

    // find functionCall part — don't assume it's always parts[0]..
    const functionCallPart = findFunctionCall(parts);

    if (
      functionCallPart &&
      functionCallPart.functionCall.name === "get_git_diff"
    ) {
      return res.status(200).json({
        type: "tool_call",
        toolName: "get_git_diff",
        // pass full chat history including model's function call for second turn..
        chatHistory: [
          ...contents,
          {
            role: "model",
            parts: [{ functionCall: functionCallPart.functionCall }],
          },
        ],
      });
    }

    // gemini responded with text directly..
    const textPart = parts?.find((p) => p.text);
    return res.status(200).json({
      type: "answer",
      answer: textPart?.text || "Something went wrong, please try again.",
      sources: [],
    });
  } catch (err) {
    console.log("askAIWithTools error", err.message);
    if (err.message?.includes("503") || err.message?.includes("UNAVAILABLE")) {
      return res.status(503).json({
        message: "AI service is currently busy. Please try again in a moment.",
      });
    }
    res.status(500).json({ message: err.message });
  }
};

// second turn — receives diff from frontend, feeds to gemini, executes create_log..
askController.askAIToolResult = async (req, res) => {
  const { diff, chatHistory, projectId } = req.body;

  if (!diff || !chatHistory) {
    return res.status(400).json({ message: "Missing diff or chat history" });
  }
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // find the functionCall from chat history to get the correct call reference..
    const modelTurn = chatHistory.find((m) => m.role === "model");
    const functionCallPart = findFunctionCall(modelTurn?.parts);

    // append the diff as a function response referencing the original call..
    const updatedHistory = [
      ...chatHistory,
      {
        role: "user",
        parts: [
          {
            functionResponse: {
              name: "get_git_diff",
              response: { diff },
            },
          },
        ],
      },
    ];

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: updatedHistory,
      config: { tools },
    });

    const candidate = result.candidates[0];
    const parts = candidate.content.parts;
    const functionCallResult = findFunctionCall(parts);

    if (
      functionCallResult &&
      functionCallResult.functionCall.name === "create_log"
    ) {
      const {
        projectId: pid,
        entryType,
        content,
        tags,
      } = functionCallResult.functionCall.args;

      const resolvedProjectId = pid || projectId;

      if (!resolvedProjectId) {
        return res
          .status(400)
          .json({ message: "Could not determine which project to log to" });
      }

      // verify the project belongs to this user..
      const project = await Project.findOne({
        _id: resolvedProjectId,
        userId: req.userId,
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // create the log..
      const log = await Log.create({
        projectId: resolvedProjectId,
        userId: req.userId,
        entryType,
        content,
        tags,
      });

      // increment log count..
      await Project.findByIdAndUpdate(resolvedProjectId, {
        $inc: { logCount: 1 },
      });

      // generate embedding asynchronously — don't block the response..
      generateEmbedding(content)
        .then((embedding) => {
          Log.findByIdAndUpdate(log._id, { embedding }).exec();
        })
        .catch((err) => console.log("embedding generation error", err.message));

      return res.status(200).json({
        type: "answer",
        answer: `Log created successfully — **${entryType}**: ${content.slice(0, 100)}...`,
        sources: [],
        log,
      });
    }

    // gemini responded with text..
    const textPart = parts?.find((p) => p.text);
    return res.status(200).json({
      type: "answer",
      answer: textPart?.text || "Something went wrong, please try again.",
      sources: [],
    });
  } catch (err) {
    console.log("askAIToolResult error", err.message);
    if (err.message?.includes("503") || err.message?.includes("UNAVAILABLE")) {
      return res.status(503).json({
        message: "AI service is currently busy. Please try again in a moment.",
      });
    }
    res.status(500).json({ message: err.message });
  }
};

export default askController;

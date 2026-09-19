import Log from "../models/logModel.js";
import Project from "../models/projectModel.js";
import generateEmbedding from "../helper/embeddingGenerator.js";
import findFunctionCall from "../helper/findFunctionCall.js";
import { GoogleGenAI } from "@google/genai";
import mongoose from "mongoose";

const askController = {};

askController.askAI = async (req, res) => {
  const { query, history = [] } = req.body;

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
          `Log ${i + 1} [${log.entryType}] (${new Date(log.createdAt).toLocaleDateString()}):\n${log.content}`,
      )
      .join("\n\n");

    // inject last 2 conversation turns so follow-up questions make sense..
    const recentContext = history
      .slice(-2)
      .map((h) => `User: ${h.question}\nAI: ${h.answer}`)
      .join("\n\n");

    const prompt = `You are an AI assistant helping a developer reflect on their project journey.
Based on the following log entries from the developer's build log, answer their question concisely and accurately.
Only use information from the provided logs. If the logs don't contain enough information, say so.
${
  recentContext
    ? `\nRecent conversation for context:\n${recentContext}\n`
    : ""
}
Developer's question: ${query}

Relevant log entries:
${context}

Answer:`;

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash", // RAG answer
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

      // return create_log args to frontend — let MCP server handle actual creation..
      return res.status(200).json({
        type: "tool_call",
        toolName: "create_log",
        args: {
          projectId: resolvedProjectId,
          entryType,
          content,
          tags,
        },
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

// classify user intent — SEARCH (personal logs), CREATE (git diff log), or GENERAL (knowledge question)..
askController.getIntent = async (req, res) => {
  const { query, history = [] } = req.body;

  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Query cannot be empty" });
  }

  try {
    // include the last turn so pronouns like "it" or "that" can be resolved..
    const lastTurn = history.slice(-1)[0];
    const recentContext = lastTurn
      ? `Recent conversation:\nUser: ${lastTurn.question}\nAI: ${lastTurn.answer.slice(0, 200)}\n\n`
      : "";

    const prompt = `Classify the user's intent into exactly one of three categories:

- "SEARCH" — the user wants to search through or ask about their personal development logs, past decisions, blockers, wins, or learnings from their own projects. Keywords like "I", "my", "did I", "last week", "this project" strongly indicate SEARCH.
- "CREATE" — the user wants to create or capture a new log entry from their git repository or latest commit.
- "GENERAL" — the user is asking a general knowledge question, concept explanation, or technical question that does NOT require their personal logs. Things like "what is Redis", "explain binary trees", "how does OAuth work".

${recentContext}Reply with exactly one word: "SEARCH", "CREATE", or "GENERAL".
User query: "${query}"`;

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash", // intent classification — one word, no reasoning needed
      contents: prompt,
    });

    const text = result.text?.trim().toUpperCase() || "";
    let intent = "GENERAL";
    if (text.includes("CREATE")) intent = "CREATE";
    else if (text.includes("SEARCH")) intent = "SEARCH";

    return res.status(200).json({ intent });
  } catch (err) {
    console.log("Intent classification error:", err.message);
    // fallback: check for CREATE patterns, otherwise default to GENERAL for safety..
    const fallback = /create.*log|log.*git|git.*diff|commit/i.test(query)
      ? "CREATE"
      : /my |did i|i did|last week|this project|blockers|decisions|what.*i.*learn/i.test(query)
        ? "SEARCH"
        : "GENERAL";
    return res.status(200).json({ intent: fallback });
  }
};

// answer general knowledge questions directly — no RAG, no vector search..
askController.askAIGeneral = async (req, res) => {
  const { query, history = [] } = req.body;

  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Query cannot be empty" });
  }
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const systemInstruction = `You are a helpful AI assistant on Build Log, a developer journaling platform.
Answer questions clearly and concisely. Use markdown formatting where appropriate (headings, lists, code blocks).
Keep answers focused and developer-friendly.`;

    // build multi-turn contents array so Gemini remembers previous turns..
    const contents = [
      // inject up to 4 previous turns as conversation history..
      ...history.slice(-4).flatMap((h) => [
        { role: "user", parts: [{ text: h.question }] },
        { role: "model", parts: [{ text: h.answer }] },
      ]),
      // the current question..
      { role: "user", parts: [{ text: query }] },
    ];

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash", // general Q&A answer
      contents,
      config: { systemInstruction },
    });

    const answer =
      result.text ||
      result?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      "I wasn't able to generate an answer. Please try again.";

    return res.status(200).json({ answer });
  } catch (err) {
    console.log("askAIGeneral error:", err.message);
    if (err.message?.includes("503") || err.message?.includes("UNAVAILABLE")) {
      return res.status(503).json({
        message: "AI service is currently busy. Please try again in a moment.",
      });
    }
    return res.status(500).json({ message: err.message });
  }
};

// summarize a Q&A conversation turn into a structured log entry draft..
askController.summarizeToLog = async (req, res) => {
  const { question, answer, precedingContext } = req.body;

  if (!question || !answer) {
    return res
      .status(400)
      .json({ message: "Question and answer are required" });
  }
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const prompt = `You are an AI assistant for Build Log, a developer journal platform.
Analyze the following conversation turn between a developer and an AI assistant, and summarize it into a single structured log entry.

${precedingContext ? `Preceding conversation context:\n${precedingContext}\n\n` : ""}
Developer Question: "${question}"
AI Response: "${answer}"

Categorize the takeaway into exactly one of these 4 entry types:
- "Decision": Architectural choices, library selections, design decisions, trade-offs.
- "Blocker": Challenges, bugs, CORS issues, errors encountered and their resolution.
- "Win": Milestones reached, features completed, major progress made, optimizations.
- "Learn": Insights gained, technical takeaways, how something works, best practices.

Return ONLY a valid JSON object in this exact schema (no markdown fences, no extra text):
{
  "entryType": "Decision" | "Blocker" | "Win" | "Learn",
  "content": "A crisp, well-written 1-3 sentence summary of what was decided, solved, learned, or built. Do not write raw markdown headers.",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash", // structured extraction, same tier as General Q&A
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawText =
      result.text ||
      result?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      "{}";

    let parsed;
    try {
      const cleaned = rawText.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.log(
        "JSON parse error in summarizeToLog:",
        parseErr.message,
        rawText,
      );
      parsed = {
        entryType: "Learn",
        content: answer.slice(0, 250),
        tags: ["development", "ai-chat"],
      };
    }

    const validTypes = ["Decision", "Blocker", "Win", "Learn"];
    const entryType = validTypes.includes(parsed.entryType)
      ? parsed.entryType
      : "Learn";
    const content = parsed.content || answer.slice(0, 250);
    const tags = Array.isArray(parsed.tags)
      ? parsed.tags
          .map((t) => String(t).toLowerCase().trim())
          .filter(Boolean)
      : ["ai-chat"];

    return res.status(200).json({
      entryType,
      content,
      tags: tags.length > 0 ? tags : ["ai-chat"],
    });
  } catch (err) {
    console.log("summarizeToLog error:", err.message);
    if (err.message?.includes("503") || err.message?.includes("UNAVAILABLE")) {
      return res.status(503).json({
        message: "AI service is currently busy. Please try again in a moment.",
      });
    }
    // Return graceful fallback so user can still edit
    return res.status(200).json({
      entryType: "Learn",
      content: answer.slice(0, 250),
      tags: ["ai-chat"],
    });
  }
};

export default askController;


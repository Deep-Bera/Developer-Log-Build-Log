import Artifact from "../models/artifactModel.js";
import Project from "../models/projectModel.js";
import Log from "../models/logModel.js";
// import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import buildPrompt from "../helper/promtBuilder.js";

const artifactController = {};

artifactController.generateArtifact = async (req, res) => {
  const { projectId } = req.params;
  const { type } = req.body;
  if (!type || !["readme", "interview-qa"].includes(type)) {
    return res.status(400).json({ message: "Invalid artifact type" });
  }

  try {
    // console.log("Key loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO");
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    // only allow generation on completed projects..
    const project = await Project.findOne({
      _id: projectId,
      userId: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.status !== "complete") {
      return res.status(400).json({
        message: "Artifacts can only be generated for completed projects",
      });
    }

    // check the 3 artifact limit per type..
    const count = await Artifact.countDocuments({ projectId, type });
    if (count >= 3) {
      return res.status(400).json({
        message: `You have reached the maximum of 3 ${type} artifacts for this project`,
      });
    }

    // Fetch lightweight plain JS log objects with essential fields only, bypassing heavy embeddings for optimal performanc
    const logs = await Log.find({ projectId })
      .select("content entryType tags createdAt -_id")
      .lean();

    if (logs.length === 0) {
      return res
        .status(400)
        .json({ message: "Cannot generate artifact — project has no logs" });
    }

    // build the prompt..
    const prompt = buildPrompt(type, project, logs);

    // call gemini..
    // const result = await model.generateContent(prompt);
    // const content = result.response.text();
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const content = result.text;
    // console.log(content);
    // save the artifact..
    const artifact = await Artifact.create({
      projectId,
      userId: req.userId,
      type,
      content,
    });

    res.status(201).json({ data: artifact });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

artifactController.getAllArtifacts = async (req, res) => {
  const { projectId } = req.params;

  try {
    const artifacts = await Artifact.find({
      projectId,
      userId: req.userId,
    }).sort({ createdAt: -1 });
    res.status(200).json({ data: artifacts });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

artifactController.getArtifactById = async (req, res) => {
  const { projectId, artifactId } = req.params;

  try {
    const artifact = await Artifact.findOne({
      _id: artifactId,
      projectId,
      userId: req.userId,
    });

    if (!artifact) {
      return res.status(404).json({ message: "Artifact not found" });
    }

    res.status(200).json({ data: artifact });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

artifactController.updateArtifact = async (req, res) => {
  const { projectId, artifactId } = req.params;
  const { content } = req.body;

  if (!content || typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ message: "Content cannot be empty" });
  }

  try {
    const artifact = await Artifact.findOne({
      _id: artifactId,
      projectId,
      userId: req.userId,
    });

    if (!artifact) {
      return res.status(404).json({ message: "Artifact not found" });
    }

    artifact.content = content;
    await artifact.save();

    res.status(200).json({ data: artifact });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

export default artifactController;

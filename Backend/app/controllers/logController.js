import Log from "../models/logModel.js";
import Project from "../models/projectModel.js";
import generateEmbedding from "../helper/embeddingGenerator.js";
import { validationResult } from "express-validator";

const logsController = {};

logsController.createLog = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  const { entryType, content, tags } = req.body;
  const { projectId } = req.params;
  const project = await Project.findOne({ _id: projectId, userId: req.userId });
  if (!project) {
    return res.status(403).json({
      message: "You are not the owner of this project to create Logs",
    });
  }
  try {
    const log = new Log({
      projectId,
      userId: req.userId,
      entryType,
      content,
      tags,
    });
    log.embedding = await generateEmbedding(content);
    await log.save();

    // increment logCount on the project
    await Project.findByIdAndUpdate(projectId, { $inc: { logCount: 1 } });

    res.status(201).json({ data: log });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

logsController.getAllLogs = async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const entryType = req.query.entryType;
  const sort = req.query.sort === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  try {
    const query = { projectId };
    if (entryType) query.entryType = entryType;
    // Verify project privacy status
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    //Block access if project is private and requester is not owner
    if (!project.isPublic && project.userId?.toString() !== req.userId) {
      return res.status(403).json({ message: "This project is private" });
    }

    //Build query (ignore 'all' filter)
    if (entryType && entryType !== "all") {
      query.entryType = entryType;
    }
    const total = await Log.countDocuments(query);

    const logs = await Log.find(query)
      .sort({ createdAt: sort })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//for specific logs only ...
logsController.getLogById = async (req, res) => {
  const { projectId, logId } = req.params;

  try {
    const log = await Log.findOne({
      _id: logId,
      projectId,
      userId: req.userId,
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.status(200).json({ data: log });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

logsController.updateLog = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  const { projectId, logId } = req.params;
  const { entryType, content, tags } = req.body;

  try {
    const log = await Log.findOne({
      _id: logId,
      projectId,
      userId: req.userId,
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    if (entryType) log.entryType = entryType;
    if (content) {
      log.content = content;
      log.embedding = await generateEmbedding(content);
    }
    if (tags) log.tags = tags;

    await log.save();

    res.status(200).json({ data: log });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

logsController.deleteLog = async (req, res) => {
  const { projectId, logId } = req.params;

  try {
    const log = await Log.findOneAndDelete({
      _id: logId,
      projectId,
      userId: req.userId,
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }
    await Project.findByIdAndUpdate(projectId, { $inc: { logCount: -1 } });
    res.status(200).json({ message: "Log deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default logsController;

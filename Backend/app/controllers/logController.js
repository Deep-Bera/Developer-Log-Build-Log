import Log from "../models/logModel.js";
import Project from "../models/projectModel.js";
import { validationResult } from "express-validator";

const logsController = {};

logsController.createLog = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  const { entryType, content, tags } = req.body;
  const { projectId } = req.params;
  try {
    const log = new Log({
      projectId,
      userId: req.userId,
      entryType,
      content,
      tags,
    });

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
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  try {
    const total = await Log.countDocuments({ projectId, userId: req.userId });

    const logs = await Log.find({ projectId, userId: req.userId })
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
    return res.status(401).json({ error: errors.array() });
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
    if (content) log.content = content;
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

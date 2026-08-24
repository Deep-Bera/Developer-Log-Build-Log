import Project from "../models/projectModel.js";
import Log from "../models/logModel.js";
import { validationResult } from "express-validator";

const projectController = {};

projectController.createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  try {
    const { name, stack, startDate } = req.body;

    const project = await Project.create({
      userId: req.userId,
      name,
      stack,
      startDate,
    });

    res.status(201).json({ data: project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

projectController.getAllProject = async (req, res) => {
  try {
    const project = await Project.find({ userId: req.userId });

    if (project.length == 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(project);
  } catch (error) {
    console.log(error.message);
    res.status(400).json("Something went wrong", error.message);
  }
};

projectController.getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findOne({ userId: req.userId, _id: id });
    if (project.length == 0) {
      return res.status(400).json("No Project Found");
    }
    res.status(200).json({ data: project });
  } catch (error) {
    console.log(error.message);
    res.status(400).json("Something went wrong", error.message);
  }
};

projectController.submitProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.project.status !== "in-progress") {
      return res
        .status(400)
        .json({ errors: "only In-Progress Projects can be Completed" });
    }
    const updatedPost = await Project.findOneAndUpdate(
      { userId: req.userId, _id: id },
      { status: "complete" },
      { returnDocument: "after" },
    );
    res.status(200).json({ data: updatedPost });
  } catch (error) {
    console.log(error.message);
    res.status(400).json("Something went wrong", error.message);
  }
};

projectController.updateProjectById = async (req, res) => {
  const { name, stack, startDate } = req.body;

  // const project = await Project.findOne({ userId: req.userId, _id: id });
  // if (!project) {
  //   return res.status(400).json("No Project Found");
  // }
  // console.log(project);

  try {
    if (name) req.project.name = name;
    if (stack) req.project.stack = stack;
    if (startDate) req.project.startDate = startDate;

    await req.project.save();

    res.status(200).json({ data: req.project });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

projectController.deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    await Log.deleteMany({ projectId: id });
    const deletedProject = await Project.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

projectController.getAllPublicProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      isPublic: true,
      isHidden: false,
    }).populate("userId", "name");

    if (projects.length === 0) {
      return res.status(200).json({ data: [] });
    }

    res.status(200).json({ data: projects });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

projectController.getPublicProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findOne({
      _id: id,
      isPublic: true,
      isHidden: false,
    }).populate("userId", "name");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ data: project });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

projectController.setProjectVisibility = async (req, res) => {
  const { id } = req.params;
  try {
    //here used to be one more DB call, but that checking is already been done in the verifyOwener Middle ware so no need to check that here againg
    const updatedProject = await Project.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { isPublic: !req.project.isPublic },
      { returnDocument: "after" },
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: `Project is now ${updatedProject.isPublic ? "public" : "private"}`,
      data: updatedProject,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export default projectController;

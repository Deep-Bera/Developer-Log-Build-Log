import Project from "../models/projectModel.js";

const verifyProjectOwner = async (req, res, next) => {
  const { id } = req.params;
  try {
    const project = await Project.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    req.project = project;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export default verifyProjectOwner;

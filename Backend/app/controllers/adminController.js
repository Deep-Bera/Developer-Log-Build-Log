import User from "../models/userModel.js";
import Project from "../models/projectModel.js";
import Log from "../models/logModel.js";
import Artifact from "../models/artifactModel.js";

const adminController = {};

// overview numbers for the admin dashboard..
adminController.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();

    // projects that are public but not yet approved — sitting in the queue..
    const pendingApprovals = await Project.countDocuments({
      isPublic: true,
      isApproved: false,
    });

    // projects that have been reported at least once..
    const reportedProjects = await Project.countDocuments({
      reportCount: { $gt: 0 },
    });

    res.status(200).json({
      data: {
        totalUsers,
        totalProjects,
        pendingApprovals,
        reportedProjects,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

// ------- user management -------

adminController.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ data: users });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

adminController.deleteUser = async (req, res) => {
  const { id } = req.params;

  // don't let admin delete themselves..
  if (id === req.userId.toString()) {
    return res
      .status(400)
      .json({ message: "You cannot delete your own account" });
  }

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // clean up all their projects and logs..
    const projects = await Project.find({ userId: id });
    const projectIds = projects.map((p) => p._id);

    await Log.deleteMany({ projectId: { $in: projectIds } });
    await Artifact.deleteMany({ projectId: { $in: projectIds } });
    await Project.deleteMany({ userId: id });

    res.status(200).json({ message: "User and all their data deleted" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

// ------- project management -------

// all projects across all users — admin gets the full picture..
adminController.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ data: projects });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

adminController.approveProject = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findByIdAndUpdate(
      id,
      { isApproved: true, rejectionReason: "" },
      { returnDocument: "after" },
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ data: project, message: "Project approved" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

adminController.rejectProject = async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason || rejectionReason.trim() === "") {
    return res.status(400).json({ message: "Rejection reason is required" });
  }

  try {
    const project = await Project.findByIdAndUpdate(
      id,
      {
        isApproved: false,
        isPublic: false,
        rejectionReason: rejectionReason.trim(),
      },
      { returnDocument: "after" },
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ data: project, message: "Project rejected" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

adminController.revokeApproval = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findByIdAndUpdate(
      id,
      { isApproved: false, rejectionReason: "", isPublic: false },
      { returnDocument: "after" },
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ data: project, message: "Approval revoked" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

// toggles isHidden — used for hiding/unhiding reported projects..
adminController.toggleHideProject = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.isHidden = !project.isHidden;
    await project.save();

    res.status(200).json({
      data: project,
      message: `Project is now ${project.isHidden ? "hidden" : "visible"}`,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

adminController.deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // clean up all logs under this project..
    await Log.deleteMany({ projectId: id });
    await Artifact.deleteMany({ projectId: { $in: projectIds } });
    res
      .status(200)
      .json({ message: "Project and its logs deleted successfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
};

export default adminController;

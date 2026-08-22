import { checkSchema } from "express-validator";
import express from "express";

import authenticateUser from "../middleware/authentication.js";
import authorizeUser from "../middleware/authorization.js";
import verifyProjectOwner from "../middleware/verifyProjectOwner.js";

import {
  createProjectValidator,
  updateProjectValidator,
} from "../validators/projectValidator.js";
import projectController from "../controllers/projectController.js";

const router = express.Router();
//* ------------------------all the APIs double checked --------------------//
router.post(
  "/",
  authenticateUser,
  checkSchema(createProjectValidator),
  authorizeUser(["admin", "user"]),
  projectController.createProject,
);
router.get(
  "/",
  authenticateUser,
  authorizeUser(["admin", "user"]),
  projectController.getAllProject,
);

router.get("/public", projectController.getAllPublicProjects);

router.get("/public/:id", projectController.getPublicProjectById);

router.get(
  "/:id",
  authenticateUser,
  authorizeUser(["admin", "user"]),
  projectController.getProjectById,
);

router.patch(
  "/:id/visibility",
  authenticateUser,
  verifyProjectOwner,
  authorizeUser(["admin", "user"]),
  projectController.setProjectVisibility,
);

router.patch(
  "/:id",
  authenticateUser,
  verifyProjectOwner,
  authorizeUser(["admin", "user"]),
  projectController.submitProjectById,
);

router.put(
  "/:id",
  authenticateUser,
  verifyProjectOwner,
  checkSchema(updateProjectValidator),
  authorizeUser(["admin", "user"]),
  projectController.updateProjectById,
);

router.delete(
  "/:id",
  authenticateUser,
  authorizeUser(["admin", "user"]),
  projectController.deleteProject,
);

export default router;

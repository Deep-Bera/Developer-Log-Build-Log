import express from "express";
import authenticateUser from "../middleware/authentication.js";
import authorizeUser from "../middleware/authorization.js";
import artifactController from "../controllers/artifactController.js";

const router = express.Router();

// generate a new artifact..
router.post(
  "/:projectId",
  authenticateUser,
  authorizeUser(["admin", "user"]),
  artifactController.generateArtifact,
);

// get all artifacts for a project..
router.get(
  "/:projectId",
  authenticateUser,
  authorizeUser(["admin", "user"]),
  artifactController.getAllArtifacts,
);

// get one specific artifact based on the Id..
router.get(
  "/:projectId/:artifactId",
  authenticateUser,
  authorizeUser(["admin", "user"]),
  artifactController.getArtifactById,
);

// edit artifact content..
router.patch(
  "/:projectId/:artifactId",
  authenticateUser,
  authorizeUser(["admin", "user"]),
  artifactController.updateArtifact,
);

export default router;

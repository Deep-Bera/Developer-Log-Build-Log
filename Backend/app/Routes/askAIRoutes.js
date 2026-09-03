import express from "express";
import authenticateUser from "../middleware/authentication.js";
import authorizeUser from "../middleware/authorization.js";
import askController from "../controllers/askAIController.js";

const router = express.Router();

// RAG flow controller .....
router.post(
  "/",
  authenticateUser,
  authorizeUser(["admin", "user"]),
  askController.askAI,
);

// first turn — send query to gemini with tools..
router.post(
  "/create-log",
  authenticateUser,
  authorizeUser(["admin", "user"]),
  askController.askAIWithTools,
);

// second turn — receive diff from frontend, complete the flow..
router.post(
  "/tool-result",
  authenticateUser,
  authorizeUser(["admin", "user"]),
  askController.askAIToolResult,
);

export default router;

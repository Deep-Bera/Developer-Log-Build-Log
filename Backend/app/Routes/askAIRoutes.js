import express from "express";
import authenticateUser from "../middleware/authentication.js";
import authorizeUser from "../middleware/authorization.js";
import askController from "../controllers/askAIController.js";

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  authorizeUser(["admin", "user"]),
  askController.askAI,
);

export default router;

import express from "express";
import { checkSchema } from "express-validator";
import authenticateUser from "../middleware/authentication.js";
import authorizeUser from "../middleware/authorization.js";
import {
  createLogValidator,
  updateLogValidator,
} from "../validators/logsValidator.js";

import logsController from "../controllers/logController.js";

const router = express.Router();

// creating a log .....
router.post(
  "/:projectId",
  authenticateUser,
  checkSchema(createLogValidator),
  authorizeUser(["admin", "user"]),
  logsController.createLog,
);
//get all the logs ..
router.get(
  "/:projectId",
  authenticateUser,
  authorizeUser(["admin", "user"]),
  logsController.getAllLogs,
);
//get one specific route....
router.get(
  "/:projectId/:logId",
  authenticateUser,
  authorizeUser(["admin", "user"]),
  logsController.getLogById,
);

router.patch(
  "/:projectId/:logId",
  authenticateUser,
  checkSchema(updateLogValidator),
  authorizeUser(["admin", "user"]),
  logsController.updateLog,
);

router.delete(
  "/:projectId/:logId",
  authenticateUser,
  authorizeUser(["admin", "user"]),
  logsController.deleteLog,
);

export default router;

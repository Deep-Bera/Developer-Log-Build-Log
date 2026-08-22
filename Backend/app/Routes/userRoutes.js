import express from "express";
import { checkSchema } from "express-validator";

import userController from "../controllers/userController.js";
import {
  userRegisterValidator,
  userLoginValidator,
} from "../validators/userValidator.js";
import authentication from "../middleware/authentication.js";

const router = express.Router();

router.post(
  "/register",
  checkSchema(userRegisterValidator),
  userController.registerUser,
);
router.post(
  "/login",
  checkSchema(userLoginValidator),
  userController.loginUser,
);
router.get("/profile", authentication, userController.userDetails);
router.put("/:id", authentication, userController.updateUserDetails);

export default router;

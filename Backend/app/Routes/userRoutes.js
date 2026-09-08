import express from "express";
import { checkSchema } from "express-validator";

import userController from "../controllers/userController.js";
import {
  userRegisterValidator,
  userLoginValidator,
} from "../validators/userValidator.js";
import authentication from "../middleware/authentication.js";
import upload from "../middleware/upload.js";

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
router.put(
  "/profile",
  authentication,
  upload.single("avatar"),
  userController.updateUserDetails,
);

export default router;

import express from "express";
import authenticateUser from "../middleware/authentication.js";
import authorizeUser from "../middleware/authorization.js";
import adminController from "../controllers/adminController.js";

const router = express.Router();

// all admin routes require authentication + admin role..
router.get(
  "/stats",
  authenticateUser,
  authorizeUser(["admin"]),
  adminController.getStats,
);

// ------- user management -------
router.get(
  "/users",
  authenticateUser,
  authorizeUser(["admin"]),
  adminController.getAllUsers,
);

router.delete(
  "/users/:id",
  authenticateUser,
  authorizeUser(["admin"]),
  adminController.deleteUser,
);

// ------- project management -------
router.get(
  "/projects",
  authenticateUser,
  authorizeUser(["admin"]),
  adminController.getAllProjects,
);

router.patch(
  "/projects/:id/approve",
  authenticateUser,
  authorizeUser(["admin"]),
  adminController.approveProject,
);

router.patch(
  "/projects/:id/reject",
  authenticateUser,
  authorizeUser(["admin"]),
  adminController.rejectProject,
);

router.patch(
  "/projects/:id/hide",
  authenticateUser,
  authorizeUser(["admin"]),
  adminController.toggleHideProject,
);

router.delete(
  "/projects/:id",
  authenticateUser,
  authorizeUser(["admin"]),
  adminController.deleteProject,
);

export default router;

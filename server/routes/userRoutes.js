import express from "express";
import {
  isAdminRoute,
  isSuperAdminRoute,
  protectRoute,
} from "../middlewares/authMiddlewave.js";
import {
  activateUserProfile,
  changeUserPassword,
  deleteUserProfile,
  getNotificationsList,
  getTeamList,
  loginUser,
  logoutUser,
  markNotificationRead,
  registerUser,
  updateUserProfile,
  promoteToAdmin,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/get-team", protectRoute, getTeamList);
router.get("/notifications", protectRoute, getNotificationsList);

router.put("/profile", protectRoute, updateUserProfile);
router.put("/read-noti", protectRoute, markNotificationRead);
router.put("/change-password", protectRoute, changeUserPassword);

//* FOR PASSWORD RESET

router.post("/forgotpassword", forgotPassword);
router.post("/changepassword/:resetToken", resetPassword);

//*  FOR ADMIN ONLY - ADMIN ROUTES
router
  .route("/:id")
  .put(protectRoute, isAdminRoute, activateUserProfile)
  .delete(protectRoute, isAdminRoute, deleteUserProfile);

router.post(
  "/promote-to-admin",
  protectRoute,
  isSuperAdminRoute,
  promoteToAdmin
);
export default router;

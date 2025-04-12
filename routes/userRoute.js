import express from "express";
import {
  deleteUser,
  getUserInfo,
  Login,
  Register,
  updateUserInfo,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controller/userController.js";

const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.get("/get/:id", getUserInfo);
router.patch("/update/:id", updateUserInfo);
router.delete("/delete/:id", deleteUser);
router.post("/:userId/follow", followUser);
router.post("/:userId/unfollow", unfollowUser);
router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);

export { router as UserRouter };

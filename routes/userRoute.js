import express from "express";
import {
  deleteUser,
  getUserInfo,
  updateUserInfo,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  create,
} from "../controller/userController.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.post("/create", create);
router.get("/:id", getUserInfo);
router.patch("/update/:id", updateUserInfo);
router.delete("/delete/:id", deleteUser);
router.post("/:userId/follow", followUser);
router.post("/:userId/unfollow", unfollowUser);
router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);

export { router as UserRouter };

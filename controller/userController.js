import bcrypt from "bcrypt";
import { UserModel } from "../models/User.js";
import { getAuth } from "@clerk/express";
import { RecipeModel } from "../models/Recipe.js";
import { PreferenceModel } from "../models/Preference.js";
import { clerkClient } from "@clerk/express";

const create = async (req, res) => {
  try {
    const { userId } = req.auth;
    const existingUser = await UserModel.findOne({ clerkId: userId });
    if (existingUser) {
      return res.status(401).json({ message: "User already exists" });
    }
    const user = await clerkClient.users.getUser(userId);
    const newUser = new UserModel({
      clerkId: userId,
      fullname: user?.fullName,
      username: user?.username,
      imageUrl: user?.imageUrl,
    });
    await newUser.save();
    console.log("✅ User saved:", user);
    res.status(201).json({ message: "User Created Successfully", newUser });
  } catch (error) {
    console.error("❌ Error saving user:", error);
    res.status(500).json({ message: error.message });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500);
  }
};

const updateUserInfo = async (req, res) => {
  try {
    const userId = req.params.id;
    const update = req.body.update;
    const user = await UserModel.findByIdAndUpdate(userId, update, {
      new: true,
    });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500);
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await UserModel.findByIdAndDelete(userId);
    await RecipeModel.deleteMany({ author: userId });
    await PreferenceModel.deleteMany({ userID: userId });
    res.status(200).json({ message: "User Deleted Successfully" });
  } catch (error) {
    res.status(500);
  }
};

const updatePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedPassword = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(updatePassword, salt);
    const user = await UserModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });
    res.status(200).json({ message: "Password Changed successfully" });
  } catch (error) {
    res.status(500);
  }
};

// Follow a user
const followUser = async (req, res) => {
  try {
    const { userId } = req.params; // User to be followed
    const currentUserId = req.body.id; // Authenticated user

    if (userId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await UserModel.findById(userId);
    const currentUser = await UserModel.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are already following this user" });
    }

    // Update both users
    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.body.id;

    if (userId === currentUserId) {
      return res.status(400).json({ message: "You cannot unfollow yourself" });
    }

    const userToUnfollow = await UserModel.findById(userId);
    const currentUser = await UserModel.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is being followed
    if (!currentUser.following.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are not following this user" });
    }

    // Update both users
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userId
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a user's followers
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId).populate(
      "followers",
      "fullname username imageUrl"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.followers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a user's following list
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId).populate(
      "following",
      "fullname username imageUrl"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.following);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const FetchSaved = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);
    const savedRecipe = await RecipeModel.find({
      _id: { $in: user.savedRecipes },
    });

    res.status(200).json({ savedRecipe });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  create,
  getUserInfo,
  updateUserInfo,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};

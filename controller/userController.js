import bcrypt from "bcrypt";
import { UserModel } from "../models/User.js";
import jwt from "jsonwebtoken";

const Register = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;
    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exist" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new UserModel({
      fullname,
      username,
      email,
      password: hashedPassword,
    });
    await user.save();
    res.status(200).json({ message: "User Created Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username: username }).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ message: `User ${username} doesn't exist` });
    }
    console.log(user);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({ message: "Incorrect Password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ userId: user._id, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findOne({ _id: userId });
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

export {
  Register,
  Login,
  getUserInfo,
  updateUserInfo,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};

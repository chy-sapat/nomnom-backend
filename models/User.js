import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String},
    fullname: { type: String, trim: true, required: true },
    username: { type: String, required: true, unique: true, trim: true },
    // Hide password from queries
    description: { type: String, default: "", trim: true },
    imageUrl: { type: String, default: "" },
    bannerImageUrl: { type: String, default: "" }, // User profile banner
    savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model("User", UserSchema);

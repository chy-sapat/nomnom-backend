import mongoose from "mongoose";

const RepliesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reply: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const RatingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String, trim: true },
  replies: [RepliesSchema],
});

const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    ingredients: [{ type: String }],
    directions: [{ type: String}],
    ratings: [RatingSchema],
    labels: [{ type: String, trim: true }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    difficulty: {type: String},
    servings: { type: Number, required: true },
    cookTime: { type: Number, default:  0},
    averageRating: { type: Number, default: 0 },
    totalRating: { type: Number, default: 0 }, // Sum of all ratings
    ratingCount: { type: Number, default: 0 }, // Number of ratings
    views: { type: Number, default: 0 }, // Track recipe views
    image: { type: String, default: ""}
  },
  { timestamps: true }
);

export const RecipeModel = mongoose.model("Recipe", RecipeSchema);

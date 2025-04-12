import mongoose from "mongoose";

const RepliesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reply: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const IngredientSchema = new mongoose.Schema({
  ingredient: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }, // Example: "grams", "cups", "tbsp"
});

const DirectionSchema = new mongoose.Schema({
  step: { type: String, required: true },
  imageUrl: { type: String }, // Optional step-by-step image
});

const NutritionalValueSchema = new mongoose.Schema({
  proteinPerServing: { type: Number, required: true },
  caloriePerServing: { type: Number, required: true },
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
    ingredients: [IngredientSchema],
    directions: [DirectionSchema],
    nutritionalValue: NutritionalValueSchema,
    ratings: [RatingSchema],
    labels: [{ type: String, trim: true }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    servings: { type: Number, required: true },
    prepTime: { type: Number, required: true }, // In minutes
    cookTime: { type: Number, required: true }, // In minutes
    averageRating: { type: Number, default: 0 },
    totalRating: { type: Number, default: 0 }, // Sum of all ratings
    ratingCount: { type: Number, default: 0 }, // Number of ratings
    views: { type: Number, default: 0 }, // Track recipe views
  },
  { timestamps: true }
);

export const RecipeModel = mongoose.model("Recipe", RecipeSchema);

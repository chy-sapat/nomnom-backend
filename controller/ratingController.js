import { RecipeModel } from "../models/Recipe.js";

// Add or Update Rating
const addOrUpdateRating = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { userId, rating, comments } = req.body;
    // const userId = req.user.id; // Authenticated user ID

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const recipe = await RecipeModel.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if user already rated
    const existingRating = recipe.ratings.find(
      (r) => r.userId.toString() === userId
    );

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comments = comments;
    } else {
      // Add new rating
      recipe.ratings.push({ userId, rating, comments });
      recipe.totalRatings += 1;
    }

    // Calculate new average rating
    const totalRatingSum = recipe.ratings.reduce((sum, r) => sum + r.rating, 0);
    recipe.averageRating = totalRatingSum / (recipe.ratings.length || 1);

    await recipe.save();
    res
      .status(200)
      .json({ message: "Rating added/updated successfully", recipe });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

// Delete Rating
const deleteRating = async (req, res) => {
  try {
    const { recipeId, userId } = req.params;
    // const userId = req.user.id; // Authenticated user ID

    const recipe = await RecipeModel.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Find rating index
    const ratingIndex = recipe.ratings.findIndex(
      (r) => r.userId.toString() === userId
    );
    if (ratingIndex === -1) {
      return res.status(400).json({ message: "Rating not found" });
    }

    // Remove rating
    recipe.ratings.splice(ratingIndex, 1);
    recipe.totalRatings -= 1;

    // Recalculate average rating
    const totalRatingSum = recipe.ratings.reduce((sum, r) => sum + r.rating, 0);
    recipe.averageRating =
      recipe.totalRatings > 0 ? totalRatingSum / recipe.totalRatings : 0;

    await recipe.save();
    res.status(200).json({ message: "Rating deleted successfully", recipe });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

// Get All Ratings for a Recipe
const getRecipeRatings = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const recipe = await RecipeModel.findById(recipeId).populate(
      "ratings.userId",
      "fullname username"
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(recipe.ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a reply to a rating
const addReplyToRating = async (req, res) => {
  try {
    const { recipeId, ratingId } = req.params;
    const { reply } = req.body;
    const userId = req.user.id; // Authenticated user ID

    if (!reply || reply.trim() === "") {
      return res.status(400).json({ message: "Reply cannot be empty" });
    }

    const recipe = await RecipeModel.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const rating = recipe.ratings.id(ratingId);
    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Add reply to rating
    rating.replies.push({ userId, reply });

    await recipe.save();
    res.status(200).json({ message: "Reply added successfully", rating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit a reply
const editReplyOnRating = async (req, res) => {
  try {
    const { recipeId, ratingId, replyId } = req.params;
    const { reply } = req.body;
    const userId = req.user.id; // Authenticated user ID

    if (!reply || reply.trim() === "") {
      return res.status(400).json({ message: "Reply cannot be empty" });
    }

    const recipe = await RecipeModel.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const rating = recipe.ratings.id(ratingId);
    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    const replyIndex = rating.replies.findIndex(
      (r) => r._id.toString() === replyId && r.userId.toString() === userId
    );
    if (replyIndex === -1) {
      return res
        .status(403)
        .json({ message: "Unauthorized or reply not found" });
    }

    // Update the reply
    rating.replies[replyIndex].reply = reply;
    rating.replies[replyIndex].createdAt = new Date(); // Update timestamp

    await recipe.save();
    res.status(200).json({ message: "Reply updated successfully", rating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a reply from a rating
const deleteReplyFromRating = async (req, res) => {
  try {
    const { recipeId, ratingId, replyId } = req.params;
    const userId = req.user.id; // Authenticated user ID

    const recipe = await RecipeModel.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const rating = recipe.ratings.id(ratingId);
    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    const replyIndex = rating.replies.findIndex(
      (r) => r._id.toString() === replyId && r.userId.toString() === userId
    );
    if (replyIndex === -1) {
      return res
        .status(400)
        .json({ message: "Reply not found or unauthorized" });
    }

    rating.replies.splice(replyIndex, 1);

    await recipe.save();
    res.status(200).json({ message: "Reply deleted successfully", rating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all replies for a rating
const getRepliesForRating = async (req, res) => {
  try {
    const { recipeId, ratingId } = req.params;

    const recipe = await RecipeModel.findById(recipeId).populate(
      "ratings.replies.userId",
      "fullname username imageUrl"
    );
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const rating = recipe.ratings.id(ratingId);
    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    res.status(200).json(rating.replies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export {
  addOrUpdateRating,
  deleteRating,
  getRecipeRatings,
  addReplyToRating,
  editReplyOnRating,
  deleteReplyFromRating,
  getRepliesForRating,
};

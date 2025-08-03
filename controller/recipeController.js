import { PreferenceModel } from "../models/Preference.js";
import { RecipeModel } from "../models/Recipe.js";
import { UserModel } from "../models/User.js";
import { rankRecipes } from "../recommendations/preferenceFilter.js";
import {
  buildTFIDF,
  getSimilarRecipesByInput,
} from "../recommendations/recommendation.js";

// Create a new recipe
const createRecipe = async (req, res) => {
  try {
    const recipe = new RecipeModel(req.body);
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all recipes
const getRecipes = async (req, res) => {
  try {
    const { latest, clerkId } = req.query;

    let recipes;

    if (latest === "true") {
      recipes = await RecipeModel.find()
        .sort({ createdAt: -1 })
        .populate("author", "fullname username")
        .populate("ratings.userId", "fullname username imageUrl")
        .lean();
    } else {
      recipes = await RecipeModel.find()
        .populate("author", "fullname username")
        .lean();
    }

    if (clerkId) {
      const preference = await PreferenceModel.findOne({ clerkId });
      if (preference) {
        const prefData = {
          dietaryPreference: preference.dietaryPreference,
          allergies: preference.allergies,
        };
        recipes = rankRecipes(recipes, prefData);
      }
    }
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a recipe by ID
const getRecipeById = async (req, res) => {
  try {
    const recipe = await RecipeModel.findById(req.params.id).populate(
      "author",
      "fullname username"
    );
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    const allRecipes = await RecipeModel.find({ _id: { $ne: req.params.id } })
      .populate("author", "fullname")
      .select("title averageRating image ingredients labels")
      .lean();
    buildTFIDF(allRecipes);
    const similar = getSimilarRecipesByInput(
      recipe.ingredients,
      recipe.labels,
      2
    );
    res.status(200).json({ recipe, similar });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a recipe
const updateRecipe = async (req, res) => {
  try {
    const updatedRecipe = await RecipeModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a recipe
const deleteRecipe = async (req, res) => {
  try {
    const deletedRecipe = await RecipeModel.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSimilarByIngredientAndLabels = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await RecipeModel.findById(id);
    const recipes = await RecipeModel.find({ _id: { $ne: id } }).lean();
    buildTFIDF(recipes);
    const similar = getSimilarRecipesByInput(
      recipe.ingredients,
      recipe.labels,
      10
    );
    res.status(200).json({ similarRecipes: similar });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
};

const searchRecipe = async (req, res) => {
  const { q, ingredient, minIngredients, maxIngredients } = req.query;

  try {
    const query = {};

    if (q) {
      const regex = new RegExp(q, "i");
      query.$or = [{ title: regex }, { ingredients: regex }];
    }

    if (ingredient) {
      query.ingredients = query.ingredients || {};
      query.ingredients.$in = [new RegExp(ingredient, "i")];
    }

    if (minIngredients) {
      query["ingredients.0"] = { $exists: true };
      query.$expr = query.$expr || {};
      query.$expr.$gte = [{ $size: "$ingredients" }, parseInt(minIngredients)];
    }

    if (maxIngredients) {
      query.$expr = query.$expr || {};
      query.$expr.$lte = [{ $size: "$ingredients" }, parseInt(maxIngredients)];
    }

    const recipes = await RecipeModel.find(query).populate(
      "author",
      "fullname username"
    );
    res.status(200).json(recipes);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error during search." });
  }
};

const saveRecipe = async (req, res) => {
  const { userId, recipeId } = req.body;
  try {
    const user = await UserModel.findById(userId);
    const recipe = await RecipeModel.findById(recipeId);

    if (!user || !recipe) {
      return res.status(404).json({ error: "User or Recipe not found" });
    }
    const alreadySaved = user.savedRecipes.includes(recipeId);
    if (alreadySaved) {
      return res.status(400).json({ error: "Recipe already saved" });
    }

    user.savedRecipes.push(recipeId);
    await user.save();

    res.status(200).json({ message: "Recipe saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserRecipes = async (req, res) => {
  const { userId } = req.params;
  try {
    const recipes = await RecipeModel.find({ author: userId }).populate(
      "author",
      "fullname username"
    );
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ message: "No recipes found" });
    }
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserSavedRecipes = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.findById(userId);
    if (!user || !user.savedRecipes || user.savedRecipes.length === 0) {
      return res.status(404).json({ message: "No saved recipes found" });
    }
    const recipes = await RecipeModel.find({
      _id: { $in: user.savedRecipes },
    }).populate("author", "fullname username");
    res.status(200).json(recipes);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

const getRecommendations = async (req, res) => {
  const { clerkId } = req.query;
  console.log("Clerk ID:", clerkId);
  try {
    const preference = await PreferenceModel.findOne({ clerkId });
    if (!preference) {
      return res.status(404).json({ message: "Preferences not found" });
    }

    const recipes = await RecipeModel.find()
      .populate("author", "fullname username")
      .lean();
    const recommendedRecipes = rankRecipes(recipes, {
      dietaryPreference: preference.dietaryPreference.map((d) =>
        d.toLowerCase()
      ),
      allergies: preference.allergies.map((a) => a.toLowerCase()),
    });
    res.status(200).json(recommendedRecipes);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getSimilarByIngredientAndLabels,
  searchRecipe,
  saveRecipe,
  getUserRecipes,
  getUserSavedRecipes,
  getRecommendations,
};

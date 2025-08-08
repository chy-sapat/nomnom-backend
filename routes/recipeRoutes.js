import express from "express";
import {
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
  deleteSavedRecipe,
  getFeaturedRecipe,
  clearSearchHistory,
} from "../controller/recipeController.js";

const router = express.Router();

router.post("/", createRecipe);
router.get("/", getRecipes);
router.get("/featured", getFeaturedRecipe);
router.get("/search", searchRecipe);
router.get("/recommendations", getRecommendations);
router.get("/:id", getRecipeById);
router.patch("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);
router.get("/getSimilar/:id", getSimilarByIngredientAndLabels);
router.post("/save-recipe", saveRecipe);
router.post("/delete-saved-recipe", deleteSavedRecipe);
router.get("/getUserRecipes/:userId", getUserRecipes);
router.get("/getUserSavedRecipes/:userId", getUserSavedRecipes);

export { router as RecipeRouter };

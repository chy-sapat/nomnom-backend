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
} from "../controller/recipeController.js";

const router = express.Router();

router.post("/", createRecipe);
router.get("/", getRecipes);
router.get("/featured", getFeaturedRecipe);
router.get("/search", searchRecipe);
router.get("/:id", getRecipeById);
router.patch("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);
router.get("/getSimilar/:id", getSimilarByIngredientAndLabels);
router.post("/save-recipe", saveRecipe);
router.post("/delete-saved-recipe", deleteSavedRecipe);
router.get("/getUserRecipes/:userId", getUserRecipes);
router.get("/getUserSavedRecipes/:userId", getUserSavedRecipes);
router.get("/recommendations", getRecommendations);

export { router as RecipeRouter };

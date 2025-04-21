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
} from "../controller/recipeController.js";

const router = express.Router();

router.post("/", createRecipe);
router.get("/", getRecipes);
router.get("/search", searchRecipe);
router.get("/:id", getRecipeById);
router.patch("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);
router.get("/getSimilar/:id", getSimilarByIngredientAndLabels);
router.post("/save-recipe", saveRecipe);

export { router as RecipeRouter };

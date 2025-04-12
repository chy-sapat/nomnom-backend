import express from "express";
import {
  addOrUpdateRating,
  deleteRating,
  getRecipeRatings,
  addReplyToRating,
  deleteReplyFromRating,
  editReplyOnRating,
  getRepliesForRating
} from "../controller/ratingController.js";

const router = express.Router();

router.post("/:recipeId/rate", addOrUpdateRating);
router.delete("/:recipeId/rate", deleteRating);
router.get("/:recipeId/ratings", getRecipeRatings);
router.post("/:recipeId/rating/:ratingId/reply", addReplyToRating);
router.put("/:recipeId/rating/:ratingId/reply/:replyId", editReplyOnRating);
router.delete(
  "/:recipeId/rating/:ratingId/reply/:replyId",
  deleteReplyFromRating
);
router.get("/:recipeId/rating/:ratingId/replies", getRepliesForRating);

export { router as RatingRouter };

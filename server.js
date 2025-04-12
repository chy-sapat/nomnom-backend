import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import { UserRouter } from "./routes/userRoute.js";
import { RecipeRouter } from "./routes/recipeRoutes.js";
import { RatingRouter } from "./routes/ratingsRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_DB_URI);

app.use("/api/v1/user", UserRouter);
app.use("/api/v1/recipe", RecipeRouter);
app.use("/api/v1/ratings", RatingRouter);

app.listen(port, () => {
  console.log(`Server Started at port: ${port}`);
});

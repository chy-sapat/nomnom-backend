import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { clerkMiddleware } from "@clerk/express";
import "dotenv/config";
import { UserRouter } from "./routes/userRoute.js";
import { RecipeRouter } from "./routes/recipeRoutes.js";
import { RatingRouter } from "./routes/ratingsRoutes.js";
import { PreferenceRouter } from "./routes/preferenceRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use("/api/v1/user", UserRouter);
app.use("/api/v1/recipe", RecipeRouter);
app.use("/api/v1/ratings", RatingRouter);
app.use("/api/v1/preference", PreferenceRouter);
app.post("/api/test", (req, res) => {
  console.log("✅ /api/test HIT!");
  res.status(200).json({ message: "Test passed" });
});

app.listen(port, () => {
  console.log(`Server Started at port: ${port}`);
});

export default app;

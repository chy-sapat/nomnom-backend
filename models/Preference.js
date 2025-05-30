import { mongoose } from "mongoose";

const preferenceSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  dietaryPreference: [{ type: String }],
  allergies: [{ type: String }],
});

export const PreferenceModel = mongoose.model("Preference", preferenceSchema);

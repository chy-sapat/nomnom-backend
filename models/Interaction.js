import { Schema } from "mongoose";

const interactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const InteractionModel = mongoose.model(
  "Interaction",
  interactionSchema
);

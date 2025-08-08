import { Schema } from "mongoose";

const QuerySchema = new Schema(
  {
    query: { type: String },
    searchFrequency: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const searchHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  queryList: [{ type: QuerySchema }],
});

export const SearchHistoryModel = mongoose.model(
  "SearchHistory",
  searchHistorySchema
);

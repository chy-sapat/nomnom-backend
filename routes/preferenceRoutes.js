import express from "express";
import {
  createPreference,
  getPreference,
  updatePreference,
} from "../controller/preferenceController.js";

const router = express.Router();

router.post("/", createPreference);
router.get("/:userId", getPreference);
router.put("/:userId", updatePreference);

export { router as PreferenceRouter };

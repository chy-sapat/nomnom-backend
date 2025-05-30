import { PreferenceModel } from "../models/Preference.js";

const createPreference = async (req, res) => {
  try {
    const { clerkId, dietaryPreference, allergies } = req.body;
    const preference = new PreferenceModel({
      clerkId,
      dietaryPreference: dietaryPreference || [],
      allergies: allergies || [],
    });
    await preference.save();
    res.status(201).json(preference);
  } catch (error) {
    console.error("Error creating preference:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPreference = async (req, res) => {
  try {
    const userId = req.params.userId;
    const preference = await PreferenceModel.findOne({ clerkId: userId });
    if (!preference) {
      return res.status(404).json({ message: "Preference not found" });
    }
    res.status(200).json(preference);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const updatePreference = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { update } = req.body;
    const preference = await PreferenceModel.findOneAndUpdate(
      { clerkId: userId },
      update,
      { new: true, runValidators: true }
    );
    if (!preference) {
      return res.status(404).json({ message: "Preference not found" });
    }
    res.status(200).json(preference);
  } catch (error) {
    console.error("Error updating preference:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { createPreference, getPreference, updatePreference };

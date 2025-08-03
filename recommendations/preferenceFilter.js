const normalizeIngredient = (ingredientList = []) => {
  return ingredientList
    .map((ingredient) => {
      if (!ingredient) return null;
      const parts = ingredient.split(", ");
      return (parts[1] || parts[0]).trim().toLowerCase();
    })
    .filter(Boolean);
};

const scoreRecipe = (recipe, preferences) => {
  let score = 0;
  let isUnsafe = false;
  const matchedAllergens = [];

  const ingredientNames = normalizeIngredient(recipe.ingredients);

  // +2 for dietary tag match
  (preferences.dietaryPreference || []).forEach((pref) => {
    const labelsLower = (recipe.labels || []).map((l) => l.toLowerCase());
    if (labelsLower.includes(pref.toLowerCase())) {
      score += 2;
    }
  });

  // Flag allergens
  (preferences.allergies || []).forEach((allergen) => {
    // Create regex: match word with optional plural (e.g., "egg" or "eggs")
    const regex = new RegExp(`\\b${allergen.toLowerCase()}(es|s)?\\b`, "i");

    ingredientNames.forEach((ingredient) => {
      if (regex.test(ingredient)) {
        isUnsafe = true;
        if (!matchedAllergens.includes(allergen)) {
          matchedAllergens.push(allergen);
        }
      }
    });
  });

  return { ...recipe, score, isUnsafe, matchedAllergens };
};

const rankRecipes = (
  recipes = [],
  preferences = { dietaryPreference: [], allergies: [] }
) => {
  const scored = recipes.map((recipe) => scoreRecipe(recipe, preferences));

  // Return safe & unsafe separately
  return {
    safe: scored.filter((r) => !r.isUnsafe).sort((a, b) => b.score - a.score),
    unsafe: scored.filter((r) => r.isUnsafe),
  };
};

export { rankRecipes };

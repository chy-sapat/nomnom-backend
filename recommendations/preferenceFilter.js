const normalizeIngredient = (ingredientList) => {
  return ingredientList
    .map((ingredient) => {
      const part = ingredient.split(", ");
      return part[1]?.trim().toLowerCase();
    })
    .filter(Boolean); //This filters out any undefines or null values
};

const scoreRecipe = (recipe, preferences) => {
  let score = 0;
  let isUnsafe = false;
  const matchedAllergens = [];
  const ingredientNames = normalizeIngredient(recipe.ingredients || []);

  // +2 for each dietary tag match
  preferences.dietaryPreference.forEach((pref) => {
    if ((recipe.labels || []).includes(pref.toLowerCase())) {
      score += 2;
    }
  });

  // -3 for each allergen found in ingredients
  preferences.allergies.forEach((allergen) => {
    ingredientNames.forEach((ingredient) => {
      if (ingredient.includes(allergen.toLowerCase())) {
        isUnsafe = true;
        matchedAllergens.push(allergen);
      }
    });
  });

  return { ...recipe, score, isUnsafe, matchedAllergens };
};

const rankRecipes = (recipes, preferences) => {
  const cleanRecipes = recipes.map((recipe) =>
    scoreRecipe(recipe, preferences)
  );
  return cleanRecipes
    .filter((r) => !r.isUnsafe)
    .sort((a, b) => b.score - a.score);
};

export { rankRecipes };

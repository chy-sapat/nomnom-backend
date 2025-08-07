import natural from "natural";

const TfIdf = natural.TfIdf;

const tfidf = new TfIdf();
let allTerms = [];
let recipes = [];

function buildTFIDF(recipeList) {
  recipes = recipeList;
  tfidf.documents = [];
  recipeList.forEach((recipe) => {
    const text = combineRecipeText(recipe);
    tfidf.addDocument(text);
  });
  allTerms = Array.from(
    new Set(tfidf.documents.flatMap((doc) => Object.keys(doc)))
  );
}

function combineRecipeText(recipe) {
  const titleText = (recipe.title || "").toLowerCase().trim();
  const ingredientsText = (recipe.ingredients || [])
    .map((str) => str.toLowerCase().trim())
    .join(" ");
  const labelsText = (recipe.labels || [])
    .map((str) => str.toLowerCase().trim())
    .join(" ");
  const weightedTitle = titleText
    .split(" ")
    .map((t) => `${t} ${t} ${t}`)
    .join(" ");
  const weightedIngredients = ingredientsText
    .split(" ")
    .map((t) => `${t} ${t}`)
    .join(" ");
  const weightedLabels = labelsText;

  return `${weightedTitle} ${weightedIngredients} ${weightedLabels}`;
}

function getRecipeVector(docIndex) {
  const terms = tfidf.listTerms(docIndex);
  return allTerms.map((term) => {
    const match = terms.find((t) => t.term === term);
    return match ? match.tfidf : 0;
  });
}

function getInputVector(title, ingredients, labels) {
  const titleText = (title || "").toLowerCase().trim();
  const ingredientsText = (ingredients || [])
    .map((str) => str.toLowerCase().trim())
    .join(" ");
  const labelsText = (labels || [])
    .map((str) => str.toLowerCase().trim())
    .join(" ");

  const weightedTitle = titleText
    .split(" ")
    .map((t) => `${t} ${t} ${t}`)
    .join(" ");
  const weightedIngredients = ingredientsText
    .split(" ")
    .map((t) => `${t} ${t}`)
    .join(" ");
  const weightedLabels = labelsText;

  const text = `${weightedTitle} ${weightedIngredients} ${weightedLabels}`;

  tfidf.addDocument(text);
  const inputIndex = tfidf.documents.length - 1;

  const vector = allTerms.map((term) => tfidf.tfidf(term, inputIndex));

  tfidf.documents.pop();

  return vector;
}

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB || 1);
}

function getSimilarRecipesByInput(title, ingredients, labels, topN = 5) {
  const inputVector = getInputVector(title, ingredients, labels);

  const scores = recipes.map((recipe, i) => {
    const vector = getRecipeVector(i);
    const score = cosineSimilarity(inputVector, vector);
    return { recipe, score };
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ recipe, score }) => ({
      ...recipe,
      similarity: score.toFixed(3),
    }));
}

export { buildTFIDF, getSimilarRecipesByInput };

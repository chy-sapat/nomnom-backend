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
  return [...recipe.ingredients, ...recipe.labels]
    .map((str) => str.toLowerCase().trim())
    .join(" ");
}

function getRecipeVector(docIndex) {
  const terms = tfidf.listTerms(docIndex);
  return allTerms.map((term) => {
    const match = terms.find((t) => t.term === term);
    return match ? match.tfidf : 0;
  });
}

function getInputVector(ingredients, labels) {
  const text = [...ingredients, ...labels]
    .map((str) => str.toLowerCase().trim())
    .join(" ");

  // Add the input as a temporary document
  tfidf.addDocument(text);
  const inputIndex = tfidf.documents.length - 1;

  const vector = allTerms.map((term) => {
    return tfidf.tfidf(term, inputIndex);
  });

  // Remove the temporary document
  tfidf.documents.pop();

  return vector;
}

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB || 1);
}

function getSimilarRecipesByIndex(targetIndex, topN = 5) {
  const targetVector = getRecipeVector(targetIndex);
  const scores = recipes.map((_, i) => {
    if (i === targetIndex) return -1;
    const vector = getRecipeVector(i);
    return cosineSimilarity(targetVector, vector);
  });

  return scores
    .map((score, i) => ({ score, index: i }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ index }) => recipes[index]);
}

function getSimilarRecipesByInput(ingredients, labels, topN = 5) {
  const inputVector = getInputVector(ingredients, labels);

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
      similarity: score.toFixed(3), // rounded to 3 decimals (optional)
    }));
}

export { buildTFIDF, getSimilarRecipesByIndex, getSimilarRecipesByInput };

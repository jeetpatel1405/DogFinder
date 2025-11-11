// Trait extraction using pattern matching and simple NLP
export interface ExtractedTraits {
  sizes: string[];
  temperaments: string[];
  maxWeight: number | null;
  keywordMatches: string[];
}

const TRAIT_KEYWORDS = {
  sizes: {
    small: ['small', 'tiny', 'toy', 'compact', 'miniature'],
    medium: ['medium', 'moderate', 'average'],
    large: ['large', 'big', 'giant', 'huge'],
  },
  temperaments: {
    friendly: ['friendly', 'kind', 'gentle', 'loving', 'affectionate', 'good with kids'],
    energetic: ['energetic', 'active', 'athletic', 'playful', 'high energy', 'hyper'],
    calm: ['calm', 'laid-back', 'relaxed', 'lazy', 'quiet', 'docile'],
    intelligent: ['intelligent', 'smart', 'quick', 'trainable', 'clever'],
    protective: ['protective', 'guard', 'watch', 'loyal', 'defensive'],
    independent: ['independent', 'stubborn', 'strong-willed', 'determined'],
  },
};

export function extractTraits(query: string): ExtractedTraits {
  const lowerQuery = query.toLowerCase();
  const traits: ExtractedTraits = {
    sizes: [],
    temperaments: [],
    maxWeight: null,
    keywordMatches: [],
  };

  // Extract size
  Object.entries(TRAIT_KEYWORDS.sizes).forEach(([size, keywords]) => {
    if (keywords.some((kw) => lowerQuery.includes(kw))) {
      traits.sizes.push(size);
    }
  });

  // Extract temperament traits
  Object.entries(TRAIT_KEYWORDS.temperaments).forEach(([trait, keywords]) => {
    if (keywords.some((kw) => lowerQuery.includes(kw))) {
      traits.temperaments.push(trait);
    }
  });

  // Extract weight constraint (e.g., "under 50 pounds", "less than 30 lbs")
  const weightMatch = lowerQuery.match(/(?:under|less than|below|max|maximum|<)\s*(\d+)\s*(?:pound|lb|lbs|kg)/);
  if (weightMatch) {
    traits.maxWeight = parseInt(weightMatch[1], 10);
  }

  // Extract all words that could be breed-related traits
  const words = lowerQuery.split(/\s+/);
  traits.keywordMatches = words.filter(
    (word) =>
      word.length > 3 &&
      !['good', 'with', 'dogs', 'kids', 'cats', 'families', 'small', 'large', 'looking', 'need'].includes(word)
  );

  return traits;
}

export function scoreBreedMatch(breed: any, traits: ExtractedTraits): number {
  let score = 0;
  const breedData = breed.temperament?.toLowerCase() || '';
  const breedName = breed.name?.toLowerCase() || '';

  // Score temperament matches
  traits.temperaments.forEach((trait) => {
    if (breedData.includes(trait)) {
      score += 10;
    }
  });

  // Score size matches
  traits.sizes.forEach((size) => {
    if (breedData.includes(size) || breedName.includes(size)) {
      score += 8;
    }
  });

  // Score weight constraint
  if (traits.maxWeight && breed.weight?.imperial) {
    const breedWeightStr = breed.weight.imperial;
    const weights = breedWeightStr.split('-').map((w: string) => parseInt(w.trim(), 10));
    const maxBreedWeight = Math.max(...weights.filter((w: number) => !isNaN(w)));
    if (maxBreedWeight <= traits.maxWeight) {
      score += 15;
    }
  }

  // Bonus for direct keyword matches in breed name or temperament
  traits.keywordMatches.forEach((keyword) => {
    if (breedName.includes(keyword)) {
      score += 5;
    }
    if (breedData.includes(keyword)) {
      score += 3;
    }
  });

  return score;
}

export function rankBreeds(breeds: any[], traits: ExtractedTraits): any[] {
  const scored = breeds
    .map((breed) => ({
      ...breed,
      matchScore: scoreBreedMatch(breed, traits),
    }))
    .filter((breed) => breed.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  return scored;
}

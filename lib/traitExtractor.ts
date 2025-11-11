// Trait extraction using pattern matching and simple NLP
export interface ExtractedTraits {
  sizes: string[];
  temperaments: string[];
  maxWeight: number | null; // Upper bound weight in lbs (imperial)
  minWeight: number | null; // Lower bound weight in lbs (imperial)
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
    minWeight: null,
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
  const maxWeightMatch = lowerQuery.match(/(?:(?:under|less than|below|at most|maximum|max)|<=|<)\s*(\d+)\s*(pound|lb|lbs|kg)/);
  const minWeightMatch = lowerQuery.match(/(?:(?:above|more than|over|at least|minimum|min)|>=|>)\s*(\d+)\s*(pound|lb|lbs|kg)/);

  const toLbs = (value: number, unit: string) => {
    if (unit === 'kg') {
      return Math.round(value * 2.20462); // convert kg to lbs (rounded)
    }
    return value;
  };

  if (maxWeightMatch) {
    const numeric = parseInt(maxWeightMatch[1], 10);
    const unit = maxWeightMatch[2];
    traits.maxWeight = toLbs(numeric, unit);
  }
  if (minWeightMatch) {
    const numeric = parseInt(minWeightMatch[1], 10);
    const unit = minWeightMatch[2];
    traits.minWeight = toLbs(numeric, unit);
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

  // Score weight constraints (imperial range "min - max")
  if ((traits.maxWeight || traits.minWeight) && breed.weight?.imperial) {
    const breedWeightStr = breed.weight.imperial;
    const weights = breedWeightStr
      .split('-')
      .map((w: string) => parseInt(w.trim(), 10))
      .filter((w: number) => !isNaN(w));
    if (weights.length) {
      const breedMin = Math.min(...weights);
      const breedMax = Math.max(...weights);
      if (traits.maxWeight && breedMax <= traits.maxWeight) {
        score += 15; // fits upper bound
      }
      if (traits.minWeight && breedMin >= traits.minWeight) {
        score += 15; // fits lower bound
      }
      // Bonus if both bounds specified and breed range fully inside
      if (traits.maxWeight && traits.minWeight && breedMin >= traits.minWeight && breedMax <= traits.maxWeight) {
        score += 5;
      }
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

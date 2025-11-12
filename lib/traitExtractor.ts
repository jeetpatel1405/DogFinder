// Trait extraction using pattern matching and simple NLP
export interface ExtractedTraits {
  sizes: string[];
  temperaments: string[];
  maxWeight: number | null; // Upper bound weight in lbs (imperial)
  minWeight: number | null; // Lower bound weight in lbs (imperial)
  minLifespan: number | null; // Lower bound lifespan in years
  maxLifespan: number | null; // Upper bound lifespan in years
  minHeight: number | null; // Lower bound height in inches
  maxHeight: number | null; // Upper bound height in inches
  keywordMatches: string[];
}

const TRAIT_KEYWORDS = {
  sizes: {
    small: ['small', 'tiny', 'toy', 'compact', 'miniature'],
    medium: ['medium', 'moderate', 'average'],
    large: ['large', 'big', 'giant', 'huge'],
  },
  temperaments: {
    friendly: ['friendly'],
    energetic: ['energetic'],
    loyal: ['loyal'],
    playful: ['playful'],
    protective: ['protective'],
    calm: ['calm'],
    intelligent: ['intelligent'],
    gentle: ['gentle'],
    alert: ['alert'],
    affectionate: ['affectionate'],
    independent: ['independent'],
    outgoing: ['outgoing'],
    brave: ['brave'],
    adaptable: ['adaptable'],
    social: ['social'],
    curious: ['curious'],
    devoted: ['devoted'],
    patient: ['patient'],
    confident: ['confident'],
    sensitive: ['sensitive'],
    active: ['active'],
    stubborn: ['stubborn'],
    obedient: ['obedient'],
    docile: ['docile'],
    bold: ['bold'],
  },
};

export function extractTraits(query: string): ExtractedTraits {
  const lowerQuery = query.toLowerCase();
  const traits: ExtractedTraits = {
    sizes: [],
    temperaments: [],
    maxWeight: null,
    minWeight: null,
    minLifespan: null,
    maxLifespan: null,
    minHeight: null,
    maxHeight: null,
    keywordMatches: [],
  };

  // Extract size
  Object.entries(TRAIT_KEYWORDS.sizes).forEach(([size, keywords]) => {
    if (keywords.some((kw) => lowerQuery.includes(kw))) {
      traits.sizes.push(size);
    }
  });

  // Extract temperament traits - each temperament keyword must be checked
  Object.entries(TRAIT_KEYWORDS.temperaments).forEach(([trait, keywords]) => {
    if (keywords.some((kw) => lowerQuery.includes(kw))) {
      traits.temperaments.push(trait);
    }
  });

  // Extract lifespan bounds - format: "lifespan 10-12"
  const lifespanMatch = lowerQuery.match(/lifespan\s+(\d+)\s*-\s*(\d+)/i);
  if (lifespanMatch) {
    traits.minLifespan = parseInt(lifespanMatch[1], 10);
    traits.maxLifespan = parseInt(lifespanMatch[2], 10);
  }

  // Extract height bounds - format: "height 10-15 inches"
  const heightMatch = lowerQuery.match(/height\s+(\d+)\s*-\s*(\d+)\s*(?:inches?|in)?/i);
  if (heightMatch) {
    traits.minHeight = parseInt(heightMatch[1], 10);
    traits.maxHeight = parseInt(heightMatch[2], 10);
  }

  // Extract weight bounds - handle multiple occurrences and take most restrictive
  // Find ALL "at least X lbs" and "at most Y lbs" patterns
  const atLeastRegex = /at least\s+(\d+)\s*(?:lbs?|pounds?)/gi;
  const atMostRegex = /at most\s+(\d+)\s*(?:lbs?|pounds?)/gi;
  
  let atLeastMatches = [...lowerQuery.matchAll(atLeastRegex)];
  let atMostMatches = [...lowerQuery.matchAll(atMostRegex)];
  
  // Take the highest minWeight (most restrictive lower bound)
  if (atLeastMatches.length > 0) {
    const allMinWeights = atLeastMatches.map(m => parseInt(m[1], 10));
    traits.minWeight = Math.max(...allMinWeights);
  }
  
  // Take the lowest maxWeight (most restrictive upper bound)
  if (atMostMatches.length > 0) {
    const allMaxWeights = atMostMatches.map(m => parseInt(m[1], 10));
    traits.maxWeight = Math.min(...allMaxWeights);
  }
  
  // Fallback patterns for weight (only if not already set)
  if (traits.minWeight === null) {
    const overMatch = lowerQuery.match(/(?:over|above|more than)\s+(\d+)\s*(?:lbs?|pounds?)/i);
    if (overMatch) {
      traits.minWeight = parseInt(overMatch[1], 10);
    }
  }
  
  if (traits.maxWeight === null) {
    const underMatch = lowerQuery.match(/(?:under|below|less than)\s+(\d+)\s*(?:lbs?|pounds?)/i);
    if (underMatch) {
      traits.maxWeight = parseInt(underMatch[1], 10);
    }
  }
  
  // Validate weight constraints - if minWeight > maxWeight, it's impossible
  if (traits.minWeight !== null && traits.maxWeight !== null && traits.minWeight > traits.maxWeight) {
    console.warn(`Invalid weight constraints: minWeight (${traits.minWeight}) > maxWeight (${traits.maxWeight}). Clearing constraints.`);
    traits.minWeight = null;
    traits.maxWeight = null;
  }

  // Extract all words that could be breed-related traits
  const words = lowerQuery.split(/\s+/);
  traits.keywordMatches = words.filter(
    (word) =>
      word.length > 3 &&
      !['good', 'with', 'dogs', 'kids', 'cats', 'families', 'small', 'large', 'looking', 'need', 'least', 'most', 'weight', 'nature', 'lifespan'].includes(word)
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
  if ((traits.maxWeight !== null || traits.minWeight !== null) && breed.weight?.imperial) {
    const breedWeightStr = breed.weight.imperial;
    const weights = breedWeightStr
      .split('-')
      .map((w: string) => parseInt(w.trim(), 10))
      .filter((w: number) => !isNaN(w));
    if (weights.length) {
      const breedMin = Math.min(...weights);
      const breedMax = Math.max(...weights);
      if (traits.maxWeight !== null && breedMax <= traits.maxWeight) {
        score += 15; // fits upper bound
      }
      if (traits.minWeight !== null && breedMin >= traits.minWeight) {
        score += 15; // fits lower bound
      }
      // Bonus if both bounds specified and breed range fully inside
      if (traits.maxWeight !== null && traits.minWeight !== null && breedMin >= traits.minWeight && breedMax <= traits.maxWeight) {
        score += 5;
      }
    }
  }
  
  // Score lifespan constraints
  if ((traits.minLifespan !== null || traits.maxLifespan !== null) && breed.life_span) {
    const lifespans = breed.life_span
      .match(/\d+/g)
      ?.map((l: string) => parseInt(l, 10)) || [];
    if (lifespans.length) {
      const breedMinLife = Math.min(...lifespans);
      const breedMaxLife = Math.max(...lifespans);
      if (traits.maxLifespan !== null && breedMaxLife <= traits.maxLifespan) {
        score += 10;
      }
      if (traits.minLifespan !== null && breedMinLife >= traits.minLifespan) {
        score += 10;
      }
      if (traits.maxLifespan !== null && traits.minLifespan !== null && breedMinLife >= traits.minLifespan && breedMaxLife <= traits.maxLifespan) {
        score += 5;
      }
    }
  }
  
  // Score height constraints
  if ((traits.minHeight !== null || traits.maxHeight !== null) && breed.height?.imperial) {
    const breedHeightStr = breed.height.imperial;
    const heights = breedHeightStr
      .split('-')
      .map((h: string) => parseInt(h.trim(), 10))
      .filter((h: number) => !isNaN(h));
    if (heights.length) {
      const breedMinHeight = Math.min(...heights);
      const breedMaxHeight = Math.max(...heights);
      if (traits.maxHeight !== null && breedMaxHeight <= traits.maxHeight) {
        score += 10;
      }
      if (traits.minHeight !== null && breedMinHeight >= traits.minHeight) {
        score += 10;
      }
      if (traits.maxHeight !== null && traits.minHeight !== null && breedMinHeight >= traits.minHeight && breedMaxHeight <= traits.maxHeight) {
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

// Strict filter: check if breed meets ALL filter requirements (AND operation)
function meetsStrictFilters(breed: any, traits: ExtractedTraits): boolean {
  // 1. Check weight constraints strictly (AND condition)
  if (traits.minWeight !== null || traits.maxWeight !== null) {
    if (!breed.weight?.imperial) return false;
    
    const breedWeightStr = breed.weight.imperial;
    const weights = breedWeightStr
      .split('-')
      .map((w: string) => parseInt(w.trim(), 10))
      .filter((w: number) => !isNaN(w));
    
    if (weights.length === 0) return false;
    
    const breedMin = Math.min(...weights);
    const breedMax = Math.max(...weights);
    
    // Both min and max must be within bounds
    if (traits.minWeight !== null && breedMin < traits.minWeight) return false;
    if (traits.maxWeight !== null && breedMax > traits.maxWeight) return false;
  }
  
  // 2. Check lifespan constraints strictly (AND condition)
  if (traits.minLifespan !== null || traits.maxLifespan !== null) {
    if (!breed.life_span) return false;
    
    const lifespans = breed.life_span
      .match(/\d+/g)
      ?.map((l: string) => parseInt(l, 10)) || [];
    
    if (lifespans.length === 0) return false;
    
    const breedMinLife = Math.min(...lifespans);
    const breedMaxLife = Math.max(...lifespans);
    
    // Both min and max must be within bounds
    if (traits.minLifespan !== null && breedMinLife < traits.minLifespan) return false;
    if (traits.maxLifespan !== null && breedMaxLife > traits.maxLifespan) return false;
  }
  
  // 3. Check height constraints strictly (AND condition)
  if (traits.minHeight !== null || traits.maxHeight !== null) {
    if (!breed.height?.imperial) return false;
    
    const breedHeightStr = breed.height.imperial;
    const heights = breedHeightStr
      .split('-')
      .map((h: string) => parseInt(h.trim(), 10))
      .filter((h: number) => !isNaN(h));
    
    if (heights.length === 0) return false;
    
    const breedMinHeight = Math.min(...heights);
    const breedMaxHeight = Math.max(...heights);
    
    // Both min and max must be within bounds
    if (traits.minHeight !== null && breedMinHeight < traits.minHeight) return false;
    if (traits.maxHeight !== null && breedMaxHeight > traits.maxHeight) return false;
  }
  
  // 4. Check temperament/nature - breed must have ALL selected temperaments (AND condition)
  if (traits.temperaments.length > 0) {
    const breedTemperament = breed.temperament?.toLowerCase() || '';
    
    // Every selected temperament must be present
    const hasAllTemperaments = traits.temperaments.every((trait) => {
      const traitLower = trait.toLowerCase();
      return breedTemperament.includes(traitLower);
    });
    
    if (!hasAllTemperaments) return false;
  }
  
  // 5. Check size constraints (if specified)
  if (traits.sizes.length > 0) {
    // For size, breed should match at least one of the specified sizes
    // since sizes are usually mutually exclusive
    const breedData = breed.temperament?.toLowerCase() || '';
    const breedName = breed.name?.toLowerCase() || '';
    const breedGroup = breed.breed_group?.toLowerCase() || '';
    
    const matchesAnySize = traits.sizes.some((size) => 
      breedData.includes(size) || 
      breedName.includes(size) ||
      breedGroup.includes(size)
    );
    
    if (!matchesAnySize) return false;
  }
  
  return true;
}

export function rankBreeds(breeds: any[], traits: ExtractedTraits): any[] {
  // Apply strict filters first (AND operation on all criteria)
  const filtered = breeds.filter((breed) => meetsStrictFilters(breed, traits));
  
  // Then score and sort the filtered results
  const scored = filtered
    .map((breed) => ({
      ...breed,
      matchScore: scoreBreedMatch(breed, traits),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  return scored;
}

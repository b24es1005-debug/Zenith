export type BortleClass = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export function clampScore(score: number) {
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function getBortleClassFromScore(score: number): BortleClass {
  if (score <= 10) return 1;
  if (score <= 20) return 2;
  if (score <= 30) return 3;
  if (score <= 42) return 4;
  if (score <= 55) return 5;
  if (score <= 67) return 6;
  if (score <= 78) return 7;
  if (score <= 90) return 8;
  return 9;
}

export function getLightPollutionLevelLabel(bortleClass: BortleClass) {
  switch (bortleClass) {
    case 1:
      return "Excellent Dark Sky";
    case 2:
      return "Excellent";
    case 3:
      return "Very Good";
    case 4:
      return "Good";
    case 5:
      return "Moderate";
    case 6:
      return "Bright";
    case 7:
      return "Poor";
    case 8:
      return "Very Poor";
    case 9:
      return "City Sky";
  }
}

export function getSkyQualityRating(bortleClass: BortleClass) {
  switch (bortleClass) {
    case 1:
    case 2:
      return "Excellent";
    case 3:
      return "Very Good";
    case 4:
      return "Good";
    case 5:
      return "Moderate";
    case 6:
      return "Low";
    case 7:
      return "Poor";
    case 8:
      return "Very Poor";
    case 9:
      return "City Sky";
  }
}

export function getStargazingRecommendation(bortleClass: BortleClass) {
  switch (bortleClass) {
    case 1:
    case 2:
      return "Ideal for Milky Way structure, faint nebulae, and deep-sky imaging.";
    case 3:
      return "Excellent for most deep-sky objects and wide-field astrophotography.";
    case 4:
      return "Very usable for galaxies, clusters, and bright nebulae.";
    case 5:
      return "Moderate conditions. Best for brighter targets and moonless nights.";
    case 6:
      return "Limited for faint targets. Focus on the Moon, planets, and bright clusters.";
    case 7:
      return "Poor. Stargazing is possible, but contrast will be noticeably reduced.";
    case 8:
      return "Very Poor. Only the brightest targets are practical.";
    case 9:
      return "City sky. Planets and the Moon are the best targets here.";
  }
}

export function getBortleDescription(bortleClass: BortleClass) {
  return `${getLightPollutionLevelLabel(bortleClass)} sky`; 
}
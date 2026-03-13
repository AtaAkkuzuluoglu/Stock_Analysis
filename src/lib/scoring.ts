import type { ScoringResult, Recommendation, KeyRatios, DCFResult } from "./types";

interface ScoringInput {
  dcf: DCFResult;
  ratios: KeyRatios;
}

export function calculateScore(input: ScoringInput): ScoringResult {
  const { dcf, ratios } = input;

  // 1. DCF margin of safety score (40% weight)
  const dcfScore = scoreMarginOfSafety(dcf.marginOfSafety);

  // 2. Financial health score (30% weight)
  const healthScore = scoreFinancialHealth(ratios);

  // 3. Profitability score (20% weight)
  const profitabilityScore = scoreProfitability(ratios);

  // 4. Valuation score (10% weight)
  const valuationScore = scoreValuation(ratios);

  // Weighted overall score (-100 to +100)
  const overallScore =
    dcfScore * 0.4 +
    healthScore * 0.3 +
    profitabilityScore * 0.2 +
    valuationScore * 0.1;

  // Map to recommendation
  const recommendation = scoreToRecommendation(overallScore);

  // Build details
  const details: string[] = [];

  if (dcf.error) {
    details.push(`DCF: ${dcf.error}`);
  } else {
    details.push(
      `DCF fair value $${dcf.intrinsicValue.toFixed(2)} vs current $${dcf.currentPrice.toFixed(2)} (${dcf.marginOfSafety > 0 ? "+" : ""}${dcf.marginOfSafety.toFixed(1)}% margin of safety)`
    );
  }

  if (ratios.debtToEquity !== null) {
    const debtStatus = ratios.debtToEquity > 200 ? "high" : ratios.debtToEquity > 100 ? "moderate" : "low";
    details.push(`Debt/Equity: ${ratios.debtToEquity.toFixed(1)}% (${debtStatus})`);
  }

  if (ratios.returnOnEquity !== null) {
    const roeStatus = ratios.returnOnEquity > 0.2 ? "strong" : ratios.returnOnEquity > 0.1 ? "adequate" : "weak";
    details.push(`ROE: ${(ratios.returnOnEquity * 100).toFixed(1)}% (${roeStatus})`);
  }

  if (ratios.profitMargin !== null) {
    details.push(`Profit margin: ${(ratios.profitMargin * 100).toFixed(1)}%`);
  }

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    recommendation,
    dcfScore: Math.round(dcfScore * 10) / 10,
    healthScore: Math.round(healthScore * 10) / 10,
    profitabilityScore: Math.round(profitabilityScore * 10) / 10,
    valuationScore: Math.round(valuationScore * 10) / 10,
    details,
  };
}

function scoreMarginOfSafety(marginOfSafety: number): number {
  // Returns score from -100 to +100
  // Positive margin of safety = undervalued (good)
  // Negative = overvalued (bad)
  if (marginOfSafety > 50) return 100;
  if (marginOfSafety > 20) return 60 + (marginOfSafety - 20) * (40 / 30);
  if (marginOfSafety > 5) return 20 + (marginOfSafety - 5) * (40 / 15);
  if (marginOfSafety > -5) return marginOfSafety * 4;
  if (marginOfSafety > -20) return -20 + (marginOfSafety + 5) * (40 / 15);
  if (marginOfSafety > -50) return -60 + (marginOfSafety + 20) * (40 / 30);
  return -100;
}

function scoreFinancialHealth(ratios: KeyRatios): number {
  let score = 0;
  let factors = 0;

  // Debt to equity (lower is better)
  if (ratios.debtToEquity !== null) {
    factors++;
    if (ratios.debtToEquity < 30) score += 100;
    else if (ratios.debtToEquity < 80) score += 60;
    else if (ratios.debtToEquity < 150) score += 20;
    else if (ratios.debtToEquity < 300) score -= 30;
    else score -= 80;
  }

  // Current ratio (higher is better, 1.5-3 is ideal)
  if (ratios.currentRatio !== null) {
    factors++;
    if (ratios.currentRatio >= 1.5 && ratios.currentRatio <= 3) score += 100;
    else if (ratios.currentRatio >= 1 && ratios.currentRatio < 1.5) score += 50;
    else if (ratios.currentRatio > 3) score += 60;
    else if (ratios.currentRatio >= 0.5) score -= 20;
    else score -= 80;
  }

  // Interest coverage
  if (ratios.interestCoverage !== null) {
    factors++;
    if (ratios.interestCoverage > 10) score += 100;
    else if (ratios.interestCoverage > 5) score += 70;
    else if (ratios.interestCoverage > 2) score += 30;
    else if (ratios.interestCoverage > 1) score -= 20;
    else score -= 80;
  }

  return factors > 0 ? score / factors : 0;
}

function scoreProfitability(ratios: KeyRatios): number {
  let score = 0;
  let factors = 0;

  // ROE
  if (ratios.returnOnEquity !== null) {
    factors++;
    if (ratios.returnOnEquity > 0.25) score += 100;
    else if (ratios.returnOnEquity > 0.15) score += 70;
    else if (ratios.returnOnEquity > 0.05) score += 30;
    else if (ratios.returnOnEquity > 0) score += 0;
    else score -= 60;
  }

  // Profit margin
  if (ratios.profitMargin !== null) {
    factors++;
    if (ratios.profitMargin > 0.2) score += 100;
    else if (ratios.profitMargin > 0.1) score += 60;
    else if (ratios.profitMargin > 0.05) score += 30;
    else if (ratios.profitMargin > 0) score += 0;
    else score -= 50;
  }

  // Revenue growth
  if (ratios.revenueGrowth !== null) {
    factors++;
    if (ratios.revenueGrowth > 0.2) score += 100;
    else if (ratios.revenueGrowth > 0.1) score += 70;
    else if (ratios.revenueGrowth > 0.05) score += 40;
    else if (ratios.revenueGrowth > 0) score += 10;
    else score -= 40;
  }

  return factors > 0 ? score / factors : 0;
}

function scoreValuation(ratios: KeyRatios): number {
  let score = 0;
  let factors = 0;

  // P/E ratio (lower is better for value)
  if (ratios.trailingPE !== null && ratios.trailingPE > 0) {
    factors++;
    if (ratios.trailingPE < 12) score += 100;
    else if (ratios.trailingPE < 18) score += 70;
    else if (ratios.trailingPE < 25) score += 30;
    else if (ratios.trailingPE < 40) score -= 10;
    else score -= 50;
  }

  // P/B ratio
  if (ratios.priceToBook !== null && ratios.priceToBook > 0) {
    factors++;
    if (ratios.priceToBook < 1.5) score += 100;
    else if (ratios.priceToBook < 3) score += 60;
    else if (ratios.priceToBook < 6) score += 20;
    else score -= 30;
  }

  // PEG ratio
  if (ratios.pegRatio !== null && ratios.pegRatio > 0) {
    factors++;
    if (ratios.pegRatio < 1) score += 100;
    else if (ratios.pegRatio < 1.5) score += 60;
    else if (ratios.pegRatio < 2) score += 20;
    else score -= 20;
  }

  return factors > 0 ? score / factors : 0;
}

function scoreToRecommendation(score: number): Recommendation {
  if (score > 20) return "STRONG_BUY";
  if (score > 5) return "BUY";
  if (score >= -5) return "HOLD";
  if (score >= -20) return "SELL";
  return "STRONG_SELL";
}

export function getRecommendationColor(rec: Recommendation): string {
  switch (rec) {
    case "STRONG_BUY":
      return "bg-green-600 text-white";
    case "BUY":
      return "bg-green-400 text-gray-900";
    case "HOLD":
      return "bg-yellow-400 text-gray-900";
    case "SELL":
      return "bg-red-400 text-white";
    case "STRONG_SELL":
      return "bg-red-600 text-white";
  }
}

export function getRecommendationLabel(rec: Recommendation): string {
  switch (rec) {
    case "STRONG_BUY":
      return "Strong Buy";
    case "BUY":
      return "Buy";
    case "HOLD":
      return "Hold";
    case "SELL":
      return "Sell";
    case "STRONG_SELL":
      return "Strong Sell";
  }
}

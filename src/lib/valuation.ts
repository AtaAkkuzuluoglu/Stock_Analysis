import type { DCFResult } from "./types";

interface DCFInput {
  freeCashFlow: number;
  sharesOutstanding: number;
  currentPrice: number;
  historicalFCF: number[];
  revenueGrowth: number | null;
  discountRate?: number;
  terminalGrowthRate?: number;
  projectionYears?: number;
}

export function calculateDCF(input: DCFInput): DCFResult {
  const {
    freeCashFlow,
    sharesOutstanding,
    currentPrice,
    historicalFCF,
    revenueGrowth,
    discountRate = 0.1,
    terminalGrowthRate = 0.03,
    projectionYears = 5,
  } = input;

  // Edge case: negative or zero FCF
  if (freeCashFlow <= 0 || sharesOutstanding <= 0) {
    return {
      intrinsicValue: 0,
      currentPrice,
      marginOfSafety: -100,
      projectedFCF: [],
      terminalValue: 0,
      presentValue: 0,
      discountRate,
      terminalGrowthRate,
      growthRate: 0,
      sharesOutstanding,
      error: "Cannot calculate DCF: negative or zero free cash flow",
    };
  }

  // Estimate growth rate from historical FCF CAGR
  let growthRate = 0;
  if (historicalFCF.length >= 2) {
    const validFCF = historicalFCF.filter((f) => f > 0);
    if (validFCF.length >= 2) {
      const firstFCF = validFCF[0];
      const lastFCF = validFCF[validFCF.length - 1];
      const years = validFCF.length - 1;
      growthRate = Math.pow(lastFCF / firstFCF, 1 / years) - 1;
    }
  }

  // Fallback to revenue growth if FCF growth is unreasonable
  if (growthRate <= 0 && revenueGrowth && revenueGrowth > 0) {
    growthRate = revenueGrowth;
  }

  // Cap growth rate at reasonable levels
  growthRate = Math.min(Math.max(growthRate, -0.05), 0.3);

  // Project FCF forward
  const projectedFCF: number[] = [];
  let currentFCF = freeCashFlow;
  for (let i = 0; i < projectionYears; i++) {
    currentFCF = currentFCF * (1 + growthRate);
    projectedFCF.push(currentFCF);
  }

  // Calculate terminal value
  const terminalFCF = projectedFCF[projectedFCF.length - 1];
  const terminalValue =
    (terminalFCF * (1 + terminalGrowthRate)) /
    (discountRate - terminalGrowthRate);

  // Discount projected FCFs and terminal value to present
  let presentValue = 0;
  for (let i = 0; i < projectedFCF.length; i++) {
    presentValue += projectedFCF[i] / Math.pow(1 + discountRate, i + 1);
  }
  presentValue += terminalValue / Math.pow(1 + discountRate, projectionYears);

  // Calculate intrinsic value per share
  const intrinsicValue = presentValue / sharesOutstanding;

  // Calculate margin of safety
  const marginOfSafety =
    ((intrinsicValue - currentPrice) / currentPrice) * 100;

  return {
    intrinsicValue: Math.round(intrinsicValue * 100) / 100,
    currentPrice,
    marginOfSafety: Math.round(marginOfSafety * 100) / 100,
    projectedFCF: projectedFCF.map((f) => Math.round(f)),
    terminalValue: Math.round(terminalValue),
    presentValue: Math.round(presentValue),
    discountRate,
    terminalGrowthRate,
    growthRate: Math.round(growthRate * 10000) / 100,
    sharesOutstanding,
  };
}

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  }
  if (Math.abs(value) >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  return `$${value.toLocaleString()}`;
}

export function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return "N/A";
  return `${(value * 100).toFixed(2)}%`;
}

export function formatNumber(value: number | null, decimals: number = 2): string {
  if (value === null || value === undefined) return "N/A";
  return value.toFixed(decimals);
}

export function formatLargeNumber(value: number | null): string {
  if (value === null || value === undefined) return "N/A";
  if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(0);
}

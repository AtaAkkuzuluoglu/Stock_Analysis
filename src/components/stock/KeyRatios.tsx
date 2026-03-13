"use client";

import React from "react";
import type { KeyRatios as KeyRatiosType } from "@/lib/types";
import Card from "@/components/ui/Card";

interface KeyRatiosProps {
  ratios: KeyRatiosType;
}

interface RatioItem {
  label: string;
  value: string | number;
  tooltip: string;
  color?: string;
}

const RATIO_DESCRIPTIONS: Record<string, string> = {
  "P/E (Trailing)":
    "Price-to-Earnings ratio based on past 12 months earnings. Lower values may indicate undervaluation.",
  "P/E (Forward)":
    "Price-to-Earnings ratio based on projected earnings. Compares price to expected future earnings.",
  "PEG Ratio":
    "Price/Earnings to Growth ratio. A PEG < 1 may indicate a stock is undervalued relative to its growth.",
  "P/B Ratio":
    "Price-to-Book ratio. Compares market value to book value. Value investors prefer < 1.5.",
  "P/S Ratio":
    "Price-to-Sales ratio. Useful for valuing unprofitable companies. Lower is generally better.",
  "EV/EBITDA":
    "Enterprise Value to EBITDA. Useful for comparing companies with different capital structures.",
  "EV/Revenue":
    "Enterprise Value to Revenue. Good for comparing companies across industries.",
  "Profit Margin":
    "Net income as a percentage of revenue. Higher margins indicate better profitability.",
  "Operating Margin":
    "Operating income as a percentage of revenue. Shows operational efficiency.",
  ROE: "Return on Equity. Measures how efficiently the company uses shareholders' equity to generate profit.",
  "Return on Assets":
    "Return on Assets. Measures how efficiently the company uses its assets to generate profit.",
  "Current Ratio":
    "Current assets divided by current liabilities. Above 1.5 indicates good short-term liquidity.",
  "Quick Ratio":
    "Liquid assets divided by current liabilities. A more conservative measure of liquidity.",
  "Debt/Equity":
    "Total debt divided by shareholder equity. Lower ratios indicate less financial leverage.",
  "Interest Coverage":
    "EBIT divided by interest expense. Higher values indicate better ability to service debt.",
  "Dividend Yield":
    "Annual dividend as a percentage of stock price. Higher yields provide more income.",
  "Payout Ratio":
    "Percentage of earnings paid as dividends. Very high ratios may be unsustainable.",
  "Revenue Growth":
    "Year-over-year revenue growth rate. Higher growth indicates expanding business.",
  "Earnings Growth":
    "Year-over-year earnings growth rate. Higher growth indicates improving profitability.",
  "Free Cash Flow":
    "Cash generated after capital expenditures. Positive FCF funds dividends, buybacks, and growth.",
};

function formatRatioValue(value: number | null, isPercent = false): string {
  if (value === null || value === undefined) return "N/A";
  if (isPercent) return `${(value * 100).toFixed(2)}%`;
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return value.toFixed(2);
}

export default function KeyRatios({ ratios }: KeyRatiosProps) {
  const valuationRatios: RatioItem[] = [
    {
      label: "P/E (Trailing)",
      value: formatRatioValue(ratios.trailingPE),
      tooltip: RATIO_DESCRIPTIONS["P/E (Trailing)"],
    },
    {
      label: "P/E (Forward)",
      value: formatRatioValue(ratios.forwardPE),
      tooltip: RATIO_DESCRIPTIONS["P/E (Forward)"],
    },
    {
      label: "PEG Ratio",
      value: formatRatioValue(ratios.pegRatio),
      tooltip: RATIO_DESCRIPTIONS["PEG Ratio"],
    },
    {
      label: "P/B Ratio",
      value: formatRatioValue(ratios.priceToBook),
      tooltip: RATIO_DESCRIPTIONS["P/B Ratio"],
    },
    {
      label: "P/S Ratio",
      value: formatRatioValue(ratios.priceToSales),
      tooltip: RATIO_DESCRIPTIONS["P/S Ratio"],
    },
    {
      label: "EV/EBITDA",
      value: formatRatioValue(ratios.evToEbitda),
      tooltip: RATIO_DESCRIPTIONS["EV/EBITDA"],
    },
    {
      label: "EV/Revenue",
      value: formatRatioValue(ratios.evToRevenue),
      tooltip: RATIO_DESCRIPTIONS["EV/Revenue"],
    },
  ];

  const profitabilityRatios: RatioItem[] = [
    {
      label: "Profit Margin",
      value: formatRatioValue(ratios.profitMargin, true),
      tooltip: RATIO_DESCRIPTIONS["Profit Margin"],
    },
    {
      label: "Operating Margin",
      value: formatRatioValue(ratios.operatingMargin, true),
      tooltip: RATIO_DESCRIPTIONS["Operating Margin"],
    },
    {
      label: "ROE",
      value: formatRatioValue(ratios.returnOnEquity, true),
      tooltip: RATIO_DESCRIPTIONS["ROE"],
    },
    {
      label: "Return on Assets",
      value: formatRatioValue(ratios.returnOnAssets, true),
      tooltip: RATIO_DESCRIPTIONS["Return on Assets"],
    },
    {
      label: "Revenue Growth",
      value: formatRatioValue(ratios.revenueGrowth, true),
      tooltip: RATIO_DESCRIPTIONS["Revenue Growth"],
    },
    {
      label: "Earnings Growth",
      value: formatRatioValue(ratios.earningsGrowth, true),
      tooltip: RATIO_DESCRIPTIONS["Earnings Growth"],
    },
  ];

  const healthRatios: RatioItem[] = [
    {
      label: "Current Ratio",
      value: formatRatioValue(ratios.currentRatio),
      tooltip: RATIO_DESCRIPTIONS["Current Ratio"],
    },
    {
      label: "Quick Ratio",
      value: formatRatioValue(ratios.quickRatio),
      tooltip: RATIO_DESCRIPTIONS["Quick Ratio"],
    },
    {
      label: "Debt/Equity",
      value: formatRatioValue(ratios.debtToEquity),
      tooltip: RATIO_DESCRIPTIONS["Debt/Equity"],
    },
    {
      label: "Interest Coverage",
      value: formatRatioValue(ratios.interestCoverage),
      tooltip: RATIO_DESCRIPTIONS["Interest Coverage"],
    },
  ];

  const incomeRatios: RatioItem[] = [
    {
      label: "Dividend Yield",
      value: formatRatioValue(ratios.dividendYield, true),
      tooltip: RATIO_DESCRIPTIONS["Dividend Yield"],
    },
    {
      label: "Payout Ratio",
      value: formatRatioValue(ratios.payoutRatio, true),
      tooltip: RATIO_DESCRIPTIONS["Payout Ratio"],
    },
    {
      label: "Free Cash Flow",
      value: formatRatioValue(ratios.freeCashFlow),
      tooltip: RATIO_DESCRIPTIONS["Free Cash Flow"],
    },
    {
      label: "Total Cash",
      value: formatRatioValue(ratios.totalCash),
      tooltip: "Total cash and cash equivalents on the balance sheet.",
    },
    {
      label: "Total Debt",
      value: formatRatioValue(ratios.totalDebt),
      tooltip: "Total long-term debt on the balance sheet.",
    },
  ];

  return (
    <Card title="Key Financial Ratios">
      <div className="space-y-6">
        <RatioSection title="Valuation" ratios={valuationRatios} />
        <RatioSection title="Profitability" ratios={profitabilityRatios} />
        <RatioSection title="Financial Health" ratios={healthRatios} />
        <RatioSection title="Income & Cash" ratios={incomeRatios} />
      </div>
    </Card>
  );
}

function RatioSection({
  title,
  ratios,
}: {
  title: string;
  ratios: RatioItem[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        {title}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {ratios.map((ratio) => (
          <RatioCard
            key={ratio.label}
            label={ratio.label}
            value={ratio.value}
            tooltip={ratio.tooltip}
          />
        ))}
      </div>
    </div>
  );
}

function RatioCard({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string | number;
  tooltip: string;
}) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  // Get color based on value
  let valueClass = "text-gray-900 dark:text-gray-100";
  if (typeof value === "string" && value !== "N/A") {
    // Try to extract a number for color coding
    const numMatch = value.match(/^-?[\d.]+/);
    if (numMatch) {
      const num = parseFloat(numMatch[0]);
      if (!isNaN(num)) {
        if (label.includes("Margin") || label === "ROE" || label === "Return on Assets") {
          valueClass = num > 15 ? "text-green-600 dark:text-green-400" :
                      num > 5 ? "text-yellow-600 dark:text-yellow-400" :
                      num >= 0 ? "text-orange-600 dark:text-orange-400" :
                      "text-red-600 dark:text-red-400";
        } else if (label.includes("Growth")) {
          valueClass = num > 10 ? "text-green-600 dark:text-green-400" :
                      num > 0 ? "text-yellow-600 dark:text-yellow-400" :
                      "text-red-600 dark:text-red-400";
        } else if (label === "Debt/Equity") {
          valueClass = num < 100 ? "text-green-600 dark:text-green-400" :
                      num < 200 ? "text-yellow-600 dark:text-yellow-400" :
                      "text-red-600 dark:text-red-400";
        } else if (label.includes("Ratio")) {
          if (label === "Current Ratio" || label === "Quick Ratio") {
            valueClass = num >= 1.5 ? "text-green-600 dark:text-green-400" :
                        num >= 1 ? "text-yellow-600 dark:text-yellow-400" :
                        "text-red-600 dark:text-red-400";
          }
        }
      }
    }
  }

  return (
    <div
      className="relative group p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
        {label}
      </div>
      <div className={`text-sm font-semibold ${valueClass}`}>
        {value}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      )}
    </div>
  );
}

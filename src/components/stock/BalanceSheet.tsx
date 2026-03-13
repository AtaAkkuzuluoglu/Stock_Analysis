"use client";

import React, { useState } from "react";
import type { BalanceSheet as BalanceSheetType, BalanceSheetItem } from "@/lib/types";
import Card from "@/components/ui/Card";

interface BalanceSheetProps {
  data: BalanceSheetType;
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toLocaleString()}`;
}

function interpretBalanceSheet(item: BalanceSheetItem): string[] {
  const insights: string[] = [];

  // Assets vs liabilities
  if (item.totalAssets > 0 && item.totalLiabilities > 0) {
    const equityRatio = item.totalEquity / item.totalAssets;
    if (equityRatio > 0.5) {
      insights.push(
        "Strong equity position — shareholders own more than half the company's assets."
      );
    } else if (equityRatio > 0.2) {
      insights.push(
        "Moderate equity position with a mix of debt and equity financing."
      );
    } else {
      insights.push(
        "High leverage — most assets are financed by debt rather than equity."
      );
    }
  }

  // Current ratio
  if (item.currentAssets > 0 && item.currentLiabilities > 0) {
    const currentRatio = item.currentAssets / item.currentLiabilities;
    if (currentRatio > 2) {
      insights.push(
        `Excellent liquidity with a current ratio of ${currentRatio.toFixed(2)} — can easily cover short-term obligations.`
      );
    } else if (currentRatio > 1) {
      insights.push(
        `Adequate liquidity with a current ratio of ${currentRatio.toFixed(2)}.`
      );
    } else {
      insights.push(
        `Low liquidity — current ratio of ${currentRatio.toFixed(2)} indicates potential difficulty meeting short-term obligations.`
      );
    }
  }

  // Debt analysis
  if (item.totalDebt > 0 && item.totalEquity > 0) {
    const debtToEquity = item.totalDebt / item.totalEquity;
    if (debtToEquity > 1) {
      insights.push(
        `Higher debt than equity (D/E: ${debtToEquity.toFixed(2)}). More financial risk but could amplify returns.`
      );
    } else if (debtToEquity > 0.5) {
      insights.push(
        `Moderate debt levels relative to equity (D/E: ${debtToEquity.toFixed(2)}).`
      );
    } else {
      insights.push(
        `Conservative debt levels (D/E: ${debtToEquity.toFixed(2)}) — strong financial flexibility.`
      );
    }
  }

  // Cash position
  if (item.totalCash > 0) {
    const cashRatio = item.totalCash / item.totalLiabilities;
    if (cashRatio > 0.3) {
      insights.push(
        "Strong cash reserves relative to liabilities — great for weathering downturns or pursuing growth."
      );
    } else if (cashRatio > 0.1) {
      insights.push("Reasonable cash position for operational needs.");
    }
  }

  // Goodwill
  if (item.goodwill > 0 && item.totalAssets > 0) {
    const goodwillRatio = item.goodwill / item.totalAssets;
    if (goodwillRatio > 0.3) {
      insights.push(
        "Significant goodwill from acquisitions — watch for potential impairment charges."
      );
    }
  }

  return insights;
}

export default function BalanceSheet({ data }: BalanceSheetProps) {
  const [view, setView] = useState<"annual" | "quarterly">("annual");

  const statements = view === "annual" ? data.annual : data.quarterly;

  if (!statements || statements.length === 0) {
    return (
      <Card title="Balance Sheet">
        <p className="text-gray-500 dark:text-gray-400">
          No balance sheet data available.
        </p>
      </Card>
    );
  }

  const latest = statements[0];
  const interpretations = interpretBalanceSheet(latest);

  return (
    <Card title="Balance Sheet">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView("annual")}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            view === "annual"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Annual
        </button>
        <button
          onClick={() => setView("quarterly")}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            view === "quarterly"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Quarterly
        </button>
      </div>

      {/* Interpretation */}
      {interpretations.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Key Insights ({latest.date})
          </h4>
          <ul className="space-y-1">
            {interpretations.map((insight, i) => (
              <li
                key={i}
                className="text-sm text-blue-700 dark:text-blue-400"
              >
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Balance sheet table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">
                Item
              </th>
              {statements.slice(0, 4).map((s) => (
                <th
                  key={s.date}
                  className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium"
                >
                  {s.date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <BalanceRow
              label="Total Assets"
              values={statements.slice(0, 4).map((s) => s.totalAssets)}
              highlight
            />
            <BalanceRow
              label="Current Assets"
              values={statements.slice(0, 4).map((s) => s.currentAssets)}
            />
            <BalanceRow
              label="Total Liabilities"
              values={statements.slice(0, 4).map((s) => s.totalLiabilities)}
              highlight
            />
            <BalanceRow
              label="Current Liabilities"
              values={statements.slice(0, 4).map((s) => s.currentLiabilities)}
            />
            <BalanceRow
              label="Long-term Debt"
              values={statements.slice(0, 4).map((s) => s.longTermDebt)}
            />
            <BalanceRow
              label="Shareholder Equity"
              values={statements.slice(0, 4).map((s) => s.totalEquity)}
              highlight
            />
            <BalanceRow
              label="Cash"
              values={statements.slice(0, 4).map((s) => s.totalCash)}
            />
            <BalanceRow
              label="Goodwill"
              values={statements.slice(0, 4).map((s) => s.goodwill)}
            />
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function BalanceRow({
  label,
  values,
  highlight = false,
}: {
  label: string;
  values: number[];
  highlight?: boolean;
}) {
  return (
    <tr
      className={`border-b border-gray-100 dark:border-gray-700/50 ${
        highlight ? "font-semibold bg-gray-50/50 dark:bg-gray-800/50" : ""
      }`}
    >
      <td className="py-2 text-gray-700 dark:text-gray-300">{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className="py-2 text-right text-gray-900 dark:text-gray-100"
        >
          {v ? formatValue(v) : "N/A"}
        </td>
      ))}
    </tr>
  );
}

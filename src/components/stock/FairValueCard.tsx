"use client";

import React from "react";
import type { DCFResult, ScoringResult } from "@/lib/types";
import Card from "@/components/ui/Card";
import RecommendationBadge from "./RecommendationBadge";

interface FairValueCardProps {
  dcf: DCFResult;
  score: ScoringResult;
}

export default function FairValueCard({ dcf, score }: FairValueCardProps) {
  const hasError = !!dcf.error;
  const isUndervalued = dcf.marginOfSafety > 0;

  return (
    <Card title="Fair Value & Recommendation">
      {hasError ? (
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {dcf.error}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            DCF valuation requires positive free cash flow data.
          </p>
        </div>
      ) : (
        <div>
          {/* Recommendation */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Overall Recommendation
              </div>
              <RecommendationBadge
                recommendation={score.recommendation}
                score={score.overallScore}
                size="lg"
              />
            </div>
          </div>

          {/* DCF Value */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Current Price
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${dcf.currentPrice.toFixed(2)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Fair Value (DCF)
              </div>
              <div
                className={`text-2xl font-bold ${
                  isUndervalued
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                ${dcf.intrinsicValue.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Margin of Safety */}
          <div
            className={`p-4 rounded-lg mb-6 ${
              isUndervalued
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={`text-sm font-semibold ${
                    isUndervalued
                      ? "text-green-800 dark:text-green-300"
                      : "text-red-800 dark:text-red-300"
                  }`}
                >
                  {isUndervalued ? "Potentially Undervalued" : "Potentially Overvalued"}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    isUndervalued
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {isUndervalued ? "+" : ""}
                  {dcf.marginOfSafety.toFixed(1)}% margin of safety
                </div>
              </div>
              <div
                className={`text-3xl font-bold ${
                  isUndervalued
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {dcf.marginOfSafety > 0 ? "+" : ""}
                {dcf.marginOfSafety.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* DCF Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <DcfDetail label="Growth Rate" value={`${dcf.growthRate}%`} />
            <DcfDetail
              label="Discount Rate"
              value={`${(dcf.discountRate * 100).toFixed(0)}%`}
            />
            <DcfDetail
              label="Terminal Growth"
              value={`${(dcf.terminalGrowthRate * 100).toFixed(0)}%`}
            />
            <DcfDetail
              label="Terminal Value"
              value={`$${(dcf.terminalValue / 1e9).toFixed(2)}B`}
            />
            <DcfDetail
              label="Present Value"
              value={`$${(dcf.presentValue / 1e9).toFixed(2)}B`}
            />
            <DcfDetail
              label="Shares Outstanding"
              value={`${(dcf.sharesOutstanding / 1e9).toFixed(2)}B`}
            />
          </div>

          {/* Score Breakdown */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Score Breakdown
            </h4>
            <div className="space-y-2">
              <ScoreBar
                label="DCF Value (40%)"
                score={score.dcfScore}
              />
              <ScoreBar
                label="Financial Health (30%)"
                score={score.healthScore}
              />
              <ScoreBar
                label="Profitability (20%)"
                score={score.profitabilityScore}
              />
              <ScoreBar
                label="Valuation (10%)"
                score={score.valuationScore}
              />
            </div>
          </div>

          {/* Details */}
          {score.details.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <ul className="space-y-1">
                {score.details.map((detail, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    • {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function DcfDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const normalizedScore = (score + 100) / 2; // Convert -100 to 100 → 0 to 100
  const barColor =
    score > 20
      ? "bg-green-500"
      : score > 0
        ? "bg-yellow-500"
        : score > -20
          ? "bg-orange-500"
          : "bg-red-500";

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-gray-900 dark:text-gray-100 font-medium">
          {score.toFixed(1)}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  );
}

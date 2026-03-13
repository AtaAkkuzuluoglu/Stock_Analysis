"use client";

import React from "react";
import type { Recommendation } from "@/lib/types";
import { getRecommendationColor, getRecommendationLabel } from "@/lib/scoring";

interface RecommendationBadgeProps {
  recommendation: Recommendation;
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function RecommendationBadge({
  recommendation,
  score,
  size = "md",
}: RecommendationBadgeProps) {
  const colorClass = getRecommendationColor(recommendation);
  const label = getRecommendationLabel(recommendation);

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <div className="inline-flex flex-col items-center">
      <div
        className={`${colorClass} ${sizeClasses[size]} rounded-lg font-bold tracking-wide`}
      >
        {label}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Score: {score.toFixed(1)}/100
      </div>
    </div>
  );
}

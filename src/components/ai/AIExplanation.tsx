"use client";

import React, { useState } from "react";
import { useAIExplanation } from "@/hooks/useAIExplanation";
import type { StockQuote, KeyRatios, DCFResult, ScoringResult } from "@/lib/types";
import Card from "@/components/ui/Card";

interface AIExplanationProps {
  ticker: string;
  data: {
    quote: StockQuote;
    ratios: KeyRatios;
    dcf: DCFResult;
    score: ScoringResult;
  };
}

export default function AIExplanation({ ticker, data }: AIExplanationProps) {
  const { explanation, isLoading, error, explain, reset } = useAIExplanation();
  const [hasRequested, setHasRequested] = useState(false);
  const [question, setQuestion] = useState("");

  const hasApiKey =
    typeof window !== "undefined" && localStorage.getItem("openrouter_api_key");

  function handleExplain() {
    setHasRequested(true);
    explain({ ticker, data, question: question || undefined });
  }

  return (
    <Card title="AI Analysis">
      {!hasRequested ? (
        <div className="text-center py-4">
          <div className="mb-4">
            <svg
              className="w-12 h-12 mx-auto text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Get an AI-powered analysis of {ticker} using the Hunter model.
          </p>

          {!hasApiKey ? (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                OpenRouter API key not found.{" "}
                <a href="/settings" className="underline font-medium">
                  Add your API key
                </a>{" "}
                to enable AI analysis.
              </p>
            </div>
          ) : (
            <div className="mb-4">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a specific question (optional)..."
                className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
            </div>
          )}

          <button
            onClick={handleExplain}
            disabled={!hasApiKey}
            className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? "Analyzing..." : "Explain with AI"}
          </button>
        </div>
      ) : (
        <div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {isLoading && !explanation && (
            <div className="flex items-center gap-3 py-4">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-500 dark:text-gray-400">
                AI is analyzing {ticker}...
              </span>
            </div>
          )}

          {explanation && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {explanation}
                {isLoading && (
                  <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1" />
                )}
              </div>
            </div>
          )}

          {!isLoading && explanation && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button
                onClick={() => {
                  reset();
                  setHasRequested(false);
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ask again
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

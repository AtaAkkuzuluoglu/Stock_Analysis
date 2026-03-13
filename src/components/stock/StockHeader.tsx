"use client";

import React from "react";
import type { StockQuote } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatLargeNumber } from "@/lib/valuation";

interface StockHeaderProps {
  quote: StockQuote;
}

export default function StockHeader({ quote }: StockHeaderProps) {
  const isPositive = quote.regularMarketChange >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {quote.symbol}
            </h1>
            {quote.sector && (
              <Badge variant="blue" size="sm">
                {quote.sector}
              </Badge>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {quote.longName || quote.shortName}
          </p>
          {quote.industry && (
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {quote.industry}
            </p>
          )}
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            ${quote.regularMarketPrice.toFixed(2)}
          </div>
          <div
            className={`text-lg font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {quote.regularMarketChange.toFixed(2)} (
            {isPositive ? "+" : ""}
            {quote.regularMarketChangePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Stat label="Market Cap" value={formatCurrency(quote.marketCap)} />
        <Stat
          label="52W Range"
          value={`$${quote.fiftyTwoWeekLow.toFixed(2)} - $${quote.fiftyTwoWeekHigh.toFixed(2)}`}
        />
        <Stat
          label="Volume"
          value={formatLargeNumber(quote.regularMarketVolume)}
        />
        <Stat
          label="Avg Volume"
          value={formatLargeNumber(quote.regularMarketVolume)}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
        <Stat label="Open" value={`$${quote.regularMarketOpen.toFixed(2)}`} />
        <Stat
          label="Previous Close"
          value={`$${quote.regularMarketPreviousClose.toFixed(2)}`}
        />
        <Stat
          label="Day Range"
          value={`$${quote.regularMarketDayLow.toFixed(2)} - $${quote.regularMarketDayHigh.toFixed(2)}`}
        />
        <Stat
          label="Beta"
          value={quote.beta !== null ? quote.beta.toFixed(2) : "N/A"}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
        {value}
      </div>
    </div>
  );
}

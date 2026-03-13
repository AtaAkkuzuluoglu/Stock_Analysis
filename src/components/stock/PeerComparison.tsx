"use client";

import React from "react";
import type { PeerData, StockQuote } from "@/lib/types";
import Card from "@/components/ui/Card";

interface PeerComparisonProps {
  quote: StockQuote;
  peers: PeerData[];
}

function formatNumber(value: number | null, suffix: string = ""): string {
  if (value === null || value === undefined) return "N/A";
  return `${value.toFixed(2)}${suffix}`;
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return "N/A";
  return `${(value * 100).toFixed(1)}%`;
}

export default function PeerComparison({ quote, peers }: PeerComparisonProps) {
  if (!peers || peers.length === 0) {
    return (
      <Card title="Peer Comparison">
        <p className="text-gray-500 dark:text-gray-400">
          No peer data available.
        </p>
      </Card>
    );
  }

  // Build comparison rows with the main stock first
  const allStocks = [
    {
      symbol: quote.symbol,
      shortName: quote.shortName,
      regularMarketPrice: quote.regularMarketPrice,
      marketCap: quote.marketCap,
      trailingPE: quote.trailingPE,
      forwardPE: quote.forwardPE,
      priceToBook: quote.priceToBook,
      returnOnEquity: null as number | null,
      profitMargin: null as number | null,
      debtToEquity: null as number | null,
      revenueGrowth: null as number | null,
      dividendYield: quote.dividendYield,
      isMain: true,
    },
    ...peers.map((p) => ({ ...p, isMain: false })),
  ];

  return (
    <Card title="Peer Comparison">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                Company
              </th>
              <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                Price
              </th>
              <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                Market Cap
              </th>
              <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                P/E
              </th>
              <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                P/B
              </th>
              <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                ROE
              </th>
              <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                Margin
              </th>
              <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">
                Yield
              </th>
            </tr>
          </thead>
          <tbody>
            {allStocks.map((stock) => (
              <tr
                key={stock.symbol}
                className={`border-b border-gray-100 dark:border-gray-700/50 ${
                  stock.isMain
                    ? "bg-blue-50 dark:bg-blue-900/20 font-semibold"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                }`}
              >
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-gray-100">
                      {stock.symbol}
                    </span>
                    {stock.isMain && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-500 text-white rounded">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                    {stock.shortName}
                  </div>
                </td>
                <td className="text-right py-2.5 px-2 text-gray-900 dark:text-gray-100">
                  ${stock.regularMarketPrice.toFixed(2)}
                </td>
                <td className="text-right py-2.5 px-2 text-gray-900 dark:text-gray-100">
                  {formatMarketCap(stock.marketCap)}
                </td>
                <td className="text-right py-2.5 px-2 text-gray-900 dark:text-gray-100">
                  {formatNumber(stock.trailingPE)}
                </td>
                <td className="text-right py-2.5 px-2 text-gray-900 dark:text-gray-100">
                  {formatNumber(stock.priceToBook)}
                </td>
                <td className="text-right py-2.5 px-2 text-gray-900 dark:text-gray-100">
                  {formatPercent(stock.returnOnEquity)}
                </td>
                <td className="text-right py-2.5 px-2 text-gray-900 dark:text-gray-100">
                  {formatPercent(stock.profitMargin)}
                </td>
                <td className="text-right py-2.5 px-2 text-gray-900 dark:text-gray-100">
                  {formatPercent(stock.dividendYield)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        Data from Yahoo Finance. Some values may be unavailable for certain stocks.
      </p>
    </Card>
  );
}

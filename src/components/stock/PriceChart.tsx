"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { HistoricalPrice } from "@/lib/types";
import Card from "@/components/ui/Card";

interface PriceChartProps {
  prices: HistoricalPrice[];
}

type Period = "1m" | "3m" | "6m" | "1y" | "5y";

export default function PriceChart({ prices }: PriceChartProps) {
  const [period, setPeriod] = useState<Period>("1y");

  if (!prices || prices.length === 0) {
    return (
      <Card title="Price History">
        <p className="text-gray-500 dark:text-gray-400">
          No price data available.
        </p>
      </Card>
    );
  }

  // Filter by period
  const now = new Date();
  const cutoff = new Date();
  switch (period) {
    case "1m":
      cutoff.setMonth(now.getMonth() - 1);
      break;
    case "3m":
      cutoff.setMonth(now.getMonth() - 3);
      break;
    case "6m":
      cutoff.setMonth(now.getMonth() - 6);
      break;
    case "1y":
      cutoff.setFullYear(now.getFullYear() - 1);
      break;
    case "5y":
      cutoff.setFullYear(now.getFullYear() - 5);
      break;
  }

  const filteredPrices = prices.filter(
    (p) => new Date(p.date) >= cutoff
  );

  const chartData = filteredPrices.map((p) => ({
    date: p.date,
    price: p.close,
  }));

  // Calculate change for coloring
  const firstPrice = chartData[0]?.price || 0;
  const lastPrice = chartData[chartData.length - 1]?.price || 0;
  const isPositive = lastPrice >= firstPrice;

  const periodButtons: { label: string; value: Period }[] = [
    { label: "1M", value: "1m" },
    { label: "3M", value: "3m" },
    { label: "6M", value: "6m" },
    { label: "1Y", value: "1y" },
    { label: "5Y", value: "5y" },
  ];

  const formatPrice = (value: number) => `$${value.toFixed(2)}`;
  const formatDate = (value: any) => {
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: period === "5y" ? "2-digit" : undefined,
    });
  };

  return (
    <Card title="Price History">
      <div className="flex gap-2 mb-4">
        {periodButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setPeriod(btn.value)}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              period === btn.value
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? "#22c55e" : "#ef4444"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? "#22c55e" : "#ef4444"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              minTickGap={50}
            />
            <YAxis
              tickFormatter={formatPrice}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              width={60}
            />
            <Tooltip
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Price"]}
              labelFormatter={formatDate}
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                borderRadius: "8px",
                color: "#f3f4f6",
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? "#22c55e" : "#ef4444"}
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
        <span>Period: {formatDate(chartData[0]?.date)} - {formatDate(chartData[chartData.length - 1]?.date)}</span>
        <span
          className={
            isPositive
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }
        >
          {isPositive ? "+" : ""}
          {(((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)}%
        </span>
      </div>
    </Card>
  );
}

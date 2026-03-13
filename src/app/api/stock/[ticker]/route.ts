import { NextRequest, NextResponse } from "next/server";
import {
  getQuote,
  getKeyRatios,
  getBalanceSheet,
  getNews,
  getPeers,
  getFCFHistory,
} from "@/lib/yahoo";
import { calculateDCF } from "@/lib/valuation";
import { calculateScore } from "@/lib/scoring";

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase();

  try {
    const [quote, ratios, balanceSheet, news, peers, fcfHistory] =
      await Promise.all([
        getQuote(ticker),
        getKeyRatios(ticker),
        getBalanceSheet(ticker),
        getNews(ticker),
        getPeers(ticker),
        getFCFHistory(ticker),
      ]);

    if (!quote) {
      return NextResponse.json(
        { error: `Ticker "${ticker}" not found` },
        { status: 404 }
      );
    }

    // Calculate DCF valuation
    const dcf = calculateDCF({
      freeCashFlow: ratios?.freeCashFlow || 0,
      sharesOutstanding: quote.sharesOutstanding,
      currentPrice: quote.regularMarketPrice,
      historicalFCF: fcfHistory,
      revenueGrowth: ratios?.revenueGrowth ?? null,
    });

    // Calculate recommendation score
    const score = calculateScore({
      dcf,
      ratios: ratios || {
        trailingPE: null, forwardPE: null, pegRatio: null,
        priceToBook: null, priceToSales: null, evToEbitda: null,
        evToRevenue: null, profitMargin: null, operatingMargin: null,
        returnOnEquity: null, returnOnAssets: null, currentRatio: null,
        quickRatio: null, debtToEquity: null, interestCoverage: null,
        dividendYield: null, payoutRatio: null, revenueGrowth: null,
        earningsGrowth: null, freeCashFlow: null, totalCash: null,
        totalDebt: null,
      },
    });

    return NextResponse.json({
      quote,
      ratios,
      balanceSheet,
      dcf,
      score,
      peers,
      news,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}

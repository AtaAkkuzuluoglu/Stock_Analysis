import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getQuote,
  getKeyRatios,
  getBalanceSheet,
  getNews,
  getPeers,
  getHistoricalPrices,
  getFCFHistory,
} from "@/lib/yahoo";
import { calculateDCF } from "@/lib/valuation";
import { calculateScore } from "@/lib/scoring";
import StockHeader from "@/components/stock/StockHeader";
import KeyRatios from "@/components/stock/KeyRatios";
import BalanceSheet from "@/components/stock/BalanceSheet";
import FairValueCard from "@/components/stock/FairValueCard";
import PeerComparison from "@/components/stock/PeerComparison";
import PriceChart from "@/components/stock/PriceChart";
import NewsCard from "@/components/stock/NewsCard";
import AIExplanation from "@/components/ai/AIExplanation";
import { StockPageSkeleton } from "@/components/ui/Skeleton";

interface PageProps {
  params: { ticker: string };
}

export async function generateMetadata({ params }: PageProps) {
  const quote = await getQuote(params.ticker.toUpperCase());
  if (!quote) {
    return {
      title: `${params.ticker.toUpperCase()} - Stock Not Found | Borsa`,
    };
  }
  return {
    title: `${quote.symbol} - ${quote.shortName} | Borsa Stock Analysis`,
    description: `Analyze ${quote.shortName} (${quote.symbol}) stock with financial ratios, DCF fair value, peer comparison, and AI-powered analysis.`,
  };
}

export default async function StockPage({ params }: PageProps) {
  const ticker = params.ticker.toUpperCase();

  const [quote, ratios, balanceSheet, news, peers, historicalPrices, fcfHistory] =
    await Promise.all([
      getQuote(ticker),
      getKeyRatios(ticker),
      getBalanceSheet(ticker),
      getNews(ticker),
      getPeers(ticker),
      getHistoricalPrices(ticker, "1y"),
      getFCFHistory(ticker),
    ]);

  if (!quote) {
    notFound();
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
  const defaultRatios = {
    trailingPE: null, forwardPE: null, pegRatio: null,
    priceToBook: null, priceToSales: null, evToEbitda: null,
    evToRevenue: null, profitMargin: null, operatingMargin: null,
    returnOnEquity: null, returnOnAssets: null, currentRatio: null,
    quickRatio: null, debtToEquity: null, interestCoverage: null,
    dividendYield: null, payoutRatio: null, revenueGrowth: null,
    earningsGrowth: null, freeCashFlow: null, totalCash: null,
    totalDebt: null,
  };

  const score = calculateScore({
    dcf,
    ratios: ratios || defaultRatios,
  });

  const stockData = {
    quote,
    ratios: ratios || defaultRatios,
    dcf,
    score,
  };

  return (
    <Suspense fallback={<StockPageSkeleton />}>
      <div className="space-y-6">
        {/* Header */}
        <StockHeader quote={quote} />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Ratios */}
          <div className="lg:col-span-1">
            {ratios ? (
              <KeyRatios ratios={ratios} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Key Financial Ratios
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No ratio data available for this ticker.
                </p>
              </div>
            )}
          </div>

          {/* Fair Value & Recommendation */}
          <div className="lg:col-span-1">
            <FairValueCard dcf={dcf} score={score} />
          </div>

          {/* Balance Sheet */}
          <div className="lg:col-span-1">
            {balanceSheet ? (
              <BalanceSheet data={balanceSheet} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Balance Sheet
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No balance sheet data available.
                </p>
              </div>
            )}
          </div>

          {/* AI Explanation */}
          <div className="lg:col-span-1">
            <AIExplanation ticker={ticker} data={stockData} />
          </div>
        </div>

        {/* Price Chart (full width) */}
        <PriceChart prices={historicalPrices} />

        {/* Peer Comparison (full width) */}
        <PeerComparison quote={quote} peers={peers} />

        {/* News (full width) */}
        <NewsCard news={news} />
      </div>
    </Suspense>
  );
}

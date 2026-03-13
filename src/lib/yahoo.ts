import yahooFinance from "yahoo-finance2";
import type {
  StockQuote,
  KeyRatios,
  BalanceSheet,
  BalanceSheetItem,
  HistoricalPrice,
  NewsItem,
  PeerData,
  SearchResult,
} from "./types";

export async function searchTickers(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) return [];
  try {
    const results = await yahooFinance.search(query, { newsCount: 0 }) as any;
    return (results.quotes || [])
      .filter((q: any) => q.symbol && q.quoteType === "EQUITY")
      .map((q: any) => ({
        symbol: q.symbol,
        shortname: q.shortname || "",
        longname: q.longname || "",
        exchange: q.exchange || "",
        typeDisp: q.typeDisp || "",
        quoteType: q.quoteType || "",
        score: q.score || 0,
      }))
      .slice(0, 8);
  } catch {
    return [];
  }
}

export async function getQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const result = (await yahooFinance.quote(symbol)) as any;
    if (!result || !result.symbol) return null;
    return {
      symbol: result.symbol,
      shortName: result.shortName || "",
      longName: result.longName || result.shortName || "",
      currency: result.currency || "USD",
      regularMarketPrice: result.regularMarketPrice || 0,
      regularMarketChange: result.regularMarketChange || 0,
      regularMarketChangePercent: result.regularMarketChangePercent || 0,
      regularMarketPreviousClose: result.regularMarketPreviousClose || 0,
      regularMarketOpen: result.regularMarketOpen || 0,
      regularMarketDayHigh: result.regularMarketDayHigh || 0,
      regularMarketDayLow: result.regularMarketDayLow || 0,
      regularMarketVolume: result.regularMarketVolume || 0,
      marketCap: result.marketCap || 0,
      fiftyTwoWeekLow: result.fiftyTwoWeekLow || 0,
      fiftyTwoWeekHigh: result.fiftyTwoWeekHigh || 0,
      fiftyDayAverage: result.fiftyDayAverage || 0,
      twoHundredDayAverage: result.twoHundredDayAverage || 0,
      sharesOutstanding: result.sharesOutstanding || 0,
      trailingPE: result.trailingPE ?? null,
      forwardPE: result.forwardPE ?? null,
      priceToBook: result.priceToBook ?? null,
      dividendYield: result.dividendYield ?? null,
      beta: result.beta ?? null,
      sector: (result as any).sector || "",
      industry: (result as any).industry || "",
    };
  } catch {
    return null;
  }
}

export async function getKeyRatios(symbol: string): Promise<KeyRatios | null> {
  try {
    const [quote, modules] = await Promise.all([
      yahooFinance.quote(symbol) as Promise<any>,
      yahooFinance.quoteSummary(symbol, {
        modules: [
          "financialData",
          "defaultKeyStatistics",
          "summaryDetail",
        ],
      }) as Promise<any>,
    ]);

    const fin = modules.financialData || {};
    const stats = modules.defaultKeyStatistics || {};
    const detail = modules.summaryDetail || {};

    return {
      trailingPE: detail.trailingPE ?? quote.trailingPE ?? null,
      forwardPE: detail.forwardPE ?? quote.forwardPE ?? null,
      pegRatio: stats.pegRatio ?? null,
      priceToBook: detail.priceToBook ?? quote.priceToBook ?? null,
      priceToSales: stats.priceToSalesTrailing12Months ?? null,
      evToEbitda: stats.enterpriseToEbitda ?? null,
      evToRevenue: stats.enterpriseToRevenue ?? null,
      profitMargin: fin.profitMargins ?? null,
      operatingMargin: fin.operatingMargins ?? null,
      returnOnEquity: fin.returnOnEquity ?? null,
      returnOnAssets: fin.returnOnAssets ?? null,
      currentRatio: fin.currentRatio ?? null,
      quickRatio: fin.quickRatio ?? null,
      debtToEquity: fin.debtToEquity ?? null,
      interestCoverage: stats.interestCoverage ?? null,
      dividendYield: detail.dividendYield ?? quote.dividendYield ?? null,
      payoutRatio: detail.payoutRatio ?? null,
      revenueGrowth: fin.revenueGrowth ?? null,
      earningsGrowth: fin.earningsGrowth ?? null,
      freeCashFlow: fin.freeCashflow ?? null,
      totalCash: fin.totalCash ?? null,
      totalDebt: fin.totalDebt ?? null,
    };
  } catch {
    return null;
  }
}

export async function getBalanceSheet(
  symbol: string
): Promise<BalanceSheet | null> {
  try {
    const result = (await yahooFinance.quoteSummary(symbol, {
      modules: ["balanceSheetHistory", "balanceSheetHistoryQuarterly"],
    })) as any;

    const mapItem = (item: any): BalanceSheetItem => ({
      date: item.endDate
        ? new Date(item.endDate).toISOString().split("T")[0]
        : "",
      totalAssets: item.totalAssets || 0,
      totalLiabilities: item.totalLiab || 0,
      totalEquity: item.totalStockholderEquity || 0,
      totalCash: item.cash || 0,
      totalDebt: item.longTermDebt || 0,
      currentAssets: item.totalCurrentAssets || 0,
      currentLiabilities: item.totalCurrentLiabilities || 0,
      longTermDebt: item.longTermDebt || 0,
      goodwill: item.goodWill || 0,
      intangibleAssets: item.intangibleAssets || 0,
    });

    const annual =
      result.balanceSheetHistory?.balanceSheetStatements?.map(
        mapItem
      ) || [];
    const quarterly =
      result.balanceSheetHistoryQuarterly?.balanceSheetStatements?.map(
        mapItem
      ) || [];

    return { annual, quarterly };
  } catch {
    return null;
  }
}

export async function getHistoricalPrices(
  symbol: string,
  period: string = "1y"
): Promise<HistoricalPrice[]> {
  try {
    const result = (await yahooFinance.historical(symbol, {
      period1: getPeriodStart(period),
      interval: "1d",
    })) as any[];

    return result.map((item: any) => ({
      date: new Date(item.date).toISOString().split("T")[0],
      open: item.open || 0,
      high: item.high || 0,
      low: item.low || 0,
      close: item.close || 0,
      volume: item.volume || 0,
    }));
  } catch {
    return [];
  }
}

export async function getNews(symbol: string): Promise<NewsItem[]> {
  try {
    const result = (await yahooFinance.search(symbol, { newsCount: 10 })) as any;
    return (result.news || []).map((item: any) => ({
      title: item.title || "",
      publisher: item.publisher || "",
      link: item.link || "",
      providerPublishTime: item.providerPublishTime
        ? new Date(item.providerPublishTime * 1000).toISOString()
        : "",
      thumbnail: item.thumbnail?.resolutions?.[0]?.url,
      summary: item.summary || "",
    }));
  } catch {
    return [];
  }
}

export async function getPeers(symbol: string): Promise<PeerData[]> {
  try {
    // Get industry for peer search
    const profile = (await yahooFinance.quoteSummary(symbol, {
      modules: ["assetProfile"],
    })) as any;
    const industry = profile.assetProfile?.industry || "";

    if (!industry) return [];

    // Search for companies in the same industry
    const searchResults = (await yahooFinance.search(industry, {
      newsCount: 0,
    })) as any;
    const peerSymbols = (searchResults.quotes || [])
      .filter(
        (q: any) =>
          q.symbol &&
          q.symbol !== symbol &&
          q.quoteType === "EQUITY"
      )
      .map((q: any) => q.symbol)
      .slice(0, 5);

    if (peerSymbols.length === 0) return [];

    const peerQuotes = await Promise.all(
      peerSymbols.map(async (sym: string) => {
        try {
          const q = (await yahooFinance.quote(sym)) as any;
          const s = (await yahooFinance.quoteSummary(sym, {
            modules: ["financialData", "summaryDetail"],
          })) as any;
          const fin = s.financialData || {};
          const detail = s.summaryDetail || {};
          return {
            symbol: q.symbol,
            shortName: q.shortName || "",
            regularMarketPrice: q.regularMarketPrice || 0,
            marketCap: q.marketCap || 0,
            trailingPE: detail.trailingPE ?? null,
            forwardPE: detail.forwardPE ?? null,
            priceToBook: detail.priceToBook ?? null,
            returnOnEquity: fin.returnOnEquity ?? null,
            profitMargin: fin.profitMargins ?? null,
            debtToEquity: fin.debtToEquity ?? null,
            revenueGrowth: fin.revenueGrowth ?? null,
            dividendYield: detail.dividendYield ?? null,
          };
        } catch {
          return null;
        }
      })
    );

    return peerQuotes.filter(Boolean) as PeerData[];
  } catch {
    return [];
  }
}

export async function getFCFHistory(
  symbol: string
): Promise<number[]> {
  try {
    const result = (await yahooFinance.quoteSummary(symbol, {
      modules: ["cashflowStatementHistory"],
    })) as any;
    const statements =
      result.cashflowStatementHistory?.cashflowStatements || [];
    return statements
      .map((s: any) => s.totalCashFromOperatingActivities - (s.capitalExpenditures || 0))
      .filter((v: any) => typeof v === "number")
      .reverse();
  } catch {
    return [];
  }
}

function getPeriodStart(period: string): Date {
  const now = new Date();
  switch (period) {
    case "1m":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "3m":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "6m":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "1y":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case "5y":
      return new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    default:
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
}

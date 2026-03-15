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

const BASE = "https://query1.finance.yahoo.com";
const HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" };

async function yfetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
  if (!res.ok) throw new Error(`Yahoo Finance API error: ${res.status}`);
  return res.json();
}

export async function searchTickers(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) return [];
  try {
    const data = await yfetch<any>(
      `/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0`
    );
    return (data.quotes || [])
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
    const data = await yfetch<any>(`/v8/finance/chart/${symbol}?interval=1d&range=1d`);
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    if (!meta || !meta.symbol) return null;

    // Get additional data from quoteSummary
    const summary = await yfetch<any>(
      `/v10/finance/quoteSummary/${symbol}?modules=price,defaultKeyStatistics,summaryDetail,assetProfile`
    ).catch(() => null);

    const price = summary?.quoteSummary?.result?.[0]?.price || {};
    const detail = summary?.quoteSummary?.result?.[0]?.summaryDetail || {};
    const stats = summary?.quoteSummary?.result?.[0]?.defaultKeyStatistics || {};
    const profile = summary?.quoteSummary?.result?.[0]?.assetProfile || {};

    return {
      symbol: meta.symbol,
      shortName: price.shortName || meta.shortName || meta.symbol,
      longName: price.longName || meta.longName || meta.shortName || meta.symbol,
      currency: meta.currency || "USD",
      regularMarketPrice: meta.regularMarketPrice || 0,
      regularMarketChange: meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose || 0),
      regularMarketChangePercent: meta.previousClose
        ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100
        : 0,
      regularMarketPreviousClose: meta.previousClose || meta.chartPreviousClose || 0,
      regularMarketOpen: detail.regularMarketOpen || meta.regularMarketPrice || 0,
      regularMarketDayHigh: detail.regularMarketDayHigh || 0,
      regularMarketDayLow: detail.regularMarketDayLow || 0,
      regularMarketVolume: detail.regularMarketVolume || 0,
      marketCap: detail.marketCap?.raw || meta.marketCap || 0,
      fiftyTwoWeekLow: detail.fiftyTwoWeekLow || 0,
      fiftyTwoWeekHigh: detail.fiftyTwoWeekHigh || 0,
      fiftyDayAverage: detail.fiftyDayAverage || 0,
      twoHundredDayAverage: detail.twoHundredDayAverage || 0,
      sharesOutstanding: stats.sharesOutstanding?.raw || meta.sharesOutstanding || 0,
      trailingPE: detail.trailingPE?.raw ?? detail.trailingPE ?? null,
      forwardPE: detail.forwardPE?.raw ?? detail.forwardPE ?? null,
      priceToBook: detail.priceToBook?.raw ?? detail.priceToBook ?? null,
      dividendYield: detail.dividendYield?.raw ?? detail.dividendYield ?? null,
      beta: stats.beta?.raw ?? stats.beta ?? null,
      sector: profile.sector || "",
      industry: profile.industry || "",
    };
  } catch {
    return null;
  }
}

export async function getKeyRatios(symbol: string): Promise<KeyRatios | null> {
  try {
    const data = await yfetch<any>(
      `/v10/finance/quoteSummary/${symbol}?modules=financialData,defaultKeyStatistics,summaryDetail`
    );
    const result = data.quoteSummary?.result?.[0];
    if (!result) return null;

    const fin = result.financialData || {};
    const stats = result.defaultKeyStatistics || {};
    const detail = result.summaryDetail || {};

    const raw = (v: any) => v?.raw ?? v ?? null;

    return {
      trailingPE: raw(detail.trailingPE),
      forwardPE: raw(detail.forwardPE),
      pegRatio: raw(stats.pegRatio),
      priceToBook: raw(detail.priceToBook),
      priceToSales: raw(stats.priceToSalesTrailing12Months),
      evToEbitda: raw(stats.enterpriseToEbitda),
      evToRevenue: raw(stats.enterpriseToRevenue),
      profitMargin: raw(fin.profitMargins),
      operatingMargin: raw(fin.operatingMargins),
      returnOnEquity: raw(fin.returnOnEquity),
      returnOnAssets: raw(fin.returnOnAssets),
      currentRatio: raw(fin.currentRatio),
      quickRatio: raw(fin.quickRatio),
      debtToEquity: raw(fin.debtToEquity),
      interestCoverage: raw(stats.interestCoverage),
      dividendYield: raw(detail.dividendYield),
      payoutRatio: raw(detail.payoutRatio),
      revenueGrowth: raw(fin.revenueGrowth),
      earningsGrowth: raw(fin.earningsGrowth),
      freeCashFlow: raw(fin.freeCashflow),
      totalCash: raw(fin.totalCash),
      totalDebt: raw(fin.totalDebt),
    };
  } catch {
    return null;
  }
}

export async function getBalanceSheet(symbol: string): Promise<BalanceSheet | null> {
  try {
    const data = await yfetch<any>(
      `/v10/finance/quoteSummary/${symbol}?modules=balanceSheetHistory,balanceSheetHistoryQuarterly`
    );
    const result = data.quoteSummary?.result?.[0];
    if (!result) return null;

    const mapItem = (item: any): BalanceSheetItem => ({
      date: item.endDate?.fmt || "",
      totalAssets: item.totalAssets?.raw || 0,
      totalLiabilities: item.totalLiab?.raw || 0,
      totalEquity: item.totalStockholderEquity?.raw || 0,
      totalCash: item.cash?.raw || 0,
      totalDebt: item.longTermDebt?.raw || 0,
      currentAssets: item.totalCurrentAssets?.raw || 0,
      currentLiabilities: item.totalCurrentLiabilities?.raw || 0,
      longTermDebt: item.longTermDebt?.raw || 0,
      goodwill: item.goodWill?.raw || 0,
      intangibleAssets: item.intangibleAssets?.raw || 0,
    });

    const annual = (result.balanceSheetHistory?.balanceSheetStatements || []).map(mapItem);
    const quarterly = (result.balanceSheetHistoryQuarterly?.balanceSheetStatements || []).map(mapItem);

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
    const rangeMap: Record<string, string> = {
      "1m": "1mo",
      "3m": "3mo",
      "6m": "6mo",
      "1y": "1y",
      "5y": "5y",
    };
    const range = rangeMap[period] || "1y";

    const data = await yfetch<any>(
      `/v8/finance/chart/${symbol}?interval=1d&range=${range}`
    );
    const result = data.chart?.result?.[0];
    if (!result) return [];

    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0];

    return timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString().split("T")[0],
      open: quote?.open?.[i] || 0,
      high: quote?.high?.[i] || 0,
      low: quote?.low?.[i] || 0,
      close: quote?.close?.[i] || 0,
      volume: quote?.volume?.[i] || 0,
    }));
  } catch {
    return [];
  }
}

export async function getNews(symbol: string): Promise<NewsItem[]> {
  try {
    const data = await yfetch<any>(
      `/v1/finance/search?q=${symbol}&newsCount=10`
    );
    return (data.news || []).map((item: any) => ({
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
    const profile = await yfetch<any>(
      `/v10/finance/quoteSummary/${symbol}?modules=assetProfile`
    );
    const industry = profile.quoteSummary?.result?.[0]?.assetProfile?.industry || "";
    if (!industry) return [];

    const search = await yfetch<any>(
      `/v1/finance/search?q=${encodeURIComponent(industry)}&quotesCount=10&newsCount=0`
    );
    const peerSymbols = (search.quotes || [])
      .filter((q: any) => q.symbol && q.symbol !== symbol && q.quoteType === "EQUITY")
      .map((q: any) => q.symbol)
      .slice(0, 5);

    if (peerSymbols.length === 0) return [];

    const peerData = await Promise.all(
      peerSymbols.map(async (sym: string) => {
        try {
          const [chartData, summaryData] = await Promise.all([
            yfetch<any>(`/v8/finance/chart/${sym}?interval=1d&range=1d`),
            yfetch<any>(`/v10/finance/quoteSummary/${sym}?modules=financialData,summaryDetail`),
          ]);

          const meta = chartData.chart?.result?.[0]?.meta;
          const result = summaryData.quoteSummary?.result?.[0];
          if (!meta || !result) return null;

          const fin = result.financialData || {};
          const detail = result.summaryDetail || {};
          const raw = (v: any) => v?.raw ?? v ?? null;

          return {
            symbol: meta.symbol,
            shortName: meta.shortName || meta.symbol,
            regularMarketPrice: meta.regularMarketPrice || 0,
            marketCap: detail.marketCap?.raw || meta.marketCap || 0,
            trailingPE: raw(detail.trailingPE),
            forwardPE: raw(detail.forwardPE),
            priceToBook: raw(detail.priceToBook),
            returnOnEquity: raw(fin.returnOnEquity),
            profitMargin: raw(fin.profitMargins),
            debtToEquity: raw(fin.debtToEquity),
            revenueGrowth: raw(fin.revenueGrowth),
            dividendYield: raw(detail.dividendYield),
          };
        } catch {
          return null;
        }
      })
    );

    return peerData.filter(Boolean) as PeerData[];
  } catch {
    return [];
  }
}

export async function getFCFHistory(symbol: string): Promise<number[]> {
  try {
    const data = await yfetch<any>(
      `/v10/finance/quoteSummary/${symbol}?modules=cashflowStatementHistory`
    );
    const statements =
      data.quoteSummary?.result?.[0]?.cashflowStatementHistory?.cashflowStatements || [];
    return statements
      .map((s: any) => (s.totalCashFromOperatingActivities?.raw || 0) - (s.capitalExpenditures?.raw || 0))
      .filter((v: any) => typeof v === "number")
      .reverse();
  } catch {
    return [];
  }
}

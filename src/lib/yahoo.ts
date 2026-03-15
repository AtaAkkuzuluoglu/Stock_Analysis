import type {
  StockQuote,
  KeyRatios,
  BalanceSheet,
  HistoricalPrice,
  NewsItem,
  PeerData,
  SearchResult,
} from "./types";

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
const BASE = "https://query1.finance.yahoo.com";

async function yfetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": UA },
    next: { revalidate: 60 },
  });
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
    const [chartData, searchData] = await Promise.all([
      yfetch<any>(`/v8/finance/chart/${symbol}?interval=1d&range=1y`),
      yfetch<any>(`/v1/finance/search?q=${symbol}&quotesCount=1&newsCount=0`).catch(() => null),
    ]);

    const meta = chartData.chart?.result?.[0]?.meta;
    if (!meta?.symbol) return null;

    const searchQuote = searchData?.quotes?.[0] || {};
    const industry = searchQuote.industry || "";
    const sector = searchQuote.sectorDisp || searchQuote.sector || "";

    // Calculate moving averages from historical data
    const quotes = chartData.chart?.result?.[0]?.indicators?.quote?.[0];
    const closes = (quotes?.close || []).filter((c: any) => c != null);
    let fiftyDayAvg = 0;
    let twoHundredDayAvg = 0;
    if (closes.length >= 50) {
      const last50 = closes.slice(-50);
      fiftyDayAvg = last50.reduce((a: number, b: number) => a + b, 0) / last50.length;
    }
    if (closes.length >= 200) {
      const last200 = closes.slice(-200);
      twoHundredDayAvg = last200.reduce((a: number, b: number) => a + b, 0) / last200.length;
    }

    const prevClose = meta.chartPreviousClose || 0;
    const change = prevClose ? meta.regularMarketPrice - prevClose : 0;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;

    return {
      symbol: meta.symbol,
      shortName: meta.shortName || meta.symbol,
      longName: meta.longName || meta.shortName || meta.symbol,
      currency: meta.currency || "USD",
      regularMarketPrice: meta.regularMarketPrice || 0,
      regularMarketChange: change,
      regularMarketChangePercent: changePercent,
      regularMarketPreviousClose: prevClose,
      regularMarketOpen: meta.regularMarketPrice || 0,
      regularMarketDayHigh: meta.regularMarketDayHigh || 0,
      regularMarketDayLow: meta.regularMarketDayLow || 0,
      regularMarketVolume: meta.regularMarketVolume || 0,
      marketCap: 0,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
      fiftyDayAverage: fiftyDayAvg,
      twoHundredDayAverage: twoHundredDayAvg,
      sharesOutstanding: 0,
      trailingPE: null,
      forwardPE: null,
      priceToBook: null,
      dividendYield: null,
      beta: null,
      sector,
      industry,
    };
  } catch {
    return null;
  }
}

export async function getKeyRatios(_symbol: string): Promise<KeyRatios | null> {
  return null;
}

export async function getBalanceSheet(_symbol: string): Promise<BalanceSheet | null> {
  return null;
}

export async function getHistoricalPrices(
  symbol: string,
  period: string = "1y"
): Promise<HistoricalPrice[]> {
  try {
    const rangeMap: Record<string, string> = {
      "1m": "1mo", "3m": "3mo", "6m": "6mo", "1y": "1y", "5y": "5y",
    };
    const data = await yfetch<any>(
      `/v8/finance/chart/${symbol}?interval=1d&range=${rangeMap[period] || "1y"}`
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
    const searchData = await yfetch<any>(
      `/v1/finance/search?q=${symbol}&quotesCount=1&newsCount=0`
    );
    const industry = searchData?.quotes?.[0]?.industry || "";
    if (!industry) return [];

    const peerSearch = await yfetch<any>(
      `/v1/finance/search?q=${encodeURIComponent(industry)}&quotesCount=10&newsCount=0`
    );
    const peerSymbols = (peerSearch.quotes || [])
      .filter((q: any) => q.symbol && q.symbol !== symbol && q.quoteType === "EQUITY")
      .map((q: any) => q.symbol)
      .slice(0, 5);

    if (peerSymbols.length === 0) return [];

    const peerData = await Promise.all(
      peerSymbols.map(async (sym: string) => {
        try {
          const chartData = await yfetch<any>(`/v8/finance/chart/${sym}?interval=1d&range=1d`);
          const meta = chartData.chart?.result?.[0]?.meta;
          if (!meta) return null;
          return {
            symbol: meta.symbol,
            shortName: meta.shortName || meta.symbol,
            regularMarketPrice: meta.regularMarketPrice || 0,
            marketCap: 0,
            trailingPE: null,
            forwardPE: null,
            priceToBook: null,
            returnOnEquity: null,
            profitMargin: null,
            debtToEquity: null,
            revenueGrowth: null,
            dividendYield: null,
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

export async function getFCFHistory(_symbol: string): Promise<number[]> {
  return [];
}

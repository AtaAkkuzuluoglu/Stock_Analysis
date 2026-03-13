// Stock quote data
export interface StockQuote {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  marketCap: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  fiftyDayAverage: number;
  twoHundredDayAverage: number;
  sharesOutstanding: number;
  trailingPE: number | null;
  forwardPE: number | null;
  priceToBook: number | null;
  dividendYield: number | null;
  beta: number | null;
  sector: string;
  industry: string;
}

// Key financial ratios
export interface KeyRatios {
  trailingPE: number | null;
  forwardPE: number | null;
  pegRatio: number | null;
  priceToBook: number | null;
  priceToSales: number | null;
  evToEbitda: number | null;
  evToRevenue: number | null;
  profitMargin: number | null;
  operatingMargin: number | null;
  returnOnEquity: number | null;
  returnOnAssets: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  debtToEquity: number | null;
  interestCoverage: number | null;
  dividendYield: number | null;
  payoutRatio: number | null;
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  freeCashFlow: number | null;
  totalCash: number | null;
  totalDebt: number | null;
}

// Balance sheet data
export interface BalanceSheetItem {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalCash: number;
  totalDebt: number;
  currentAssets: number;
  currentLiabilities: number;
  longTermDebt: number;
  goodwill: number;
  intangibleAssets: number;
}

export interface BalanceSheet {
  annual: BalanceSheetItem[];
  quarterly: BalanceSheetItem[];
}

// Historical price data
export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// News item
export interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: string;
  thumbnail?: string;
  summary?: string;
}

// Peer comparison
export interface PeerData {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  marketCap: number;
  trailingPE: number | null;
  forwardPE: number | null;
  priceToBook: number | null;
  returnOnEquity: number | null;
  profitMargin: number | null;
  debtToEquity: number | null;
  revenueGrowth: number | null;
  dividendYield: number | null;
}

// DCF valuation result
export interface DCFResult {
  intrinsicValue: number;
  currentPrice: number;
  marginOfSafety: number;
  projectedFCF: number[];
  terminalValue: number;
  presentValue: number;
  discountRate: number;
  terminalGrowthRate: number;
  growthRate: number;
  sharesOutstanding: number;
  error?: string;
}

// Recommendation score
export type Recommendation =
  | "STRONG_BUY"
  | "BUY"
  | "HOLD"
  | "SELL"
  | "STRONG_SELL";

export interface ScoringResult {
  overallScore: number;
  recommendation: Recommendation;
  dcfScore: number;
  healthScore: number;
  profitabilityScore: number;
  valuationScore: number;
  details: string[];
}

// Comprehensive stock data
export interface StockData {
  quote: StockQuote;
  ratios: KeyRatios;
  balanceSheet: BalanceSheet;
  dcf: DCFResult;
  score: ScoringResult;
  peers: PeerData[];
  news: NewsItem[];
  historicalPrices: HistoricalPrice[];
}

// Search result
export interface SearchResult {
  symbol: string;
  shortname: string;
  longname: string;
  exchange: string;
  typeDisp: string;
  quoteType: string;
  score: number;
}

// AI explanation request/response
export interface AIExplainRequest {
  ticker: string;
  data: {
    quote: StockQuote;
    ratios: KeyRatios;
    dcf: DCFResult;
    score: ScoringResult;
  };
  question?: string;
}

export interface AIExplainResponse {
  explanation: string;
}

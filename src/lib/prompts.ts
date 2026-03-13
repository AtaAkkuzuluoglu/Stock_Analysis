import type { StockQuote, KeyRatios, DCFResult, ScoringResult } from "./types";

export const SYSTEM_PROMPT = `You are a senior equity analyst providing clear, concise stock analysis. You explain complex financial concepts in plain language that retail investors can understand. You are objective and balanced — you highlight both strengths and weaknesses. You never give direct financial advice (buy/sell) but instead present the facts and let investors decide.

Your analysis should:
- Be 3-5 paragraphs
- Explain the company's financial health in simple terms
- Interpret key ratios and what they mean for investors
- Discuss the valuation (is the stock cheap/expensive vs fair value?)
- Mention notable risks or catalysts
- Use a professional but accessible tone

Do NOT use markdown headers or bullet points. Write flowing paragraphs.`;

export function buildUserPrompt(data: {
  quote: StockQuote;
  ratios: KeyRatios;
  dcf: DCFResult;
  score: ScoringResult;
}): string {
  const { quote, ratios, dcf, score } = data;

  return `Analyze ${quote.longName || quote.shortName} (${quote.symbol}).

**Current Price:** $${quote.regularMarketPrice.toFixed(2)} (${quote.regularMarketChangePercent > 0 ? "+" : ""}${quote.regularMarketChangePercent.toFixed(2)}%)
**Market Cap:** $${(quote.marketCap / 1e9).toFixed(2)}B
**Sector:** ${quote.sector || "N/A"} | **Industry:** ${quote.industry || "N/A"}

**Key Ratios:**
- P/E (trailing): ${ratios.trailingPE?.toFixed(2) || "N/A"}
- P/E (forward): ${ratios.forwardPE?.toFixed(2) || "N/A"}
- P/B: ${ratios.priceToBook?.toFixed(2) || "N/A"}
- P/S: ${ratios.priceToSales?.toFixed(2) || "N/A"}
- EV/EBITDA: ${ratios.evToEbitda?.toFixed(2) || "N/A"}
- ROE: ${ratios.returnOnEquity ? (ratios.returnOnEquity * 100).toFixed(1) + "%" : "N/A"}
- Profit Margin: ${ratios.profitMargin ? (ratios.profitMargin * 100).toFixed(1) + "%" : "N/A"}
- Operating Margin: ${ratios.operatingMargin ? (ratios.operatingMargin * 100).toFixed(1) + "%" : "N/A"}
- Current Ratio: ${ratios.currentRatio?.toFixed(2) || "N/A"}
- Debt/Equity: ${ratios.debtToEquity?.toFixed(1) || "N/A"}
- Revenue Growth: ${ratios.revenueGrowth ? (ratios.revenueGrowth * 100).toFixed(1) + "%" : "N/A"}
- Free Cash Flow: $${ratios.freeCashFlow ? (ratios.freeCashFlow / 1e9).toFixed(2) + "B" : "N/A"}

**DCF Fair Value:**
${dcf.error ? `- ${dcf.error}` : `- Intrinsic Value: $${dcf.intrinsicValue.toFixed(2)}
- Current Price: $${dcf.currentPrice.toFixed(2)}
- Margin of Safety: ${dcf.marginOfSafety.toFixed(1)}%
- Growth Rate Used: ${dcf.growthRate}%
- Discount Rate: ${(dcf.discountRate * 100).toFixed(0)}%`}

**Scoring:**
- Overall Score: ${score.overallScore}/100 → ${score.recommendation}
- DCF Score: ${score.dcfScore}/100
- Financial Health Score: ${score.healthScore}/100
- Profitability Score: ${score.profitabilityScore}/100
- Valuation Score: ${score.valuationScore}/100

Please provide a comprehensive but concise analysis of this stock.`;
}

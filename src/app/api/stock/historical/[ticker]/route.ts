import { NextRequest, NextResponse } from "next/server";
import { getHistoricalPrices } from "@/lib/yahoo";

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase();
  const period = request.nextUrl.searchParams.get("period") || "1y";

  try {
    const prices = await getHistoricalPrices(ticker, period);
    return NextResponse.json({ prices });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch historical prices" },
      { status: 500 }
    );
  }
}

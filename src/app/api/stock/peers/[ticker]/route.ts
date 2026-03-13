import { NextRequest, NextResponse } from "next/server";
import { getPeers } from "@/lib/yahoo";

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase();

  try {
    const peers = await getPeers(ticker);
    return NextResponse.json({ peers });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch peers" },
      { status: 500 }
    );
  }
}

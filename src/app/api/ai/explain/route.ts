import { NextRequest, NextResponse } from "next/server";
import { chatCompletionStream } from "@/lib/openrouter";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, ticker, data, question } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is required" },
        { status: 400 }
      );
    }

    if (!ticker || !data) {
      return NextResponse.json(
        { error: "Ticker and data are required" },
        { status: 400 }
      );
    }

    const userPrompt = question
      ? `About ${ticker}: ${question}\n\nContext:\n${buildUserPrompt(data)}`
      : buildUserPrompt(data);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await chatCompletionStream(
            [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            apiKey,
            (chunk) => {
              controller.enqueue(encoder.encode(chunk));
            }
          );
          controller.close();
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(`Error: ${error.message || "Failed to get AI response"}`)
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}

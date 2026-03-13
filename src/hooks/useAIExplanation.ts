import { useState, useCallback } from "react";
import type { AIExplainRequest } from "@/lib/types";

export function useAIExplanation() {
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const explain = useCallback(async (request: AIExplainRequest) => {
    const apiKey =
      typeof window !== "undefined"
        ? localStorage.getItem("openrouter_api_key")
        : null;

    if (!apiKey) {
      setError(
        "OpenRouter API key not found. Please add your API key in Settings."
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setExplanation("");

    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...request, apiKey }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to get AI explanation");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        setExplanation((prev) => prev + text);
      }
    } catch (err: any) {
      setError(err.message || "Failed to get explanation");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setExplanation("");
    setError(null);
    setIsLoading(false);
  }, []);

  return { explanation, isLoading, error, explain, reset };
}

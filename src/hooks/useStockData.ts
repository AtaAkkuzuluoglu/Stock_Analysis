import useSWR from "swr";
import type { StockData } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useStockData(ticker: string) {
  const { data, error, isLoading, mutate } = useSWR<StockData>(
    ticker ? `/api/stock/${ticker}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

export function useHistoricalPrices(ticker: string, period: string = "1y") {
  const { data, error, isLoading } = useSWR(
    ticker
      ? `/api/stock/historical/${ticker}?period=${period}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    data: data?.prices || [],
    error,
    isLoading,
  };
}

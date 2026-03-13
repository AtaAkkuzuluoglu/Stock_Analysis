import SearchBar from "@/components/search/SearchBar";

export default function Home() {
  const popularTickers = [
    { symbol: "AAPL", name: "Apple" },
    { symbol: "MSFT", name: "Microsoft" },
    { symbol: "GOOGL", name: "Google" },
    { symbol: "AMZN", name: "Amazon" },
    { symbol: "TSLA", name: "Tesla" },
    { symbol: "META", name: "Meta" },
    { symbol: "NVDA", name: "NVIDIA" },
    { symbol: "JPM", name: "JPMorgan" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Analyze Any Stock
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Get financial ratios, DCF fair value, peer comparison, and
          AI-powered explanations — all in one place.
        </p>
      </div>

      {/* Search */}
      <div className="w-full max-w-2xl mb-8">
        <SearchBar />
      </div>

      {/* Popular tickers */}
      <div className="text-center">
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">
          Popular stocks:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {popularTickers.map((t) => (
            <a
              key={t.symbol}
              href={`/stock/${t.symbol}`}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <span className="font-semibold">{t.symbol}</span>
              <span className="text-gray-400 dark:text-gray-500 ml-1">
                {t.name}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-4xl w-full">
        <FeatureCard
          title="Financial Ratios"
          description="Comprehensive valuation, profitability, and health metrics with plain-language explanations."
        />
        <FeatureCard
          title="Fair Value (DCF)"
          description="Discounted cash flow model estimates intrinsic value and margin of safety."
        />
        <FeatureCard
          title="AI Analysis"
          description="Powered by OpenRouter Hunter model — get natural language explanations of complex data."
        />
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}

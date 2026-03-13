"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import type { SearchResult } from "@/lib/types";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    async function search() {
      if (!debouncedQuery || debouncedQuery.length < 1) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/stock/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    search();
  }, [debouncedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigateToTicker(symbol: string) {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/stock/${symbol}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        navigateToTicker(query.trim().toUpperCase());
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => (i < results.length - 1 ? i + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          navigateToTicker(results[selectedIndex].symbol);
        } else if (query.trim()) {
          navigateToTicker(query.trim().toUpperCase());
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search ticker (e.g., AAPL, MSFT, GOOGL)..."
          className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {results.map((result, index) => (
            <button
              key={result.symbol}
              onClick={() => navigateToTicker(result.symbol)}
              className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                index === selectedIndex
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : ""
              }`}
            >
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {result.symbol}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {result.shortname || result.longname}
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 uppercase">
                {result.exchange}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen &&
        !isLoading &&
        results.length === 0 &&
        debouncedQuery.length >= 1 && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 text-center text-gray-500 dark:text-gray-400">
            No results found for &quot;{debouncedQuery}&quot;
          </div>
        )}
    </div>
  );
}

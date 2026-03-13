"use client";

import React from "react";
import type { NewsItem } from "@/lib/types";
import Card from "@/components/ui/Card";

interface NewsCardProps {
  news: NewsItem[];
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function NewsCard({ news }: NewsCardProps) {
  if (!news || news.length === 0) {
    return (
      <Card title={`News & Analysis`}>
        <p className="text-gray-500 dark:text-gray-400">
          No recent news available.
        </p>
      </Card>
    );
  }

  return (
    <Card title={`News & Analysis`}>
      <div className="space-y-4">
        {news.slice(0, 8).map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
          >
            <div className="flex gap-3">
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.publisher}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatTimeAgo(item.providerPublishTime)}
                  </span>
                </div>
                {item.summary && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {item.summary}
                  </p>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
}

"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "red" | "yellow" | "blue" | "gray";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantStyles = {
  green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  yellow:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export default function Badge({
  children,
  variant = "gray",
  size = "md",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { APP_CONFIG } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(amount: number | string | { toString(): string }): string {
  const num = typeof amount === "number" ? amount : parseFloat(amount.toString());
  if (isNaN(num)) return "$0.00";
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatUsd(amount: number | string | { toString(): string }): string {
  const num = typeof amount === "number" ? amount : parseFloat(amount.toString());
  if (isNaN(num)) return "$0.00";
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatUsdt(amount: number | string | { toString(): string }): string {
  const num = typeof amount === "number" ? amount : parseFloat(amount.toString());
  if (isNaN(num)) return "0.00 USDT";
  return `${num.toFixed(4)} USDT`;
}

export function inrToUsdt(inrAmount: number): number {
  return Number((inrAmount / APP_CONFIG.usdtToInrRate).toFixed(4));
}

export function usdtToInr(usdtAmount: number): number {
  return Number((usdtAmount * APP_CONFIG.usdtToInrRate).toFixed(2));
}

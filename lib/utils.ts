import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse URL hash fragment into an object with key-value pairs
 * @param hash - Hash string from window.location.hash (with or without # character)
 * @returns Object with key-value pairs parsed from the hash
 */
export function parseHashParams(hash: string): Record<string, string> {
  // Remove the leading # if present
  const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
  
  if (!cleanHash) return {};
  
  // Parse the hash into key-value pairs
  const params: Record<string, string> = {};
  cleanHash.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[key] = decodeURIComponent(value);
    }
  });
  
  return params;
}

/**
 * Extract hash parameters from the browser URL
 * Only works client-side
 */
export function getHashParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  return parseHashParams(window.location.hash);
}

/**
 * Format document type from snake_case to Title Case
 * Converts strings like "product_safety_assessment" to "Product Safety Assessment"
 * @param type - The snake_case string to format
 * @returns Formatted string in Title Case
 */
export function formatDocumentType(type: string): string {
  if (!type) return '';
  
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

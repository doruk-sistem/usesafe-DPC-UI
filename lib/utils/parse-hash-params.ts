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
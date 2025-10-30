/**
 * IP Geolocation Utilities
 * 
 * Get location information from IP addresses using ip-api.com (free, no API key required)
 * Rate limit: 45 requests per minute
 */

interface LocationData {
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
}

interface IPApiResponse {
  status: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  timezone?: string;
  message?: string;
}

/**
 * Get location from IP address using ip-api.com
 * Returns formatted location string (e.g., "San Francisco, CA, United States")
 */
export async function getLocationFromIP(ipAddress: string): Promise<string | null> {
  try {
    // Skip private/local IPs
    if (isPrivateIP(ipAddress)) {
      return 'Local Network';
    }

    // Call ip-api.com (free, no API key needed)
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,countryCode,region,regionName,city,timezone,message`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!response.ok) {
      console.error('IP geolocation API error:', response.status);
      return null;
    }

    const data: IPApiResponse = await response.json();

    if (data.status === 'fail') {
      console.error('IP geolocation failed:', data.message);
      return null;
    }

    // Format location string
    const parts: string[] = [];
    
    if (data.city) parts.push(data.city);
    if (data.regionName) parts.push(data.regionName);
    if (data.country) parts.push(data.country);

    return parts.length > 0 ? parts.join(', ') : null;
  } catch (error) {
    console.error('Failed to get location from IP:', error);
    return null;
  }
}

/**
 * Get detailed location data from IP address
 */
export async function getDetailedLocationFromIP(ipAddress: string): Promise<LocationData | null> {
  try {
    if (isPrivateIP(ipAddress)) {
      return {
        city: 'Local',
        region: 'Network',
        country: 'Private',
        countryCode: 'XX',
      };
    }

    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,countryCode,region,regionName,city,timezone,message`, {
      next: { revalidate: 86400 }
    });

    if (!response.ok) {
      return null;
    }

    const data: IPApiResponse = await response.json();

    if (data.status === 'fail') {
      return null;
    }

    return {
      city: data.city,
      region: data.regionName,
      country: data.country,
      countryCode: data.countryCode,
      timezone: data.timezone,
    };
  } catch (error) {
    console.error('Failed to get detailed location from IP:', error);
    return null;
  }
}

/**
 * Check if IP address is private/local
 */
function isPrivateIP(ip: string): boolean {
  // IPv4 private ranges
  const privateRanges = [
    /^127\./,          // Loopback
    /^10\./,           // Private class A
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Private class B
    /^192\.168\./,     // Private class C
    /^::1$/,           // IPv6 loopback
    /^fe80:/,          // IPv6 link-local
    /^fc00:/,          // IPv6 unique local
  ];

  return privateRanges.some(range => range.test(ip));
}

/**
 * Get client IP address from request headers
 * Handles various proxy headers (Cloudflare, Vercel, etc.)
 */
export function getClientIP(headers: Headers): string | null {
  // Try various headers in order of preference
  const ipHeaders = [
    'cf-connecting-ip',      // Cloudflare
    'x-real-ip',             // Nginx
    'x-forwarded-for',       // Standard proxy header
    'x-vercel-forwarded-for', // Vercel
  ];

  for (const header of ipHeaders) {
    const value = headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(',')[0].trim();
      if (ip) return ip;
    }
  }

  return null;
}

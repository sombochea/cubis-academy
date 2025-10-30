/**
 * Browser Fingerprinting Utility
 * Generates a unique, persistent device identifier stored in localStorage
 * This survives browser restarts and is used to identify the same device
 */

const DEVICE_ID_KEY = "cubis_device_id";
const DEVICE_INFO_KEY = "cubis_device_info";

interface DeviceInfo {
  deviceId: string;
  fingerprint: string;
  userAgent: string;
  screen: string;
  timezone: string;
  language: string;
  platform: string;
  createdAt: string;
  lastSeen: string;
}

/**
 * Generate a unique device fingerprint based on browser characteristics
 * This creates a hash of various browser properties
 */
function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    !!window.indexedDB,
  ];

  // Create a simple hash
  const str = components.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Generate a random UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a persistent device ID
 * This ID is stored in localStorage and survives browser restarts
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") {
    // Server-side: return a temporary ID
    return "server-" + Date.now();
  }

  try {
    // Try to get existing device ID
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);

    if (!deviceId) {
      // Generate new device ID
      deviceId = generateUUID();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);

      // Store device info
      const deviceInfo: DeviceInfo = {
        deviceId,
        fingerprint: generateFingerprint(),
        userAgent: navigator.userAgent,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      };

      localStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));

      console.log("🆔 New device ID created:", deviceId);
    } else {
      // Update last seen
      const deviceInfoStr = localStorage.getItem(DEVICE_INFO_KEY);
      if (deviceInfoStr) {
        const deviceInfo: DeviceInfo = JSON.parse(deviceInfoStr);
        deviceInfo.lastSeen = new Date().toISOString();
        localStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
      }
    }

    return deviceId;
  } catch (error) {
    console.error("Failed to get/create device ID:", error);
    // Fallback to session-based ID
    return "fallback-" + Date.now();
  }
}

/**
 * Get device information
 */
export function getDeviceInfo(): DeviceInfo | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const deviceInfoStr = localStorage.getItem(DEVICE_INFO_KEY);
    if (deviceInfoStr) {
      return JSON.parse(deviceInfoStr);
    }
  } catch (error) {
    console.error("Failed to get device info:", error);
  }

  return null;
}

/**
 * Get browser fingerprint (without device ID)
 * This can be used to detect if the same browser is being used
 */
export function getBrowserFingerprint(): string {
  if (typeof window === "undefined") {
    return "server";
  }

  return generateFingerprint();
}

/**
 * Clear device ID (for testing or logout)
 */
export function clearDeviceId(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(DEVICE_ID_KEY);
    localStorage.removeItem(DEVICE_INFO_KEY);
    console.log("🗑️ Device ID cleared");
  } catch (error) {
    console.error("Failed to clear device ID:", error);
  }
}

/**
 * Check if device ID exists
 */
export function hasDeviceId(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return !!localStorage.getItem(DEVICE_ID_KEY);
  } catch (error) {
    return false;
  }
}

/**
 * Get device name (for display purposes)
 */
export function getDeviceName(): string {
  if (typeof window === "undefined") {
    return "Server";
  }

  const ua = navigator.userAgent;

  // Detect device type
  if (/mobile/i.test(ua)) {
    if (/iPad/i.test(ua)) return "iPad";
    if (/iPhone/i.test(ua)) return "iPhone";
    if (/Android/i.test(ua)) return "Android Phone";
    return "Mobile Device";
  }

  if (/tablet/i.test(ua)) {
    return "Tablet";
  }

  // Desktop
  if (/Mac/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows PC";
  if (/Linux/i.test(ua)) return "Linux PC";

  return "Desktop";
}

/**
 * Get comprehensive device information for session tracking
 */
export function getDeviceInfoForSession() {
  return {
    deviceId: getDeviceId(),
    deviceName: getDeviceName(),
    fingerprint: getBrowserFingerprint(),
    userAgent: typeof window !== "undefined" ? navigator.userAgent : "",
    screen:
      typeof window !== "undefined" ? `${screen.width}x${screen.height}` : "",
    timezone:
      typeof window !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "",
    language: typeof window !== "undefined" ? navigator.language : "",
  };
}

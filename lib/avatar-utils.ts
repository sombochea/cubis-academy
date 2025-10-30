/**
 * Avatar and Profile Background Utilities
 * Generates beautiful, consistent colors based on user data
 */

// Modern gradient combinations for profile backgrounds
// Inspired by popular design systems (Stripe, Linear, Vercel)
const gradientBackgrounds = [
  'from-blue-400 via-indigo-400 to-purple-400', // Blue to purple
  'from-cyan-400 via-blue-400 to-indigo-400', // Cyan to indigo
  'from-violet-400 via-purple-400 to-fuchsia-400', // Violet to fuchsia
  'from-sky-400 via-blue-400 to-cyan-400', // Sky to cyan
  'from-indigo-400 via-blue-400 to-cyan-400', // Indigo to cyan
  'from-blue-500 via-indigo-500 to-purple-500', // Deeper blue to purple
  'from-teal-400 via-cyan-400 to-blue-400', // Teal to blue
  'from-purple-400 via-pink-400 to-rose-400', // Purple to rose
  'from-indigo-500 via-purple-500 to-pink-500', // Deep indigo to pink
  'from-cyan-500 via-blue-500 to-indigo-500', // Deep cyan to indigo
];

// Avatar gradient combinations (brand-aligned, more vibrant for small avatars)
const avatarGradients = [
  'from-[#007FFF] to-[#17224D]', // Primary brand gradient
  'from-blue-500 to-blue-700',
  'from-indigo-500 to-indigo-700',
  'from-cyan-500 to-cyan-700',
  'from-sky-500 to-sky-700',
  'from-blue-600 to-indigo-700',
  'from-teal-500 to-teal-700',
  'from-purple-500 to-purple-700',
  'from-indigo-600 to-purple-700',
  'from-cyan-600 to-blue-700',
];

/**
 * Generate a consistent hash from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get a consistent gradient background based on user ID or email
 * Same user will always get the same gradient
 */
export function getProfileBackground(userId: string): string {
  const hash = hashString(userId);
  const index = hash % gradientBackgrounds.length;
  return gradientBackgrounds[index];
}

/**
 * Get a consistent avatar gradient based on user ID or email
 * Same user will always get the same gradient
 */
export function getAvatarGradient(userId: string): string {
  const hash = hashString(userId);
  const index = hash % avatarGradients.length;
  return avatarGradients[index];
}

/**
 * Get initials from a name
 */
export function getInitials(name?: string | null): string {
  if (!name) return 'U';
  
  const parts = name.trim().split(' ');
  
  if (parts.length === 1) {
    // Single name: take first 2 characters
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  // Multiple names: take first letter of first and last name
  const firstInitial = parts[0][0];
  const lastInitial = parts[parts.length - 1][0];
  return (firstInitial + lastInitial).toUpperCase();
}

/**
 * Get role-specific gradient (for role badges)
 */
export function getRoleGradient(role?: string | null): string {
  switch (role) {
    case 'admin':
      return 'from-purple-500 to-purple-700';
    case 'teacher':
      return 'from-blue-500 to-blue-700';
    case 'student':
      return 'from-green-500 to-green-700';
    default:
      return 'from-gray-500 to-gray-700';
  }
}

/**
 * Get role label
 */
export function getRoleLabel(role?: string | null): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'teacher':
      return 'Teacher';
    case 'student':
      return 'Student';
    default:
      return 'User';
  }
}

/**
 * Get role icon emoji
 */
export function getRoleIcon(role?: string | null): string {
  switch (role) {
    case 'admin':
      return '👑';
    case 'teacher':
      return '👨‍🏫';
    case 'student':
      return '🎓';
    default:
      return '👤';
  }
}

/**
 * Generate a beautiful pattern overlay for profile backgrounds
 */
export function getPatternOverlay(): string {
  return `
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  `;
}

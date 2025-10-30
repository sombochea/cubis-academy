# Loading States Documentation

## Overview

The application now has comprehensive loading states to provide better user experience during authentication and page transitions.

## Components

### 1. LoadingRedirect Component

**Location**: `components/LoadingRedirect.tsx`

A beautiful animated loading screen shown during authentication and redirects.

**Features**:
- Animated progress bar
- Step-by-step loading indicators
- Role-specific color gradients
- Smooth animations and transitions

**Props**:
- `message?: string` - Custom message to display
- `role?: 'student' | 'teacher' | 'admin'` - User role for color theming

**Usage**:
```tsx
import { LoadingRedirect } from '@/components/LoadingRedirect';

<LoadingRedirect role="student" message="Loading Dashboard" />
```

### 2. Skeleton Loaders

**Location**: `components/ui/skeleton-loader.tsx`

Reusable skeleton components for different page types.

**Components**:
- `Skeleton` - Basic skeleton element
- `DashboardSkeleton` - For dashboard pages
- `ProfileSkeleton` - For profile pages
- `TableSkeleton` - For data tables

**Usage**:
```tsx
import { DashboardSkeleton } from '@/components/ui/skeleton-loader';

export default function Loading() {
  return <DashboardSkeleton />;
}
```

## Loading Pages

### Auth Loading
**Location**: `app/[locale]/(auth)/loading.tsx`

Shown during authentication flows (login, OAuth callback).

### Role-Specific Loading

**Student**: `app/[locale]/(student)/loading.tsx`
**Teacher**: `app/[locale]/(teacher)/loading.tsx`
**Admin**: `app/[locale]/(admin)/loading.tsx`

Each shows a role-specific loading screen with appropriate colors:
- Student: Green gradient
- Teacher: Blue gradient
- Admin: Purple gradient

## Login Flow

### Credentials Login
1. User submits login form
2. `isRedirecting` state set to `true`
3. LoadingRedirect component shown
4. 1.5s delay for smooth animation
5. Redirect to dashboard

### OAuth Login (Google)
1. User clicks "Sign in with Google"
2. `isRedirecting` state set to `true`
3. LoadingRedirect component shown
4. OAuth flow completes
5. Redirect to dashboard

## Implementation Details

### Login Page Updates
- Added `isRedirecting` state
- Shows LoadingRedirect when redirecting
- 1.5s delay for smooth UX

### Session Initialization
- SessionInitializer runs in background
- No UI blocking
- Console logging for debugging

## Best Practices

1. **Always show loading states** for async operations
2. **Use role-specific colors** for better UX
3. **Keep animations smooth** (300ms transitions)
4. **Provide feedback** with step indicators
5. **Don't block too long** (1-2s max for artificial delays)

## Customization

### Colors
Edit `getRoleColor()` in LoadingRedirect.tsx:
```tsx
const getRoleColor = (role?: string) => {
  switch (role) {
    case 'admin':
      return 'from-purple-500 to-pink-500';
    // Add more roles...
  }
};
```

### Steps
Edit `steps` array in LoadingRedirect.tsx:
```tsx
const steps = [
  { label: <Trans>Step 1</Trans>, icon: Loader2 },
  { label: <Trans>Step 2</Trans>, icon: Loader2 },
  // Add more steps...
];
```

## Internationalization

All loading messages are wrapped with `<Trans>` for i18n support.

To add translations:
1. Run `pnpm i18n:extract`
2. Edit `locales/km/messages.po` and `locales/en/messages.po`
3. Run `pnpm i18n:compile`

## Performance

- Loading animations use CSS transforms (GPU accelerated)
- Progress bar updates every 30ms
- Step transitions every 800ms
- Total animation time: ~2.4s

## Accessibility

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast colors
- Clear visual feedback

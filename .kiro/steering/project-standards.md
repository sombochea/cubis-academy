---
inclusion: always
---

# Project Standards

## Tech Stack (Non-Negotiable)

- Next.js 16+ App Router with Server Components (default to server, use 'use client' only when needed)
- TailwindCSS v4+ for styling
- ShadCN UI components (accessible, customizable)
- TanStack Form + Zod for all forms
- TanStack Table v8+ for data tables (with pagination, sorting, filtering)
- Motion 12+ for animations
- PostgreSQL 18+ with Drizzle ORM
- Auth.js v5 beta for authentication
- useSWR for client-side data fetching
- Resend for emails
- Lingui v5+ for internationalization (i18n)
- React Country Flag for flag icons

## Naming Conventions (Critical - Must Follow)

- Database fields: `snake_case` (e.g., `full_name`, `created_at`, `user_id`)
- TypeScript variables/functions: `camelCase` (e.g., `getUserById`, `isLoading`)
- React components: `PascalCase` (e.g., `LoginForm`, `UserProfile`)
- Component files: `PascalCase.tsx` (e.g., `LoginForm.tsx`)
- Non-component files: `kebab-case` (e.g., `auth-utils.ts`, `db-queries.ts`)
- API routes: `kebab-case` (e.g., `route.ts` in `api/user-profile/`)

## TypeScript Rules

- NEVER use `any` type (use `unknown` if type is truly unknown)
- Define explicit return types for functions
- Use Zod schemas for runtime validation, infer TypeScript types from them
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use strict mode (already configured in tsconfig.json)

## Component Architecture

- Default to Server Components (no 'use client' directive)
- Use 'use client' only for: forms, interactive UI, hooks (useState, useEffect, useSWR)
- Keep components small (<150 lines) and single-purpose
- Extract reusable logic into custom hooks or utilities
- Use composition over prop drilling (Context API when needed)
- Implement error boundaries for client components

## Data Fetching Patterns

- Server Components: Direct database queries via Drizzle
- Client Components: useSWR for caching and revalidation
- API Routes: Validate with Zod, return typed responses
- Always handle loading and error states explicitly

## Form Handling

- Use TanStack Form + Zod for ALL forms
- Validate on client (TanStack Form) AND server (API route)
- Pass Zod schemas directly to `validators.onChange` (no adapter)
- Show field-level errors below inputs
- Disable submit button when invalid or submitting

## Security Requirements (Non-Negotiable)

- Hash passwords with bcrypt (never store plain text)
- Validate ALL inputs on both client and server
- Implement RBAC: Student, Teacher, Admin roles
- Protect routes with middleware checking session + role
- Never expose sensitive data in client-side code
- Use CSRF tokens on forms (Auth.js handles this)

## Accessibility (WCAG AA Compliance)

- Use semantic HTML (`<button>`, `<label>`, `<nav>`)
- Pair all inputs with labels (`htmlFor` + `id`)
- Provide alt text for images
- Ensure keyboard navigation works
- Use `aria-invalid`, `aria-describedby` for form errors
- Test with screen readers

## Internationalization (i18n)

- Use Lingui v5+ for all translations
- Supported languages: Khmer (km - default), English (en)
- Wrap all user-facing text with `<Trans>` component
- Use Kantumruy Pro font for Khmer text
- Use Manrope font for English text
- Store translations in `locales/{locale}/messages.po`
- Run `pnpm i18n:extract` to extract messages
- Run `pnpm i18n:compile` to compile translations
- All routes must be locale-aware: `/{locale}/path`

## Responsive Design (Cross-Platform)

- Mobile-first approach (design for mobile, enhance for desktop)
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Test on: Mobile (375px), Tablet (768px), Desktop (1440px)
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Touch-friendly targets: minimum 44x44px for buttons
- Optimize images with Next.js `<Image>` component (responsive)
- Hide/show elements appropriately: `hidden lg:block`
- Stack layouts vertically on mobile, horizontal on desktop
- Test on iOS Safari, Android Chrome, Desktop Chrome/Firefox

## Project Structure

```
app/
├── [locale]/        # Locale-aware routes (km, en)
│   ├── (auth)/      # Login, register routes
│   ├── (student)/   # Student portal (/student/*)
│   ├── (teacher)/   # Teacher dashboard (/teacher/*)
│   ├── (admin)/     # Admin backoffice (/admin/*)
│   ├── unauthorized/
│   ├── layout.tsx   # Locale layout with fonts
│   └── page.tsx     # Landing page
└── api/             # API routes (no locale)

components/
├── ui/              # ShadCN components (Button, Input, etc.)
├── LanguageProvider.tsx
├── LanguageSwitcher.tsx
└── [feature]/       # Feature-specific components

lib/
├── auth/            # Auth utilities (session.ts)
├── drizzle/         # DB schema, queries, migrations
├── validations/     # Zod schemas (auth.ts, course.ts, etc.)
├── hooks/           # Custom hooks (useLocale.ts)
├── i18n.ts          # i18n configuration
└── utils.ts         # General utilities

locales/
├── km/              # Khmer translations
│   └── messages.po
└── en/              # English translations
    └── messages.po

proxy.ts             # Route protection & locale routing (Next.js 16)
```

## Performance

- Target <300ms response time for dashboard pages
- Use Server Components by default (faster initial load)
- Implement useSWR caching for client-side data
- Optimize images with Next.js `<Image>` component
- Lazy load heavy components with `next/dynamic`

## Data Tables (TanStack Table)

Use the reusable `DataTable` component for all tabular data with pagination, sorting, and filtering.

### Basic Usage

```typescript
'use client';

import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

// Define columns
const columns: ColumnDef<YourDataType>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <Button>Edit</Button>
          <Button>Delete</Button>
        </div>
      );
    },
  },
];

// Use in component
export default function MyPage() {
  const data = [...]; // Your data array

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Search by name..."
    />
  );
}
```

### Sortable Columns

```typescript
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const columns: ColumnDef<YourDataType>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
];
```

### Custom Cell Rendering

```typescript
const columns: ColumnDef<YourDataType>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {status}
        </span>
      );
    },
  },
];
```

### Features

- **Pagination**: Compact footer with page size control (10, 20, 30, 40, 50)
- **Sorting**: Click column headers to sort (ascending/descending)
- **Filtering**: Global search by specified column key
- **Custom Filters**: Pass filter components for advanced filtering
- **Row Numbering**: Optional row numbers that respect pagination
- **Column Visibility**: Toggle column visibility via dropdown
- **Fixed Height**: Table body scrolls with fixed header and footer
- **Responsive**: Mobile-friendly with horizontal scroll
- **Internationalized**: All UI text wrapped with `<Trans>`

### Props

- `columns`: Array of column definitions (required)
- `data`: Array of data objects (required)
- `searchKey`: Column key to enable search filtering (optional)
- `searchPlaceholder`: Placeholder text for search input (optional)
- `filterComponent`: Function that receives table instance and returns filter UI (optional)
- `showRowNumber`: Show row numbers in first column (optional, default: false)

### Best Practices

- Define columns outside component or use `useMemo` to prevent re-renders
- Use `accessorKey` for simple data access
- Use `accessorFn` for computed values
- Keep cell renderers lightweight
- Use proper TypeScript types for data
- Table height is fixed with `max-h-[calc(100vh-320px)]` for optimal viewport usage
- Pagination footer is compact (py-3) to minimize vertical space

### Row Numbering

Enable row numbers with the `showRowNumber` prop:

```typescript
<DataTable columns={columns} data={data} showRowNumber={true} />
```

Row numbers:

- Automatically adjust for pagination (e.g., page 2 starts at 11)
- Cannot be hidden via column visibility toggle
- Centered alignment with subtle styling
- Fixed width of 60px

### Custom Filters

Create reusable filter components:

```typescript
// CourseFilters.tsx
export function CourseFilters({ table }) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={table.getColumn("status")?.getFilterValue() ?? "all"}
        onValueChange={(value) => {
          table
            .getColumn("status")
            ?.setFilterValue(value === "all" ? undefined : value);
        }}
      >
        <SelectTrigger className="h-9 w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// Usage
<DataTable
  columns={columns}
  data={data}
  filterComponent={(table) => <CourseFilters table={table} />}
/>;
```

**Important**: Always derive filter values from table state to keep UI in sync:

```typescript
// ✅ Correct - derives from table state
const filterValue = table.getColumn('status')?.getFilterValue();
const displayValue = filterValue === undefined ? 'all' : filterValue;

// ❌ Wrong - uses prop directly
value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
```

## File Upload System

Use the upload system for handling file uploads with metadata tracking.

### Basic Usage

```typescript
import { ImageUpload } from "@/components/admin/ImageUpload";

<ImageUpload
  currentImage={currentPhotoUrl}
  onUploadComplete={(fileUrl) => {
    // Handle the uploaded file URL
    setPhotoUrl(fileUrl);
  }}
  category="profile"
/>;
```

### Upload Categories

- `profile` - User profile photos (auto-resized to 400x400px)
- `document` - PDF, Word documents, etc.
- `course_material` - Course-related files
- `general` - Other files

### Features

- **Metadata Tracking** - All uploads stored with metadata in database
- **Storage Usage** - Track total storage per user
- **Image Processing** - Auto-resize and optimize images with Sharp
- **Multiple Storage** - Support for local, S3, R2 (configured via storageType)
- **File Validation** - Type and size validation
- **Public/Private** - Control file visibility

### API Endpoint

```typescript
POST /api/upload
FormData:
  - file: File (required)
  - category: string (required)
  - isPublic: boolean (optional)

Response:
{
  id: string,
  fileName: string,
  fileUrl: string,
  fileSize: number,
  mimeType: string
}
```

### Database Schema

```sql
uploads table:
- id: UUID
- user_id: UUID (who uploaded)
- file_name: string
- original_name: string
- mime_type: string
- file_size: integer (bytes)
- file_path: string
- file_url: string
- storage_type: 'local' | 's3' | 'r2'
- category: string
- is_public: boolean
- metadata: JSON
- created: timestamp
- updated: timestamp
```

### Storage Functions

```typescript
import { uploadFile, getUserStorageUsage, deleteFile } from "@/lib/upload";

// Upload file
const result = await uploadFile(file, {
  userId: "user-id",
  category: "profile",
  isPublic: true,
  maxSize: 5 * 1024 * 1024, // 5MB
  resize: { width: 400, height: 400, fit: "cover" },
});

// Get user storage usage
const totalBytes = await getUserStorageUsage("user-id");

// Delete file
await deleteFile("file-id", "user-id");
```

### Configuration

Files are stored in `public/uploads/{category}/` by default.

To switch to S3/R2:

1. Update `storageType` in upload options
2. Implement S3/R2 upload logic in `lib/upload.ts`
3. Update `fileUrl` to return CDN URL

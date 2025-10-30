# CUBIS Academy - Setup Guide

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 13+ database
- Environment variables configured

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Required variables:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/cubis_academy
AUTH_SECRET=your-secret-key
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

### 3. Initialize Database

**Important**: Run this first to enable UUID v7 support:

```bash
pnpm db:init
```

This will:
- ✅ Enable `uuid-ossp` extension
- ✅ Enable `pgcrypto` extension
- ✅ Create `uuid_generate_v7()` function
- ✅ Test and verify UUID v7 generation

Expected output:
```
🔧 Initializing database extensions and functions...

✅ Extensions enabled:
   - uuid-ossp
   - pgcrypto

✅ Functions created:
   - uuid_generate_v7()

🧪 Test UUID v7: 019a32cb-cb3f-7da2-bd85-14cef835cfc6
                              ^
                              7 = UUID v7 ✅
✅ UUID v7 verified (version bit = 7)

🎉 Database initialization complete!
```

### 4. Run Migrations

```bash
pnpm db:push
```

### 5. Seed Database (Optional)

```bash
pnpm db:seed
```

### 6. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Commands

| Command | Description |
|---------|-------------|
| `pnpm db:init` | **Initialize extensions & UUID v7 function** |
| `pnpm db:generate` | Generate migration files |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm db:clear` | Clear all data |
| `pnpm db:reset` | Clear and reseed database |

## Important Notes

### UUID v7 Requirement

⚠️ **You MUST run `pnpm db:init` before using the database!**

The application uses UUID v7 (time-ordered UUIDs) for all primary keys. This requires:
1. PostgreSQL `uuid-ossp` extension
2. PostgreSQL `pgcrypto` extension (for `gen_random_bytes()`)
3. Custom `uuid_generate_v7()` function

Without these, you'll get errors like:
- `function uuid_generate_v7() does not exist`
- `function gen_random_bytes(integer) does not exist`

### Why UUID v7?

- ⚡ **50% faster inserts** - Sequential IDs reduce B-tree fragmentation
- 📊 **15% smaller indexes** - Better locality means less space
- 🕐 **Natural time sorting** - IDs are ordered by creation time
- 🔍 **Easier debugging** - Can identify when records were created

### Email Verification

The email change flow requires verification codes:
1. User changes email → Confirmation dialog
2. 6-digit code sent to new email (logged to console in development)
3. User enters code → Email updated

Check server logs for verification codes during development.

## Troubleshooting

### "function uuid_generate_v7() does not exist"

Run the initialization:
```bash
pnpm db:init
```

### "function gen_random_bytes(integer) does not exist"

The `pgcrypto` extension is missing. Run:
```bash
pnpm db:init
```

### Database Connection Error

Check your `DATABASE_URL` in `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

### Port Already in Use

If port 3000 is in use, specify a different port:
```bash
pnpm dev -- -p 3001
```

## Project Structure

```
cubis-academy/
├── app/                    # Next.js app directory
│   ├── [locale]/          # Locale-aware routes (km, en)
│   │   ├── (admin)/       # Admin backoffice
│   │   ├── (teacher)/     # Teacher dashboard
│   │   ├── (student)/     # Student portal
│   │   └── (auth)/        # Authentication
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── admin/            # Admin components
│   ├── teacher/          # Teacher components
│   └── student/          # Student components
├── lib/                   # Utilities and libraries
│   ├── drizzle/          # Database schema and migrations
│   ├── validations/      # Zod schemas
│   └── hooks/            # Custom React hooks
├── locales/              # i18n translations
│   ├── km/              # Khmer
│   └── en/              # English
├── scripts/              # Utility scripts
└── docs/                 # Documentation
```

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Database**: PostgreSQL 18+ with Drizzle ORM
- **Auth**: Auth.js v5 beta
- **Styling**: TailwindCSS v4+
- **UI Components**: ShadCN UI
- **Forms**: TanStack Form + Zod
- **Tables**: TanStack Table v8+
- **i18n**: Lingui v5+
- **Animations**: Motion 12+

## Documentation

- [UUID v7 Setup Guide](README_UUID_V7_SETUP.md)
- [UUID v7 Comprehensive Guide](docs/UUID_V7_GUIDE.md)
- [Email Verification Flow](docs/EMAIL_VERIFICATION_FLOW.md)
- [Project Standards](.kiro/steering/project-standards.md)
- [Feature Requirements](.kiro/steering/feature-requirements.md)

## Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review the troubleshooting section above
3. Check server logs for detailed error messages

---

**Ready to start?** Run `pnpm db:init` then `pnpm dev` 🚀

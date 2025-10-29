# CUBIS Academy - Setup Guide

## Prerequisites

- Node.js 22+
- PostgreSQL 18+
- pnpm (recommended)

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL=postgresql://user:password@localhost:5432/cubis_academy

# Auth.js - Generate a secret key
AUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# Google OAuth2 (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Set Up Database

Create the database:

```bash
createdb cubis_academy
```

Push the schema to the database (recommended for development):

```bash
pnpm db:push
```

**Note**: Use `db:push` for development. It's simpler and doesn't require migrations.

For production with migration tracking (optional):

```bash
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Apply migrations
```

### 4. Seed Database with Sample Data

Run the seed script to populate the database with sample users and courses:

```bash
pnpm db:seed
```

This will create:
- 1 Admin user: `admin@cubisacademy.com`
- 4 Teachers: `john@cubisacademy.com`, etc.
- 6 Students: `alice@example.com`, etc.
- 6 Courses with enrollments, payments, scores, and attendance

**All passwords are: `123456`**

**Login Credentials:**
- Admin: `admin@cubisacademy.com` / `123456`
- Teacher: `john@cubisacademy.com` / `123456`
- Student: `alice@example.com` / `123456`

### 5. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

## Database Management

View database in Drizzle Studio:

```bash
pnpm db:studio
```

### Reset Database (if needed)

If you need to start fresh:

```bash
# Drop and recreate
dropdb cubis_academy
createdb cubis_academy

# Push schema and seed
pnpm db:push
pnpm db:seed
```

## Default User Roles

- **student**: Can browse courses, enroll, view materials, track progress
- **teacher**: Can manage courses, add scores, mark attendance
- **admin**: Full system access

## Testing the Application

1. Register a new student account at `/register`
2. Login at `/login`
3. Access student dashboard at `/student`

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format in `.env.local`
- Ensure database exists: `psql -l | grep cubis_academy`

### Migration Errors

If you get "type already exists" errors:
- You already used `db:push` - just run `pnpm db:seed`
- Don't mix `db:push` and `db:migrate` - choose one approach
- To reset: drop database, recreate, then `db:push` again

### Auth Issues

- Verify AUTH_SECRET is set
- Check Google OAuth credentials
- Clear browser cookies

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

## Next Steps

- Add course materials management
- Implement payment processing
- Add email notifications
- Create teacher course management
- Build admin backoffice features

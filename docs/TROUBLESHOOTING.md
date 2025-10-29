# 🔧 Troubleshooting Guide

## Database Issues

### "type already exists" Error

**Error Message:**
```
error: type "attendance_status" already exists
```

**Cause:** You already ran `pnpm db:push` which created the schema. You don't need migrations.

**Solution:**
```bash
# Just seed the data - schema already exists
pnpm db:seed
```

**To Start Fresh:**
```bash
# Drop and recreate database
dropdb cubis_academy
createdb cubis_academy

# Push schema and seed
pnpm db:push
pnpm db:seed
```

### Database Connection Failed

**Check PostgreSQL is running:**
```bash
pg_isready
# Should output: /tmp:5432 - accepting connections
```

**Check database exists:**
```bash
psql -l | grep cubis_academy
```

**Verify DATABASE_URL:**
```bash
# In .env.local, should look like:
DATABASE_URL=postgresql://username:password@localhost:5432/cubis_academy
```

### Can't Create Database

**Error:** `createdb: error: database creation failed`

**Solution:**
```bash
# Use psql instead
psql postgres
CREATE DATABASE cubis_academy;
\q
```

## Migration vs Push

### When to Use What

**Use `db:push` (Recommended for Development):**
- ✅ Faster and simpler
- ✅ No migration files to manage
- ✅ Perfect for development
- ✅ Automatically syncs schema

```bash
pnpm db:push
```

**Use `db:migrate` (For Production):**
- ✅ Track migration history
- ✅ Rollback capability
- ✅ Team collaboration
- ❌ More complex

```bash
pnpm db:generate  # First time only
pnpm db:migrate
```

**Don't Mix Them!** Choose one approach and stick with it.

## Build Errors

### Edge Runtime Error (crypto module)

**Error Message:**
```
Error: The edge runtime does not support Node.js 'crypto' module.
```

**Cause:** Middleware trying to use Node.js modules (like bcrypt) in Edge runtime.

**Solution:** This has been fixed by splitting the auth configuration:
- `auth.config.ts` - Edge-compatible (no bcrypt)
- `auth.ts` - Full Node.js support (with bcrypt)

If you still see this error:
```bash
# Clear cache and rebuild
rm -rf .next
pnpm build
pnpm dev
```

**Detailed explanation:** See `EDGE_RUNTIME_FIX.md`

### TypeScript Errors

**Clear cache and rebuild:**
```bash
rm -rf .next
pnpm build
```

### Module Not Found

**Reinstall dependencies:**
```bash
rm -rf node_modules
pnpm install
```

## Authentication Issues

### Can't Login After Seeding

**Check credentials (all passwords: 123456):**
- Admin: `admin@cubisacademy.com` / `123456`
- Teacher: `john@cubisacademy.com` / `123456`
- Student: `alice@example.com` / `123456`

**Verify seed ran successfully:**
```bash
pnpm db:studio
# Check if users table has data
```

### Google OAuth Not Working

**Setup required:**
1. Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
2. Add to `.env.local`:
```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`

### Session/Cookie Issues

**Clear browser data:**
- Clear cookies for localhost
- Try incognito/private mode
- Restart dev server

## Development Server Issues

### Port Already in Use

**Use different port:**
```bash
pnpm dev -- -p 3001
```

**Or kill existing process:**
```bash
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Hot Reload Not Working

**Restart dev server:**
```bash
# Stop with Ctrl+C
# Clear cache
rm -rf .next
# Start again
pnpm dev
```

## Seed Script Issues

### Seed Fails with Constraint Error

**Error:** `duplicate key value violates unique constraint`

**Cause:** Database already has data.

**Solution:**
```bash
# Option 1: Clear and re-seed (recommended)
pnpm db:clear
pnpm db:seed

# Or use the reset command (clears + seeds)
pnpm db:reset

# Option 2: Drop and recreate database
dropdb cubis_academy
createdb cubis_academy
pnpm db:push
pnpm db:seed
```

### SUID Generation Error

**Check sequence:**
```bash
# View existing students
pnpm db:studio
# Check students table for SUID format
```

## Animation/UI Issues

### Animations Not Working

**Check motion package:**
```bash
pnpm list motion
# Should show: motion@12.23.24
```

**Reinstall if needed:**
```bash
pnpm add motion
```

### Styles Not Applying

**Check TailwindCSS:**
```bash
# Restart dev server
pnpm dev
```

**Clear browser cache:**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

## Environment Variables

### Variables Not Loading

**Check file name:**
- Must be `.env.local` (not `.env`)
- Must be in project root

**Restart dev server:**
```bash
# Stop with Ctrl+C
pnpm dev
```

**Verify variables:**
```bash
# In your code, check:
console.log(process.env.DATABASE_URL)
```

## Common Mistakes

### ❌ Running Both Push and Migrate
```bash
pnpm db:push
pnpm db:migrate  # DON'T DO THIS
```

**✅ Choose One:**
```bash
# Development
pnpm db:push

# OR Production
pnpm db:generate
pnpm db:migrate
```

### ❌ Wrong Password
```bash
# All passwords are: 123456
alice@example.com / 123456  # ✅ Correct
alice@example.com / password  # ❌ Wrong
```

### ❌ Missing Environment Variables
```bash
# Must have in .env.local:
DATABASE_URL=...
AUTH_SECRET=...
NEXTAUTH_URL=...
```

## Getting Help

### Check Documentation
1. **QUICKSTART.md** - Quick setup
2. **SETUP.md** - Detailed setup
3. **SEED_DATA.md** - Sample data info
4. **FEATURES.md** - Feature list

### Debug Steps
1. Check error message carefully
2. Verify environment variables
3. Check database connection
4. Clear cache and rebuild
5. Check this troubleshooting guide

### Still Stuck?

**Verify your setup:**
```bash
# 1. Check Node version
node --version  # Should be 22+

# 2. Check PostgreSQL
pg_isready

# 3. Check database exists
psql -l | grep cubis_academy

# 4. Check environment
cat .env.local

# 5. Try fresh install
rm -rf node_modules .next
pnpm install
pnpm build
```

## Quick Fixes

### Complete Reset
```bash
# Nuclear option - start completely fresh
dropdb cubis_academy
createdb cubis_academy
rm -rf node_modules .next
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

### Verify Everything Works
```bash
# 1. Build should succeed
pnpm build

# 2. Database should have data
pnpm db:studio

# 3. Dev server should start
pnpm dev

# 4. Login should work
# Visit http://localhost:3000
# Login with: alice@example.com / 123456
```

---

**Most Common Issue**: Mixing `db:push` and `db:migrate`. Just use `db:push` for development! 🎯

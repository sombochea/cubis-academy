# Password Update - All Users Now Use `123456`

## What Changed

All seed data passwords have been updated from individual passwords (1-6) to a single, easy-to-remember password: **`123456`**

## Updated Login Credentials

**All users now use password: `123456`**

### Admin
- Email: `admin@cubisacademy.com`
- Password: `123456`

### Teachers
- John Smith: `john@cubisacademy.com` / `123456`
- Sarah Johnson: `sarah@cubisacademy.com` / `123456`
- Michael Chen: `michael@cubisacademy.com` / `123456`
- Emily Davis: `emily@cubisacademy.com` / `123456`

### Students
- Alice Williams: `alice@example.com` / `123456`
- Bob Martinez: `bob@example.com` / `123456`
- Carol Brown: `carol@example.com` / `123456`
- David Lee: `david@example.com` / `123456`
- Eva Garcia: `eva@example.com` / `123456`
- Frank Wilson: `frank@example.com` / `123456`

## Why This Change?

- **Easier to remember**: One password for all test accounts
- **Faster testing**: No need to remember different passwords
- **More realistic**: Simulates a common password pattern
- **Better UX**: Simplifies the testing experience

## How to Apply

If you've already seeded your database with the old passwords, you need to re-seed:

```bash
# Option 1: Drop and recreate database
dropdb cubis_academy
createdb cubis_academy
pnpm db:push
pnpm db:seed

# Option 2: Clear tables and re-seed
psql cubis_academy
TRUNCATE users, students, teachers, courses, enrollments, payments, scores, attendances CASCADE;
\q
pnpm db:seed
```

## Files Updated

1. **lib/drizzle/seed.ts** - Seed script now uses `123456` for all users
2. **README.md** - Updated login credentials
3. **SETUP.md** - Updated seed data section
4. **QUICKSTART.md** - Updated test accounts
5. **SEED_DATA.md** - Updated all password references
6. **TROUBLESHOOTING.md** - Updated login examples
7. **PROJECT_SUMMARY.md** - Updated test accounts

## Testing

After re-seeding, test login with:

```bash
# Start dev server
pnpm dev

# Visit http://localhost:3000
# Click "Login"
# Use any account with password: 123456
```

### Quick Test
- Email: `alice@example.com`
- Password: `123456`

Should successfully log you into the student portal! 🎉

## Security Note

⚠️ **Important**: This password is for **development/testing only**. Never use simple passwords like this in production!

For production:
- Enforce strong password requirements
- Implement password complexity rules
- Use multi-factor authentication
- Regular security audits

---

**Remember**: All test accounts now use password `123456` 🔑

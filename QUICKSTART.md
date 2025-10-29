# 🚀 Quick Start Guide

Get CUBIS Academy up and running in 5 minutes!

## Prerequisites

- Node.js 22+
- PostgreSQL 18+
- pnpm installed

## Step-by-Step Setup

### 1️⃣ Clone & Install (1 min)

```bash
# Install dependencies
pnpm install
```

### 2️⃣ Configure Environment (1 min)

```bash
# Copy environment template
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/cubis_academy
AUTH_SECRET=your-secret-here  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

### 3️⃣ Setup Database (2 min)

```bash
# Create database
createdb cubis_academy

# Push schema (use this, not migrate)
pnpm db:push

# Seed sample data
pnpm db:seed
```

**Important**: Use `db:push` for development. Don't run `db:migrate` unless you specifically need migration tracking.

### 4️⃣ Start Development (1 min)

```bash
pnpm dev
```

Visit: **http://localhost:3000** 🎉

## 🎯 Test Accounts

**All passwords: `123456`**

### Admin
- Email: `admin@cubisacademy.com`
- Password: `123456`

### Teacher
- Email: `john@cubisacademy.com`
- Password: `123456`

### Student
- Email: `alice@example.com`
- Password: `123456`

## ✨ What You'll See

1. **Beautiful Landing Page** with animations
2. **Login/Register** pages
3. **Student Dashboard** with course browsing
4. **Teacher Dashboard** (placeholder)
5. **Admin Dashboard** (placeholder)

## 🎨 Features to Explore

- ✅ Animated landing page with motion effects
- ✅ Google OAuth login (configure credentials)
- ✅ Browse 6 sample courses
- ✅ View enrollments and payments
- ✅ Check scores and attendance
- ✅ Role-based access control

## 🛠️ Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production

# Database
pnpm db:studio        # Open database GUI
pnpm db:seed          # Seed data
pnpm db:clear         # Clear all data
pnpm db:reset         # Clear + seed
pnpm db:push          # Update schema

# Lint
pnpm lint             # Check code quality
```

## 📚 Next Steps

1. **Explore the UI**: Check out the animated landing page
2. **Test Different Roles**: Login as student, teacher, admin
3. **Browse Courses**: See the 6 sample courses
4. **Check Database**: Run `pnpm db:studio` to view data
5. **Read Docs**: Check FEATURES.md for full feature list

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env.local
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
pnpm build
```

### Port Already in Use
```bash
# Use different port
pnpm dev -- -p 3001
```

## 📖 Documentation

- **README.md** - Project overview
- **SETUP.md** - Detailed setup guide
- **FEATURES.md** - Complete feature list
- **SEED_DATA.md** - Sample data reference
- **IMPLEMENTATION.md** - Technical details
- **CHANGELOG.md** - Version history

## 🎉 You're Ready!

Start building amazing features on top of this solid foundation!

Need help? Check the documentation or review the code comments.

---

**Happy Coding! 🚀**

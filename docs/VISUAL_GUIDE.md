# 🎨 Visual Guide - CUBIS Academy Landing Page

## 🌈 Color Palette

### Primary Colors
- **Blue-Indigo Gradient**: `from-blue-600 to-indigo-600`
- **Background**: `from-slate-50 via-blue-50 to-indigo-50`

### Course Card Gradients
- **Web Development**: `from-blue-500 to-cyan-500`
- **UX/UI Design**: `from-purple-500 to-pink-500`
- **DevOps**: `from-orange-500 to-red-500`
- **Programming**: `from-green-500 to-emerald-500`

## 🎭 Animations

### Page Load Sequence
1. **Navigation** (0.0s): Slides down from top
2. **Hero Badge** (0.2s): Fades in with scale
3. **Hero Text** (0.4s): Fades in with upward motion
4. **Stats** (0.5s+): Staggered appearance
5. **Course Cards** (0.6s+): Staggered with rotation

### Hover Effects
- **Buttons**: Shadow increase + subtle scale
- **Course Cards**: Scale 1.05 + rotate 2° + lift
- **Feature Cards**: Translate up 10px

### Continuous Animations
- **CTA Background**: Floating gradient circles (20s loop)
- **Smooth Scroll**: Throughout the page

## 📱 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Single column, stacked navigation |
| Tablet (640-1024px) | 2-column features, adjusted spacing |
| Desktop (>1024px) | 4-column features, full animations |

## 🎯 Typography

- **Hero Headline**: 5xl/6xl (48px/60px)
- **Section Titles**: 4xl (36px)
- **Feature Titles**: xl (20px)
- **Body Text**: xl (20px)
- **Small Text**: sm (14px)

## 🎨 Component Structure

```
LandingPage
├── Navigation (Fixed, Backdrop Blur)
├── Hero Section
│   ├── Badge
│   ├── Headline with Gradient
│   ├── CTA Buttons
│   └── Stats Grid (4 items)
├── Animated Course Cards (Desktop only)
├── Features Section (4 cards)
├── CTA Section (Gradient background)
└── Footer (Dark theme)
```

## 🌟 Special Effects

- **Backdrop Blur**: Navigation bar
- **Text Gradients**: Headlines and CTAs
- **Box Shadows**: Hover states
- **Smooth Transitions**: All interactive elements

---

**Design Philosophy**: Modern, Clean, Animated, User-Friendly

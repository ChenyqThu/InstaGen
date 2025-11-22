# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InstaGen Polaroid is an interactive Polaroid-style camera web application that uses Google Gemini 2.5 Flash Image API for AI-powered photo editing. Users can take photos through their webcam, drag them onto a virtual board, and apply various AI transformations.

**Current Version**: v1.5.1 (UX & Performance Improvements)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://0.0.0.0:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

Create a `.env` file in the root directory with:
```
GEMINI_API_KEY=your_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For server-side operations
```

## Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + TypeScript | SPA application |
| Build Tool | Vite | Fast dev & build |
| Styling | Tailwind CSS (CDN) | Atomic CSS |
| Backend | Vercel Serverless | API routes |
| Database | Supabase (PostgreSQL) | Data + Auth |
| AI Service | Google Gemini 2.5 Flash | Image editing |
| Deployment | Vercel | Auto deploy |

### Core Modules

1. **Authentication** (Phase 1): OAuth login (Google/GitHub), session management
2. **Photo Library** (Phase 2): Personal photo storage, cloud sync, sharing
3. **Account Management** (Phase 3): Profile settings, custom API key
4. **Usage Limits** (Phase 4): Daily quota (3/day), usage tracking
5. **Gallery Enhancement** (Phase 5): High-quality download, UX improvements

### Recent Improvements (v1.5.1)

**UX Enhancements**:
- Save button remains enabled when not logged in - clicking opens login modal
- Photo state persists through OAuth login flow via localStorage (max 10 photos)
- Seamless login experience - users can continue editing after authentication

**Download Quality**:
- High-resolution export: 4x scaling (1360x1960 pixels)
- Correct aspect ratio cropping (300:340 = 15:17 for Polaroid frame)
- Native `<img>` rendering for better quality (vs CSS background-image)
- Canvas-based pre-cropping before html2canvas rendering

### Application Flow

```
Camera Capture → Photo State (DEVELOPING → DONE → EDITING) → AI Edit / Save / Share
                                    ↓
                              Login Required (for AI Edit & Save)
                                    ↓
                              Quota Check (3/day or Custom Key)
```

### File Structure

```
/
├── api/                          # Vercel Serverless Functions
│   ├── generate.js               # Gemini API proxy + quota check
│   └── validate-key.js           # API key validation
│
├── components/                   # React components (root level)
│   ├── Camera.tsx                # Webcam capture with filter wheel
│   ├── FilterWheel.tsx           # Rotatable filter selector
│   ├── PhotoModal.tsx            # Edit modal with AI controls + usage display
│   ├── PolaroidFrame.tsx         # Photo frame (uses <img> for better quality)
│   ├── PolaroidPhoto.tsx         # Draggable photo component
│   ├── PublicGallery.tsx         # Public gallery view
│   └── pokemon-css/              # Pokemon card holographic effects
│
├── src/                          # Source modules (Phase 1-4)
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication state management
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginModal.tsx    # OAuth + Email login modal
│   │   │   ├── UserMenu.tsx      # User dropdown menu
│   │   │   └── AccountSettings.tsx # Profile + API key settings
│   │   └── gallery/
│   │       ├── MyGallery.tsx     # Personal photo library
│   │       ├── GalleryPhotoModal.tsx # Gallery photo editor with download
│   │       └── PhotoActions.tsx  # Photo action menu
│   ├── services/
│   │   ├── supabaseClient.ts     # Supabase client (auth)
│   │   ├── authService.ts        # Auth operations
│   │   ├── photoService.ts       # Photo CRUD operations
│   │   └── usageService.ts       # Usage quota service
│   ├── hooks/
│   │   ├── useMyPhotos.ts        # Personal photos hook
│   │   └── useUsageLimit.ts      # Usage limit hook
│   ├── config/
│   │   └── usageConfig.ts        # Quota configuration (3/day)
│   └── types/
│       └── auth.ts               # Auth type definitions
│
├── services/                     # Services (root level)
│   ├── geminiService.ts          # Gemini API client with auth
│   └── supabaseClient.ts         # Supabase client (gallery)
│
├── config/                       # Configuration
│   ├── filterConfig.ts           # Instagram filter definitions
│   └── magicEditConfig.ts        # AI edit options with previews
│
├── public/                       # Static assets
│   ├── instagram.css             # Instagram filter CSS
│   └── assets/
│       ├── camera.webp           # Camera image
│       └── previews/             # Edit option previews
│
├── App.tsx                       # Main app component (with localStorage)
├── index.tsx                     # React entry point
├── index.html                    # HTML template
├── types.ts                      # Global type definitions
├── constants.ts                  # Translations + frame styles
└── vite.config.ts                # Vite configuration
```

### Photo State Persistence

**localStorage Integration** (App.tsx):
- Automatic save: Photos state syncs to localStorage on every change
- Automatic restore: Photos recovered on app load (after OAuth redirect)
- Storage limit: Max 10 most recent photos to prevent overflow
- Storage key: `instagen-photos`
- Use case: Prevents photo loss during OAuth login flow

### Database Tables (Supabase)

| Table | Purpose | Phase |
|-------|---------|-------|
| `user_profiles` | User profile + custom API key | 1, 3 |
| `user_photos` | Personal photo storage | 2 |
| `public_photos` | Public gallery | 2 |
| `user_usage` | Daily usage tracking | 4 |

### Key Technical Details

**Authentication Flow**:
- OAuth providers: Google, GitHub
- Session managed via Supabase Auth
- AuthContext provides: `user`, `isAuthenticated`, `signIn`, `signOut`
- Protected features require login (Magic Edit, Save Photo)

**Usage Limit System**:
- Daily quota: 3 free calls per day (UTC reset)
- Custom API key: Unlimited usage
- Server-side enforcement in `/api/generate.js`
- Frontend display in PhotoModal (remaining: X/3)

**Gemini API Integration** (services/geminiService.ts):
- Model: `gemini-2.5-flash-image`
- Sends: base64 image + text prompt + Bearer token
- Returns: transformed image
- Error codes: `auth_required` (401), `quota_exceeded` (429)

**Instagram Filters** (components/FilterWheel.tsx):
- 24 Instagram-style filters
- Rotatable gear wheel UI
- CSS filters applied via canvas context

**Path Alias**:
- `@/*` maps to project root
- Example: `import { Camera } from '@/components/Camera'`

**i18n**:
- Languages: English ('en'), Chinese ('zh')
- All strings in `TRANSLATIONS` constant
- Toggle in top-right header

**High-Quality Photo Export** (GalleryPhotoModal.tsx):
- Aspect ratio: 300:340 (15:17) - matches Polaroid frame visible area
- Cropping logic: Center crop to maintain subject
- Resolution: 4x scaling (1200x1360 photo area → 4800x5440 output)
- Image rendering: `<img>` tag with `data-main-photo` attribute
- Pre-processing: Canvas crops image before html2canvas
- Quality settings: `imageSmoothingQuality: 'high'`, PNG format

## Important Implementation Notes

**Photo Status Flow**:
```
DEVELOPING (5s animation) → DONE (ready) → EDITING (API call) → DONE
```

**Save Button Behavior**:
- **Not logged in**: Button enabled with blue border, click to open login modal
- **Logged in**: Normal save behavior, disabled after successful save
- **Login flow**: Photo modal closes → Login modal opens → After login, photos persist in localStorage

**Protected Actions** (require login):
- Magic Edit (AI transformation)
- Save to personal library
- Pin to public gallery

**Error Handling**:
- `auth_required`: Show login modal
- `quota_exceeded`: Show upgrade tip (add custom API key)
- API errors: Revert to DONE status + alert

**User Menu Items**:
- My Photos → Opens personal gallery
- Settings → Opens account settings (profile + API key)
- Logout → Sign out

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design
- [Auth System](./docs/AUTH_SYSTEM.md) - Authentication details
- [Photo Storage](./docs/PHOTO_STORAGE.md) - Photo management
- [Usage Limits](./docs/USAGE_LIMIT_SYSTEM.md) - Quota system
- [API Reference](./docs/API_REFERENCE.md) - Backend APIs
- [Roadmap](./docs/roadmap/) - Development phases (all completed)

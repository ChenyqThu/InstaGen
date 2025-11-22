# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InstaGen Polaroid is an interactive Polaroid-style camera web application that uses Google Gemini 2.5 Flash Image API for AI-powered photo editing. Users can take photos through their webcam, drag them onto a virtual board, and apply various AI transformations.

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
```

The Gemini API key is accessed via `process.env.API_KEY` or `process.env.GEMINI_API_KEY` (both mapped in vite.config.ts:14-15).
Supabase credentials are used for the public gallery feature (services/supabaseClient.ts).

## Architecture

### Core Application Flow

1. **Camera Capture** (Camera.tsx): Accesses user's webcam, captures square photos, applies mirror flip for selfie mode
2. **Photo State Management** (App.tsx): Central state for all photos with UUID-based tracking, manages lifecycle from DEVELOPING → DONE → EDITING
3. **Photo Display** (PolaroidPhoto.tsx): Draggable Polaroid frames with 5-second developing animation
4. **AI Editing** (PhotoModal.tsx + geminiService.ts): Modal interface for frame styles and Gemini-powered transformations

### State Management Pattern

Photos flow through three states defined in types.ts:
- `PhotoStatus.DEVELOPING`: Initial 5-second blur/grayscale animation
- `PhotoStatus.DONE`: Ready for interaction
- `PhotoStatus.EDITING`: Processing with Gemini API

All photo data is managed through the `PhotoData` interface with position (x, y), rotation, and frame style.

### Key Technical Details

**Camera Integration**:
- Camera asset served from public/assets/camera.webp
- Lens positioned absolutely at center (top-1/2 left-1/2) with video feed
- Shutter button hotspot at bottom-[22%] left-[11%]
- Outputs square images with centered crop
- Fallback UI shown if image fails to load

**Instagram Filters** (components/FilterWheel.tsx + config/filterConfig.ts):
- Rotatable gear wheel around camera lens for filter selection
- 24 Instagram-style filters (Normal, 1977, Aden, Amaro, etc.)
- Filters applied via CSS classes from public/instagram.css
- Canvas context.filter used for photo capture
- Bilingual filter names (English/Chinese) in filterConfig.ts
- Filter ID saved with photo for gallery display

**Gemini API Integration** (services/geminiService.ts):
- Model: `gemini-2.5-flash-image`
- Sends base64 image + text prompt
- Returns transformed image via `responseModalities: [Modality.IMAGE]`
- Predefined prompts in constants.ts (cartoon, sketch, anime, retro, cyberpunk, watercolor)

**Path Alias**:
- `@/*` maps to project root (tsconfig.json:21-24, vite.config.ts:18-20)
- Import example: `import { Camera } from '@/components/Camera'`

**Styling**:
- Tailwind CSS loaded via CDN (index.html:7)
- Custom animations: `animate-eject` (photo ejection), `animate-develop` (revealing effect)
- Frame styles in FRAME_STYLES constant (classic/black/colorful/vintage)

### File Structure

```
/
├── App.tsx                    # Main app component, photo state
├── index.tsx                  # React root
├── index.html                 # Entry point with Tailwind + importmap
├── types.ts                   # TypeScript interfaces/enums
├── constants.ts               # Edit options, translations, frame styles
├── vite.config.ts             # Vite config with env var injection
├── components/
│   ├── Camera.tsx            # Webcam capture with filter wheel
│   ├── FilterWheel.tsx       # Rotatable filter selector gear
│   ├── PolaroidPhoto.tsx     # Draggable photo component
│   ├── PolaroidFrame.tsx     # Photo frame with styles
│   ├── PhotoModal.tsx        # Edit modal with AI controls
│   ├── PublicGallery.tsx     # Public gallery view
│   └── pokemon-css/          # Pokemon card holographic effects
├── config/
│   ├── filterConfig.ts       # Instagram filter definitions
│   └── magicEditConfig.ts    # AI edit options
├── services/
│   ├── geminiService.ts      # Gemini API client
│   └── supabaseClient.ts     # Supabase client for gallery
└── public/
    ├── instagram.css         # Instagram filter CSS
    └── assets/
        └── camera.webp       # Camera image asset (required)
```

## Important Implementation Notes

**Gemini API Error Handling**:
- Photo status reverts to DONE on API failure (PhotoModal.tsx:46)
- User sees browser alert with translated error message
- No retry logic implemented

**Drag-and-Drop**:
- Uses Pointer Events API (not mouse events) for better mobile support
- Prevents dragging when clicking edit button (line 38 check)
- Brings photo to front on select via array reordering

**i18n**:
- Two languages: English ('en') and Chinese ('zh')
- All UI strings in TRANSLATIONS constant
- Language toggle in top-right header

**Photo Persistence**:
- Photos stored in React state only (no localStorage/backend)
- Refreshing page clears all photos
- Download creates timestamped PNG files

**Public Gallery** (components/PublicGallery.tsx + services/supabaseClient.ts):
- Photos can be pinned to public gallery via Supabase
- Stores: data_url, caption, frame_style, timestamp, prompt_used, pokemon_id, filter_id
- Gallery displays photos with original filter and Pokemon card effects
- Supabase table: `public_photos`

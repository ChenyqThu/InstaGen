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

Create a `.env.local` file in the root directory with:
```
GEMINI_API_KEY=your_api_key_here
```

The API key is accessed via `process.env.API_KEY` or `process.env.GEMINI_API_KEY` (both mapped in vite.config.ts:14-15).

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
│   ├── Camera.tsx            # Webcam capture interface
│   ├── PolaroidPhoto.tsx     # Draggable photo component
│   └── PhotoModal.tsx        # Edit modal with AI controls
├── services/
│   └── geminiService.ts      # Gemini API client
└── public/
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

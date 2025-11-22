# Changelog

All notable changes to InstaGen Polaroid will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.1] - 2025-01-22

### Added

- **localStorage Persistence** - Photo state now persists through OAuth login redirects
  - Stores up to 10 most recent photos in localStorage
  - Automatic recovery on app load
  - Prevents photo loss when user logs in to save photos
  - Storage key: `instagen-photos`

### Changed

- **Save Button UX** - Improved user experience for non-logged-in users
  - Save button remains enabled when not logged in (previously disabled/grayed out)
  - Clicking Save button now closes photo modal and opens login modal
  - After login, users can continue editing their photos seamlessly
  - Blue border styling indicates clickable state

- **Photo Rendering** - Migrated from CSS background to native `<img>` tag
  - `PolaroidFrame.tsx` now uses `<img>` element instead of CSS `backgroundImage`
  - Added `data-main-photo="true"` attribute for identification
  - Improved rendering quality for html2canvas export
  - Better browser compatibility and performance

### Fixed

- **High-Quality Download** - Fixed photo distortion and blur in downloaded images
  - Correct aspect ratio cropping: 300:340 (15:17) matching Polaroid frame
  - Center crop algorithm maintains photo subject
  - 4x resolution output (4800x5440 pixels for photo area)
  - Canvas pre-processing before html2canvas rendering
  - `imageSmoothingQuality: 'high'` for better interpolation
  - PNG format with maximum quality (1.0)

### Technical Details

**Files Modified**:
- `App.tsx` - Added localStorage initialization and persistence
- `components/PolaroidFrame.tsx` - Changed from CSS background to `<img>` tag
- `components/PhotoModal.tsx` - Updated Save button behavior
- `src/components/gallery/GalleryPhotoModal.tsx` - Implemented correct aspect ratio cropping

**Key Improvements**:
- Photo cropping algorithm: `targetRatio = 300 / 340 = 0.882`
- Horizontal photos: crop width (center crop)
- Vertical photos: crop height (center crop)
- Export resolution: 4x scaling via html2canvas
- Image quality: High smoothing + PNG format

## [1.5.0] - Previous Release

### Added
- Gallery Enhancement (Phase 5)
- Personal photo library with cloud sync
- High-quality photo download
- Public gallery sharing

## [1.4.0] - Previous Release

### Added
- Usage Limit System (Phase 4)
- Daily quota tracking (3 calls/day)
- Custom API key support for unlimited usage

## [1.3.0] - Previous Release

### Added
- Account Management (Phase 3)
- Profile settings
- Custom Gemini API key configuration

## [1.2.0] - Previous Release

### Added
- Photo Library (Phase 2)
- Personal photo storage
- Cloud synchronization via Supabase

## [1.1.0] - Previous Release

### Added
- Authentication System (Phase 1)
- OAuth login (Google/GitHub)
- Email/password authentication
- Session management

## [1.0.0] - Initial Release

### Added
- Webcam photo capture
- Instagram-style filters
- Polaroid frame styles
- Pokemon card holographic effects
- AI-powered photo editing via Gemini 2.5 Flash
- Draggable photo board

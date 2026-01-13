import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from './src/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { Camera } from './components/Camera';
import { PolaroidPhoto } from './components/PolaroidPhoto';
import { PhotoModal } from './components/PhotoModal';
import { PublicGallery } from './components/PublicGallery';
import { Language, PhotoData, PhotoFrameStyle, PhotoStatus } from './types';
import { TRANSLATIONS } from './constants';
import { UserMenu } from '@/src/components/auth/UserMenu';
import { LoginModal } from '@/src/components/auth/LoginModal';
import { Button } from './src/components/ui/Button';
import { ToastProvider } from './src/contexts/ToastContext';
import { GuideModal } from './src/components/ui/GuideModal';

const STORAGE_KEY = 'instagen-photos';
const MAX_STORED_PHOTOS = 5; // Reduced limit to prevent localStorage overflow (base64 images are large)

const App: React.FC = () => {
  // Initialize photos from localStorage
  const [photos, setPhotos] = useState<PhotoData[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Restored photos from localStorage:', parsed.length);
        return parsed;
      }
    } catch (error) {
      console.error('Failed to restore photos from localStorage:', error);
    }
    return [];
  });

  const { isAuthenticated, user } = useAuth();
  const [lang, setLang] = useState<Language>('en');

  // Sync language from user profile
  useEffect(() => {
    if (user?.language) {
      setLang(user.language);
    }
  }, [user?.language]);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Check for first-time login guide
  useEffect(() => {
    // Show guide if not seen before (check localStorage)
    const hasSeenGuide = localStorage.getItem('hasSeenGuide');
    if (!hasSeenGuide) {
      // Delay slightly to let UI settle
      const timer = setTimeout(() => {
        setShowGuide(true);
        localStorage.setItem('hasSeenGuide', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Persist photos to localStorage whenever they change
  useEffect(() => {
    // Skip if no photos to store
    if (photos.length === 0) return;

    const savePhotos = (photosToSave: PhotoData[]) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(photosToSave));
        return true;
      } catch {
        return false;
      }
    };

    // Try to save most recent photos, progressively reduce count if storage is full
    let photosToStore = photos.slice(-MAX_STORED_PHOTOS);

    if (!savePhotos(photosToStore)) {
      // Storage full - try clearing and saving fewer photos
      localStorage.removeItem(STORAGE_KEY);

      // Progressively reduce until it fits
      for (let count = Math.min(3, photosToStore.length); count >= 1; count--) {
        photosToStore = photos.slice(-count);
        if (savePhotos(photosToStore)) {
          console.log(`Saved ${count} photos after storage cleanup`);
          return;
        }
      }
      // If even 1 photo doesn't fit, clear storage entirely
      localStorage.removeItem(STORAGE_KEY);
      console.warn('localStorage full, photos will not persist');
    }
  }, [photos]);

  const bringToFront = (id: string) => {
    setPhotos(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index === -1 || index === prev.length - 1) return prev;
      const newPhotos = [...prev];
      const [item] = newPhotos.splice(index, 1);
      newPhotos.push(item);
      return newPhotos;
    });
  };

  const handleTakePhoto = useCallback((dataUrl: string, filterId: string) => {
    // Trigger Global Flash
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 250); // Faster flash

    const newPhoto: PhotoData = {
      id: uuidv4(),
      x: 60,
      y: -100,
      rotation: 0,
      dataUrl,
      timestamp: Date.now(),
      status: PhotoStatus.DEVELOPING,
      frameStyle: PhotoFrameStyle.CLASSIC,
      filterId: filterId || undefined,
    };

    // Animation: "Eject" from the camera slot
    // Camera container: positioned at 50vh with pt-[100px]
    // Camera dimensions: ~400px (w-[380px] md:w-[420px] h-[380px] md:h-[420px])
    // Calculate exact camera bottom position
    const cameraHeight = window.innerWidth < 768 ? 380 : 420;
    const cameraCenterY = window.innerHeight / 2 + 100; // 50vh + pt-[100px]
    const cameraBottomY = cameraCenterY + cameraHeight / 2 - 320; // Center + half height

    const photoX = window.innerWidth < 768
      ? window.innerWidth / 2 - 85  // Mobile: center (170px / 2)
      : window.innerWidth / 4 - 85; // Desktop: left quarter (170px / 2)

    setPhotos(prev => [...prev, { ...newPhoto, x: photoX, y: cameraBottomY }]);
  }, []);

  const updatePhoto = useCallback((id: string, updates: Partial<PhotoData>) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deletePhoto = useCallback((id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

  const activePhoto = photos.find(p => p.id === editingPhotoId);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-surface-muted text-text-main font-sans selection:bg-brand-accent selection:text-white">

      {/* Global Flash Overlay */}
      <div
        className={`fixed inset-0 bg-white z-[100] pointer-events-none transition-opacity ease-out ${flashActive ? 'opacity-100 duration-0' : 'opacity-0 duration-500'}`}
      />

      {/* Header - Logo & Title */}
      <div className="absolute top-4 left-4 z-50 flex gap-2 items-center animate-fade-in-down select-none">
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center">
          <img
            src="/logo.png"
            alt="InstaGen Logo"
            className="w-10 h-10 object-contain"
            onError={(e) => {
              // Fallback if logo doesn't exist yet
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <h1 className="text-2xl font-bold font-hand bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent tracking-wide pointer-events-none">
          {TRANSLATIONS[lang].title}
        </h1>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-6 right-8 z-50 flex items-center gap-3">
        {/* Guide Button */}
        <button
          onClick={() => setShowGuide(true)}
          className="
            flex items-center gap-2 px-3 py-2
            bg-white/80 backdrop-blur-md
            rounded-full
            border border-white/50
            shadow-sm hover:shadow-md
            hover:-translate-y-0.5 active:translate-y-0
            transition-all duration-200
            group
          "
          title={lang === 'zh' ? '使用指南' : 'Guide'}
        >
          <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
            <span className="text-brand-primary font-bold text-lg leading-none">?</span>
          </div>
          <span className="text-sm font-medium text-text-main group-hover:text-brand-primary hidden sm:block">
            {lang === 'zh' ? '使用指南' : 'Guide'}
          </span>
        </button>

        {/* Public Gallery Entry */}
        <button
          onClick={() => setShowGallery(true)}
          className="
            flex items-center gap-2 px-3 py-2
            bg-white/80 backdrop-blur-md
            rounded-full
            border border-white/50
            shadow-sm hover:shadow-md
            hover:-translate-y-0.5 active:translate-y-0
            transition-all duration-200
            group
          "
          title={TRANSLATIONS[lang].publicGallery}
        >
          <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-brand-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-text-main group-hover:text-brand-primary hidden sm:block">{TRANSLATIONS[lang].publicGallery}</span>
        </button>

        {/* Language Toggle */}
        {!isAuthenticated && (
          <button
            onClick={toggleLang}
            className="
              flex items-center gap-2 px-3 py-2
              bg-white/80 backdrop-blur-md
              rounded-full
              border border-white/50
              shadow-sm hover:shadow-md
              hover:-translate-y-0.5 active:translate-y-0
              transition-all duration-200
              group
            "
          >
            <span className="text-lg group-hover:scale-110 transition-transform">{lang === 'en' ? '🇺🇸' : '🇨🇳'}</span>
            <span className="text-sm font-medium text-text-main group-hover:text-brand-primary">{lang === 'en' ? 'EN' : '中文'}</span>
          </button>
        )}

        {/* User Menu */}
        <UserMenu lang={lang} onLoginClick={() => setIsLoginModalOpen(true)} />
      </div>

      {/* Left Section: Camera Station */}
      <div className="absolute left-0 top-0 bottom-0 w-full md:w-1/2 flex items-center justify-center z-40 pointer-events-none pt-[100px]">
        <div className="pointer-events-auto relative animate-scale-in">
          <Camera onTakePhoto={handleTakePhoto} lang={lang} />

          {/* Decorative background element behind camera */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#E8E4D9] rounded-full -z-10 opacity-50 blur-3xl"></div>
        </div>
      </div>

      {/* Right Section: Photo Board */}
      <div className="absolute inset-0 w-full h-full z-10">
        {/* Warm Polka Dot Background */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle, #F4A261 1.5px, transparent 1.5px),
              radial-gradient(circle, #E76F51 1.5px, transparent 1.5px),
              radial-gradient(circle, #F4A261 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px, 80px 80px, 40px 40px',
            backgroundPosition: '0 0, 37px 23px, 19px 51px'
          }}
        />

        {photos.map((photo, index) => (
          <PolaroidPhoto
            key={photo.id}
            photo={photo}
            lang={lang}
            isLatest={index === photos.length - 1}
            onUpdate={updatePhoto}
            onSelect={bringToFront}
            onEditStart={setEditingPhotoId}
          />
        ))}
      </div>

      {/* Edit Modal */}
      {activePhoto && (
        <PhotoModal
          photo={activePhoto}
          isOpen={!!activePhoto}
          onClose={() => setEditingPhotoId(null)}
          onUpdate={updatePhoto}
          onDelete={deletePhoto}
          onLoginRequest={() => setIsLoginModalOpen(true)}
          lang={lang}
        />
      )}

      {/* Footer Info */}
      <div className="absolute bottom-4 right-4 md:right-auto md:w-full md:text-center text-text-muted text-[11px] z-0 pointer-events-none font-mono tracking-tighter flex items-center justify-center md:justify-center gap-1">
        <span>Powered by Google Gemini 3 Pro · © 2025</span>
        <span className="mx-1">|</span>
        <span className="inline-block animate-spin text-pink-400" style={{ animationDuration: '3s' }}>🌸</span>
        <span className="ml-[4px]">Made by Lucien</span>
      </div>

      <PublicGallery
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        lang={lang}
      />

      <GuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        lang={lang}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        lang={lang}
      />
    </div>
  );
};

export default function AppWrapper() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  );
}
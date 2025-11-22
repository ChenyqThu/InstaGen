import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Camera } from './components/Camera';
import { PolaroidPhoto } from './components/PolaroidPhoto';
import { PhotoModal } from './components/PhotoModal';
import { PublicGallery } from './components/PublicGallery';
import { Language, PhotoData, PhotoFrameStyle, PhotoStatus } from './types';
import { TRANSLATIONS } from './constants';
import { UserMenu } from '@/src/components/auth/UserMenu';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [lang, setLang] = useState<Language>('en');
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

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
    // Position photos to appear from the top of the camera (left 1/4 of screen, visible area)
    setPhotos(prev => [...prev, { ...newPhoto, x: window.innerWidth / 4 - 85, y: 200 }]);
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
    <div className="relative w-screen h-screen overflow-hidden bg-[#F5F5F4] text-gray-800 font-sans selection:bg-[#E6C2A8] selection:text-white">

      {/* Global Flash Overlay */}
      <div
        className={`fixed inset-0 bg-white z-[100] pointer-events-none transition-opacity ease-out ${flashActive ? 'opacity-100 duration-0' : 'opacity-0 duration-500'}`}
      />

      {/* Header - Logo & Title */}
      <div className="absolute top-4 left-4 z-50 flex gap-1 items-center">
        {/* Logo Placeholder */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center">
          {/* TODO: Replace with actual logo image */}
          <img
            src="/logo.png"
            alt="InstaGen Logo"
            className="w-8 h-8 object-contain"
            onError={(e) => {
              // Fallback if logo doesn't exist yet
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <h1 className="text-2xl font-bold font-hand text-[#F35750] tracking-wider opacity-70">
          {TRANSLATIONS[lang].title}
        </h1>
      </div>

      {/* Language Toggle & User Menu - Top Right */}
      <div className="absolute top-6 right-8 z-50 flex items-center gap-4">
        <button
          onClick={toggleLang}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-[#E5E5E5] text-[#E76F51] font-bold hover:bg-white hover:shadow-lg hover:scale-105 transition-all duration-300 group"
        >
          <span className="text-lg group-hover:animate-spin">🌍</span>
          <span className="text-sm">{lang === 'en' ? 'English' : '中文'}</span>
        </button>
        <UserMenu lang={lang} />
      </div>

      {/* Left Section: Camera Station */}
      <div className="absolute left-0 top-0 bottom-0 w-full md:w-1/2 flex items-center justify-center z-40 pointer-events-none">
        <div className="pointer-events-auto relative">
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
          lang={lang}
        />
      )}

      {/* Footer Info */}
      <div className="absolute bottom-4 right-4 md:right-auto md:w-full md:text-center text-gray-400 text-[10px] z-0 pointer-events-none font-mono tracking-tighter">
        POWERED BY GOOGLE GEMINI 2.5 FLASH
      </div>

      {/* Public Gallery Entry */}
      <div className="absolute bottom-6 left-6 z-50">
        <button
          onClick={() => setShowGallery(true)}
          className="group flex items-center gap-3 pr-6 pl-1 py-1 bg-white border-2 border-[#E76F51] rounded-full shadow-[0_4px_14px_rgba(231,111,81,0.3)] hover:shadow-[0_6px_20px_rgba(231,111,81,0.4)] hover:scale-105 transition-all duration-300"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E76F51] to-[#F4A261] flex items-center justify-center text-white shadow-sm group-hover:rotate-12 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
            </svg>
          </div>
          <span className="text-lg font-hand font-bold text-[#E76F51] tracking-wider">{TRANSLATIONS[lang].publicGallery}</span>
        </button>
      </div>

      <PublicGallery
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        lang={lang}
      />
    </div>
  );
};

export default App;
import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Camera } from './components/Camera';
import { PolaroidPhoto } from './components/PolaroidPhoto';
import { PhotoModal } from './components/PhotoModal';
import { Language, PhotoData, PhotoFrameStyle, PhotoStatus } from './types';
import { TRANSLATIONS } from './constants';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [lang, setLang] = useState<Language>('en');
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [flashActive, setFlashActive] = useState(false);
  
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

  const handleTakePhoto = useCallback((dataUrl: string) => {
    // Trigger Global Flash
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 250); // Faster flash

    const newPhoto: PhotoData = {
      id: uuidv4(),
      x: 60, 
      y: -100, 
      rotation: (Math.random() * 6) - 3,
      dataUrl,
      timestamp: Date.now(),
      status: PhotoStatus.DEVELOPING,
      frameStyle: PhotoFrameStyle.CLASSIC,
    };

    // Animation: "Eject" from the camera slot
    // We position it physically near the camera first, then user drags
    setPhotos(prev => [...prev, { ...newPhoto, x: 100, y: window.innerHeight / 2 - 200 }]);
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

      {/* Header / Controls */}
      <div className="absolute top-6 right-8 z-50 flex gap-4 items-center">
        <h1 className="text-2xl font-bold font-hand text-gray-600 tracking-wider hidden md:block opacity-50">
          {TRANSLATIONS[lang].title}
        </h1>
        <button 
          onClick={toggleLang}
          className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-gray-200 text-sm font-medium hover:bg-white transition-colors"
        >
          {lang === 'en' ? '中文' : 'English'}
        </button>
      </div>

      {/* Left Section: Camera Station */}
      <div className="absolute left-0 top-0 bottom-0 w-full md:w-1/3 flex items-center justify-center z-40 pointer-events-none">
        <div className="pointer-events-auto relative pt-10 pl-8">
           <Camera onTakePhoto={handleTakePhoto} lang={lang} />
           
           {/* Decorative background element behind camera */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#E8E4D9] rounded-full -z-10 opacity-50 blur-3xl"></div>
        </div>
      </div>

      {/* Right Section: Photo Board */}
      <div className="absolute inset-0 w-full h-full z-10">
        <div className="absolute top-1/2 right-[20%] text-gray-300 font-bold text-4xl opacity-40 -rotate-6 pointer-events-none select-none hidden md:block">
          {photos.length === 0 ? TRANSLATIONS[lang].dragHint : ''}
        </div>
        
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
    </div>
  );
};

export default App;
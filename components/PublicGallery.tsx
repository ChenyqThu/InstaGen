import React, { useEffect, useState } from 'react';
import { PhotoData, PhotoFrameStyle, PhotoStatus } from '../types';
import { fetchPublicPhotos } from '../services/supabaseClient';
import { PolaroidFrame } from './PolaroidFrame';
import { TRANSLATIONS } from '../constants';

interface PublicGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    lang: 'en' | 'zh';
}

export const PublicGallery: React.FC<PublicGalleryProps> = ({ isOpen, onClose, lang }) => {
    const [photos, setPhotos] = useState<PhotoData[]>([]);
    const [loading, setLoading] = useState(false);
    const t = TRANSLATIONS[lang];

    useEffect(() => {
        if (isOpen) {
            loadPhotos();
        }
    }, [isOpen]);

    const loadPhotos = async () => {
        setLoading(true);
        try {
            const data = await fetchPublicPhotos();
            // Map Supabase data to PhotoData
            const mappedPhotos: PhotoData[] = data.map((p: any) => ({
                id: p.id,
                x: 0,
                y: 0,
                rotation: (Math.random() - 0.5) * 10, // Random rotation for gallery look
                dataUrl: p.data_url,
                timestamp: p.timestamp,
                status: PhotoStatus.DONE,
                frameStyle: p.frame_style as PhotoFrameStyle,
                caption: p.caption,
                promptUsed: p.prompt_used,
            }));
            setPhotos(mappedPhotos);
        } catch (error) {
            console.error('Failed to load public photos:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-[#F5F5F4] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-500">
            {/* Background Pattern */}
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

            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-md border-b border-stone-200 z-10 shadow-sm">
                <h2 className="text-2xl font-bold font-hand text-stone-800">
                    Public Pinboard <span className="text-stone-400 text-sm font-sans font-normal ml-2">Global Gallery</span>
                </h2>
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Gallery Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 z-0">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-400"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 pb-20 pt-8">
                        {photos.map((photo) => (
                            <div key={photo.id} className="relative flex justify-center transform hover:scale-105 transition-transform duration-300 group" style={{ transform: `rotate(${photo.rotation}deg)` }}>
                                {/* Red Pin */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 drop-shadow-md">
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="20" cy="12" r="8" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
                                        <path d="M20 20L20 30" stroke="#991B1B" strokeWidth="3" strokeLinecap="round" />
                                        <circle cx="20" cy="12" r="3" fill="#FCA5A5" fillOpacity="0.5" />
                                    </svg>
                                </div>

                                <PolaroidFrame
                                    dataUrl={photo.dataUrl}
                                    caption={photo.caption}
                                    timestamp={photo.timestamp}
                                    frameStyle={photo.frameStyle}
                                    scale={0.8}
                                    editable={false}
                                    promptUsed={photo.promptUsed}
                                    lang={lang}
                                />
                            </div>
                        ))}
                        {photos.length === 0 && (
                            <div className="col-span-full text-center text-stone-400 py-20">
                                No photos pinned yet. Be the first!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

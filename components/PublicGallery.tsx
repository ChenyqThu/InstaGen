import React, { useEffect, useState } from 'react';
import { X, Globe, ImageIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import { PhotoData, PhotoFrameStyle, PhotoStatus } from '../types';
import { photoService } from '../src/services/photoService';
import { useDrawerAnimation } from '@/src/hooks/useDrawerAnimation';
import { getPokemonConfig } from '@/src/utils/pokemonUtils';
import { PolaroidFrame } from './PolaroidFrame';
import { PokemonCard } from './pokemon-css/PokemonCard';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { INSTAGRAM_FILTERS } from '../config/filterConfig';
import { Skeleton } from '../src/components/ui/Skeleton';

interface PublicGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
}

export const PublicGallery: React.FC<PublicGalleryProps> = ({ isOpen, onClose, lang }) => {
    const [photos, setPhotos] = useState<PhotoData[]>([]);
    const [loading, setLoading] = useState(false);
    const t = TRANSLATIONS[lang];

    // Animation state using shared hook
    const { isMounted, isVisible } = useDrawerAnimation({ isOpen, onClose });

    useEffect(() => {
        if (isOpen) {
            loadPhotos();
        }
    }, [isOpen]);

    const loadPhotos = async () => {
        setLoading(true);
        try {
            const data = await photoService.fetchPublicPhotos();
            const mappedPhotos: PhotoData[] = data.map((p: any) => ({
                id: p.id,
                x: 0,
                y: 0,
                rotation: (Math.random() - 0.5) * 8,
                dataUrl: p.data_url,
                timestamp: p.timestamp,
                status: PhotoStatus.DONE,
                frameStyle: p.frame_style as PhotoFrameStyle,
                caption: p.caption,
                promptUsed: p.prompt_used,
                pokemonId: p.pokemon_id,
                filterId: p.filter_id,
            }));
            setPhotos(mappedPhotos);
        } catch (error) {
            console.error('Failed to load public photos:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className={`
                    absolute inset-0 bg-black/30 backdrop-blur-sm
                    transition-opacity duration-300
                    ${isVisible ? 'opacity-100' : 'opacity-0'}
                `}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`
                    absolute top-0 right-0 bottom-0
                    w-full sm:w-[520px] md:w-[640px] lg:w-[800px]
                    bg-surface-muted
                    shadow-2xl
                    flex flex-col
                    overflow-hidden
                    transition-transform duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isVisible ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Background Pattern */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle, var(--color-brand-primary) 1px, transparent 1px),
                            radial-gradient(circle, var(--color-brand-secondary) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px, 60px 60px',
                        backgroundPosition: '0 0, 20px 20px'
                    }}
                />

                {/* Header */}
                <div className="flex-none px-4 md:px-6 py-4 border-b border-border-default/50 bg-white/80 backdrop-blur-xl relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-md">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-main">{t.publicGallery}</h2>
                                <p className="text-xs text-text-muted">{t.globalGallery}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="
                                p-2 rounded-full
                                bg-black/5 hover:bg-black/10
                                transition-all duration-200
                                hover:scale-110 active:scale-95
                            "
                        >
                            <X className="w-5 h-5 text-text-muted" />
                        </button>
                    </div>
                </div>

                {/* Gallery Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 relative z-0">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6 pb-6">
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex justify-center"
                                    style={{ transform: `rotate(${(Math.random() - 0.5) * 6}deg)` }}
                                >
                                    <div className="w-[160px] p-3 bg-white shadow-lg rounded-sm">
                                        <Skeleton className="w-full aspect-square mb-3 rounded-sm" />
                                        <Skeleton className="w-3/4 h-3 mb-1.5 rounded-sm" />
                                        <Skeleton className="w-1/2 h-2 rounded-sm" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : photos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
                            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-brand-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-text-main">{t.emptyGallery}</h3>
                            <p className="text-center max-w-xs text-sm text-text-muted">
                                {lang === 'zh' ? '成为第一个分享照片的人吧！' : 'Be the first to share a photo!'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6 pb-6">
                            {photos.map((photo, index) => {
                                const filterClass = photo.filterId
                                    ? INSTAGRAM_FILTERS.find(f => f.id === photo.filterId)?.className || ''
                                    : '';
                                const pokemonCard = getPokemonConfig(photo.pokemonId);

                                return (
                                    <div
                                        key={photo.id}
                                        className={`
                                            flex justify-center
                                            transition-all duration-300
                                            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                                        `}
                                        style={{
                                            transitionDelay: `${Math.min(index * 40 + 100, 400)}ms`,
                                            transform: `rotate(${photo.rotation}deg)`
                                        }}
                                    >
                                        <div className="transform hover:scale-105 hover:rotate-0 transition-all duration-300 cursor-pointer hover:z-10">
                                            {pokemonCard ? (
                                                <div className={`w-[140px] sm:w-[160px] ${filterClass}`}>
                                                    <PokemonCard
                                                        {...pokemonCard}
                                                        img={photo.dataUrl}
                                                        name={photo.caption || ''}
                                                        className="w-full h-full"
                                                    >
                                                        <PolaroidFrame
                                                            dataUrl={photo.dataUrl}
                                                            caption={photo.caption}
                                                            timestamp={photo.timestamp}
                                                            frameStyle={photo.frameStyle}
                                                            scale={0.5}
                                                            editable={false}
                                                            promptUsed={photo.promptUsed}
                                                            lang={lang}
                                                        />
                                                    </PokemonCard>
                                                </div>
                                            ) : (
                                                <div className={filterClass}>
                                                    <PolaroidFrame
                                                        dataUrl={photo.dataUrl}
                                                        caption={photo.caption}
                                                        timestamp={photo.timestamp}
                                                        frameStyle={photo.frameStyle}
                                                        scale={0.55}
                                                        editable={false}
                                                        promptUsed={photo.promptUsed}
                                                        lang={lang}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

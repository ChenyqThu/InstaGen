import React, { useState, useMemo } from 'react';
import { X, Search, ChevronDown, Camera } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useMyPhotos } from '@/src/hooks/useMyPhotos';
import { useDrawerAnimation } from '@/src/hooks/useDrawerAnimation';
import { SavedPhoto } from '@/src/services/photoService';
import { PhotoCard } from './PhotoCard';
import { GalleryPhotoModal } from './GalleryPhotoModal';
import { PhotoCardSkeletonGrid } from './PhotoCardSkeleton';
import { TRANSLATIONS } from '@/constants';
import { Language } from '@/types';

interface MyGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
}

type FilterType = 'all' | 'public' | 'private';
type SortOrder = 'newest' | 'oldest';

export const MyGallery: React.FC<MyGalleryProps> = ({ isOpen, onClose, lang }) => {
    const {
        photos,
        loading,
        deletePhoto,
        shareToPublic,
        unshareFromPublic,
        updatePhoto,
    } = useMyPhotos();
    const [selectedPhoto, setSelectedPhoto] = useState<SavedPhoto | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

    // Animation state using shared hook
    const { isMounted, isVisible } = useDrawerAnimation({ isOpen, onClose });

    const t = TRANSLATIONS[lang];

    const filteredAndSortedPhotos = useMemo(() => {
        const filtered = photos.filter(photo => {
            if (filter === 'public' && !photo.is_public) return false;
            if (filter === 'private' && photo.is_public) return false;

            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const caption = (photo.caption || '').toLowerCase();
                const date = new Date(photo.created_at).toLocaleDateString();
                return caption.includes(query) || date.includes(query);
            }

            return true;
        });

        return filtered.sort((a, b) => {
            const timeA = new Date(a.created_at).getTime();
            const timeB = new Date(b.created_at).getTime();
            return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
        });
    }, [photos, filter, searchQuery, sortOrder]);

    const handleUpdatePhoto = async (updates: Partial<SavedPhoto>) => {
        if (!selectedPhoto) return;
        await updatePhoto(selectedPhoto.id, updates);
        setSelectedPhoto(prev => prev ? { ...prev, ...updates } : null);
    };

    const handleDeletePhoto = async () => {
        if (!selectedPhoto) return;
        await deletePhoto(selectedPhoto.id);
        setSelectedPhoto(null);
    };

    const handleShare = async () => {
        if (!selectedPhoto) return;
        await shareToPublic(selectedPhoto.id);
        setSelectedPhoto(prev => prev ? { ...prev, is_public: true } : null);
    };

    const handleUnshare = async () => {
        if (!selectedPhoto) return;
        await unshareFromPublic(selectedPhoto.id);
        setSelectedPhoto(prev => prev ? { ...prev, is_public: false } : null);
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
                    w-full sm:w-[480px] md:w-[560px] lg:w-[640px]
                    bg-surface-muted
                    shadow-2xl
                    flex flex-col
                    transition-transform duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isVisible ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="flex-none px-4 md:px-6 py-4 border-b border-border-default/50 bg-white/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-text-main">{t.myPhotos}</h2>
                            <span className="px-2.5 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-semibold">
                                {photos.length}
                            </span>
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

                    {/* Controls Row */}
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="
                            flex-1 flex items-center
                            px-3 py-2
                            bg-white/80 backdrop-blur-md
                            border border-white/50
                            rounded-full
                            shadow-sm
                            focus-within:ring-2 focus-within:ring-brand-primary/20
                            transition-all
                        ">
                            <Search className="w-4 h-4 text-text-muted mr-2 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder={t.searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent outline-none text-text-main placeholder:text-text-muted text-sm min-w-0"
                            />
                        </div>

                        {/* Sort */}
                        <div className="relative flex-shrink-0">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                                className="
                                    appearance-none
                                    pl-3 pr-8 py-2
                                    bg-white/80 backdrop-blur-md
                                    border border-white/50
                                    rounded-full
                                    text-sm font-medium text-text-main
                                    shadow-sm hover:shadow-md
                                    cursor-pointer
                                    transition-all
                                    focus:outline-none focus:ring-2 focus:ring-brand-primary/20
                                "
                            >
                                <option value="newest">{t.sortNewest}</option>
                                <option value="oldest">{t.sortOldest}</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                        </div>

                        {/* Filter Pills */}
                        <div className="hidden sm:flex items-center gap-1 p-1 bg-white/80 backdrop-blur-md rounded-full border border-white/50 shadow-sm flex-shrink-0">
                            {(['all', 'public', 'private'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`
                                        px-3 py-1.5
                                        rounded-full text-sm font-medium
                                        transition-all duration-200
                                        ${filter === f
                                            ? 'bg-brand-primary text-white shadow-sm'
                                            : 'text-text-muted hover:text-text-main hover:bg-black/5'
                                        }
                                    `}
                                >
                                    {t[f]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Filter (below search on small screens) */}
                    <div className="flex sm:hidden items-center gap-1 p-1 mt-3 bg-white/80 backdrop-blur-md rounded-full border border-white/50 shadow-sm">
                        {(['all', 'public', 'private'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`
                                    flex-1 px-2 py-1.5
                                    rounded-full text-sm font-medium
                                    transition-all duration-200
                                    ${filter === f
                                        ? 'bg-brand-primary text-white shadow-sm'
                                        : 'text-text-muted hover:text-text-main hover:bg-black/5'
                                    }
                                `}
                            >
                                {t[f]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {loading ? (
                        <PhotoCardSkeletonGrid count={6} />
                    ) : filteredAndSortedPhotos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
                            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                                <Camera className="w-8 h-8 text-brand-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-text-main">{t.noPhotosTitle}</h3>
                            <p className="text-center max-w-xs text-sm text-text-muted">{t.noPhotosDescription}</p>
                            <button
                                onClick={onClose}
                                className="
                                    mt-2 px-5 py-2.5
                                    bg-gradient-to-r from-brand-primary to-brand-secondary
                                    text-white rounded-xl font-medium text-sm
                                    shadow-md hover:shadow-lg
                                    hover:-translate-y-0.5 active:translate-y-0
                                    transition-all duration-200
                                "
                            >
                                {t.goTakePhoto} →
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-5 pb-6">
                            {filteredAndSortedPhotos.map((photo, index) => (
                                <div
                                    key={photo.id}
                                    className={`
                                        flex justify-center
                                        transition-all duration-300
                                        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                                    `}
                                    style={{ transitionDelay: `${Math.min(index * 50 + 150, 400)}ms` }}
                                >
                                    <PhotoCard
                                        photo={photo}
                                        size="md"
                                        onClick={() => setSelectedPhoto(photo)}
                                        showStatus={true}
                                        lang={lang}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Photo Edit Modal */}
            {selectedPhoto && (
                <GalleryPhotoModal
                    photo={selectedPhoto}
                    isOpen={!!selectedPhoto}
                    onClose={() => setSelectedPhoto(null)}
                    onUpdate={handleUpdatePhoto}
                    onDelete={handleDeletePhoto}
                    onShare={handleShare}
                    onUnshare={handleUnshare}
                    lang={lang}
                />
            )}
        </div>,
        document.body
    );
};

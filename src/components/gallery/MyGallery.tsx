import React, { useState, useMemo } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import { useMyPhotos } from '@/src/hooks/useMyPhotos';
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
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    const t = TRANSLATIONS[lang];

    const filteredAndSortedPhotos = useMemo(() => {
        const filtered = photos.filter(photo => {
            // Filter by type
            if (filter === 'public' && !photo.is_public) return false;
            if (filter === 'private' && photo.is_public) return false;

            // Filter by search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const caption = (photo.caption || '').toLowerCase();
                const date = new Date(photo.created_at).toLocaleDateString();
                return caption.includes(query) || date.includes(query);
            }

            return true;
        });

        // Sort by date
        return filtered.sort((a, b) => {
            const timeA = new Date(a.created_at).getTime();
            const timeB = new Date(b.created_at).getTime();
            return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
        });
    }, [photos, filter, searchQuery, sortOrder]);

    const handleUpdatePhoto = async (updates: Partial<SavedPhoto>) => {
        if (!selectedPhoto) return;
        await updatePhoto(selectedPhoto.id, updates);
        // Update selectedPhoto with new data
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 bg-stone-100 animate-in slide-in-from-bottom-10 duration-300 flex flex-col">
            {/* Header */}
            <div className="flex-none px-4 md:px-6 py-4 border-b border-gray-200 bg-white/50 backdrop-blur-sm relative">
                {/* Mobile Search Overlay */}
                {showMobileSearch && (
                    <div className="absolute inset-x-0 top-0 bg-white p-4 shadow-md z-10 flex items-center gap-2 md:hidden">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                            autoFocus
                        />
                        <button
                            onClick={() => {
                                setShowMobileSearch(false);
                                setSearchQuery('');
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">{t.myPhotos}</h2>
                        <span className="px-2 md:px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                            {photos.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Mobile Search Button */}
                        <button
                            onClick={() => setShowMobileSearch(true)}
                            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Search className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* Desktop Search */}
                        <div className="hidden md:flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                            <Search className="w-5 h-5 text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder={t.searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent outline-none text-gray-700 placeholder:text-gray-400 w-48"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                                className="appearance-none pl-3 md:pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 cursor-pointer hover:border-orange-300 transition-colors min-w-[110px]"
                            >
                                <option value="newest">{t.sortNewest}</option>
                                <option value="oldest">{t.sortOldest}</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Filter (hidden on small mobile) */}
                        <div className="hidden sm:flex items-center gap-1 md:gap-2 bg-white p-1 rounded-xl border border-gray-200">
                            {(['all', 'public', 'private'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-2 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                        ? 'bg-orange-50 text-orange-600 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {t[f]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {loading ? (
                    <PhotoCardSkeletonGrid count={8} />
                ) : filteredAndSortedPhotos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4 py-20">
                        <div className="text-7xl animate-bounce">📷</div>
                        <h3 className="text-xl font-bold text-gray-700">{t.noPhotosTitle}</h3>
                        <p className="text-center max-w-xs text-gray-500">{t.noPhotosDescription}</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-6 py-3 bg-gradient-to-r from-[#E76F51] to-[#F4A261] text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105"
                        >
                            {t.goTakePhoto} →
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                        {filteredAndSortedPhotos.map((photo) => (
                            <div key={photo.id} className="flex justify-center">
                                <PhotoCard
                                    photo={photo}
                                    size="lg"
                                    onClick={() => setSelectedPhoto(photo)}
                                    showStatus={true}
                                    lang={lang}
                                />
                            </div>
                        ))}
                    </div>
                )}
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
        </div>
    );
};

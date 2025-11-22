import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { useMyPhotos } from '@/src/hooks/useMyPhotos';
import { SavedPhoto } from '@/src/services/photoService';
import { PhotoCard } from './PhotoCard';
import { GalleryPhotoModal } from './GalleryPhotoModal';
import { TRANSLATIONS } from '@/constants';
import { Language } from '@/types';

interface MyGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
}

type FilterType = 'all' | 'public' | 'private';

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

    const t = TRANSLATIONS[lang];

    const filteredPhotos = useMemo(() => {
        return photos.filter(photo => {
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
    }, [photos, filter, searchQuery]);

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
        <div className="fixed inset-0 z-40 bg-[#FDF8F5] animate-in slide-in-from-bottom-10 duration-300 flex flex-col">
            {/* Header */}
            <div className="flex-none px-6 py-4 border-b border-gray-200 bg-white/50 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">{t.myPhotos}</h2>
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                        {photos.length}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="hidden md:flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                        <Search className="w-5 h-5 text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent outline-none text-gray-700 placeholder:text-gray-400 w-48"
                        />
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200">
                        {(['all', 'public', 'private'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    filter === f
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="animate-spin mr-2">⏳</div> {t.loading}
                    </div>
                ) : filteredPhotos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                        <div className="text-6xl">📸</div>
                        <p className="text-lg font-medium">{t.noPhotos}</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                        {filteredPhotos.map((photo) => (
                            <PhotoCard
                                key={photo.id}
                                photo={photo}
                                size="md"
                                onClick={() => setSelectedPhoto(photo)}
                                showStatus={true}
                                lang={lang}
                            />
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

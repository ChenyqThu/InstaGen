import React, { useState, useMemo } from 'react';
import { X, Search, Filter, Globe, Lock } from 'lucide-react';
import { useMyPhotos } from '@/src/hooks/useMyPhotos';
import { SavedPhoto } from '@/src/services/photoService';
import { PhotoActions } from './PhotoActions';
import { TRANSLATIONS } from '@/constants';
import { Language } from '@/types';

interface MyGalleryProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
}

type FilterType = 'all' | 'public' | 'private';

export const MyGallery: React.FC<MyGalleryProps> = ({ isOpen, onClose, lang }) => {
    const { photos, loading, deletePhoto, shareToPublic, unshareFromPublic } = useMyPhotos();
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

    const handleDownload = async (photo: SavedPhoto) => {
        try {
            const link = document.createElement('a');
            link.href = photo.data_url;
            link.download = `instagen-${new Date(photo.created_at).getTime()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Download failed', err);
        }
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
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredPhotos.map((photo) => (
                            <div
                                key={photo.id}
                                onClick={() => setSelectedPhoto(photo)}
                                className="group relative aspect-[3/4] bg-white p-3 pb-12 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rotate-0 hover:rotate-1"
                            >
                                {/* Photo */}
                                <div className="w-full h-full bg-gray-100 overflow-hidden">
                                    <img
                                        src={photo.data_url}
                                        alt={photo.caption}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Caption */}
                                <div className="absolute bottom-3 left-3 right-3 text-center">
                                    <p className="text-sm font-hand text-gray-600 truncate">
                                        {photo.caption || t.defaultCaption}
                                    </p>
                                </div>

                                {/* Status Icon */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {photo.is_public ? (
                                        <div className="p-1.5 bg-blue-500 text-white rounded-full shadow-sm">
                                            <Globe className="w-3 h-3" />
                                        </div>
                                    ) : (
                                        <div className="p-1.5 bg-gray-500 text-white rounded-full shadow-sm">
                                            <Lock className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>

                                {/* Date */}
                                <div className="absolute -bottom-8 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-gray-400">
                                        {new Date(photo.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Photo Actions Modal */}
            {selectedPhoto && (
                <PhotoActions
                    photo={selectedPhoto}
                    lang={lang}
                    onClose={() => setSelectedPhoto(null)}
                    onDelete={async () => {
                        await deletePhoto(selectedPhoto.id);
                        setSelectedPhoto(null);
                    }}
                    onShare={async () => {
                        await shareToPublic(selectedPhoto.id);
                        setSelectedPhoto(prev => prev ? { ...prev, is_public: true } : null);
                    }}
                    onUnshare={async () => {
                        await unshareFromPublic(selectedPhoto.id);
                        setSelectedPhoto(prev => prev ? { ...prev, is_public: false } : null);
                    }}
                    onDownload={() => handleDownload(selectedPhoto)}
                />
            )}
        </div>
    );
};

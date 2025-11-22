import React, { useState } from 'react';
import { Download, Share2, Trash2, X, Globe, Lock } from 'lucide-react';
import { SavedPhoto } from '@/src/services/photoService';
import { TRANSLATIONS } from '@/constants';
import { Language } from '@/types';

interface PhotoActionsProps {
    photo: SavedPhoto;
    onDelete: () => void;
    onShare: () => void;
    onUnshare: () => void;
    onDownload: () => void;
    onClose: () => void;
    lang: Language;
}

export const PhotoActions: React.FC<PhotoActionsProps> = ({
    photo,
    onDelete,
    onShare,
    onUnshare,
    onDownload,
    onClose,
    lang,
}) => {
    const t = TRANSLATIONS[lang];
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = () => {
        if (showDeleteConfirm) {
            onDelete();
        } else {
            setShowDeleteConfirm(true);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-[#FDF8F5] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/50 hover:bg-white transition-colors z-10"
                >
                    <X className="w-6 h-6 text-gray-600" />
                </button>

                {/* Photo Preview */}
                <div className="relative bg-gray-100 aspect-square flex items-center justify-center overflow-hidden">
                    <img
                        src={photo.data_url}
                        alt={photo.caption || 'Photo'}
                        className="w-full h-full object-contain"
                    />
                    {photo.is_public && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 rounded-full flex items-center gap-2 shadow-sm">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-medium text-gray-600">{t.public}</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">

                    {/* Metadata */}
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-800">
                            {photo.caption || t.defaultCaption}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>📅 {new Date(photo.created_at).toLocaleDateString()}</span>
                            {photo.filter_id && <span>🎨 {photo.filter_id}</span>}
                            {photo.frame_style && <span>🖼️ {photo.frame_style}</span>}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onDownload}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-[#E76F51] hover:text-[#E76F51] transition-all font-medium text-gray-700"
                        >
                            <Download className="w-5 h-5" />
                            {t.download}
                        </button>

                        <button
                            onClick={photo.is_public ? onUnshare : onShare}
                            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-xl transition-all font-medium ${photo.is_public
                                ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-500'
                                }`}
                        >
                            {photo.is_public ? <Lock className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                            {photo.is_public ? t.unshare : t.share}
                        </button>
                    </div>

                    {/* Delete */}
                    <div className="pt-2 border-t border-gray-100">
                        {showDeleteConfirm ? (
                            <div className="flex items-center justify-between bg-red-50 p-3 rounded-xl animate-in slide-in-from-bottom-2">
                                <span className="text-sm text-red-600 font-medium">{t.deleteConfirm}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white rounded-lg transition-colors"
                                    >
                                        {t.cancel}
                                    </button>
                                    <button
                                        onClick={onDelete}
                                        className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
                                    >
                                        {t.delete}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
                            >
                                <Trash2 className="w-5 h-5" />
                                {t.delete}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { photoService, SavedPhoto } from '../services/photoService';
import { PhotoData } from '../../types';

export function useMyPhotos() {
    const { user } = useAuth();
    const [photos, setPhotos] = useState<SavedPhoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchPhotos = useCallback(async () => {
        if (!user) {
            setPhotos([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await photoService.getUserPhotos(user.id);
            setPhotos(data);
        } catch (err) {
            console.error('Error fetching photos:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    const savePhoto = async (photo: PhotoData) => {
        if (!user) throw new Error('User must be logged in to save photos');

        try {
            setLoading(true);
            const savedPhoto = await photoService.savePhoto(photo, user.id);
            setPhotos(prev => [savedPhoto, ...prev]);
            return savedPhoto;
        } catch (err) {
            console.error('Error saving photo:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deletePhoto = async (photoId: string) => {
        if (!user) return;

        try {
            await photoService.deletePhoto(photoId, user.id);
            setPhotos(prev => prev.filter(p => p.id !== photoId));
        } catch (err) {
            console.error('Error deleting photo:', err);
            throw err;
        }
    };

    const shareToPublic = async (photoId: string) => {
        if (!user) return;

        try {
            await photoService.shareToPublic(photoId, user.id);
            setPhotos(prev => prev.map(p =>
                p.id === photoId ? { ...p, is_public: true } : p
            ));
        } catch (err) {
            console.error('Error sharing photo:', err);
            throw err;
        }
    };

    const unshareFromPublic = async (photoId: string) => {
        if (!user) return;

        try {
            await photoService.unshareFromPublic(photoId, user.id);
            setPhotos(prev => prev.map(p =>
                p.id === photoId ? { ...p, is_public: false } : p
            ));
        } catch (err) {
            console.error('Error unsharing photo:', err);
            throw err;
        }
    };

    const updateCaption = async (photoId: string, caption: string) => {
        if (!user) return;

        try {
            await photoService.updatePhotoCaption(photoId, user.id, caption);
            setPhotos(prev => prev.map(p =>
                p.id === photoId ? { ...p, caption } : p
            ));
        } catch (err) {
            console.error('Error updating caption:', err);
            throw err;
        }
    };

    return {
        photos,
        loading,
        error,
        savePhoto,
        deletePhoto,
        shareToPublic,
        unshareFromPublic,
        updateCaption,
        refresh: fetchPhotos,
    };
}

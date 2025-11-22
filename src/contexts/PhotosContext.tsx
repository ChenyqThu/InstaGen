import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { photoService, SavedPhoto } from '../services/photoService';
import { PhotoData } from '../../types';

interface PhotosContextType {
    photos: SavedPhoto[];
    loading: boolean;
    error: Error | null;
    savePhoto: (photo: PhotoData) => Promise<SavedPhoto>;
    deletePhoto: (photoId: string) => Promise<void>;
    shareToPublic: (photoId: string) => Promise<void>;
    unshareFromPublic: (photoId: string) => Promise<void>;
    updateCaption: (photoId: string, caption: string) => Promise<void>;
    updatePhoto: (photoId: string, updates: {
        data_url?: string;
        caption?: string;
        frame_style?: string;
        pokemon_id?: string | null;
        prompt_used?: string;
    }) => Promise<SavedPhoto | undefined>;
    refresh: () => Promise<void>;
}

const PhotosContext = createContext<PhotosContextType | null>(null);

interface PhotosProviderProps {
    children: ReactNode;
}

export const PhotosProvider: React.FC<PhotosProviderProps> = ({ children }) => {
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

    const savePhoto = async (photo: PhotoData): Promise<SavedPhoto> => {
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

    const deletePhoto = async (photoId: string): Promise<void> => {
        if (!user) return;

        try {
            await photoService.deletePhoto(photoId, user.id);
            setPhotos(prev => prev.filter(p => p.id !== photoId));
        } catch (err) {
            console.error('Error deleting photo:', err);
            throw err;
        }
    };

    const shareToPublic = async (photoId: string): Promise<void> => {
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

    const unshareFromPublic = async (photoId: string): Promise<void> => {
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

    const updateCaption = async (photoId: string, caption: string): Promise<void> => {
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

    const updatePhoto = async (
        photoId: string,
        updates: {
            data_url?: string;
            caption?: string;
            frame_style?: string;
            pokemon_id?: string | null;
            prompt_used?: string;
        }
    ): Promise<SavedPhoto | undefined> => {
        if (!user) return;

        try {
            const updated = await photoService.updatePhoto(photoId, user.id, updates);
            setPhotos(prev => prev.map(p =>
                p.id === photoId ? updated : p
            ));
            return updated;
        } catch (err) {
            console.error('Error updating photo:', err);
            throw err;
        }
    };

    const value: PhotosContextType = {
        photos,
        loading,
        error,
        savePhoto,
        deletePhoto,
        shareToPublic,
        unshareFromPublic,
        updateCaption,
        updatePhoto,
        refresh: fetchPhotos,
    };

    return (
        <PhotosContext.Provider value={value}>
            {children}
        </PhotosContext.Provider>
    );
};

export const usePhotos = (): PhotosContextType => {
    const context = useContext(PhotosContext);
    if (!context) {
        throw new Error('usePhotos must be used within a PhotosProvider');
    }
    return context;
};

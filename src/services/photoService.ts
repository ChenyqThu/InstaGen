import { supabase } from './supabaseClient';
import { PhotoData } from '../../types';

export interface SavedPhoto {
    id: string;
    user_id: string;
    data_url: string;
    caption?: string;
    frame_style: string;
    filter_id?: string;
    pokemon_id?: string;
    prompt_used?: string;
    is_public: boolean;
    created_at: string;
}

export const photoService = {
    /**
     * Save a photo to the user's personal gallery
     */
    async savePhoto(photo: PhotoData, userId: string): Promise<SavedPhoto> {
        const { data, error } = await supabase
            .from('user_photos')
            .insert({
                user_id: userId,
                data_url: photo.dataUrl,
                caption: photo.caption,
                frame_style: photo.frameStyle,
                filter_id: photo.filterId,
                pokemon_id: photo.pokemonId,
                prompt_used: photo.promptUsed,
                is_public: false,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get all photos for a specific user
     */
    async getUserPhotos(userId: string): Promise<SavedPhoto[]> {
        const { data, error } = await supabase
            .from('user_photos')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Delete a photo
     */
    async deletePhoto(photoId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('user_photos')
            .delete()
            .eq('id', photoId)
            .eq('user_id', userId);

        if (error) throw error;
    },

    /**
     * Share a photo to the public gallery
     */
    async shareToPublic(photoId: string, userId: string): Promise<void> {
        // First get the photo to ensure it exists and belongs to user
        const { data: photo, error: fetchError } = await supabase
            .from('user_photos')
            .select('*')
            .eq('id', photoId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !photo) throw fetchError || new Error('Photo not found');

        // Update is_public flag
        const { error: updateError } = await supabase
            .from('user_photos')
            .update({ is_public: true })
            .eq('id', photoId);

        if (updateError) throw updateError;

        // Insert into public_photos
        // Note: public_photos table structure might vary, assuming it has similar fields
        // Based on the SQL script, we added user_id and source_photo_id
        // We might need to duplicate data or just link it. 
        // The SQL script says:
        // alter table public_photos add column user_id ..., add column source_photo_id ...
        // So we probably need to insert a new record into public_photos

        const { error: insertError } = await supabase
            .from('public_photos')
            .insert({
                user_id: userId,
                source_photo_id: photoId,
                data_url: photo.data_url,
                caption: photo.caption,
                frame_style: photo.frame_style,
                filter_id: photo.filter_id,
                pokemon_id: photo.pokemon_id,
                prompt_used: photo.prompt_used,
                created_at: new Date().toISOString(), // Public photo creation time
            });

        if (insertError) throw insertError;
    },

    /**
     * Unshare a photo from the public gallery
     */
    async unshareFromPublic(photoId: string, userId: string): Promise<void> {
        // Update is_public flag
        const { error: updateError } = await supabase
            .from('user_photos')
            .update({ is_public: false })
            .eq('id', photoId)
            .eq('user_id', userId);

        if (updateError) throw updateError;

        // Delete from public_photos
        const { error: deleteError } = await supabase
            .from('public_photos')
            .delete()
            .eq('source_photo_id', photoId)
            .eq('user_id', userId);

        if (deleteError) throw deleteError;
    },

    /**
     * Update photo caption
     */
    async updatePhotoCaption(photoId: string, userId: string, caption: string): Promise<void> {
        const { error } = await supabase
            .from('user_photos')
            .update({ caption })
            .eq('id', photoId)
            .eq('user_id', userId);

        if (error) throw error;
    }
};

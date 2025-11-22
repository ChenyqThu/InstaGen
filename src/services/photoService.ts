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
     * Get all photos for a specific user (excluding archived)
     */
    async getUserPhotos(userId: string): Promise<SavedPhoto[]> {
        const { data, error } = await supabase
            .from('user_photos')
            .select('*')
            .eq('user_id', userId)
            .eq('archived', false)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Soft delete a photo (set archived = true)
     */
    async deletePhoto(photoId: string, userId: string): Promise<void> {
        // First, archive in public_photos if it was shared
        const { error: publicArchiveError } = await supabase
            .from('public_photos')
            .update({ archived: true })
            .eq('source_photo_id', photoId)
            .eq('user_id', userId);

        if (publicArchiveError) {
            console.error('Failed to archive in public_photos:', publicArchiveError);
        }

        // Then archive in user_photos
        const { error } = await supabase
            .from('user_photos')
            .update({ archived: true })
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
                timestamp: new Date(photo.created_at).getTime(),
            });

        if (insertError) throw insertError;
    },

    /**
     * Unshare a photo from the public gallery (soft delete)
     */
    async unshareFromPublic(photoId: string, userId: string): Promise<void> {
        // Update is_public flag in user_photos
        const { error: updateError } = await supabase
            .from('user_photos')
            .update({ is_public: false })
            .eq('id', photoId)
            .eq('user_id', userId);

        if (updateError) throw updateError;

        // Soft delete from public_photos (set archived = true)
        const { error: archiveError } = await supabase
            .from('public_photos')
            .update({ archived: true })
            .eq('source_photo_id', photoId)
            .eq('user_id', userId);

        if (archiveError) throw archiveError;
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
    },

    /**
     * Update photo (after AI edit or style changes)
     */
    async updatePhoto(
        photoId: string,
        userId: string,
        updates: {
            data_url?: string;
            caption?: string;
            frame_style?: string;
            pokemon_id?: string | null;
            prompt_used?: string;
        }
    ): Promise<SavedPhoto> {
        // Build update object, only include defined fields
        const updateData: Record<string, unknown> = {};
        if (updates.data_url !== undefined) updateData.data_url = updates.data_url;
        if (updates.caption !== undefined) updateData.caption = updates.caption;
        if (updates.frame_style !== undefined) updateData.frame_style = updates.frame_style;
        if (updates.pokemon_id !== undefined) updateData.pokemon_id = updates.pokemon_id;
        if (updates.prompt_used !== undefined) updateData.prompt_used = updates.prompt_used;

        const { data, error } = await supabase
            .from('user_photos')
            .update(updateData)
            .eq('id', photoId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Fetch all public photos for the gallery (excluding archived)
     */
    async fetchPublicPhotos() {
        const { data, error } = await supabase
            .from('public_photos')
            .select('*')
            .eq('archived', false)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return data || [];
    },

    /**
     * Pin a photo directly to public gallery (without saving to user_photos first)
     */
    async pinPhotoToPublic(photo: PhotoData) {
        const { error } = await supabase
            .from('public_photos')
            .insert({
                data_url: photo.dataUrl,
                caption: photo.caption,
                frame_style: photo.frameStyle,
                timestamp: photo.timestamp,
                prompt_used: photo.promptUsed,
                pokemon_id: photo.pokemonId,
                filter_id: photo.filterId,
            });

        if (error) throw error;
    }
};

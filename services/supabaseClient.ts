
import { createClient } from '@supabase/supabase-js';
import { PhotoData } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const pinPhotoToPublic = async (photo: PhotoData) => {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
        .from('public_photos')
        .insert({
            data_url: photo.dataUrl,
            caption: photo.caption,
            frame_style: photo.frameStyle,
            timestamp: photo.timestamp,
            prompt_used: photo.promptUsed,
        });

    if (error) throw error;
};

export const fetchPublicPhotos = async () => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('public_photos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) throw error;
    return data;
};

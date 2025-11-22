import { supabase } from './supabaseClient';
import { USAGE_CONFIG } from '../config/usageConfig';

export interface UsageInfo {
    used: number;
    limit: number;
    remaining: number;
    hasCustomKey: boolean;
}

/**
 * Get today's usage information for a user
 */
export const getTodayUsage = async (userId: string): Promise<UsageInfo> => {
    const today = new Date().toISOString().split('T')[0];

    // Get today's usage count
    const { data: usage, error: usageError } = await supabase
        .from('user_usage')
        .select('gemini_calls')
        .eq('user_id', userId)
        .eq('usage_date', today)
        .maybeSingle();

    if (usageError && usageError.code !== 'PGRST116') {
        console.error('Error fetching usage:', usageError);
    }

    // Get custom API key from user profile
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('custom_gemini_key')
        .eq('id', userId)
        .single();

    if (profileError) {
        console.error('Error fetching profile:', profileError);
    }

    const used = usage?.gemini_calls || 0;
    const limit = USAGE_CONFIG.DAILY_FREE_LIMIT;
    const hasCustomKey = !!profile?.custom_gemini_key;

    return {
        used,
        limit,
        remaining: Math.max(0, limit - used),
        hasCustomKey,
    };
};

/**
 * Get user's custom Gemini API key
 */
export const getCustomKey = async (userId: string): Promise<string | null> => {
    const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('custom_gemini_key')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching custom key:', error);
        return null;
    }

    return profile?.custom_gemini_key || null;
};

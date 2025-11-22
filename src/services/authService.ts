import { supabase } from './supabaseClient';
import { User, ProfileUpdate, OAuthProvider, UserProfile } from '../types/auth';

export const authService = {
    async signInWithOAuth(provider: OAuthProvider) {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) throw error;
    },

    async signInWithEmail(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    },

    async signUpWithEmail(email: string, password: string, displayName: string) {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: displayName,
                },
            },
        });
        if (error) throw error;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const profile = await this.getUserProfile(user.id);

        return {
            id: user.id,
            email: user.email!,
            displayName: profile?.display_name || user.user_metadata.full_name || user.user_metadata.name || null,
            avatarUrl: profile?.avatar_url || user.user_metadata.avatar_url || null,
            customGeminiKey: profile?.custom_gemini_key || null,
            createdAt: user.created_at,
        };
    },

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
        return data;
    },

    async updateUserProfile(userId: string, updates: ProfileUpdate) {
        const { error } = await supabase
            .from('user_profiles')
            .update({
                display_name: updates.displayName,
                avatar_url: updates.avatarUrl,
                custom_gemini_key: updates.customGeminiKey,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (error) throw error;
    },

    onAuthStateChange(callback: (user: User | null) => void) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                const user = await this.getCurrentUser();
                callback(user);
            } else if (event === 'SIGNED_OUT') {
                callback(null);
            }
        });

        return () => subscription.unsubscribe();
    },
};

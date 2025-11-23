import { supabase } from './supabaseClient';
import { User, ProfileUpdate, OAuthProvider, UserProfile } from '../types/auth';
import { Language } from '../../types';

export const authService = {
    async signInWithOAuth(provider: OAuthProvider) {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                // Redirect to origin root - Supabase will handle the hash fragment
                // with detectSessionInUrl: true in supabaseClient config
                redirectTo: window.location.origin,
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
        // Use getSession() instead of getUser() - it reads from localStorage
        // and auto-refreshes expired tokens, ensuring session persistence
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        const user = session.user;
        const profile = await this.getUserProfile(user.id);

        return {
            id: user.id,
            email: user.email!,
            displayName: profile?.display_name || user.user_metadata.full_name || user.user_metadata.name || null,
            avatarUrl: profile?.avatar_url || user.user_metadata.avatar_url || null,
            customGeminiKey: profile?.custom_gemini_key || null,
            language: (profile?.language as Language) || 'en',
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
            // PGRST116 means no rows found, which is not an error for new users
            if (error.code !== 'PGRST116') {
                console.error('Error fetching user profile:', error);
            }
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
                language: updates.language,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (error) throw error;
    },

    onAuthStateChange(callback: (user: User | null) => void) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // IMPORTANT: Do NOT await Supabase calls directly in this callback!
            // It causes a deadlock (see: https://github.com/supabase/gotrue-js/issues/762)
            // Use setTimeout to defer async work after callback completes.

            if (event === 'SIGNED_OUT') {
                callback(null);
                return;
            }

            if (session?.user) {
                const user = session.user;
                // Immediately set basic user info from session
                const basicUser = {
                    id: user.id,
                    email: user.email!,
                    displayName: user.user_metadata.full_name || user.user_metadata.name || null,
                    avatarUrl: user.user_metadata.avatar_url || null,
                    customGeminiKey: null as string | null,
                    language: 'en' as Language,
                    createdAt: user.created_at,
                };
                callback(basicUser);

                // Defer profile loading to avoid deadlock
                setTimeout(async () => {
                    const profile = await this.getUserProfile(user.id);
                    if (profile) {
                        callback({
                            ...basicUser,
                            displayName: profile.display_name || basicUser.displayName,
                            avatarUrl: profile.avatar_url || basicUser.avatarUrl,
                            customGeminiKey: profile.custom_gemini_key || null,
                            language: (profile.language as Language) || 'en',
                        });
                    }
                }, 0);
            }
        });

        return () => subscription.unsubscribe();
    },

    async deleteAccount(userId: string) {
        // Note: This only deletes the user profile data. 
        // To fully delete the auth user, we would need a server-side admin function.
        const { error } = await supabase
            .from('user_profiles')
            .delete()
            .eq('id', userId);

        if (error) throw error;
        await this.signOut();
    },
};

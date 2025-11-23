import { Language } from '../../types';

export interface User {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    customGeminiKey: string | null;
    language?: Language;
    createdAt: string;
}

export interface ProfileUpdate {
    displayName?: string;
    avatarUrl?: string;
    customGeminiKey?: string | null;
    language?: Language;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: Error | null;
}

export type OAuthProvider = 'google' | 'github';

export interface UserProfile {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    custom_gemini_key: string | null;
    language?: string;
    created_at: string;
    updated_at: string;
}

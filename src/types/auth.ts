export interface User {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    customGeminiKey: string | null;
    createdAt: string;
}

export interface ProfileUpdate {
    displayName?: string;
    avatarUrl?: string;
    customGeminiKey?: string;
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
    created_at: string;
    updated_at: string;
}

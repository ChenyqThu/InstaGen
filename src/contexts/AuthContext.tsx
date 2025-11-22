import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { User, AuthState, OAuthProvider, ProfileUpdate } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
    isAuthenticated: boolean;
    signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (updates: ProfileUpdate) => Promise<void>;
}

const initialState: AuthState = {
    user: null,
    loading: true,
    error: null,
};

type AuthAction =
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: Error | null };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload, loading: false, error: null };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        default:
            return state;
    }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const user = await authService.getCurrentUser();
                dispatch({ type: 'SET_USER', payload: user });
            } catch (error) {
                console.error('Auth initialization error:', error);
                dispatch({ type: 'SET_ERROR', payload: error as Error });
            }
        };

        initAuth();

        const unsubscribe = authService.onAuthStateChange((user) => {
            dispatch({ type: 'SET_USER', payload: user });
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const signInWithOAuth = async (provider: OAuthProvider) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            await authService.signInWithOAuth(provider);
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error as Error });
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            await authService.signInWithEmail(email, password);
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error as Error });
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            await authService.signUpWithEmail(email, password, displayName);
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error as Error });
            throw error;
        }
    };

    const signOut = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            await authService.signOut();
            dispatch({ type: 'SET_USER', payload: null });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error as Error });
            throw error;
        }
    };

    const updateProfile = async (updates: ProfileUpdate) => {
        if (!state.user) return;
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            await authService.updateUserProfile(state.user.id, updates);
            const updatedUser = await authService.getCurrentUser();
            dispatch({ type: 'SET_USER', payload: updatedUser });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error as Error });
            throw error;
        }
    };

    const value = {
        ...state,
        isAuthenticated: !!state.user,
        signInWithOAuth,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

import React, { useState } from 'react';
import { Github } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { TRANSLATIONS } from '@/constants';
import { Language } from '@/types';
import { useToast } from '../../contexts/ToastContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, lang }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp, signInWithGoogle, signInWithGithub, error } = useAuth();
    const { success, error: toastError } = useToast();
    const t = TRANSLATIONS[lang];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === 'login') {
                await signIn(email, password);
            } else {
                await signUp(email, password, displayName);
            }
            onClose();
            success(mode === 'login' ? t.loginSuccess : t.registerSuccess);
        } catch (error: any) {
            console.error('Auth failed:', error);
            toastError(error.message || t.error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            onClose();
            success(t.loginSuccess);
        } catch (error: any) {
            console.error('Google auth failed:', error);
            toastError(error.message || t.error);
        }
    };

    const handleGithubLogin = async () => {
        try {
            await signInWithGithub();
            onClose();
            success(t.loginSuccess);
        } catch (error: any) {
            console.error('Github auth failed:', error);
            toastError(error.message || t.error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <Modal.Header showCloseButton={true}>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                        <img src="/logo.png" alt="InstaGen Logo" className="w-16 h-16 object-contain" />
                    </div>

                    <h2 className="text-2xl font-bold text-text-main mb-2">
                        {t.loginTitle}
                    </h2>
                    <p className="text-text-muted mb-6">
                        {t.loginSubtitle}
                    </p>

                    {/* Tabs */}
                    <div className="flex p-1 mb-6 bg-surface-muted rounded-xl">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'login'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-text-muted hover:text-text-main'
                                }`}
                        >
                            {t.login}
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'register'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-text-muted hover:text-text-main'
                                }`}
                        >
                            {t.register}
                        </button>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body>
                <div className="p-2 text-center">
                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 mb-6 text-left">
                        {mode === 'register' && (
                            <Input
                                label={t.name}
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder={t.name}
                                required
                            />
                        )}
                        <Input
                            label={t.email}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                        />
                        <Input
                            label={t.password}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        {error && (
                            <div className="text-xs text-status-error bg-[#FEF2F2] p-2 rounded-lg">
                                {error.message}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            isLoading={loading}
                            className="w-full py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {mode === 'login' ? t.login : t.register}
                        </Button>
                    </form>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border-default"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-surface-modal px-2 text-text-muted">{t.or}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-border-default rounded-xl text-text-main font-medium hover:border-brand-primary hover:text-brand-primary transition-all duration-200 transform hover:scale-[1.02]"
                            leftIcon={
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                            }
                        >
                            {t.continueWithGoogle}
                        </Button>

                        <Button
                            onClick={handleGithubLogin}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#24292F] text-white rounded-xl font-medium hover:bg-[#333] transition-all duration-200 transform hover:scale-[1.02] shadow-md"
                            leftIcon={<Github className="w-5 h-5" />}
                        >
                            {t.githubLogin}
                        </Button>
                    </div>

                    <div className="mt-8 text-xs text-text-muted">
                        {t.agreeTo}
                        <a href="#" className="text-brand-primary hover:underline mx-1">{t.terms}</a>
                        {t.and}
                        <a href="#" className="text-brand-primary hover:underline mx-1">{t.privacy}</a>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

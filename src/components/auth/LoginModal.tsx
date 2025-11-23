import React, { useState, useRef, useEffect } from 'react';
import { Github, Mail, ChevronDown, ArrowLeft } from 'lucide-react';
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

type AuthMode = 'oauth' | 'login' | 'register';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, lang }) => {
    const [mode, setMode] = useState<AuthMode>('oauth');
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const { signIn, signUp, signInWithGoogle, signInWithGithub, error } = useAuth();
    const { success, error: toastError } = useToast();
    const t = TRANSLATIONS[lang];
    const contentRef = useRef<HTMLDivElement>(null);

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
        setPasswordError('');
    };

    // Reset mode when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setMode('oauth');
                resetForm();
            }, 350);
        }
    }, [isOpen]);

    const switchMode = (newMode: AuthMode, dir: 'forward' | 'backward') => {
        setDirection(dir);
        setIsTransitioning(true);
        setTimeout(() => {
            resetForm();
            setMode(newMode);
            setTimeout(() => setIsTransitioning(false), 50);
        }, 200);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'register') {
            if (password !== confirmPassword) {
                setPasswordError(lang === 'zh' ? '两次密码输入不一致' : 'Passwords do not match');
                return;
            }
            if (password.length < 6) {
                setPasswordError(lang === 'zh' ? '密码至少6位' : 'Password must be at least 6 characters');
                return;
            }
        }

        setPasswordError('');
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

    const getTransitionClasses = () => {
        if (!isTransitioning) return 'opacity-100 translate-x-0';
        return direction === 'forward'
            ? 'opacity-0 -translate-x-4'
            : 'opacity-0 translate-x-4';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <Modal.Header showCloseButton={true}>
                <div className="text-center">
                    <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl flex items-center justify-center shadow-inner">
                        <img src="/logo.png" alt="InstaGen Logo" className="w-14 h-14 object-contain" />
                    </div>

                    <h2 className="text-xl font-bold text-text-main mb-1">
                        {mode === 'register' ? t.register : t.loginTitle}
                    </h2>
                    <p className="text-sm text-text-muted">
                        {mode === 'register'
                            ? (lang === 'zh' ? '创建账号开始使用' : 'Create an account to get started')
                            : t.loginSubtitle
                        }
                    </p>
                </div>
            </Modal.Header>

            <Modal.Body>
                <div
                    ref={contentRef}
                    className={`
                        px-2 text-center
                        transition-all duration-200 ease-out
                        ${getTransitionClasses()}
                    `}
                >
                    {/* OAuth Mode - Default */}
                    {mode === 'oauth' && (
                        <>
                            <div className="space-y-2.5 mb-4">
                                <Button
                                    variant="outline"
                                    onClick={handleGoogleLogin}
                                    className="
                                        w-full flex items-center justify-center gap-3 px-6 py-2.5
                                        bg-white border-2 border-border-default rounded-xl
                                        text-text-main font-medium
                                        hover:border-brand-primary hover:text-brand-primary
                                        hover:shadow-md hover:-translate-y-0.5
                                        active:translate-y-0 active:shadow-sm
                                        transition-all duration-200
                                    "
                                    leftIcon={
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                    }
                                >
                                    {t.googleLogin}
                                </Button>

                                <Button
                                    onClick={handleGithubLogin}
                                    className="
                                        w-full flex items-center justify-center gap-3 px-6 py-2.5
                                        bg-[#24292F] text-white rounded-xl font-medium
                                        hover:bg-[#333] hover:shadow-md hover:-translate-y-0.5
                                        active:translate-y-0 active:shadow-sm
                                        transition-all duration-200
                                    "
                                    leftIcon={<Github className="w-5 h-5" />}
                                >
                                    {t.githubLogin}
                                </Button>
                            </div>

                            <div className="relative my-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border-default"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-surface-modal px-3 text-xs text-text-muted uppercase tracking-wider">{t.or}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => switchMode('login', 'forward')}
                                className="
                                    w-full flex items-center justify-center gap-2 px-6 py-2.5
                                    text-text-muted hover:text-brand-primary font-medium
                                    transition-all duration-200
                                    hover:bg-brand-primary/5 rounded-xl
                                    group
                                "
                            >
                                <Mail className="w-4 h-4 transition-transform group-hover:scale-110" />
                                <span>{t.emailLogin}</span>
                                <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                            </button>
                        </>
                    )}

                    {/* Email Login Mode */}
                    {mode === 'login' && (
                        <>
                            <form onSubmit={handleSubmit} className="space-y-3 mb-4 text-left">
                                <Input
                                    label={t.email}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Input
                                    label={t.password}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                {error && (
                                    <div className="text-xs text-status-error bg-status-error/10 p-3 rounded-xl animate-shake">
                                        {error.message}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    isLoading={loading}
                                    className="
                                        w-full py-2.5
                                        bg-gradient-to-r from-brand-primary to-brand-secondary
                                        text-white font-medium rounded-xl
                                        shadow-md hover:shadow-lg
                                        hover:-translate-y-0.5 active:translate-y-0
                                        transition-all duration-200
                                        disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
                                    "
                                >
                                    {t.login}
                                </Button>
                            </form>

                            <div className="flex items-center justify-between text-sm pt-2">
                                <button
                                    onClick={() => switchMode('oauth', 'backward')}
                                    className="flex items-center gap-1 text-text-muted hover:text-text-main transition-colors group"
                                >
                                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                                    <span>{lang === 'zh' ? '返回' : 'Back'}</span>
                                </button>
                                <button
                                    onClick={() => switchMode('register', 'forward')}
                                    className="text-text-muted hover:text-brand-primary transition-colors"
                                >
                                    {t.noAccount} <span className="font-semibold">{t.register}</span>
                                </button>
                            </div>
                        </>
                    )}

                    {/* Register Mode */}
                    {mode === 'register' && (
                        <>
                            <form onSubmit={handleSubmit} className="space-y-3 mb-4 text-left">
                                <Input
                                    label={t.name}
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                />
                                <Input
                                    label={t.email}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Input
                                    label={t.password}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Input
                                    label={lang === 'zh' ? '确认密码' : 'Confirm Password'}
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    error={passwordError}
                                    required
                                />

                                {error && (
                                    <div className="text-xs text-status-error bg-status-error/10 p-3 rounded-xl animate-shake">
                                        {error.message}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    isLoading={loading}
                                    className="
                                        w-full py-2.5
                                        bg-gradient-to-r from-brand-primary to-brand-secondary
                                        text-white font-medium rounded-xl
                                        shadow-md hover:shadow-lg
                                        hover:-translate-y-0.5 active:translate-y-0
                                        transition-all duration-200
                                        disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
                                    "
                                >
                                    {t.register}
                                </Button>
                            </form>

                            <div className="flex items-center justify-between text-sm pt-2">
                                <button
                                    onClick={() => switchMode('oauth', 'backward')}
                                    className="flex items-center gap-1 text-text-muted hover:text-text-main transition-colors group"
                                >
                                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                                    <span>{lang === 'zh' ? '返回' : 'Back'}</span>
                                </button>
                                <button
                                    onClick={() => switchMode('login', 'backward')}
                                    className="text-text-muted hover:text-brand-primary transition-colors"
                                >
                                    {t.hasAccount} <span className="font-semibold">{t.login}</span>
                                </button>
                            </div>
                        </>
                    )}

                    <div className="mt-6 pt-4 border-t border-border-default/50 text-xs text-text-muted">
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

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Key, AlertTriangle, Check, Loader2, Save, Trash2, Eye, EyeOff, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { TRANSLATIONS } from '@/constants';
import { Language } from '@/types';

interface AccountSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    lang?: Language;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ isOpen, onClose, lang = 'en' }) => {
    const { user, updateProfile } = useAuth();
    const t = TRANSLATIONS[lang];

    // Animation state
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Profile State
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [selectedLang, setSelectedLang] = useState<Language>(lang);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // API Key State
    const [apiKey, setApiKey] = useState('');
    const [isValidatingKey, setIsValidatingKey] = useState(false);
    const [keyValidationStatus, setKeyValidationStatus] = useState<'valid' | 'invalid' | null>(null);
    const [showKey, setShowKey] = useState(false);
    const [isSavingKey, setIsSavingKey] = useState(false);

    // Delete Account State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    // Mount/unmount animation
    useEffect(() => {
        if (isOpen) {
            setIsMounted(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsVisible(true));
            });
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setIsMounted(false), 350);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen && user) {
            setDisplayName(user.displayName || '');
            setAvatarUrl(user.avatarUrl || '');
            setSelectedLang(user.language || lang);
            setApiKey(user.customGeminiKey || '');
            setKeyValidationStatus(user.customGeminiKey ? 'valid' : null);
            setProfileMessage(null);
            setShowDeleteConfirm(false);
            setDeleteConfirmationText('');
        }
    }, [isOpen, user]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSavingProfile(true);
        setProfileMessage(null);
        try {
            await updateProfile({
                displayName,
                avatarUrl,
                language: selectedLang
            });
            setProfileMessage({ type: 'success', text: t.saved });
            setTimeout(() => setProfileMessage(null), 3000);
        } catch (error) {
            console.error('Failed to update profile:', error);
            setProfileMessage({ type: 'error', text: t.error });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleValidateKey = async () => {
        if (!apiKey) return;
        setIsValidatingKey(true);
        setKeyValidationStatus(null);

        try {
            const response = await fetch('/api/validate-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey })
            });

            const data = await response.json();
            setKeyValidationStatus(data.valid ? 'valid' : 'invalid');
        } catch (error) {
            console.error('Key validation failed:', error);
            setKeyValidationStatus('invalid');
        } finally {
            setIsValidatingKey(false);
        }
    };

    const handleSaveKey = async () => {
        if (!user || keyValidationStatus !== 'valid') return;
        setIsSavingKey(true);
        try {
            await updateProfile({ customGeminiKey: apiKey });
        } catch (error) {
            console.error('Failed to save key:', error);
        } finally {
            setIsSavingKey(false);
        }
    };

    const handleRemoveKey = async () => {
        if (!user) return;
        if (confirm(lang === 'zh' ? '确定要移除自定义 API Key 吗？' : 'Are you sure you want to remove your custom API key?')) {
            setIsSavingKey(true);
            try {
                await updateProfile({ customGeminiKey: null });
                setApiKey('');
                setKeyValidationStatus(null);
            } catch (error) {
                console.error('Failed to remove key:', error);
            } finally {
                setIsSavingKey(false);
            }
        }
    };

    const handleDeleteAccount = async () => {
        if (!user || deleteConfirmationText !== 'DELETE') return;
        setIsDeletingAccount(true);
        try {
            await authService.deleteAccount(user.id);
            onClose();
        } catch (error) {
            console.error('Failed to delete account:', error);
            alert('Failed to delete account. Please try again.');
            setIsDeletingAccount(false);
        }
    };

    if (!isMounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className={`
                    absolute inset-0 bg-black/30 backdrop-blur-sm
                    transition-opacity duration-300
                    ${isVisible ? 'opacity-100' : 'opacity-0'}
                `}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`
                    absolute top-0 right-0 bottom-0
                    w-full sm:w-[480px] md:w-[520px]
                    bg-surface-muted
                    shadow-2xl
                    flex flex-col
                    transition-transform duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isVisible ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="flex-none px-4 md:px-6 py-4 border-b border-border-default/50 bg-white/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                                <Settings className="w-5 h-5 text-brand-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-text-main">{t.accountSettings}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="
                                p-2 rounded-full
                                bg-black/5 hover:bg-black/10
                                transition-all duration-200
                                hover:scale-110 active:scale-95
                            "
                        >
                            <X className="w-5 h-5 text-text-muted" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">

                    {/* Profile Section */}
                    <section
                        className={`
                            transition-all duration-300
                            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                        `}
                        style={{ transitionDelay: '100ms' }}
                    >
                        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {t.profile}
                        </h3>
                        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-sm space-y-5">
                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-brand-primary/20 ring-offset-2 bg-surface-muted">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary text-white text-xl font-bold">
                                                {displayName?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <label className="block text-xs font-medium text-text-muted mb-1">Avatar URL</label>
                                    <input
                                        type="text"
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-3 py-2 text-sm bg-surface-muted border border-border-default rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Display Name */}
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t.displayName}</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-surface-muted border border-border-default rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t.email}</label>
                                <div className="w-full px-3 py-2 text-sm bg-surface-muted border border-border-default rounded-xl text-text-muted">
                                    {user?.email}
                                </div>
                            </div>

                            {/* Language */}
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t.language}</label>
                                <div className="relative">
                                    <select
                                        value={selectedLang}
                                        onChange={(e) => setSelectedLang(e.target.value as Language)}
                                        className="w-full px-3 py-2 text-sm bg-surface-muted border border-border-default rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="en">🇺🇸 English</option>
                                        <option value="zh">🇨🇳 中文</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex items-center justify-between pt-2">
                                <div className={`text-xs font-medium ${profileMessage?.type === 'success' ? 'text-status-success' : 'text-status-error'}`}>
                                    {profileMessage?.text}
                                </div>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="
                                        px-4 py-2 text-sm
                                        bg-gradient-to-r from-brand-primary to-brand-secondary
                                        text-white font-medium rounded-xl
                                        shadow-sm hover:shadow-md
                                        hover:-translate-y-0.5 active:translate-y-0
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                                        transition-all duration-200
                                        flex items-center gap-2
                                    "
                                >
                                    {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {t.saveChanges}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* API Settings Section */}
                    <section
                        className={`
                            transition-all duration-300
                            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                        `}
                        style={{ transitionDelay: '200ms' }}
                    >
                        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            {t.apiSettings}
                        </h3>
                        <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-sm space-y-4">
                            {/* Status */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-text-muted">{t.currentStatus}:</span>
                                {user?.customGeminiKey ? (
                                    <span className="text-status-success font-medium flex items-center gap-1">
                                        <Check className="w-4 h-4" />
                                        {t.usingCustomKey}
                                    </span>
                                ) : (
                                    <span className="text-text-muted">{t.usingSystemKey}</span>
                                )}
                            </div>

                            {/* Key Input */}
                            <div>
                                <label className="block text-xs font-medium text-text-muted mb-1">{t.geminiApiKey}</label>
                                <div className="relative">
                                    <input
                                        type={showKey ? "text" : "password"}
                                        value={apiKey}
                                        onChange={(e) => {
                                            setApiKey(e.target.value);
                                            setKeyValidationStatus(null);
                                        }}
                                        placeholder="AIza..."
                                        className={`
                                            w-full pl-3 pr-10 py-2 text-sm
                                            bg-surface-muted border rounded-xl
                                            focus:ring-2 outline-none transition-all
                                            ${keyValidationStatus === 'valid'
                                                ? 'border-status-success focus:ring-status-success/20'
                                                : keyValidationStatus === 'invalid'
                                                    ? 'border-status-error focus:ring-status-error/20'
                                                    : 'border-border-default focus:border-brand-primary focus:ring-brand-primary/20'
                                            }
                                        `}
                                    />
                                    <button
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                                    >
                                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {keyValidationStatus === 'valid' && (
                                    <p className="text-xs text-status-success mt-1.5 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> {t.keyValid}
                                    </p>
                                )}
                                {keyValidationStatus === 'invalid' && (
                                    <p className="text-xs text-status-error mt-1.5 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> {t.keyInvalid}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-2">
                                <a
                                    href="https://aistudio.google.com/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-brand-primary hover:underline font-medium"
                                >
                                    {t.getApiKey} →
                                </a>
                                <div className="flex gap-2">
                                    {user?.customGeminiKey && (
                                        <button
                                            onClick={handleRemoveKey}
                                            className="px-3 py-1.5 text-xs text-status-error hover:bg-status-error/10 rounded-lg transition-colors font-medium"
                                        >
                                            {t.removeKey}
                                        </button>
                                    )}
                                    <button
                                        onClick={handleValidateKey}
                                        disabled={!apiKey || isValidatingKey}
                                        className="px-3 py-1.5 text-xs bg-surface-muted border border-border-default text-text-main rounded-lg hover:bg-white disabled:opacity-50 transition-all font-medium"
                                    >
                                        {isValidatingKey ? <Loader2 className="w-3 h-3 animate-spin" /> : t.validateKey}
                                    </button>
                                    <button
                                        onClick={handleSaveKey}
                                        disabled={keyValidationStatus !== 'valid' || isSavingKey}
                                        className="px-3 py-1.5 text-xs bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-1"
                                    >
                                        {isSavingKey ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                        {t.saveChanges}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section
                        className={`
                            transition-all duration-300
                            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                        `}
                        style={{ transitionDelay: '300ms' }}
                    >
                        <h3 className="text-sm font-semibold text-status-error uppercase tracking-wider mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            {t.dangerZone}
                        </h3>
                        <div className="bg-status-error/5 p-5 rounded-2xl border border-status-error/20">
                            {!showDeleteConfirm ? (
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-medium text-status-error text-sm">{t.deleteAccount}</h4>
                                        <p className="text-xs text-status-error/70 mt-0.5">{t.deleteAccountConfirm}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="px-4 py-2 text-sm bg-white border border-status-error/30 text-status-error rounded-xl hover:bg-status-error hover:text-white transition-all font-medium flex-shrink-0"
                                    >
                                        {t.deleteAccount}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-xs text-status-error font-medium">{t.typeDelete}</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={deleteConfirmationText}
                                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                            placeholder="DELETE"
                                            className="flex-1 px-3 py-2 text-sm bg-white border border-status-error/30 rounded-xl focus:ring-2 focus:ring-status-error/20 outline-none text-status-error placeholder:text-status-error/30"
                                        />
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-3 py-2 text-sm bg-white text-text-main rounded-xl hover:bg-surface-muted transition-colors font-medium"
                                        >
                                            {t.cancel}
                                        </button>
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={deleteConfirmationText !== 'DELETE' || isDeletingAccount}
                                            className="px-3 py-2 text-sm bg-status-error text-white rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-1"
                                        >
                                            {isDeletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            {t.permanentlyDelete}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>,
        document.body
    );
};

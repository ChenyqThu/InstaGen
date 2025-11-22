import React, { useState, useEffect } from 'react';
import { X, User, Key, AlertTriangle, Check, Loader2, Save, Trash2, Eye, EyeOff } from 'lucide-react';
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

    // Profile State
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
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

    useEffect(() => {
        if (isOpen && user) {
            setDisplayName(user.displayName || '');
            setAvatarUrl(user.avatarUrl || '');
            setApiKey(user.customGeminiKey || '');
            setKeyValidationStatus(user.customGeminiKey ? 'valid' : null);
            // Reset states
            setProfileMessage(null);
            setShowDeleteConfirm(false);
            setDeleteConfirmationText('');
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSavingProfile(true);
        setProfileMessage(null);
        try {
            await updateProfile({
                displayName,
                avatarUrl
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
            // Call validation endpoint
            const response = await fetch('/api/validate-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey })
            });

            const data = await response.json();
            if (data.valid) {
                setKeyValidationStatus('valid');
            } else {
                setKeyValidationStatus('invalid');
            }
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
            await updateProfile({
                customGeminiKey: apiKey
            });
            // Show success feedback?
        } catch (error) {
            console.error('Failed to save key:', error);
        } finally {
            setIsSavingKey(false);
        }
    };

    const handleRemoveKey = async () => {
        if (!user) return;
        if (confirm('Are you sure you want to remove your custom API key?')) {
            setIsSavingKey(true);
            try {
                await updateProfile({
                    customGeminiKey: null // Set to null to remove
                });
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#FDF8F5] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 bg-white border-b border-[#E5E5E5] flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-[#1F2937] flex items-center gap-2">
                        <SettingsIcon className="w-6 h-6 text-[#E76F51]" />
                        {t.accountSettings}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#F5F5F4] rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-[#9CA3AF]" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Profile Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-[#F4A261]" />
                            {t.profile}
                        </h3>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5]/50 space-y-6">
                            {/* Avatar */}
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-[#FFB5BA] ring-offset-2 bg-gray-100">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E76F51] to-[#F4A261] text-white text-2xl font-bold">
                                                {displayName?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-[#374151] mb-1">Avatar URL</label>
                                    <input
                                        type="text"
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-4 py-2 bg-[#F5F5F4] border border-[#E5E5E5] rounded-xl focus:border-[#E76F51] focus:ring-2 focus:ring-[#E76F51]/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Display Name */}
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-1">{t.displayName}</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full px-4 py-2 bg-[#F5F5F4] border border-[#E5E5E5] rounded-xl focus:border-[#E76F51] focus:ring-2 focus:ring-[#E76F51]/20 outline-none transition-all"
                                />
                            </div>

                            {/* Email (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-1">{t.email}</label>
                                <div className="w-full px-4 py-2 bg-[#F5F5F4] border border-[#E5E5E5] rounded-xl text-[#9CA3AF]">
                                    {user?.email}
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="flex items-center justify-between">
                                <div className={`text-sm ${profileMessage?.type === 'success' ? 'text-[#95D5B2]' : 'text-[#E63946]'}`}>
                                    {profileMessage?.text}
                                </div>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="px-6 py-2 bg-[#E76F51] text-white font-medium rounded-xl shadow-md hover:bg-[#D65D40] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {t.saveChanges}
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* API Settings Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
                            <Key className="w-5 h-5 text-[#F4A261]" />
                            {t.apiSettings}
                        </h3>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E5E5]/50 space-y-6">
                            {/* Status */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-[#374151]">{t.currentStatus}:</span>
                                {user?.customGeminiKey ? (
                                    <span className="text-[#95D5B2] font-medium flex items-center gap-1">
                                        <Check className="w-4 h-4" />
                                        {t.usingCustomKey}
                                    </span>
                                ) : (
                                    <span className="text-[#9CA3AF] flex items-center gap-1">
                                        {t.usingSystemKey}
                                    </span>
                                )}
                            </div>

                            {/* Key Input */}
                            <div>
                                <label className="block text-sm font-medium text-[#374151] mb-1">{t.geminiApiKey}</label>
                                <div className="relative">
                                    <input
                                        type={showKey ? "text" : "password"}
                                        value={apiKey}
                                        onChange={(e) => {
                                            setApiKey(e.target.value);
                                            setKeyValidationStatus(null);
                                        }}
                                        placeholder="AIza..."
                                        className={`w-full pl-4 pr-12 py-2 bg-[#F5F5F4] border rounded-xl focus:ring-2 focus:ring-[#E76F51]/20 outline-none transition-all ${keyValidationStatus === 'valid' ? 'border-[#95D5B2]' :
                                            keyValidationStatus === 'invalid' ? 'border-[#E63946]' :
                                                'border-[#E5E5E5] focus:border-[#E76F51]'
                                            }`}
                                    />
                                    <button
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151]"
                                    >
                                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {keyValidationStatus === 'valid' && (
                                    <p className="text-xs text-[#95D5B2] mt-1 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> {t.keyValid}
                                    </p>
                                )}
                                {keyValidationStatus === 'invalid' && (
                                    <p className="text-xs text-[#E63946] mt-1 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> {t.keyInvalid}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                                <a
                                    href="https://aistudio.google.com/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#E76F51] hover:underline"
                                >
                                    {t.getApiKey}
                                </a>
                                <div className="flex gap-3">
                                    {user?.customGeminiKey && (
                                        <button
                                            onClick={handleRemoveKey}
                                            className="px-4 py-2 text-[#E63946] hover:bg-[#FEF2F2] rounded-xl transition-colors text-sm font-medium"
                                        >
                                            {t.removeKey}
                                        </button>
                                    )}
                                    <button
                                        onClick={handleValidateKey}
                                        disabled={!apiKey || isValidatingKey}
                                        className="px-4 py-2 bg-white border border-[#E5E5E5] text-[#374151] rounded-xl hover:bg-[#F5F5F4] disabled:opacity-50 transition-colors text-sm font-medium"
                                    >
                                        {isValidatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : t.validateKey}
                                    </button>
                                    <button
                                        onClick={handleSaveKey}
                                        disabled={keyValidationStatus !== 'valid' || isSavingKey}
                                        className="px-4 py-2 bg-[#E76F51] text-white rounded-xl hover:bg-[#D65D40] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                                    >
                                        {isSavingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {t.saveChanges}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section>
                        <h3 className="text-lg font-semibold text-[#E63946] mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            {t.dangerZone}
                        </h3>
                        <div className="bg-[#FEF2F2] p-6 rounded-2xl border border-[#E63946]/20">
                            {!showDeleteConfirm ? (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-[#991B1B]">{t.deleteAccount}</h4>
                                        <p className="text-sm text-[#B91C1C]/80 mt-1">{t.deleteConfirm}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="px-4 py-2 bg-white border border-[#E63946]/30 text-[#E63946] rounded-xl hover:bg-[#E63946] hover:text-white transition-all text-sm font-medium"
                                    >
                                        {t.deleteAccount}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <p className="text-sm text-[#B91C1C] font-medium">
                                        {t.typeDelete}
                                    </p>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={deleteConfirmationText}
                                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                            placeholder="DELETE"
                                            className="flex-1 px-4 py-2 bg-white border border-[#E63946]/30 rounded-xl focus:ring-2 focus:ring-[#E63946]/20 outline-none text-[#E63946] placeholder:text-[#E63946]/30"
                                        />
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-4 py-2 bg-white text-[#374151] rounded-xl hover:bg-[#F5F5F4] transition-colors text-sm font-medium"
                                        >
                                            {t.cancel}
                                        </button>
                                        <button
                                            onClick={handleDeleteAccount}
                                            disabled={deleteConfirmationText !== 'DELETE' || isDeletingAccount}
                                            className="px-4 py-2 bg-[#E63946] text-white rounded-xl hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
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
        </div>
    );
};

// Helper component for the header icon
const SettingsIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

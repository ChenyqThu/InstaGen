import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon, Settings, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { MyGallery } from '../gallery/MyGallery';
import { AccountSettings } from './AccountSettings';
import { TRANSLATIONS } from '@/constants';
import { Language } from '@/types';

interface UserMenuProps {
    lang?: Language;
    onLoginClick: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ lang = 'en', onLoginClick }) => {
    const { user, signOut, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const t = TRANSLATIONS[lang];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut();
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <button
                onClick={onLoginClick}
                className="
                    flex items-center gap-2 px-4 py-2
                    bg-gradient-to-r from-brand-primary to-brand-secondary
                    text-white font-medium rounded-full
                    shadow-sm hover:shadow-md
                    hover:-translate-y-0.5 active:translate-y-0
                    transition-all duration-200
                "
            >
                <UserIcon className="w-4 h-4" />
                {t.login}
            </button>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            {/* Avatar Button - Clean pill style */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`
                    relative flex items-center gap-2
                    p-1 pr-2
                    bg-white/80 backdrop-blur-md
                    rounded-full
                    border border-white/50
                    shadow-sm hover:shadow-md
                    hover:-translate-y-0.5 active:translate-y-0
                    transition-all duration-200
                    ${isMenuOpen ? 'ring-2 ring-brand-primary/20' : ''}
                `}
            >
                {/* Avatar */}
                <div className="relative">
                    {user?.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt={user.displayName || 'User'}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-sm font-semibold">
                            {user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                    )}
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>

                {/* Chevron indicator */}
                <svg
                    className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div
                    className="
                        absolute right-0 top-full mt-2 w-60
                        bg-white/95 backdrop-blur-xl
                        rounded-2xl
                        shadow-xl shadow-black/10
                        border border-white/50
                        overflow-hidden
                        z-50
                        animate-in fade-in slide-in-from-top-2 duration-200
                    "
                >
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5">
                        <div className="flex items-center gap-3">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.displayName || 'User'}
                                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                                />
                            ) : (
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold shadow-sm">
                                    {user?.email?.[0].toUpperCase() || 'U'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-text-main truncate">
                                    {user?.displayName || t.name}
                                </div>
                                <div className="text-xs text-text-muted truncate">
                                    {user?.email}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                        <button
                            onClick={() => {
                                setShowGallery(true);
                                setIsMenuOpen(false);
                            }}
                            className="
                                w-full px-3 py-2.5
                                text-left text-text-main
                                hover:bg-brand-primary/5
                                rounded-xl
                                transition-all duration-150
                                flex items-center gap-3
                                group
                            "
                        >
                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                                <ImageIcon className="w-4 h-4 text-brand-primary" />
                            </div>
                            <span className="font-medium">{t.myPhotos}</span>
                        </button>

                        <button
                            onClick={() => {
                                setShowSettings(true);
                                setIsMenuOpen(false);
                            }}
                            className="
                                w-full px-3 py-2.5
                                text-left text-text-main
                                hover:bg-brand-primary/5
                                rounded-xl
                                transition-all duration-150
                                flex items-center gap-3
                                group
                            "
                        >
                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors">
                                <Settings className="w-4 h-4 text-brand-primary" />
                            </div>
                            <span className="font-medium">{t.settings}</span>
                        </button>
                    </div>

                    {/* Logout */}
                    <div className="p-2 pt-0">
                        <div className="border-t border-border-default/50 mb-2" />
                        <button
                            onClick={handleSignOut}
                            className="
                                w-full px-3 py-2.5
                                text-left text-status-error
                                hover:bg-status-error/5
                                rounded-xl
                                transition-all duration-150
                                flex items-center gap-3
                                group
                            "
                        >
                            <div className="w-8 h-8 rounded-lg bg-status-error/10 flex items-center justify-center group-hover:bg-status-error/20 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{t.logout}</span>
                        </button>
                    </div>
                </div>
            )}

            <MyGallery
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
                lang={lang}
            />

            <AccountSettings
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                lang={lang}
            />
        </div>
    );
};

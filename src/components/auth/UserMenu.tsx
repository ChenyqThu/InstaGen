import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon, Settings, Image as ImageIcon, ChevronDown } from 'lucide-react';
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
                className="px-6 py-2.5 bg-gradient-to-r from-[#E76F51] to-[#F4A261] text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
                <UserIcon className="w-4 h-4" />
                {t.login}
            </button>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1 pr-3 bg-white rounded-full border border-[#E5E5E5] hover:shadow-md transition-all duration-200"
            >
                {user?.avatarUrl ? (
                    <img
                        src={user.avatarUrl}
                        alt={user.displayName || 'User'}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FFB5BA] ring-offset-2"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E76F51] to-[#F4A261] flex items-center justify-center text-white font-bold ring-2 ring-white">
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                )}
                <ChevronDown className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5E5E5] overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-4 py-3 border-b border-[#E5E5E5] bg-[#FDF8F5]">
                        <div className="font-medium text-[#1F2937] truncate">
                            {user?.displayName || t.name}
                        </div>
                        <div className="text-xs text-[#9CA3AF] truncate">
                            {user?.email}
                        </div>
                    </div>

                    <div className="p-2">
                        <button className="w-full px-3 py-2 text-left text-[#374151] hover:bg-[#FDF8F5] rounded-lg transition-colors flex items-center gap-3">
                            <UserIcon className="w-4 h-4 text-[#F4A261]" />
                            {t.myAccount}
                        </button>
                        <button
                            onClick={() => {
                                setShowGallery(true);
                                setIsMenuOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-[#374151] hover:bg-[#FDF8F5] rounded-lg transition-colors flex items-center gap-3"
                        >
                            <ImageIcon className="w-4 h-4 text-[#E76F51]" />
                            {t.myPhotos}
                        </button>
                        <button
                            onClick={() => {
                                setShowSettings(true);
                                setIsMenuOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-[#374151] hover:bg-[#FDF8F5] rounded-lg transition-colors flex items-center gap-3"
                        >
                            <Settings className="w-4 h-4 text-[#9CA3AF]" />
                            {t.settings}
                        </button>
                    </div>

                    <div className="border-t border-[#E5E5E5] p-2">
                        <button
                            onClick={handleSignOut}
                            className="w-full px-3 py-2 text-left text-[#E63946] hover:bg-[#FEF2F2] rounded-lg transition-colors flex items-center gap-3"
                        >
                            <LogOut className="w-4 h-4" />
                            {t.logout}
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

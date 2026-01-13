import React from 'react';
import { Modal } from './Modal';

import { Language } from '@/types';

interface GuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: Language;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, lang }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            animationType="zoom-out-top-right"
            className="w-[90vw] h-[90vh] md:w-full md:max-w-4xl"
        >
            <Modal.Header showCloseButton={true}>
                <div className="text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                    {lang === 'zh' ? '使用指南' : 'Usage Guide'}
                </div>
            </Modal.Header>
            <Modal.Body className="p-0 overflow-hidden h-full">
                <div className="w-full h-full overflow-y-auto bg-surface-base">
                    <img
                        src={lang === 'zh' ? "/assets/Guide_zh.png" : "/assets/Guide_en.png"}
                        alt="Usage Guide"
                        className="w-full h-auto object-contain"
                    />
                </div>
            </Modal.Body>
        </Modal>
    );
};

import React, { useRef, useEffect } from 'react';
import { PokemonCard } from './PokemonCard';

interface PokemonEffectPreviewProps {
    pokemonData: {
        id: string;
        name: string;
        supertype: string;
        subtypes: string[];
        rarity: string;
        number: string;
        gallery?: boolean;
    };
    previewImage: string;
}

export const PokemonEffectPreview: React.FC<PokemonEffectPreviewProps> = ({
    pokemonData,
    previewImage,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = previewImage;

        img.onload = () => {
            // Set canvas size to square
            canvas.width = 100;
            canvas.height = 100;

            // Draw cropped top portion of image
            const aspectRatio = img.width / img.height;
            const sourceHeight = img.width; // Make it square by using width as height
            ctx.drawImage(
                img,
                0, 0, img.width, sourceHeight, // Source: full width, top portion
                0, 0, 100, 100 // Destination: 100x100 square
            );
        };
    }, [previewImage]);

    return (
        <div className="relative w-full h-full">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 pointer-events-none">
                <PokemonCard
                    {...pokemonData}
                    img={previewImage}
                    name=""
                    className="w-full h-full opacity-90"
                >
                    <div className="w-full h-full" />
                </PokemonCard>
            </div>
        </div>
    );
};

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './cards.scss';

// Helper function to round numbers
const round = (num: number, fix = 2) => parseFloat(num.toFixed(fix));

// Helper function to clamp numbers
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

interface PokemonCardProps {
    name: string;
    img: string;
    number: string;
    supertype: string;
    subtypes: string | string[];
    rarity: string;
    gallery?: boolean;
    backimg?: string;
    className?: string;
    style?: React.CSSProperties;
}

export const PokemonCard = React.forwardRef<HTMLDivElement, PokemonCardProps & { children?: React.ReactNode }>(({
    name,
    img,
    number,
    supertype,
    subtypes,
    rarity,
    gallery = false,
    backimg = "https://tcg.pokemon.com/assets/img/global/tcg-card-back-2x.jpg",
    className = "",
    style = {},
    children,
}, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(false);
    const [interacting, setInteracting] = useState(false);

    // Sync forwarded ref with internal ref
    React.useImperativeHandle(ref, () => internalRef.current!, []);

    // Spring-like values (simplified for React without spring physics library for now, 
    // but we can add one if needed. For now, direct updates for performance)
    const [springRotate, setSpringRotate] = useState({ x: 0, y: 0 });
    const [springGlare, setSpringGlare] = useState({ x: 50, y: 50, o: 0 });
    const [springBackground, setSpringBackground] = useState({ x: 50, y: 50 });

    // Process props for data attributes
    const processedRarity = rarity.toLowerCase();
    const processedSupertype = supertype.toLowerCase();
    const processedSubtypes = Array.isArray(subtypes)
        ? subtypes.join(" ").toLowerCase()
        : subtypes.toLowerCase();
    const processedGallery = gallery.toString();

    const interact = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!internalRef.current) return;

        setInteracting(true);

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const rect = internalRef.current.getBoundingClientRect();
        const absolute = {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };

        const percent = {
            x: round((100 / rect.width) * absolute.x),
            y: round((100 / rect.height) * absolute.y),
        };

        const center = {
            x: percent.x - 50,
            y: percent.y - 50,
        };

        // Update state directly for responsiveness
        setSpringBackground({
            x: round(50 + percent.x / 4 - 12.5),
            y: round(50 + percent.y / 3 - 16.67),
        });

        setSpringRotate({
            x: round(-(center.x / 3.5)),
            y: round(center.y / 2),
        });

        setSpringGlare({
            x: percent.x,
            y: percent.y,
            o: 1,
        });
    }, []);

    const interactEnd = useCallback(() => {
        setInteracting(false);
        setSpringRotate({ x: 0, y: 0 });
        setSpringGlare({ x: 50, y: 50, o: 0 });
        setSpringBackground({ x: 50, y: 50 });
    }, []);

    // Calculate dynamic styles
    const dynamicStyles = {
        '--mx': `${springGlare.x}%`,
        '--my': `${springGlare.y}%`,
        '--tx': '0px',
        '--ty': '0px',
        '--s': '1',
        '--o': `${springGlare.o}`,
        '--rx': `${springRotate.x}deg`,
        '--ry': `${springRotate.y}deg`,
        '--pos': `${springBackground.x}% ${springBackground.y}%`,
        '--posx': `${springBackground.x}%`,
        '--posy': `${springBackground.y}%`,
        '--hyp': clamp(
            Math.sqrt(
                (springGlare.y - 50) * (springGlare.y - 50) +
                (springGlare.x - 50) * (springGlare.x - 50)
            ) / 50,
            0,
            1
        ),
    } as React.CSSProperties;

    return (
        <div
            ref={internalRef}
            className={`card ${interacting ? 'interacting' : ''} ${active ? 'active' : ''} ${className}`}
            data-number={number}
            data-subtypes={processedSubtypes}
            data-supertype={processedSupertype}
            data-rarity={processedRarity}
            data-gallery={processedGallery}
            style={{ ...style, ...dynamicStyles }}
            onMouseMove={interact}
            onMouseLeave={interactEnd}
            onTouchMove={interact}
            onTouchEnd={interactEnd}
            onClick={() => setActive(!active)}
        >
            <div className="card__translater">
                <div className="card__rotator">
                    {children ? (
                        <div className="card__front" style={{ width: '100%', height: '100%' }}>
                            {children}
                        </div>
                    ) : (
                        <img
                            className="card__front"
                            src={img}
                            alt={name}
                            loading="lazy"
                        />
                    )}
                    <div className="card__back"></div>
                    <div className={`card__shine ${processedSupertype} ${processedSubtypes}`}></div>
                    <div className={`card__glare ${processedRarity} ${processedSubtypes}`}></div>
                </div>
            </div>
        </div>
    );
});

PokemonCard.displayName = 'PokemonCard';

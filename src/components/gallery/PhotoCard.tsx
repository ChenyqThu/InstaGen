import React from 'react';
import { Globe, Lock } from 'lucide-react';
import { SavedPhoto } from '@/src/services/photoService';
import { PolaroidFrame } from '@/components/PolaroidFrame';
import { PokemonCard } from '@/components/pokemon-css/PokemonCard';
import { getPokemonConfig } from '@/src/utils/pokemonUtils';
import { PhotoFrameStyle, Language } from '@/types';
import { TRANSLATIONS } from '@/constants';

interface PhotoCardProps {
  photo: SavedPhoto;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  lang: Language;
}

// Size mapping: scale and container dimensions
const SIZE_CONFIG = {
  sm: { scale: 0.25, width: 85, height: 118 },
  md: { scale: 0.35, width: 119, height: 165 },
  lg: { scale: 0.5, width: 170, height: 235 },
};

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onClick,
  size = 'md',
  showStatus = false,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const config = SIZE_CONFIG[size];

  // Find pokemon data if photo has pokemon_id
  const pokemonConfig = getPokemonConfig(photo.pokemon_id);

  // Convert frame_style string to PhotoFrameStyle enum
  const frameStyle = (photo.frame_style as PhotoFrameStyle) || PhotoFrameStyle.CLASSIC;

  const renderCard = () => {
    const frame = (
      <PolaroidFrame
        dataUrl={photo.data_url}
        caption={photo.caption}
        timestamp={new Date(photo.created_at).getTime()}
        frameStyle={frameStyle}
        scale={config.scale}
        editable={false}
        lang={lang}
      />
    );

    if (pokemonConfig) {
      return (
        <PokemonCard
          {...pokemonConfig}
          img={photo.data_url}
          name={photo.caption || t.defaultCaption}
          className="w-full h-full"
        >
          {frame}
        </PokemonCard>
      );
    }

    return frame;
  };

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
      style={{
        width: `${config.width}px`,
        height: `${config.height}px`,
      }}
    >
      {/* Card Content */}
      <div className="w-full h-full flex items-center justify-center">
        {renderCard()}
      </div>

      {/* Status Badge */}
      {showStatus && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {photo.is_public ? (
            <div className="p-1 bg-blue-500 text-white rounded-full shadow-sm">
              <Globe className="w-3 h-3" />
            </div>
          ) : (
            <div className="p-1 bg-gray-500 text-white rounded-full shadow-sm">
              <Lock className="w-3 h-3" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { PhotoFrameStyle, FrameStyleCategory, FRAME_STYLE_CATEGORIES, Language } from '@/types';
import { FRAME_STYLES, FRAME_STYLE_NAMES, FRAME_CATEGORY_NAMES } from '@/constants';

interface FrameStylePickerProps {
  selectedStyle: PhotoFrameStyle;
  onStyleChange: (style: PhotoFrameStyle) => void;
  lang: Language;
}

// Category section component with grid layout
const CategorySection: React.FC<{
  category: FrameStyleCategory;
  styles: PhotoFrameStyle[];
  selectedStyle: PhotoFrameStyle;
  onStyleChange: (style: PhotoFrameStyle) => void;
  lang: Language;
}> = ({ category, styles, selectedStyle, onStyleChange, lang }) => {
  const categoryName = FRAME_CATEGORY_NAMES[category][lang];

  return (
    <div className="mb-5 last:mb-0">
      {/* Category Label */}
      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
        {categoryName}
      </h4>

      {/* Grid of circular buttons */}
      <div className="grid grid-cols-5 gap-3">
        {styles.map((style, index) => {
          const isSelected = selectedStyle === style;
          const frameClass = FRAME_STYLES[style];
          const styleName = FRAME_STYLE_NAMES[style][lang];

          return (
            <div
              key={style}
              className="flex flex-col items-center gap-1.5 animate-in fade-in"
              style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
            >
              <button
                onClick={() => onStyleChange(style)}
                className={`
                  w-11 h-11 rounded-full border-2 shadow-sm
                  transition-all duration-200 ease-out
                  hover:scale-110 hover:shadow-md
                  ${isSelected
                    ? 'border-[#E76F51] ring-2 ring-[#E76F51]/30 scale-105'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  ${frameClass}
                `}
                title={styleName}
              />
              <span className={`
                text-[10px] font-medium text-center leading-tight
                ${isSelected ? 'text-[#E76F51]' : 'text-gray-500'}
              `}>
                {styleName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const FrameStylePicker: React.FC<FrameStylePickerProps> = ({
  selectedStyle,
  onStyleChange,
  lang,
}) => {
  const categories: FrameStyleCategory[] = ['classic', 'colorful', 'creative'];

  return (
    <div className="h-full overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {categories.map((category) => (
        <CategorySection
          key={category}
          category={category}
          styles={FRAME_STYLE_CATEGORIES[category]}
          selectedStyle={selectedStyle}
          onStyleChange={onStyleChange}
          lang={lang}
        />
      ))}
    </div>
  );
};

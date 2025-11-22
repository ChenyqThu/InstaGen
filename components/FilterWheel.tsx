import React, { useRef, useState, useCallback, useEffect } from 'react';
import { INSTAGRAM_FILTERS, FilterConfig } from '../config/filterConfig';
import { Language } from '../types';

interface FilterWheelProps {
  currentFilter: FilterConfig;
  onFilterChange: (filter: FilterConfig) => void;
  size: number; // Diameter of the inner circle (video feed)
  lang: Language;
}

const TOOTH_HEIGHT = 1; // Shallow teeth for grip texture
const KNURL_TEETH =180; // Dense teeth for friction knurl effect

export const FilterWheel: React.FC<FilterWheelProps> = ({
  currentFilter,
  onFilterChange,
  size,
  lang,
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const startAngleRef = useRef(0);
  const currentRotationRef = useRef(0);

  const filters = INSTAGRAM_FILTERS;
  const numFilters = filters.length;
  const anglePerFilter = 360 / numFilters;
  const outerRadius = size / 2 + 22; // Add padding for the gear ring

  // Calculate angle from center
  const getAngle = useCallback((clientX: number, clientY: number) => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  }, []);

  // Get current filter index from rotation
  const getCurrentFilterIndex = useCallback((rot: number) => {
    // Normalize rotation to 0-360
    let normalized = ((rot % 360) + 360) % 360;
    // Calculate which filter is at the bottom (indicator position)
    // Since 0 degrees points right and our indicator is at bottom (+90 degrees)
    // We need to offset by 90 degrees
    let index = Math.round((normalized + 90) / anglePerFilter) % filters.length;
    if (index < 0) index += filters.length;
    return index;
  }, [anglePerFilter, filters.length]);

  // Handle pointer down
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startAngleRef.current = getAngle(e.clientX, e.clientY);
    currentRotationRef.current = rotation;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [getAngle, rotation]);

  // Handle pointer move
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const currentAngle = getAngle(e.clientX, e.clientY);
    const deltaAngle = currentAngle - startAngleRef.current;
    const newRotation = currentRotationRef.current + deltaAngle;
    setRotation(newRotation);
  }, [isDragging, getAngle]);

  // Handle pointer up
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    // Snap to nearest filter
    const filterIndex = getCurrentFilterIndex(rotation);
    // Calculate snapped rotation
    const snappedRotation = (filterIndex * anglePerFilter) - 90;
    setRotation(snappedRotation);
    onFilterChange(filters[filterIndex]);
  }, [isDragging, rotation, getCurrentFilterIndex, anglePerFilter, filters, onFilterChange]);

  // Update filter on rotation change (for live preview)
  useEffect(() => {
    if (isDragging) {
      const filterIndex = getCurrentFilterIndex(rotation);
      if (filters[filterIndex] !== currentFilter) {
        onFilterChange(filters[filterIndex]);
      }
    }
  }, [rotation, isDragging, getCurrentFilterIndex, filters, currentFilter, onFilterChange]);

  // Generate knurl texture SVG path - dense shallow teeth for grip
  const generateGearPath = () => {
    const innerR = outerRadius - 2;
    const outerR = outerRadius + TOOTH_HEIGHT;
    const centerOffset = outerR; // SVG center offset
    const points: string[] = [];

    // Dense teeth for knurl/grip texture effect
    for (let i = 0; i < KNURL_TEETH; i++) {
      const angleStep = (2 * Math.PI) / KNURL_TEETH;
      const centerAngle = i * angleStep;

      // Create sharp triangular teeth
      const angle1 = centerAngle; // Valley (inner)
      const angle2 = centerAngle + angleStep * 0.5; // Peak (outer)

      // Valley point
      points.push(`${innerR * Math.cos(angle1) + centerOffset},${innerR * Math.sin(angle1) + centerOffset}`);
      // Peak point
      points.push(`${outerR * Math.cos(angle2) + centerOffset},${outerR * Math.sin(angle2) + centerOffset}`);
    }

    return `M ${points.join(' L ')} Z`;
  };

  const wheelSize = outerRadius * 2 + TOOTH_HEIGHT * 2;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        width: wheelSize,
        height: wheelSize,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Rotating gear wheel */}
      <div
        ref={wheelRef}
        className="absolute inset-0 pointer-events-auto cursor-grab active:cursor-grabbing"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Gear SVG */}
        <svg
          width={wheelSize}
          height={wheelSize}
          className="absolute inset-0"
        >
          {/* Gear ring with teeth - warm bronze/copper color */}
          <path
            d={generateGearPath()}
            fill="none"
            stroke="#8B7355"
            strokeWidth="1"
            className="drop-shadow-md"
          />
          {/* Inner ring */}
          <circle
            cx={wheelSize / 2}
            cy={wheelSize / 2}
            r={outerRadius - 11}
            fill="none"
            stroke="#A08060"
            strokeWidth="2"
          />
        </svg>

        {/* Filter markers on inner ring */}
        {filters.map((filter, index) => {
          // Use same angle calculation as teeth for perfect alignment
          const angle = ((index / numFilters) * 2 * Math.PI) - (Math.PI / 2);
          // Place marker on the inner ring area
          const markerRadius = outerRadius - 6;
          const x = Math.cos(angle) * markerRadius + wheelSize / 2;
          const y = Math.sin(angle) * markerRadius + wheelSize / 2;

          return (
            <div
              key={filter.id}
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-700"
              style={{
                left: x - 3,
                top: y - 3,
                transform: `rotate(${-rotation}deg)`,
              }}
            />
          );
        })}
      </div>

      {/* Fixed indicator line at bottom */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-20"
        style={{
          bottom: -36,
        }}
      >
        {/* Red indicator line */}
        <div className="w-1.5 h-5 bg-red-500 rounded-full shadow-lg mx-auto" />

        {/* Filter name display */}
        <div className="mt-0.5 px-3 py-1 bg-black/70 rounded-full backdrop-blur-sm">
          <span className="text-white text-xs font-bold tracking-wider whitespace-nowrap">
            {currentFilter.name[lang].toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

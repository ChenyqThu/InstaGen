import React from 'react';

export const PhotoCardSkeleton: React.FC = () => (
  <div className="bg-white p-3 pb-12 shadow-md rounded-lg animate-pulse">
    {/* Photo area placeholder */}
    <div className="aspect-square bg-gray-200 rounded" />
    {/* Title placeholder */}
    <div className="mt-4 mx-auto w-2/3 h-4 bg-gray-200 rounded" />
    {/* Date placeholder */}
    <div className="mt-2 mx-auto w-1/2 h-3 bg-gray-100 rounded" />
  </div>
);

interface PhotoCardSkeletonGridProps {
  count?: number;
}

export const PhotoCardSkeletonGrid: React.FC<PhotoCardSkeletonGridProps> = ({
  count = 8
}) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <PhotoCardSkeleton key={index} />
    ))}
  </div>
);

export default PhotoCardSkeleton;

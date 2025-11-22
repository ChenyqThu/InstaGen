import { usePhotos } from '../contexts/PhotosContext';

/**
 * Hook for accessing user's photo library.
 * This is a convenience wrapper around usePhotos context.
 * All components using this hook share the same global state.
 */
export function useMyPhotos() {
    return usePhotos();
}

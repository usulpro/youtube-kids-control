import { useEffect, useRef, useState } from 'react';

export const useOverlay = ({ isPlaying }: { isPlaying: boolean }) => {
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isPlaying && !isHovered) {
      hideTimeoutRef.current = setTimeout(() => setIsHovered(false), 3000);
    }
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isPlaying, isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => setIsHovered(false), 3000);
    }
  };

  const showControls = !isPlaying || isHovered;

  return {
    isHovered,
    showControls,
    handleMouseEnter,
    handleMouseLeave,
  };
};

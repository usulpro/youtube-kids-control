import React, { useRef, useEffect, useState } from 'react';

type SeekBarProps = {
  currentTime: number; // The current playback time in seconds.
  duration: number; // The total duration of the media in seconds.
  onSeek: (time: number) => void; // Callback for when the user seeks to a new time.
  onTogglePlayPause: () => void; // Callback for when the user presses space to toggle play/pause.
  availableTime?: number; // Optional. The amount of time that is available for viewing (in seconds). If 0, the component is disabled.
  theme?: {
    colors?: {
      baseTrack?: string;
      playedProgress?: string;
      availableTime?: string;
      disabledOpacity?: number;
      thumb?: string;
      thumbBorder?: string;
      thumbActive?: string;
    };
    sizes?: {
      height?: number; // in pixels
      trackThickness?: number; // in pixels
      thumbDiameter?: number; // in pixels
    };
  };
};

const defaultTheme = {
  colors: {
    baseTrack: '#6f7072', // Light gray
    playedProgress: '#920606', // Red
    availableTime: '#10B981', // Green
    disabledOpacity: 0.7, // Reduced opacity for disabled state
    thumb: '#920606', // Thumb color
    thumbBorder: '#920606', // Thumb border color
    thumbActive: '#920606', // Thumb color when active
  },
  sizes: {
    height: 24, // Height of the component
    trackThickness: 4, // Thickness of the progress track
    thumbDiameter: 12, // Diameter of the draggable thumb
  },
};

const FLASH_THRESHOLD = 10; // seconds

const SeekBar: React.FC<SeekBarProps> = ({
  currentTime,
  duration,
  onSeek,
  onTogglePlayPause,
  availableTime,
  theme,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number>(currentTime);
  const [animatedDragTime, setAnimatedDragTime] = useState<number>(currentTime);
  const [flashOpacity, setFlashOpacity] = useState(1);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Merge the default theme with the provided theme
  const mergedTheme = {
    colors: {
      ...defaultTheme.colors,
      ...(theme?.colors || {}),
    },
    sizes: {
      ...defaultTheme.sizes,
      ...(theme?.sizes || {}),
    },
  };

  useEffect(() => {
    if (!isDragging) {
      setDragTime(currentTime);
    }
  }, [currentTime, isDragging]);

  // Smooth transition of the thumb
  useEffect(() => {
    if (isDragging) {
      // Directly set animatedDragTime when dragging
      setAnimatedDragTime(dragTime);
      return;
    }

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = performance.now();
    const initialTime = animatedDragTime;
    const deltaTime = dragTime - initialTime;
    const durationMs = 200; // Animation duration in milliseconds

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const newAnimatedTime = initialTime + deltaTime * progress;
      setAnimatedDragTime(newAnimatedTime);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dragTime, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (availableTime === 0) return;
    setIsDragging(true);
    handleMouseMove(e);
    window.addEventListener('mousemove', handleMouseMove as any);
    window.addEventListener('mouseup', handleMouseUp as any);
  };

  const handleMouseMove = (e: MouseEvent | React.MouseEvent) => {
    if (!isDragging) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let pos = e.clientX - rect.left;
    pos = Math.max(0, Math.min(pos, rect.width));
    const newTime = (pos / rect.width) * duration;
    setDragTime(newTime);
    setAnimatedDragTime(newTime); // Update animated time immediately during drag
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (availableTime === 0) return;
    setIsDragging(false);
    onSeek(dragTime);
    window.removeEventListener('mousemove', handleMouseMove as any);
    window.removeEventListener('mouseup', handleMouseUp as any);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (availableTime === 0) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let pos = e.clientX - rect.left;
    pos = Math.max(0, Math.min(pos, rect.width));
    const newTime = (pos / rect.width) * duration;
    onSeek(newTime);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (availableTime === 0) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onSeek(Math.max(0, currentTime - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onSeek(Math.min(duration, currentTime + 5));
    } else if (e.key === ' ') {
      e.preventDefault();
      onTogglePlayPause();
    }
  };

  // Calculate percentages for positioning
  const playedPercent = (animatedDragTime / duration) * 100;

  let availableStartPercent = 0;
  let availableWidthPercent = 0;
  if (availableTime !== undefined && availableTime > 0) {
    const availableStartTime = animatedDragTime;
    const availableEndTime = Math.min(availableStartTime + availableTime, duration);
    availableStartPercent = (availableStartTime / duration) * 100;
    availableWidthPercent = ((availableEndTime - availableStartTime) / duration) * 100;
  }

  // Determine if the component should be disabled
  const isDisabled = availableTime === 0;

  // Determine if the seek bar should flash
  const shouldFlash =
    availableTime !== undefined &&
    availableTime > 0 &&
    availableTime < FLASH_THRESHOLD;

  // Handle flashing effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (shouldFlash) {
      intervalId = setInterval(() => {
        setFlashOpacity((prev) => (prev === 1 ? 0.5 : 1));
      }, 500); // Adjust the interval as needed
    } else {
      setFlashOpacity(1);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [shouldFlash]);

  const computedOpacity = isDisabled
    ? mergedTheme.colors.disabledOpacity
    : flashOpacity;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative w-full"
      style={{
        height: `${mergedTheme.sizes.height}px`,
        opacity: computedOpacity,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <svg width="100%" height="100%" className="overflow-visible">
        {/* Base Track */}
        <rect
          x="0"
          y={mergedTheme.sizes.height / 2 - mergedTheme.sizes.trackThickness / 2}
          width="100%"
          height={mergedTheme.sizes.trackThickness}
          fill={mergedTheme.colors.baseTrack}
        />
        {/* Available Time */}
        {availableTime !== undefined && availableTime > 0 && (
          <rect
            x={`${availableStartPercent}%`}
            y={
              mergedTheme.sizes.height / 2 - mergedTheme.sizes.trackThickness / 2
            }
            width={`${availableWidthPercent}%`}
            height={mergedTheme.sizes.trackThickness}
            fill={mergedTheme.colors.availableTime}
          />
        )}
        {/* Played Progress */}
        <rect
          x="0"
          y={mergedTheme.sizes.height / 2 - mergedTheme.sizes.trackThickness / 2}
          width={`${playedPercent}%`}
          height={mergedTheme.sizes.trackThickness}
          fill={mergedTheme.colors.playedProgress}
        />
        {/* Thumb */}
        {!isDisabled && (
          <circle
            cx={`${playedPercent}%`}
            cy={`${mergedTheme.sizes.height / 2}`}
            r={mergedTheme.sizes.thumbDiameter / 2}
            fill={
              isDragging
                ? mergedTheme.colors.thumbActive
                : mergedTheme.colors.thumb
            }
            stroke={mergedTheme.colors.thumbBorder}
            strokeWidth="2"
            style={{ cursor: 'pointer' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown(e);
            }}
          />
        )}
      </svg>
    </div>
  );
};

export default SeekBar;

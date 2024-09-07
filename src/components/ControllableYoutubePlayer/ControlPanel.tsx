import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MdPlayArrow,
  MdPause,
  MdVolumeUp,
  MdVolumeOff,
  MdSettings,
  MdClosedCaption,
  MdFullscreen,
  MdFullscreenExit,
} from 'react-icons/md';

interface ControlPanelProps {
  isPlaying: boolean;
  isTimeLimitReached: boolean;
  currentTime: number;
  duration: number;
  timeRemaining: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  playerRef: React.RefObject<YT.Player>;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  isTimeLimitReached,
  currentTime,
  duration,
  timeRemaining,
  onTogglePlay,
  onSeek,
  playerRef,
  isFullscreen,
  toggleFullscreen,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showControls = !isPlaying || isHovered;

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

  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  }, [isMuted, volume, playerRef]);

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      if (playerRef.current) {
        playerRef.current.setVolume(newVolume);
        setVolume(newVolume);
        const shouldBeMuted = newVolume === 0;
        playerRef.current[shouldBeMuted ? 'mute' : 'unMute']();
        setIsMuted(shouldBeMuted);
      }
    },
    [playerRef],
  );

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onTogglePlay}
          disabled={isTimeLimitReached}
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
          className="text-white focus:outline-none"
        >
          {isPlaying ? <MdPause size={24} /> : <MdPlayArrow size={24} />}
        </button>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="text-white focus:outline-none"
          >
            {isMuted ? <MdVolumeOff size={24} /> : <MdVolumeUp size={24} />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-24"
          />
          <button
            aria-label="Settings"
            className="text-white focus:outline-none"
          >
            <MdSettings size={24} />
          </button>
          <button
            aria-label="Subtitles"
            className="text-white focus:outline-none"
          >
            <MdClosedCaption size={24} />
          </button>
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="text-white focus:outline-none"
          >
            {isFullscreen ? (
              <MdFullscreenExit size={24} />
            ) : (
              <MdFullscreen size={24} />
            )}
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-2 text-white">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="flex-grow"
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default ControlPanel;

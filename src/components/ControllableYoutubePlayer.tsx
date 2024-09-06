import React, { useState, useEffect, useRef, useCallback } from 'react';

interface YouTubePlayerProps {
  videoId: string;
  timeLimit: number; // in seconds
}

interface ControlPanelProps {
  isPlaying: boolean;
  isTimeLimitReached: boolean;
  currentTime: number;
  duration: number;
  timeRemaining: number;
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
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
  volume,
  isMuted,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onSeek,
}) => {
  const [isHovered, setIsHovered] = useState(false);
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
          {isPlaying ? '||' : '▶'}
        </button>
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="text-white focus:outline-none"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-24"
          />
          <button
            aria-label="Settings"
            className="text-white focus:outline-none"
          >
            ⚙️
          </button>
          <button
            aria-label="Subtitles"
            className="text-white focus:outline-none"
          >
            CC
          </button>
          <button
            aria-label="Fullscreen"
            className="text-white focus:outline-none"
          >
            ⛶
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

const ControllableYoutubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  timeLimit,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTimeLimitReached, setIsTimeLimitReached] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = initializeYouTubePlayer;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const initializeYouTubePlayer = () => {
    if (!containerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '360',
      width: '640',
      videoId: videoId,
      playerVars: {
        controls: 0,
        disablekb: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerReady = (event: YT.PlayerEvent) => {
    setDuration(event.target.getDuration());
  };

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      if (!isTimeLimitReached) {
        setIsPlaying(true);
        startTimer();
      } else {
        event.target.pauseVideo();
      }
    } else {
      setIsPlaying(false);
      stopTimer();
    }
  };

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 0) {
          handleTimeOver();
          return 0;
        }
        return prevTime - 1;
      });
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTimeOver = useCallback(() => {
    stopTimer();
    setIsTimeLimitReached(true);
    setIsPlaying(false);
    if (playerRef.current?.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  }, [stopTimer]);

  const togglePlay = useCallback(() => {
    if (isTimeLimitReached) return;
    if (isPlaying) {
      playerRef.current?.pauseVideo();
    } else {
      playerRef.current?.playVideo();
    }
  }, [isPlaying, isTimeLimitReached]);

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
  }, [isMuted, volume]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      setVolume(newVolume);
      const shouldBeMuted = newVolume === 0;
      playerRef.current[shouldBeMuted ? 'mute' : 'unMute']();
      setIsMuted(shouldBeMuted);
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
  }, []);

  return (
    <div className="relative w-full h-0 pb-[56.25%]">
      <div
        ref={containerRef}
        className="absolute top-0 left-0 w-full h-full"
      ></div>
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex flex-col justify-end">
        <ControlPanel
          isPlaying={isPlaying}
          isTimeLimitReached={isTimeLimitReached}
          currentTime={currentTime}
          duration={duration}
          timeRemaining={timeRemaining}
          volume={volume}
          isMuted={isMuted}
          onTogglePlay={togglePlay}
          onToggleMute={toggleMute}
          onVolumeChange={handleVolumeChange}
          onSeek={handleSeek}
        />
      </div>
    </div>
  );
};

export default ControllableYoutubePlayer;

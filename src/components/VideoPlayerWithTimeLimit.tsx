'use client';

import React, { useState, useEffect, useRef } from 'react';

interface VideoPlayerWithTimeLimitProps {
  videoId: string;
  timeLimit: number; // in seconds
  renderProgressBar: (props: {
    percentage: number;
    isFullscreen: boolean;
    shouldShow: boolean;
  }) => React.ReactNode;
}

const VideoPlayerWithTimeLimit: React.FC<VideoPlayerWithTimeLimitProps> = ({
  videoId,
  timeLimit,
  renderProgressBar,
}) => {
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const onYouTubeIframeAPIReady = () => {
    if (!playerRef.current) return;

    const newPlayer = new window.YT.Player(playerRef.current, {
      height: '390',
      width: '640',
      videoId: videoId,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });

    setPlayer(newPlayer);
  };

  const onPlayerReady = (event: YT.PlayerEvent) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
  };

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startTimer();
    } else {
      setIsPlaying(false);
      stopTimer();
    }
  };

  const startTimer = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(intervalRef.current as NodeJS.Timeout);
          player?.pauseVideo();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      player?.pauseVideo();
    } else {
      player?.playVideo();
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      player?.unMute();
      setIsMuted(false);
    } else {
      player?.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    player?.setVolume(newVolume);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value, 10);
    player?.seekTo(newTime, true);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const updateCurrentTime = () => {
      if (player && player.getCurrentTime) {
        setCurrentTime(player.getCurrentTime());
      }
    };
    const timeUpdateInterval = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(timeUpdateInterval);
  }, [player]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercentage = ((timeLimit - timeRemaining) / timeLimit) * 100;

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div ref={playerRef} className="w-full h-full"></div>
      <div className="absolute inset-0 bg-transparent" />{' '}
      {/* Transparent overlay */}
      {player && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
          <div className="flex items-center justify-between">
            <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-1/2"
            />
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
            />
            <button onClick={toggleFullscreen}>
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>
        </div>
      )}
      {renderProgressBar({
        percentage: progressPercentage,
        isFullscreen,
        shouldShow: timeRemaining <= 60, // Show progress bar in last 60 seconds
      })}
    </div>
  );
};

export default VideoPlayerWithTimeLimit;

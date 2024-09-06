'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

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
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTimeLimitReached, setIsTimeLimitReached] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
  const playerElementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
    if (!playerElementRef.current) return;

    const newPlayer = new window.YT.Player(playerElementRef.current, {
      height: '720',
      width: '100%',
      videoId: videoId,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });

    playerRef.current = newPlayer;
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
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
      stopTimer();
    }
  };

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 0) {
          handleTimeOver();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleTimeOver = useCallback(() => {
    stopTimer();
    setIsTimeLimitReached(true);
    setIsPlaying(false);
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
    console.log('Time over - video should stop');
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
    if (isMuted) {
      playerRef.current?.unMute();
      setIsMuted(false);
    } else {
      playerRef.current?.mute();
      setIsMuted(true);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseInt(e.target.value, 10);
      setVolume(newVolume);
      playerRef.current?.setVolume(newVolume);
    },
    [],
  );

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isTimeLimitReached) return;
      const newTime = parseInt(e.target.value, 10);
      playerRef.current?.seekTo(newTime, true);
    },
    [isTimeLimitReached],
  );

  // ... (остальной код остается без изменений)

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div ref={playerElementRef} className="w-full h-full"></div>
      {/* ... (остальной JSX остается без изменений) */}
    </div>
  );
};

export default VideoPlayerWithTimeLimit;

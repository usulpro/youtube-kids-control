import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFullscreen } from './useFullscreen';
import ControlPanel from './ControlPanel';

interface YouTubePlayerProps {
  videoId: string;
  timeLimit: number; // in seconds
}

const ControllableYoutubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  timeLimit,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTimeLimitReached, setIsTimeLimitReached] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { elementRef, isFullscreen, toggleFullscreen } = useFullscreen();

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

  const handleSeek = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
  }, []);

  return (
    <div ref={elementRef} className="relative w-full h-0 pb-[56.25%]">
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
          onTogglePlay={togglePlay}
          onSeek={handleSeek}
          playerRef={playerRef}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
        />
      </div>
    </div>
  );
};

export default ControllableYoutubePlayer;
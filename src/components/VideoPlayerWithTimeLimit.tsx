'use client';

import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { VIDEO_CONFIG } from '@/config';

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
  const [player, setPlayer] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const onReady = (event: { target: any }) => {
    setPlayer(event.target);
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  const startTimer = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= VIDEO_CONFIG.EXIT_FULLSCREEN_BEFORE_END) {
          exitFullscreen();
        }
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

  const onStateChange = (event: { data: number }) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      setIsPlaying(true);
      startTimer();
    } else {
      setIsPlaying(false);
      stopTimer();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const shouldShowProgressBar =
    timeRemaining <= VIDEO_CONFIG.PROGRESS_BAR_START_TIME;
  const progressPercentage = shouldShowProgressBar
    ? ((VIDEO_CONFIG.PROGRESS_BAR_START_TIME - timeRemaining) /
        VIDEO_CONFIG.PROGRESS_BAR_START_TIME) *
      100
    : 0;

  return (
    <div style={{ position: 'relative' }}>
      {renderProgressBar({
        percentage: progressPercentage,
        isFullscreen,
        shouldShow: shouldShowProgressBar,
      })}
      <YouTube
        videoId={videoId}
        opts={{
          height: '390',
          width: '640',
          playerVars: {
            autoplay: 0,
          },
        }}
        onReady={onReady}
        onStateChange={onStateChange}
      />
    </div>
  );
};

export default VideoPlayerWithTimeLimit;

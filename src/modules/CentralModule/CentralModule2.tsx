import React, { useState, useEffect } from 'react';
import ControllableYoutubePlayer from '@/modules/ControllableYoutubePlayer/ControllableYoutubePlayer';
import AnalogClock from '@/modules/AnalogClock/AnalogClock';
import { buildInitialIntervals } from './model';
import { Interval } from '../types';

const WATCH_TIME = 0.5 * 60; // 15 minutes in seconds
const BREAK_TIME = 0.5 * 60; // 10 minutes in seconds

const CentralModule: React.FC = () => {
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [playingMode, setPlayingMode] = useState<
    'watching' | 'paused' | 'break'
  >('paused');
  const [timeLimit, setTimeLimit] = useState<number>(WATCH_TIME);

  const handlePlayPause = (isPlaying: boolean) => {
    if (playingMode === 'break') {
      // not allowed to watch
      return;
    }
    if (isPlaying) {
      setPlayingMode('watching');
    } else {
      // allowed to watch but user sets on pause
      setPlayingMode('paused');
    }
  };

  useEffect(() => {
    setIntervals(buildInitialIntervals(new Date(), WATCH_TIME, BREAK_TIME));
  }, []);

  const handleReachedTimeLimit = () => {
    setTimeLimit(0);
    setPlayingMode('break');
    // // TODO: add a ref to setTimeout and disable it on component unmount
    setTimeout(() => {
      setIntervals(buildInitialIntervals(new Date(), WATCH_TIME, BREAK_TIME));
      setTimeLimit(WATCH_TIME);
      setPlayingMode('paused');
    }, BREAK_TIME * 1000);
  };

  return (
    <div>
      <ControllableYoutubePlayer
        videoId="wVH6vZiWrl8"
        onPlayPause={handlePlayPause}
        timeLimit={timeLimit}
        onTimeLimit={handleReachedTimeLimit}
        renderWidget={() => (
          <div className="w-96">
            <AnalogClock intervals={intervals} options={{ showIcons: false }} />
          </div>
        )}
      />
    </div>
  );
};

export default CentralModule;

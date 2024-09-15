import React, { useState, useEffect, useCallback } from 'react';
import ControllableYoutubePlayer from '@/modules/ControllableYoutubePlayer/ControllableYoutubePlayer';
import AnalogClock from '@/modules/AnalogClock/AnalogClock';

type Interval = {
  startTime: string;
  endTime: string;
  icon: React.ReactElement;
  color: string;
  label: string;
};

const WATCH_TIME = 15 * 60; // 15 minutes in seconds
const BREAK_TIME = 10 * 60; // 10 minutes in seconds

const CentralModule: React.FC = () => {
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [watchTimeRemaining, setWatchTimeRemaining] = useState(WATCH_TIME);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('centralModuleState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setIntervals(parsedState.intervals);
      setWatchTimeRemaining(parsedState.watchTimeRemaining);
      setBreakTimeRemaining(parsedState.breakTimeRemaining);
      setIsPlaying(parsedState.isPlaying);
      setIsBreak(parsedState.isBreak);
    } else {
      initializeIntervals();
    }
  }, []);

  useEffect(() => {
    const state = {
      intervals,
      watchTimeRemaining,
      breakTimeRemaining,
      isPlaying,
      isBreak,
    };
    localStorage.setItem('centralModuleState', JSON.stringify(state));
  }, [intervals, watchTimeRemaining, breakTimeRemaining, isPlaying, isBreak]);

  const initializeIntervals = () => {
    const now = new Date();
    const newIntervals: Interval[] = [
      {
        startTime: formatTime(now),
        endTime: formatTime(addSeconds(now, WATCH_TIME)),
        icon: <span>🎥</span>,
        color: '#059669',
        label: 'Watch Time',
      },
      {
        startTime: formatTime(addSeconds(now, WATCH_TIME)),
        endTime: formatTime(addSeconds(now, WATCH_TIME + BREAK_TIME)),
        icon: <span>⏸️</span>,
        color: '#DC2626',
        label: 'Break Time',
      },
    ];
    setIntervals(newIntervals);
  };

  const formatTime = (date: Date): string => {
    return date.toTimeString().slice(0, 5);
  };

  const addSeconds = (date: Date, seconds: number): Date => {
    return new Date(date.getTime() + seconds * 1000);
  };

  const handlePlayPause = () => {
    if (isBreak) return;
    setIsPlaying((prev) => !prev);
  };

  const handleTimeUpdate = () => {
    if (isPlaying) {
      setWatchTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setIsBreak(true);
          setBreakTimeRemaining(BREAK_TIME);
          return WATCH_TIME;
        }
        return prev - 1;
      });
    } else if (isBreak) {
      setBreakTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsBreak(false);
          setWatchTimeRemaining(WATCH_TIME);
          return 0;
        }
        return prev - 1;
      });
    }
  };

  useEffect(() => {
    const timer = setInterval(handleTimeUpdate, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, isBreak]);

  return (
    <div>
      <ControllableYoutubePlayer
        videoId="wVH6vZiWrl8"
        timeLimit={watchTimeRemaining}
      />
      <AnalogClock intervals={intervals} />
      <button onClick={handlePlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default CentralModule;

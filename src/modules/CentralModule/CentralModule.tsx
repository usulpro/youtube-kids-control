import React, { useState, useEffect } from 'react';
import ControllableYoutubePlayer from '@/modules/ControllableYoutubePlayer/ControllableYoutubePlayer';
import AnalogClock from '@/modules/AnalogClock/AnalogClock';
import { Interval } from '../types';



const WATCH_TIME = 8 * 60; // 15 minutes in seconds
const BREAK_TIME = 2 * 60; // 10 minutes in seconds

const CentralModule: React.FC = () => {
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [periodStartTime, setPeriodStartTime] = useState<Date>(new Date());
  const [currentPeriodEndTime, setCurrentPeriodEndTime] = useState<Date>(
    new Date(),
  );
  const [currentPeriodType, setCurrentPeriodType] = useState<'watch' | 'break'>(
    'watch',
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalPauseTimeDuringWatchPeriod, setTotalPauseTimeDuringWatchPeriod] =
    useState(0);
  const [lastPauseTime, setLastPauseTime] = useState<Date | null>(null);
  const [timeLimit, setTimeLimit] = useState<number>(WATCH_TIME); // Time limit in seconds

  useEffect(() => {
    const savedState = localStorage.getItem('centralModuleState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setIntervals(parsedState.intervals);
      setPeriodStartTime(new Date(parsedState.periodStartTime));
      setCurrentPeriodEndTime(new Date(parsedState.currentPeriodEndTime));
      setCurrentPeriodType(parsedState.currentPeriodType);
      setIsPlaying(parsedState.isPlaying);
      setTotalPauseTimeDuringWatchPeriod(
        parsedState.totalPauseTimeDuringWatchPeriod,
      );
      setLastPauseTime(
        parsedState.lastPauseTime ? new Date(parsedState.lastPauseTime) : null,
      );
      setTimeLimit(parsedState.timeLimit);
    } else {
      // Initialize periods
      const now = new Date();
      setPeriodStartTime(now);
      setCurrentPeriodEndTime(new Date(now.getTime() + WATCH_TIME * 1000));
      setCurrentPeriodType('watch');
      setTimeLimit(WATCH_TIME);
      updateIntervals(now, 'watch', WATCH_TIME);
    }
  }, []);

  useEffect(() => {
    const state = {
      intervals,
      periodStartTime: periodStartTime.toISOString(),
      currentPeriodEndTime: currentPeriodEndTime.toISOString(),
      currentPeriodType,
      isPlaying,
      totalPauseTimeDuringWatchPeriod,
      lastPauseTime: lastPauseTime ? lastPauseTime.toISOString() : null,
      timeLimit,
    };
    localStorage.setItem('centralModuleState', JSON.stringify(state));
  }, [
    intervals,
    periodStartTime,
    currentPeriodEndTime,
    currentPeriodType,
    isPlaying,
    totalPauseTimeDuringWatchPeriod,
    lastPauseTime,
    timeLimit,
  ]);

  const formatTime = (date: Date): string => {
    return date.toTimeString().slice(0, 5);
  };

  const addSeconds = (date: Date, seconds: number): Date => {
    return new Date(date.getTime() + seconds * 1000);
  };

  const handlePlayPause = (playing: boolean) => {
    const now = new Date();

    if (playing) {
      // Resuming play
      if (lastPauseTime) {
        const pauseDuration = Math.floor(
          (now.getTime() - lastPauseTime.getTime()) / 1000,
        );

        if (currentPeriodType === 'watch') {
          if (pauseDuration >= BREAK_TIME) {
            // Break time has been exceeded, start new watch period
            setCurrentPeriodType('watch');
            setPeriodStartTime(now);
            setCurrentPeriodEndTime(addSeconds(now, WATCH_TIME));
            setTotalPauseTimeDuringWatchPeriod(0);
            setLastPauseTime(null);
            setTimeLimit(WATCH_TIME);
            updateIntervals(now, 'watch', WATCH_TIME);
            setIsPlaying(true);
            return;
          } else {
            // Add to totalPauseTimeDuringWatchPeriod
            setTotalPauseTimeDuringWatchPeriod((prev) => prev + pauseDuration);
          }
        }
        setLastPauseTime(null);
      }
      setIsPlaying(true);
    } else {
      // Pausing play
      setIsPlaying(false);
      setLastPauseTime(now);
    }
  };

  const handleTimeUpdate = () => {
    const now = new Date();

    // Calculate remaining time
    const remainingTime = Math.floor(
      (currentPeriodEndTime.getTime() - now.getTime()) / 1000,
    );
    setTimeLimit(remainingTime > 0 ? remainingTime : 0);

    if (currentPeriodType === 'watch') {
      if (now >= currentPeriodEndTime) {
        // Watch period over
        setIsPlaying(false);
        setCurrentPeriodType('break');

        // Adjust break time
        const adjustedBreakTime = Math.max(
          0,
          BREAK_TIME - totalPauseTimeDuringWatchPeriod,
        );

        setPeriodStartTime(now);
        setCurrentPeriodEndTime(addSeconds(now, adjustedBreakTime));

        // Reset totalPauseTimeDuringWatchPeriod
        setTotalPauseTimeDuringWatchPeriod(0);

        // Update intervals
        updateIntervals(now, 'break', adjustedBreakTime);

        // Update timeLimit
        setTimeLimit(adjustedBreakTime);
      }
    } else if (currentPeriodType === 'break') {
      if (now >= currentPeriodEndTime) {
        // Break period over
        setCurrentPeriodType('watch');
        setPeriodStartTime(now);
        setCurrentPeriodEndTime(addSeconds(now, WATCH_TIME));

        // Update intervals
        updateIntervals(now, 'watch', WATCH_TIME);

        // Update timeLimit
        setTimeLimit(WATCH_TIME);
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(handleTimeUpdate, 1000);
    return () => clearInterval(timer);
  });

  const updateIntervals = (
    startTime: Date,
    periodType: 'watch' | 'break',
    duration: number,
  ) => {
    const intervals: Interval[] = [];
    let currentTime = startTime;
    let type = periodType;
    let totalPauseTime = totalPauseTimeDuringWatchPeriod;
    let periodEndTime = addSeconds(currentTime, duration);

    // Current interval
    intervals.push({
      startTime: formatTime(currentTime),
      endTime: formatTime(periodEndTime),
      icon: type === 'watch' ? <span>🎥</span> : <span>⏸️</span>,
      color: type === 'watch' ? '#059669' : '#DC2626',
      label: type === 'watch' ? 'Watch Time' : 'Break Time',
    });

    // Next two intervals
    for (let i = 0; i < 2; i++) {
      currentTime = periodEndTime;
      if (type === 'watch') {
        // Next is Break Time
        const adjustedBreakTime = Math.max(0, BREAK_TIME - totalPauseTime);
        periodEndTime = addSeconds(currentTime, adjustedBreakTime);
        type = 'break';
      } else {
        // Next is Watch Time
        periodEndTime = addSeconds(currentTime, WATCH_TIME);
        type = 'watch';
        totalPauseTime = 0; // Reset totalPauseTime when new watch period starts
      }
      intervals.push({
        startTime: formatTime(currentTime),
        endTime: formatTime(periodEndTime),
        icon: type === 'watch' ? <span>🎥</span> : <span>⏸️</span>,
        color: type === 'watch' ? '#059669' : '#DC2626',
        label: type === 'watch' ? 'Watch Time' : 'Break Time',
      });
    }

    setIntervals(intervals);
  };

  return (
    <div>
      <ControllableYoutubePlayer
        videoId="wVH6vZiWrl8"
        onPlayPause={handlePlayPause}
        timeLimit={timeLimit}
        isPlaying={isPlaying && currentPeriodType === 'watch'}
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

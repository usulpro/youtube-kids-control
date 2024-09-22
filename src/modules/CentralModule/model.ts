import { Interval } from "../types";

const formatTime = (date: Date): string => {
  return date.toTimeString().slice(0, 5);
};

const addSeconds = (date: Date, seconds: number): Date => {
  return new Date(date.getTime() + seconds * 1000);
};

const createInterval = (
  startTime: Date,
  endTime: Date,
  type: 'watch' | 'break',
): Interval => {
  return {
    startTime,
    endTime,
    icon: type === 'watch' ? '🎥' : '⏸️',
    color: type === 'watch' ? '#059669' : '#DC2626',
    label: type === 'watch' ? 'Watch Time' : 'Break Time',
  };
};

export const buildInitialIntervals = (
  startTime: Date,
  watchTime: number,
  breakTime: number,
): Interval[] => {
  const periods = Math.ceil(45 * 60 / (watchTime + breakTime));
  const intervals: Interval[] = [];

  let watchStartTime = startTime;
  new Array(periods).fill(1).forEach(() => {
    const watchEndTime = addSeconds(watchStartTime, watchTime);
    const breakEndTime = addSeconds(watchEndTime, breakTime);
    intervals.push(createInterval(watchStartTime, watchEndTime, 'watch'));
    intervals.push(createInterval(watchEndTime, breakEndTime, 'break'));
    watchStartTime = breakEndTime;
  });

  return intervals;
};




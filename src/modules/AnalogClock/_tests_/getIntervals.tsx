import React from 'react';
import { FiCoffee, FiBook, FiTv, FiMoon, FiSun, FiHeart } from 'react-icons/fi';

type Interval = {
  startTime: string;
  endTime: string;
  icon: React.ReactElement;
  color: string;
  label: string;
};

export const generateTestIntervals = (): Interval[] => {
  const now = new Date();
  const intervals: Interval[] = [];

  const addMinutes = (date: Date, minutes: number): Date => {
    return new Date(date.getTime() + minutes * 60000);
  };

  const formatTime = (date: Date): string => {
    return date.toTimeString().slice(0, 5);
  };

  // Two passed intervals (10 minutes each)
  const passedInterval1End = addMinutes(now, -10);
  const passedInterval1Start = addMinutes(passedInterval1End, -10);
  intervals.push({
    startTime: formatTime(passedInterval1Start),
    endTime: formatTime(passedInterval1End),
    icon: <FiCoffee className="text-yellow-600 text-2xl" />,
    color: '#D97706',
    label: 'Passed Interval 1',
  });

  const passedInterval2End = now;
  const passedInterval2Start = addMinutes(passedInterval2End, -10);
  intervals.push({
    startTime: formatTime(passedInterval2Start),
    endTime: formatTime(passedInterval2End),
    icon: <FiBook className="text-blue-600 text-2xl" />,
    color: '#2563EB',
    label: 'Passed Interval 2',
  });

  // Current interval (17 minutes)
  const currentIntervalStart = now;
  const currentIntervalEnd = addMinutes(currentIntervalStart, 17);
  intervals.push({
    startTime: formatTime(currentIntervalStart),
    endTime: formatTime(currentIntervalEnd),
    icon: <FiTv className="text-green-600 text-2xl" />,
    color: '#059669',
    label: 'Current Interval',
  });

  // Three upcoming intervals (5, 8, and 20 minutes)
  const upcomingInterval1Start = currentIntervalEnd;
  const upcomingInterval1End = addMinutes(upcomingInterval1Start, 5);
  intervals.push({
    startTime: formatTime(upcomingInterval1Start),
    endTime: formatTime(upcomingInterval1End),
    icon: <FiMoon className="text-purple-600 text-2xl" />,
    color: '#7C3AED',
    label: 'Upcoming Interval 1',
  });

  const upcomingInterval2Start = upcomingInterval1End;
  const upcomingInterval2End = addMinutes(upcomingInterval2Start, 8);
  intervals.push({
    startTime: formatTime(upcomingInterval2Start),
    endTime: formatTime(upcomingInterval2End),
    icon: <FiSun className="text-red-600 text-2xl" />,
    color: '#DC2626',
    label: 'Upcoming Interval 2',
  });

  const upcomingInterval3Start = upcomingInterval2End;
  const upcomingInterval3End = addMinutes(upcomingInterval3Start, 20);
  intervals.push({
    startTime: formatTime(upcomingInterval3Start),
    endTime: formatTime(upcomingInterval3End),
    icon: <FiHeart className="text-pink-600 text-2xl" />,
    color: '#D97706',
    label: 'Upcoming Interval 3',
  });

  return intervals;
};

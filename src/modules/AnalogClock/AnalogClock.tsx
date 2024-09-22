import React, { useState, useEffect } from 'react';
import ClockUI from './ClockUI';
import { Interval } from '../types';



type Options = {
  showIcons: boolean;
};

type AnalogClockProps = {
  intervals: Interval[];
  options: Options;
};

const defaultOptions: Options = {
  showIcons: true,
};

const AnalogClock: React.FC<AnalogClockProps> = ({
  intervals,
  options = defaultOptions,
}) => {
  const { showIcons = defaultOptions.showIcons } = options;
  const [time, setTime] = useState<Date>(new Date());
  const [filteredIntervals, setFilteredIntervals] = useState<Interval[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const filterIntervals = (currentTime: Date) => {
      const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60000);
      const fortyFiveMinutesLater = new Date(
        currentTime.getTime() + 45 * 60000,
      );

      return intervals.reduce((acc: Interval[], interval: Interval) => {
        if (interval.startTime.getTime() > currentTime.getTime() + 45 * 60000)
          return acc;

        let newInterval = { ...interval };

        if (interval.startTime.getTime() < currentTime.getTime() - 5 * 60000) {
          if (interval.endTime.getTime() <= currentTime.getTime() - 5 * 60000)
            return acc;
          newInterval.startTime = fiveMinutesAgo;
        }

        if (interval.endTime.getTime() > currentTime.getTime() + 45 * 60000) {
          newInterval.endTime = fortyFiveMinutesLater;
        }

        if (interval.endTime.getTime() <= currentTime.getTime()) {
          newInterval.status = 'passed';
        } else if (interval.startTime.getTime() > currentTime.getTime()) {
          newInterval.status = 'upcoming';
        } else {
          newInterval.status = 'current';
        }

        return [...acc, newInterval];
      }, []);
    };

    setFilteredIntervals(filterIntervals(time));
  }, [time, intervals]);

  return (
    <ClockUI
      hours={time.getHours()}
      minutes={time.getMinutes()}
      seconds={time.getSeconds()}
      intervals={filteredIntervals}
      showIcons={showIcons}
    />
  );
};

export default AnalogClock;

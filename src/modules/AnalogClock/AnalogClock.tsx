import React, { useState, useEffect } from 'react';
import ClockUI from './ClockUI';

type IntervalStatus = 'passed' | 'current' | 'upcoming';

type Interval = {
  startTime: string;
  endTime: string;
  icon: React.ReactElement;
  color: string;
  label: string;
  status?: IntervalStatus;
};

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
      const currentMinutes =
        currentTime.getHours() * 60 + currentTime.getMinutes();
      const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60000);
      const fortyFiveMinutesLater = new Date(
        currentTime.getTime() + 45 * 60000,
      );

      return intervals.reduce((acc: Interval[], interval: Interval) => {
        const start = new Date(`1970-01-01T${interval.startTime}:00`);
        const end = new Date(`1970-01-01T${interval.endTime}:00`);
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const endMinutes = end.getHours() * 60 + end.getMinutes();

        if (startMinutes > currentMinutes + 45) return acc;

        let newInterval = { ...interval };

        if (startMinutes < currentMinutes - 5) {
          if (endMinutes <= currentMinutes - 5) return acc;
          newInterval.startTime = fiveMinutesAgo.toTimeString().slice(0, 5);
        }

        if (endMinutes > currentMinutes + 45) {
          newInterval.endTime = fortyFiveMinutesLater
            .toTimeString()
            .slice(0, 5);
        }

        if (endMinutes <= currentMinutes) {
          newInterval.status = 'passed';
        } else if (startMinutes > currentMinutes) {
          newInterval.status = 'upcoming';
        } else {
          newInterval.status = 'current';
        }

        return [...acc, newInterval];
      }, []);
    };

    setFilteredIntervals(filterIntervals(time));
  }, [time, intervals]);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  return (
    <ClockUI
      hours={hours}
      minutes={minutes}
      seconds={seconds}
      intervals={filteredIntervals}
      showIcons={showIcons}
    />
  );
};

export default AnalogClock;

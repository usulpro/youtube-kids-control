export type IntervalStatus = 'passed' | 'current' | 'upcoming';

export type Interval = {
  startTime: Date;
  endTime: Date;
  icon: React.ReactElement | string;
  color: string;
  label: string;
  status?: IntervalStatus;
};

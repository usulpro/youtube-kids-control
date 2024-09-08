import React from 'react';
import { FiCoffee, FiBook, FiTv, FiMoon, FiSun, FiHeart } from 'react-icons/fi';

type Interval = {
  startTime: string;
  endTime: string;
  icon: React.ReactElement;
  color: string;
  label: string;
};

type ClockUIProps = {
  hours: number;
  minutes: number;
  seconds: number;
  intervals: Interval[];
};

const ClockUI: React.FC<ClockUIProps> = ({ hours, minutes, seconds, intervals }) => {
  const radius = 100;
  const center = radius;

  const hourAngle = (hours % 12 + minutes / 60) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  const hourHandLength = radius * 0.5;
  const minuteHandLength = radius * 0.7;
  const secondHandLength = radius * 0.8;

  const createHand = (angle: number, length: number, width: number, color: string) => {
    const x2 = center + length * Math.sin(angle * Math.PI / 180);
    const y2 = center - length * Math.cos(angle * Math.PI / 180);
    return <line x1={center} y1={center} x2={x2} y2={y2} stroke={color} strokeWidth={width} />;
  };

  const createMarker = (minute: number) => {
    const angle = minute * 6;
    const innerRadius = radius * 0.88;
    const outerRadius = minute % 5 === 0 ? radius * 0.98 : radius * 0.95;
    const x1 = center + innerRadius * Math.sin(angle * Math.PI / 180);
    const y1 = center - innerRadius * Math.cos(angle * Math.PI / 180);
    const x2 = center + outerRadius * Math.sin(angle * Math.PI / 180);
    const y2 = center - outerRadius * Math.cos(angle * Math.PI / 180);
    return <line key={minute} x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeWidth={minute % 5 === 0 ? 2 : 1} />;
  };

  const createMinuteNumber = (minute: number) => {
    if (minute % 5 !== 0) return null;
    const angle = minute * 6;
    const textRadius = radius * 0.75;
    const x = center + textRadius * Math.sin(angle * Math.PI / 180);
    const y = center - textRadius * Math.cos(angle * Math.PI / 180);
    return (
      <text
        key={minute}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fontWeight="bold"
        fill="black"
      >
        {minute}
      </text>
    );
  };

  const createIntervalSector = (interval: Interval) => {
    const timeToAngle = (time: string) => {
      const [, m] = time.split(':').map(Number);
      return m * 6; // 6 degrees per minute
    };

    const startAngle = timeToAngle(interval.startTime);
    const endAngle = timeToAngle(interval.endTime);

    const innerRadius = radius * 1.05;
    const outerRadius = radius * 1.15;

    const startX = center + innerRadius * Math.sin(startAngle * Math.PI / 180);
    const startY = center - innerRadius * Math.cos(startAngle * Math.PI / 180);
    const endX = center + innerRadius * Math.sin(endAngle * Math.PI / 180);
    const endY = center - innerRadius * Math.cos(endAngle * Math.PI / 180);

    const largeArcFlag = (endAngle - startAngle + 360) % 360 > 180 ? "1" : "0";

    const path = `
      M ${startX} ${startY}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}
      L ${center + outerRadius * Math.sin(endAngle * Math.PI / 180)} ${center - outerRadius * Math.cos(endAngle * Math.PI / 180)}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${center + outerRadius * Math.sin(startAngle * Math.PI / 180)} ${center - outerRadius * Math.cos(startAngle * Math.PI / 180)}
      Z
    `;

    const iconAngle = startAngle;
    const iconX = center + (outerRadius + 10) * Math.sin(iconAngle * Math.PI / 180);
    const iconY = center - (outerRadius + 10) * Math.cos(iconAngle * Math.PI / 180);

    return (
      <g key={interval.startTime}>
        <path d={path} fill={interval.color} opacity="0.5" />
        <foreignObject x={iconX - 12} y={iconY - 12} width="24" height="24">
          {React.cloneElement(interval.icon, { className: `${interval.icon.props.className} absolute` })}
        </foreignObject>
      </g>
    );
  };

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${radius * 2.4} ${radius * 2.4}`}>
      <g transform={`translate(${radius * 0.2}, ${radius * 0.2})`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="black" strokeWidth="2" />

        {intervals.map(createIntervalSector)}

        {[...Array(60)].map((_, i) => createMinuteNumber(i))}
        {[...Array(60)].map((_, i) => createMarker(i))}

        {createHand(hourAngle, hourHandLength, 4, "black")}
        {createHand(minuteAngle, minuteHandLength, 2, "blue")}
        {createHand(secondAngle, secondHandLength, 1, "red")}

        <circle cx={center} cy={center} r="3" fill="black" />
      </g>
    </svg>
  );
};

export default ClockUI;
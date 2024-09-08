import React from 'react';

type IntervalStatus = 'passed' | 'current' | 'upcoming';

type Interval = {
  startTime: string;
  endTime: string;
  icon: React.ReactElement;
  color: string;
  label: string;
  status: IntervalStatus;
};

type ClockUIProps = {
  hours: number;
  minutes: number;
  seconds: number;
  intervals: Interval[];
};

const clockThemeLight = {
  colors: {
    background: '#ffffff',
    border: '#383838',
    hourHand: '#494949',
    minuteHand: 'black',
    secondHand: '#ff8282',
    text: '#525252',
    outerCircle: '#adb1ba',
    outerCircleTransparent: 'rgba(104, 108, 118, 0.132)',
  },
  opacity: {
    current: 0.7,
    upcoming: 0.4,
    passed: 0.2,
  },
};

const clockTheme = {
  colors: {
    background: '#1b2023',
    border: '#727272',
    hourHand: '#6c6c6c',
    minuteHand: '#ffffff',
    secondHand: '#ff8282',
    text: '#d1d1d1',
    outerCircle: '#396298',
    outerCircleTransparent: 'rgba(31, 47, 70, 0.767)',
  },
  opacity: {
    current: 0.7,
    upcoming: 0.4,
    passed: 0.2,
  },
};

const ClockUI: React.FC<ClockUIProps> = ({
  hours,
  minutes,
  seconds,
  intervals,
}) => {
  const radius = 100;
  const center = radius;
  const padding = radius * 0.3;

  const hourAngle = ((hours % 12) + minutes / 60) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  const hourHandLength = radius * 0.5;
  const minuteHandLength = radius * 0.75;
  const secondHandLength = radius * 0.85;

  const createHand = (
    angle: number,
    length: number,
    color: string,
    handType: 'hour' | 'minute' | 'second',
  ) => {
    const radians = (angle * Math.PI) / 180;
    const x2 = center + length * Math.sin(radians);
    const y2 = center - length * Math.cos(radians);

    let path = '';

    switch (handType) {
      case 'hour':
        const hourBaseWidth = 4; // Уменьшено с 8 до 6
        const hourTipWidth = 2; // Уменьшено с 4 до 3
        path = createTaperingHand(radians, length, hourBaseWidth, hourTipWidth);
        break;
      case 'minute':
        const minuteBaseWidth = 6;
        const minuteTipWidth = 2;
        path = createTaperingHand(
          radians,
          length,
          minuteBaseWidth,
          minuteTipWidth,
        );
        break;
      case 'second':
        const secondWidth = 2;
        const counterweightLength = length * 0.2;
        path = createSecondHand(
          radians,
          length,
          secondWidth,
          counterweightLength,
        );
        break;
    }

    return <path d={path} fill={color} stroke={color} strokeWidth="0.5" />;
  };

  const createTaperingHand = (
    radians: number,
    length: number,
    baseWidth: number,
    tipWidth: number,
  ) => {
    const baseX1 = center + (baseWidth / 2) * Math.cos(radians);
    const baseY1 = center + (baseWidth / 2) * Math.sin(radians);
    const baseX2 = center - (baseWidth / 2) * Math.cos(radians);
    const baseY2 = center - (baseWidth / 2) * Math.sin(radians);

    const tipX1 =
      center + length * Math.sin(radians) + (tipWidth / 2) * Math.cos(radians);
    const tipY1 =
      center - length * Math.cos(radians) + (tipWidth / 2) * Math.sin(radians);
    const tipX2 =
      center + length * Math.sin(radians) - (tipWidth / 2) * Math.cos(radians);
    const tipY2 =
      center - length * Math.cos(radians) - (tipWidth / 2) * Math.sin(radians);

    return `
      M ${baseX1} ${baseY1}
      L ${tipX1} ${tipY1}
      L ${tipX2} ${tipY2}
      L ${baseX2} ${baseY2}
      A ${baseWidth / 2} ${baseWidth / 2} 0 0 1 ${baseX1} ${baseY1}
      Z
    `;
  };

  const createSecondHand = (
    radians: number,
    length: number,
    width: number,
    counterweightLength: number,
  ) => {
    const x2 = center + length * Math.sin(radians);
    const y2 = center - length * Math.cos(radians);
    const cwX = center - counterweightLength * Math.sin(radians);
    const cwY = center + counterweightLength * Math.cos(radians);

    const baseX1 = center + (width / 2) * Math.cos(radians);
    const baseY1 = center + (width / 2) * Math.sin(radians);
    const baseX2 = center - (width / 2) * Math.cos(radians);
    const baseY2 = center - (width / 2) * Math.sin(radians);

    return `
      M ${baseX1} ${baseY1}
      L ${x2} ${y2}
      L ${baseX2} ${baseY2}
      L ${cwX} ${cwY}
      Z
    `;
  };

  const createMarker = (minute: number) => {
    const angle = minute * 6;
    const innerRadius = radius * 0.88;
    const outerRadius = minute % 5 === 0 ? radius * 0.98 : radius * 0.95;
    const x1 = center + innerRadius * Math.sin((angle * Math.PI) / 180);
    const y1 = center - innerRadius * Math.cos((angle * Math.PI) / 180);
    const x2 = center + outerRadius * Math.sin((angle * Math.PI) / 180);
    const y2 = center - outerRadius * Math.cos((angle * Math.PI) / 180);
    return (
      <line
        key={minute}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={clockTheme.colors.border}
        strokeWidth={minute % 5 === 0 ? 2 : 1}
      />
    );
  };

  const createMinuteNumber = (minute: number) => {
    if (minute % 5 !== 0) return null;
    const angle = minute * 6;
    const textRadius = radius * 0.75;
    const x = center + textRadius * Math.sin((angle * Math.PI) / 180);
    const y = center - textRadius * Math.cos((angle * Math.PI) / 180);
    return (
      <text
        key={minute}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fontWeight="bold"
        fill={clockTheme.colors.text}
      >
        {minute}
      </text>
    );
  };

  const createIntervalSector = (interval: Interval) => {
    const timeToAngle = (time: string) => {
      const [, m] = time.split(':').map(Number);
      return m * 6;
    };

    const startAngle = timeToAngle(interval.startTime);
    const endAngle = timeToAngle(interval.endTime);

    const innerRadius = radius * 1.05;
    const outerRadius = radius * 1.2;

    const startX =
      center + innerRadius * Math.sin((startAngle * Math.PI) / 180);
    const startY =
      center - innerRadius * Math.cos((startAngle * Math.PI) / 180);
    const endX = center + innerRadius * Math.sin((endAngle * Math.PI) / 180);
    const endY = center - innerRadius * Math.cos((endAngle * Math.PI) / 180);

    const largeArcFlag = (endAngle - startAngle + 360) % 360 > 180 ? '1' : '0';

    const path = `
      M ${startX} ${startY}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}
      L ${center + outerRadius * Math.sin((endAngle * Math.PI) / 180)} ${
      center - outerRadius * Math.cos((endAngle * Math.PI) / 180)
    }
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${
      center + outerRadius * Math.sin((startAngle * Math.PI) / 180)
    } ${center - outerRadius * Math.cos((startAngle * Math.PI) / 180)}
      Z
    `;

    const iconAngle = startAngle;
    const iconRadius = (innerRadius + outerRadius) / 2;
    const iconX = center + iconRadius * Math.sin((iconAngle * Math.PI) / 180);
    const iconY = center - iconRadius * Math.cos((iconAngle * Math.PI) / 180);

    const opacity = clockTheme.opacity[interval.status];

    return (
      <g key={interval.startTime}>
        <path d={path} fill={interval.color} opacity={opacity} />
        <circle
          cx={iconX}
          cy={iconY}
          r={radius * 0.07}
          fill={interval.color}
          stroke={interval.color}
          strokeWidth="1"
          opacity="1"
        />
        <foreignObject x={iconX - 4} y={iconY - 4} width="12" height="12">
          {React.cloneElement(interval.icon, {
            className: `${interval.icon.props.className} absolute`,
            style: { color: 'white', width: '60%', height: '60%', opacity: 1 },
          })}
        </foreignObject>
      </g>
    );
  };

  const totalSize = (radius + padding) * 2;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${totalSize} ${totalSize}`}>
      <g transform={`translate(${padding}, ${padding})`}>
        <circle
          cx={center}
          cy={center}
          r={radius * 1.24}
          fill={clockTheme.colors.background}
          stroke={clockTheme.colors.outerCircleTransparent}
          strokeWidth={radius * 0.06}
        />
        <circle
          cx={center}
          cy={center}
          r={radius * 1.22}
          fill="none"
          stroke={clockTheme.colors.outerCircle}
          strokeWidth={radius * 0.03}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={clockTheme.colors.border}
          strokeWidth="2"
        />

        {intervals.map(createIntervalSector)}

        {[...Array(60)].map((_, i) => createMinuteNumber(i))}
        {[...Array(60)].map((_, i) => createMarker(i))}

        {createHand(
          hourAngle,
          hourHandLength,
          clockTheme.colors.hourHand,
          'hour',
        )}
        {createHand(
          minuteAngle,
          minuteHandLength,
          clockTheme.colors.minuteHand,
          'minute',
        )}
        {createHand(
          secondAngle,
          secondHandLength,
          clockTheme.colors.secondHand,
          'second',
        )}

        <circle cx={center} cy={center} r="4" fill={clockTheme.colors.border} />
      </g>
    </svg>
  );
};

export default ClockUI;

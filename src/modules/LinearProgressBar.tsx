import React from 'react';

interface LinearProgressBarProps {
  percentage: number;
  isFullscreen: boolean;
  shouldShow: boolean;
}

const LinearProgressBar: React.FC<LinearProgressBarProps> = ({ percentage, isFullscreen, shouldShow }) => {
  if (!shouldShow) return null;

  const barStyle: React.CSSProperties = {
    position: isFullscreen ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 9999,
  };

  const fillStyle: React.CSSProperties = {
    width: `${percentage}%`,
    height: '100%',
    backgroundColor: '#3f51b5',
    transition: 'width 0.5s ease-in-out',
  };

  return (
    <div style={barStyle}>
      <div style={fillStyle}></div>
    </div>
  );
};

export default LinearProgressBar;
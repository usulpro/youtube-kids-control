import React from 'react';
import { useOverlay } from './useOverlay';

type Props = {
  renderWidget: () => React.ReactElement;
  isPlaying: boolean;
};

const WidgetPanel = ({ renderWidget, isPlaying }: Props) => {
  const { handleMouseEnter, handleMouseLeave, showControls } = useOverlay({
    isPlaying,
  });

  return (
    <div
      className={`absolute top-0 left-0 w-full h-[70%] bg-gray-700 bg-opacity-30 flex justify-center items-center ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {renderWidget()}
    </div>
  );
};

export default WidgetPanel;

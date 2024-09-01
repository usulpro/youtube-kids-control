'use client';

import React, { useEffect, useRef, useState } from 'react';

const YouTubePlayer = () => {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const playerRef = useRef(null);

  useEffect(() => {
    // Load the IFrame Player API code asynchronously.
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('player', {
        height: '360',
        width: '640',
        videoId: 'M7lc1UVf-VE',
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const onPlayerReady = (event) => {
    setIsReady(true);
  };

  const onPlayerStateChange = (event) => {
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
  };

  const playPause = () => {
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const updateTime = () => {
    if (playerRef.current && playerRef.current.getCurrentTime) {
      setCurrentTime(Math.floor(playerRef.current.getCurrentTime()));
    }
  };

  useEffect(() => {
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg">
      <div className="relative">
        <div id="player"></div>
        {showOverlay && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Time's up!</h2>
              <p className="mb-4">You've watched for {currentTime} seconds.</p>
              <button
                onClick={() => setShowOverlay(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Continue Watching
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center space-x-4">
        <button
          onClick={playPause}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          disabled={!isReady}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <span className="text-lg font-semibold">
          Time: {currentTime} seconds
        </span>
        <button
          onClick={() => setShowOverlay(true)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Show Overlay
        </button>
      </div>
    </div>
  );
};

export default YouTubePlayer;

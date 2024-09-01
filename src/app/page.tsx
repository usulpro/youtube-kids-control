'use client';

import LinearProgressBar from '@/components/LinearProgressBar';
import VideoPlayerWithTimeLimit from '@/components/VideoPlayerWithTimeLimit';
import { VIDEO_CONFIG } from '@/config';

export default function Home() {
  return (
    <main>
      <h1>YouTube для детей с ограничением времени</h1>
      <VideoPlayerWithTimeLimit
        videoId="dQw4w9WgXcQ"
        timeLimit={VIDEO_CONFIG.DEFAULT_VIDEO_LENGTH}
        renderProgressBar={({ percentage, isFullscreen, shouldShow }) => (
          <LinearProgressBar
            percentage={percentage}
            isFullscreen={isFullscreen}
            shouldShow={shouldShow}
          />
        )}
      />
    </main>
  );
}

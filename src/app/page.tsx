'use client';

import ControllableYoutubePlayer from '@/components/ControllableYoutubePlayer/ControllableYoutubePlayer';
import { VIDEO_CONFIG } from '@/config';

export default function Home() {
  return (
    <main>
      <h1>Youtube player with Parent control</h1>
      <ControllableYoutubePlayer
        videoId="wVH6vZiWrl8"
        timeLimit={VIDEO_CONFIG.DEFAULT_VIDEO_LENGTH}
      />
    </main>
  );
}

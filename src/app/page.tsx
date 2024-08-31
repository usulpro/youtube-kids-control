import VideoPlayerWithTimeLimit from '@/components/VideoPlayerWithTimeLimit';

export default function Home() {
  return (
    <main>
      <h1>YouTube для детей с ограничением времени</h1>
      <VideoPlayerWithTimeLimit videoId="dQw4w9WgXcQ" timeLimit={20} />
    </main>
  );
}

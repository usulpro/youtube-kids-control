'use client'

import React, { useState, useEffect, useRef } from 'react'
import YouTube from 'react-youtube'

interface VideoPlayerWithTimeLimitProps {
  videoId: string
  timeLimit: number // in seconds
  exitFullscreenBeforeEnd?: number // seconds before end to exit fullscreen
}

const VideoPlayerWithTimeLimit: React.FC<VideoPlayerWithTimeLimitProps> = ({
  videoId,
  timeLimit,
  exitFullscreenBeforeEnd = 0
}) => {
  const [player, setPlayer] = useState<any>(null)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const onReady = (event: { target: any }) => {
    setPlayer(event.target)
  }

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err))
    } else if (player?.getIframe()) {
      const iframe = player.getIframe()
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen()
      }
    }
  }

  const startTimer = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= exitFullscreenBeforeEnd) {
          exitFullscreen()
        }
        if (prevTime <= 0) {
          clearInterval(intervalRef.current as NodeJS.Timeout)
          player?.pauseVideo()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)
  }

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const onStateChange = (event: { data: number }) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      setIsPlaying(true)
      startTimer()
    } else {
      setIsPlaying(false)
      stopTimer()
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div>
      <YouTube
        videoId={videoId}
        opts={{
          height: '390',
          width: '640',
          playerVars: {
            autoplay: 0,
          },
        }}
        onReady={onReady}
        onStateChange={onStateChange}
      />
      <p>Time remaining: {timeRemaining} seconds</p>
      {timeRemaining <= 0 && <p>Viewing time has expired!</p>}
    </div>
  )
}

export default VideoPlayerWithTimeLimit
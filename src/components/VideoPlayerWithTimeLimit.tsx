'use client'

import React, { useState, useEffect, useRef } from 'react'
import YouTube from 'react-youtube'

interface VideoPlayerWithTimeLimitProps {
  videoId: string
  timeLimit: number // в секундах
}

const VideoPlayerWithTimeLimit: React.FC<VideoPlayerWithTimeLimitProps> = ({ videoId, timeLimit }) => {
  const [player, setPlayer] = useState<any>(null)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const onReady = (event: { target: any }) => {
    setPlayer(event.target)
  }

  const startTimer = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
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
      <p>Оставшееся время: {timeRemaining} секунд</p>
      {timeRemaining <= 0 && <p>Время просмотра истекло!</p>}
    </div>
  )
}

export default VideoPlayerWithTimeLimit
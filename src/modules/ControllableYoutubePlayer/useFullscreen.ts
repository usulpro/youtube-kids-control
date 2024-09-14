import { useState, useCallback, useEffect, useRef } from 'react';

export const useFullscreen = () => {
  const elementRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Включение полноэкранного режима
  const enterFullscreen = useCallback(() => {
    const element = elementRef.current;
    if (element) {
      try {
        element.requestFullscreen();
      } catch (err) {
        console.error('Error attempting to enable fullscreen mode:', err);
      }
    }
  }, []);

  // Выход из полноэкранного режима
  const exitFullscreen = useCallback(() => {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error attempting to exit fullscreen mode:', err);
    }
  }, []);

  // Переключение полноэкранного режима
  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Обработчик события изменения состояния полноэкранного режима
  const handleFullscreenChange = useCallback(() => {
    const fullscreenElement = document.fullscreenElement;
    setIsFullscreen(!!fullscreenElement);
  }, []);

  // Подписка на событие fullscreenchange
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  return {
    elementRef,
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
};

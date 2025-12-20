"use client";

import * as React from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  startPosition?: number;
  onProgressUpdate: (currentTime: number, duration: number) => void;
  onVideoEnd: () => void;
  className?: string;
}

export function VideoPlayer({
  videoUrl,
  startPosition = 0,
  onProgressUpdate,
  onVideoEnd,
  className = "",
}: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastReportedTimeRef = React.useRef<number>(0);
  const hideControlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Store callbacks in refs to prevent video reload when they change
  const onProgressUpdateRef = React.useRef(onProgressUpdate);
  const onVideoEndRef = React.useRef(onVideoEnd);

  // Update refs when callbacks change (but don't trigger video reload)
  React.useEffect(() => {
    onProgressUpdateRef.current = onProgressUpdate;
    onVideoEndRef.current = onVideoEnd;
  }, [onProgressUpdate, onVideoEnd]);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isBuffering, setIsBuffering] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [showSettings, setShowSettings] = React.useState(false);

  // Format time (seconds to mm:ss)
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Initialize video
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (startPosition > 0) {
        video.currentTime = startPosition;
      }
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setIsBuffering(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setIsBuffering(false);
    };

    const handleCanPlayThrough = () => {
      setIsLoading(false);
      setIsBuffering(false);
    };

    const handleWaiting = () => {
      // Show buffering indicator
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      // Video is playing, hide all loading indicators
      setIsLoading(false);
      setIsBuffering(false);
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      // Video play was requested, but might still be buffering
      setIsPlaying(true);
    };

    const handleSeeking = () => {
      setIsBuffering(true);
    };

    const handleSeeked = () => {
      setIsBuffering(false);
    };

    const handleError = () => {
      setError("Failed to load video. Please try again.");
      setIsLoading(false);
      setIsBuffering(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      // Report progress every 5 seconds using ref (stable reference)
      if (Math.abs(video.currentTime - lastReportedTimeRef.current) >= 5) {
        lastReportedTimeRef.current = video.currentTime;
        onProgressUpdateRef.current(video.currentTime, video.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onProgressUpdateRef.current(video.duration, video.duration);
      onVideoEndRef.current();
    };

    // Add all event listeners
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("canplaythrough", handleCanPlayThrough);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("play", handlePlay);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("error", handleError);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // Only set source if it's changed or first load
    const currentSrc = video.src;
    const isSameUrl = currentSrc === videoUrl || currentSrc.includes(videoUrl);

    if (!isSameUrl) {
      // eslint-disable-next-line no-console
      console.log("📹 VIDEO SOURCE CHANGED! Reloading...", {
        old: currentSrc.substring(0, 80),
        new: videoUrl.substring(0, 80),
      });
      video.src = videoUrl;
      video.load();
    } else {
      // eslint-disable-next-line no-console
      console.log("✅ Video source unchanged, keeping current playback");
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", handleError);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [videoUrl, startPosition]); // REMOVED onProgressUpdate and onVideoEnd

  // Periodic progress update
  React.useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      if (videoRef.current && isPlaying) {
        onProgressUpdateRef.current(
          videoRef.current.currentTime,
          videoRef.current.duration
        );
      }
    }, 30000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]); // REMOVED onProgressUpdate dependency

  // Periodic state sync - CRITICAL: prevent stuck screen
  React.useEffect(() => {
    const syncInterval = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;

      // Check if video element state matches React state
      const videoIsActuallyPlaying =
        !video.paused && !video.ended && video.readyState > 2;

      if (videoIsActuallyPlaying !== isPlaying) {
        // eslint-disable-next-line no-console
        console.log("🔄 State mismatch detected! Syncing...", {
          videoPlaying: videoIsActuallyPlaying,
          reactState: isPlaying,
          paused: video.paused,
          ended: video.ended,
          readyState: video.readyState,
        });
        setIsPlaying(videoIsActuallyPlaying);
      }

      // Also sync buffering state
      if (video.readyState < 3 && !isBuffering && !isLoading) {
        setIsBuffering(true);
      } else if (video.readyState >= 3 && isBuffering) {
        setIsBuffering(false);
      }
    }, 500); // Check twice per second

    return () => clearInterval(syncInterval);
  }, [isPlaying, isBuffering, isLoading]);

  // Auto-hide controls
  const resetControlsTimeout = React.useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Play/Pause toggle
  const togglePlayPause = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Use video element's paused state as source of truth
    if (video.paused) {
      video.play().catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Play failed:", err);
        setIsPlaying(false);
      });
    } else {
      video.pause();
    }
  }, []);

  // Seek - make progress bar clickable
  const handleSeek = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      if (!video || !duration) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;

      // eslint-disable-next-line no-console
      console.log("⏩ Seeking to:", newTime.toFixed(2), "seconds");

      video.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration]
  );

  // Skip forward/backward
  const skip = React.useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(duration, videoRef.current.currentTime + seconds)
      );
    }
  }, [duration]);

  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = React.useCallback(() => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  // Fullscreen
  const toggleFullscreen = React.useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Playback speed
  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, duration, skip, toggleFullscreen, toggleMute, togglePlayPause]);

  if (error) {
    return (
      <div
        className={`bg-default-900 flex items-center justify-center ${className}`}
      >
        <div className="text-center p-8">
          <p className="text-white text-lg mb-2">Unable to load video</p>
          <p className="text-default-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black group ${className}`}
      onMouseMove={resetControlsTimeout}
      onMouseEnter={() => {
        setShowControls(true);
      }}
      onMouseLeave={() => {
        if (isPlaying) setShowControls(false);
      }}
      onClick={togglePlayPause}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          togglePlayPause();
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
      role="button"
      tabIndex={0}
      aria-label="Video player"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        disablePictureInPicture
        controlsList="nodownload noremoteplayback"
        style={{ maxHeight: "100%", maxWidth: "100%" }}
      >
        Your browser does not support the video tag.
      </video>

      {/* Loading/Buffering Spinner */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent" />
            <p className="text-white text-sm font-medium">
              {isLoading ? "Loading video..." : "Buffering..."}
            </p>
          </div>
        </div>
      )}

      {/* Center Play Button (when paused and not loading/buffering) */}
      {!isPlaying && !isLoading && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="pointer-events-auto group"
            aria-label="Play video"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-full p-5 group-hover:scale-110 transition-transform shadow-2xl ring-4 ring-white/20">
              <Play className="w-14 h-14 text-primary-600 fill-primary-600" />
            </div>
          </button>
        </div>
      )}

      {/* Custom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="toolbar"
        aria-label="Video controls"
      >
        {/* Progress Bar - Clickable and Draggable */}
        <div className="px-4 pb-2">
          <div
            className="relative h-1 bg-white/30 rounded-full cursor-pointer group/progress hover:h-2 transition-all"
            onClick={handleSeek}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                skip(-10);
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                skip(10);
              }
            }}
            role="slider"
            tabIndex={0}
            aria-label="Video progress"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            onMouseDown={(e) => {
              e.preventDefault();
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = moveEvent.clientX - rect.left;
                const percentage = Math.max(
                  0,
                  Math.min(1, clickX / rect.width)
                );
                const newTime = percentage * duration;
                if (videoRef.current && duration) {
                  videoRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                }
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-primary-600 rounded-full pointer-events-none"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white shadow-lg rounded-full opacity-0 group-hover/progress:opacity-100 transition-all" />
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between px-4 pb-4">
          {/* Left Controls */}
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              className="text-white hover:text-primary-400 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 fill-white" />
              )}
            </button>

            {/* Skip Back */}
            <button
              onClick={() => skip(-10)}
              className="text-white hover:text-primary-400 transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => skip(10)}
              className="text-white hover:text-primary-400 transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="text-white hover:text-primary-400 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all accent-primary-600"
              />
            </div>

            {/* Time */}
            <span className="text-white text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Settings (Playback Speed) */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-primary-400 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-sm rounded-lg py-2 min-w-[120px]">
                  <div className="px-3 py-1 text-white text-xs font-semibold opacity-70">
                    Speed
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        playbackRate === rate
                          ? "text-primary-400 bg-white/10"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-primary-400 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

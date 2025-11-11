"use client";

import * as React from "react";

// Dynamically import Shaka Player to avoid SSR issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let shaka: any = null;

if (typeof window !== "undefined") {
  import("shaka-player/dist/shaka-player.ui").then((module) => {
    shaka = module.default;
  });
  // @ts-expect-error - CSS import
  import("shaka-player/dist/controls.css");
}

interface VideoPlayerProps {
  videoUrl: string;
  startPosition?: number;
  onProgressUpdate: (currentTime: number, duration: number) => void;
  onVideoEnd: () => void;
  className?: string;
}

// Check if URL is a direct video file (MP4, WebM, etc.)
function isDirectVideoUrl(url: string): boolean {
  const directVideoFormats = [".mp4", ".webm", ".ogg", ".mov"];
  const urlLower = url.toLowerCase();
  return directVideoFormats.some((format) => urlLower.includes(format));
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
  const playerRef = React.useRef<unknown>(null);
  const uiRef = React.useRef<unknown>(null);
  const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastReportedTimeRef = React.useRef<number>(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [useNativePlayer, setUseNativePlayer] = React.useState(false);

  // Initialize Shaka Player
  React.useEffect(() => {
    if (!videoRef.current || !containerRef.current) return;

    // Check if it's a direct video URL (MP4, WebM, etc.)
    if (isDirectVideoUrl(videoUrl)) {
      // Use native HTML5 video player
      setUseNativePlayer(true);
      const videoElement = videoRef.current;

      if (videoElement) {
        videoElement.src = videoUrl;
        if (startPosition > 0) {
          videoElement.currentTime = startPosition;
        }
        setIsLoading(false);
      }
      return;
    }

    // Wait for Shaka to load (client-side only)
    if (!shaka) {
      const checkShaka = setInterval(() => {
        if (shaka) {
          clearInterval(checkShaka);
          // Retry initialization once shaka is loaded
          if (videoRef.current && containerRef.current) {
            // Re-trigger effect by updating a flag
            setIsLoading(true);
          }
        }
      }, 100);

      // Cleanup
      return () => clearInterval(checkShaka);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let player: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ui: any = null;

    const initPlayer = async () => {
      try {
        // eslint-disable-next-line no-console
        console.log("Initializing Shaka Player with URL:", videoUrl);

        // Check if browser is supported
        if (!shaka || !shaka.Player.isBrowserSupported()) {
          setError("Browser not supported for video playback");
          setIsLoading(false);
          return;
        }

        // Create player instance
        const videoElement = videoRef.current;
        const containerElement = containerRef.current;

        if (!videoElement || !containerElement) return;

        player = new shaka.Player(videoElement);
        playerRef.current = player;

        // Create UI
        ui = new shaka.ui.Overlay(player, containerElement, videoElement);
        uiRef.current = ui;

        // Configure UI
        const config = {
          addSeekBar: true,
          addBigPlayButton: true,
          controlPanelElements: [
            "play_pause",
            "time_and_duration",
            "spacer",
            "mute",
            "volume",
            "fullscreen",
            "overflow_menu",
          ],
          overflowMenuButtons: ["playback_rate", "quality", "captions"],
        };

        ui.configure(config);

        // Error handling
        player.addEventListener("error", (event: unknown) => {
          const shakaError = (event as { detail: unknown }).detail;
          // eslint-disable-next-line no-console
          console.error("Shaka Player Error:", shakaError);
          setError("Failed to load video. Please try again.");
          setIsLoading(false);
        });

        // Load the video
        try {
          // eslint-disable-next-line no-console
          console.log("Loading video with Shaka Player...");
          await player.load(videoUrl);

          // eslint-disable-next-line no-console
          console.log("Video loaded successfully");

          // Set start position after video is loaded
          if (startPosition > 0 && videoRef.current) {
            videoRef.current.currentTime = startPosition;
          }

          setIsLoading(false);
        } catch (loadError: unknown) {
          // eslint-disable-next-line no-console
          console.error("Error loading video:", loadError);

          // Check if it's a Shaka error
          if (
            loadError &&
            typeof loadError === "object" &&
            "code" in loadError
          ) {
            const shakaError = loadError as {
              code: number;
              message?: string;
              severity?: number;
              category?: number;
            };
            // eslint-disable-next-line no-console
            console.error("Shaka Error Details:", {
              code: shakaError.code,
              message: shakaError.message,
              severity: shakaError.severity,
              category: shakaError.category,
            });

            // Try fallback to native player for certain error codes
            if (shakaError.code === 1001 || shakaError.code === 1002) {
              // eslint-disable-next-line no-console
              console.log("Attempting fallback to native HTML5 player...");
              setUseNativePlayer(true);
              if (videoRef.current) {
                videoRef.current.src = videoUrl;
                if (startPosition > 0) {
                  videoRef.current.currentTime = startPosition;
                }
                setIsLoading(false);
              }
              return;
            }
          }

          setError(
            "Failed to load video. The video format may not be supported or the URL is invalid."
          );
          setIsLoading(false);
        }
      } catch (err: unknown) {
        // eslint-disable-next-line no-console
        console.error("Error initializing player:", err);
        setError("Failed to initialize video player");
        setIsLoading(false);
      }
    };

    initPlayer();

    // Cleanup
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (ui) {
        ui.destroy();
      }
      if (player) {
        player.destroy();
      }
    };
  }, [videoUrl, startPosition, useNativePlayer]);

  // Progress tracking
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const { currentTime, duration } = video;

      // Report progress every 5 seconds of playback
      if (Math.abs(currentTime - lastReportedTimeRef.current) >= 5) {
        lastReportedTimeRef.current = currentTime;
        onProgressUpdate(currentTime, duration);
      }
    };

    const handleEnded = () => {
      onVideoEnd();
    };

    const handlePause = () => {
      // Report progress when user pauses
      const { currentTime, duration } = video;
      if (currentTime > 0) {
        onProgressUpdate(currentTime, duration);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("pause", handlePause);

    // Periodic progress update (every 30 seconds)
    progressIntervalRef.current = setInterval(() => {
      if (!video.paused && video.currentTime > 0) {
        onProgressUpdate(video.currentTime, video.duration);
      }
    }, 30000);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("pause", handlePause);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [onProgressUpdate, onVideoEnd]);

  // Report final position before unmount
  React.useEffect(() => {
    const videoElement = videoRef.current;
    return () => {
      if (videoElement && videoElement.currentTime > 0) {
        onProgressUpdate(videoElement.currentTime, videoElement.duration);
      }
    };
  }, [onProgressUpdate]);

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
    <div className={`relative bg-default-900 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-default-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4" />
            <p className="text-white text-sm">Loading video...</p>
          </div>
        </div>
      )}
      {useNativePlayer ? (
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          playsInline
          controlsList="nodownload"
          style={{ maxHeight: "100%", backgroundColor: "#000" }}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div ref={containerRef} className="w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full"
            playsInline
            style={{ maxHeight: "100%", backgroundColor: "#000" }}
          />
        </div>
      )}
    </div>
  );
}

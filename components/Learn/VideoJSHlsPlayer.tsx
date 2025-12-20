"use client";

/* eslint-disable no-console */
import * as React from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";
import "videojs-hls-quality-selector";

// Extend videojs player types for quality plugins
interface VideoJsPlayerExtended extends Player {
  qualityLevels?: () => unknown;
  hlsQualitySelector?: (options?: Record<string, unknown>) => void;
}

interface VideoJSHlsPlayerProps {
  videoUrl: string; // Supports: .mp4, .webm, .m3u8 (HLS), .ogg, .mov - auto-detected
  startPosition?: number;
  onProgressUpdate: (currentTime: number, duration: number) => void;
  onVideoEnd: () => void;
  className?: string;
  authToken?: string; // For HLS segment authentication
}

/**
 * VideoJSHlsPlayer - Universal Video Player with Video.js
 *
 * Following Video.js React guide: https://videojs.org/guides/react/
 * Supports: MP4, WebM, MOV, OGG, HLS (.m3u8) with auto-detection
 * Features: HLS ABR, quality selection, optimizations, security
 */
export function VideoJSHlsPlayer({
  videoUrl,
  startPosition = 0,
  onProgressUpdate,
  onVideoEnd,
  className = "",
  authToken,
}: VideoJSHlsPlayerProps) {
  const videoRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<VideoJsPlayerExtended | null>(null);
  const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastReportedTimeRef = React.useRef<number>(0);
  
  // Store playback state for tab visibility changes
  const wasPlayingBeforeHiddenRef = React.useRef<boolean>(false);

  // Store callbacks and startPosition in refs to prevent player reload when they change
  const onProgressUpdateRef = React.useRef(onProgressUpdate);
  const onVideoEndRef = React.useRef(onVideoEnd);
  const startPositionRef = React.useRef(startPosition);

  // Update refs when callbacks/position change (but don't trigger player reload)
  React.useEffect(() => {
    onProgressUpdateRef.current = onProgressUpdate;
    onVideoEndRef.current = onVideoEnd;
    startPositionRef.current = startPosition;
    console.log("📌 Updated startPosition ref to:", startPosition);
  }, [onProgressUpdate, onVideoEnd, startPosition]);

  // Auto-detect video type from URL
  const getVideoType = (url: string): string => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes(".m3u8")) {
      return "application/x-mpegURL"; // HLS
    } else if (urlLower.includes(".mp4")) {
      return "video/mp4";
    } else if (urlLower.includes(".webm")) {
      return "video/webm";
    } else if (urlLower.includes(".ogg")) {
      return "video/ogg";
    } else if (urlLower.includes(".mov")) {
      return "video/quicktime";
    } else if (urlLower.includes(".avi")) {
      return "video/x-msvideo";
    } else if (urlLower.includes(".mkv")) {
      return "video/x-matroska";
    }
    // Default to mp4 if can't determine
    return "video/mp4";
  };

  const videoType = getVideoType(videoUrl);
  const isHLS = videoType === "application/x-mpegURL";

  // Initialize Video.js player (following official guide)
  React.useEffect(() => {
    console.log("🔄 ========== USEEFFECT TRIGGERED ==========");
    console.log("   videoUrl:", `${videoUrl.substring(0, 80)}...`);
    console.log("   startPosition:", startPosition);
    console.log("   authToken:", authToken ? "Present" : "None");
    console.log("   Player exists:", !!playerRef.current);

    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      console.log("🎬 ========== VIDEO PLAYER INITIALIZATION ==========");
      console.log("📹 Video URL:", videoUrl);
      console.log("🎯 Detected Format:", videoType);
      console.log("🌊 Is HLS:", isHLS);
      console.log("⏱️ Start Position:", startPosition, "seconds");
      console.log(
        "🔐 Auth Token:",
        authToken ? "✅ Provided" : "❌ Not provided"
      );

      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current?.appendChild(videoElement);

      const player = (playerRef.current = videojs(
        videoElement,
        {
          controls: true, // Use Video.js default controls
          autoplay: false,
          preload: "auto",
          fluid: false,
          responsive: false,
          fill: true,
          playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
          controlBar: {
            pictureInPictureToggle: true,
            volumePanel: {
              inline: false,
            },
          },
          // Only configure HLS settings if it's an HLS video
          ...(isHLS && {
            html5: {
              vhs: {
                // ⚡ OPTIMIZATION: HLS Performance
                enableLowInitialPlaylist: false,
                smoothQualityChange: true,
                useBandwidthFromLocalStorage: true,
                useNetworkInformationApi: true,
                bandwidth: 4194304, // 4 Mbps initial estimate
                limitRenditionByPlayerDimensions: true,

                // 🔐 SECURITY: Auth headers for segments
                ...(authToken && {
                  xhr: {
                    beforeRequest: (options: Record<string, unknown>) => {
                      const headers =
                        (options.headers as Record<string, unknown>) || {};
                      headers["Authorization"] = `Bearer ${authToken}`;
                      options.headers = headers;
                      console.log(
                        "🔐 Adding auth header to segment request:",
                        options.uri
                      );
                      return options;
                    },
                  },
                }),
              },
              nativeAudioTracks: false,
              nativeVideoTracks: false,
            },
          }),
          sources: [
            {
              src: videoUrl,
              type: videoType,
            },
          ],
        },
        () => {
          console.log("✅ Player Ready!");
          console.log("📊 Player Info:", {
            duration: player.duration(),
            width: player.videoWidth(),
            height: player.videoHeight(),
            supportsFullScreen: player.supportsFullScreen(),
          });

          console.log("⏱️ ========== START POSITION SETUP ==========");
          console.log("📍 Start Position from backend:", startPosition);
          console.log("⏳ Waiting for metadata to load before seeking...");

          // Initialize quality selector only for HLS
          if (isHLS) {
            const extPlayer = player as VideoJsPlayerExtended;

            console.log("🎚️ ========== HLS ADAPTIVE BITRATE SETUP ==========");

            if (extPlayer.hlsQualitySelector) {
              extPlayer.hlsQualitySelector({ displayCurrentQuality: true });
              console.log("✅ HLS Quality Selector initialized");
            }

            // Monitor quality levels
            const qualityLevels = extPlayer.qualityLevels?.();
            if (qualityLevels) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const qLevels = qualityLevels as any;
              console.log("📊 Quality Levels:", qLevels.length);

              qLevels.on("addqualitylevel", () => {
                console.log("➕ New quality level added");
                for (let i = 0; i < qLevels.length; i++) {
                  const level = qLevels[i];
                  console.log(`   Quality ${i}:`, {
                    resolution: `${level.width}x${level.height}`,
                    bitrate: `${(level.bitrate / 1000000).toFixed(2)} Mbps`,
                    enabled: level.enabled,
                  });
                }
              });

              qLevels.on("change", () => {
                const currentLevel = qLevels[qLevels.selectedIndex];
                if (currentLevel) {
                  console.log("🔄 Quality Changed:", {
                    resolution: `${currentLevel.width}x${currentLevel.height}`,
                    bitrate: `${(currentLevel.bitrate / 1000000).toFixed(2)} Mbps`,
                  });
                }
              });
            }

            // Monitor bandwidth and buffer
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const tech = (extPlayer as any).tech?.(true);
              if (tech && tech.vhs) {
                setInterval(() => {
                  // eslint-disable-next-line prefer-destructuring
                  const vhs = tech.vhs;
                  if (vhs && vhs.bandwidth) {
                    console.log("📊 HLS Stats:", {
                      bandwidth: `${(vhs.bandwidth / 1000000).toFixed(2)} Mbps`,
                      currentTime: player.currentTime()?.toFixed(2),
                      buffered: `${player.bufferedPercent()?.toFixed(2)}%`,
                    });
                  }
                }, 10000); // Log every 10 seconds
              }
            } catch {
              // Ignore tech access errors
            }
          }
        }
      ));

      // 🔐 SECURITY: Disable right-click context menu
      const videoEl = player.el();
      if (videoEl) {
        videoEl.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          console.log("🚫 SECURITY: Right-click blocked");
        });
        console.log("🔐 SECURITY: Right-click disabled");
      }

      // 🔐 SECURITY: Disable download button
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-destructuring
        const controlBar = (player as any).controlBar;
        controlBar?.getChild?.("downloadButton")?.hide?.();
        console.log("🔐 SECURITY: Download button disabled");
      } catch {
        // Download button not available
      }

      // Event listeners for progress tracking
      player.on("loadstart", () => {
        console.log("📥 Loading video...");
      });

      player.on("loadedmetadata", () => {
        const dur = player.duration();
        console.log("📊 Metadata loaded:", {
          duration: dur,
          videoWidth: player.videoWidth(),
          videoHeight: player.videoHeight(),
        });

        // ⚠️ CRITICAL: Set start position AFTER metadata is loaded
        const currentStartPos = startPositionRef.current;
        console.log("🎯 SETTING START POSITION NOW");
        console.log("   📍 Requested position (from ref):", currentStartPos);
        console.log("   📊 Video duration:", dur);

        if (currentStartPos > 0 && dur) {
          // Make sure position is valid
          if (currentStartPos < dur) {
            player.currentTime(currentStartPos);
            console.log("   ✅ Position set to:", currentStartPos);

            // Verify it actually worked
            setTimeout(() => {
              const actualPos = player.currentTime() || 0;
              console.log(
                "   🔍 Verify after 100ms - Current time:",
                actualPos
              );
              if (Math.abs(actualPos - currentStartPos) > 1) {
                console.error(
                  "   ❌ POSITION MISMATCH! Expected:",
                  currentStartPos,
                  "Got:",
                  actualPos
                );
              }
            }, 100);
          } else {
            console.warn(
              "   ⚠️ Start position",
              currentStartPos,
              "exceeds duration",
              dur
            );
            console.warn("   ⚠️ Starting from beginning instead");
          }
        } else {
          console.log("   ℹ️ No start position - starting from 0");
        }
        console.log("⏱️ ========== START POSITION COMPLETE ==========");
      });

      player.on("canplay", () => {
        console.log("▶️ Video can play");
      });

      player.on("play", () => {
        console.log("▶️ Video started playing");
        console.log("   📍 Starting at position:", player.currentTime());
      });

      player.on("pause", () => {
        const time = player.currentTime() || 0;
        const dur = player.duration() || 0;
        console.log("⏸️ Video paused");
        console.log("📍 Progress Update on pause:", {
          currentTime: `${time.toFixed(2)}s`,
          duration: `${dur.toFixed(2)}s`,
          percentage: `${((time / dur) * 100).toFixed(1)}%`,
        });
        // Update progress API on pause
        onProgressUpdateRef.current(time, dur);
      });

      player.on("ratechange", () => {
        console.log("⚡ Playback speed changed:", `${player.playbackRate()}x`);
      });

      player.on("volumechange", () => {
        console.log("🔊 Volume changed:", {
          volume: `${((player.volume() || 0) * 100).toFixed(0)}%`,
          muted: player.muted(),
        });
      });

      player.on("fullscreenchange", () => {
        console.log("🖥️ Fullscreen:", player.isFullscreen() ? "ON" : "OFF");
      });

      player.on("enterpictureinpicture", () => {
        console.log("📺 Picture-in-Picture: ENABLED");
      });

      player.on("leavepictureinpicture", () => {
        console.log("📺 Picture-in-Picture: DISABLED");
      });

      player.on("waiting", () => {
        console.log("⏳ Buffering...");
      });

      player.on("playing", () => {
        console.log("▶️ Playback resumed (video is playing)");
      });

      player.on("timeupdate", () => {
        const time = player.currentTime() || 0;
        const dur = player.duration() || 0;

        // Report progress every 5 seconds
        if (Math.abs(time - lastReportedTimeRef.current) >= 5) {
          lastReportedTimeRef.current = time;
          console.log("📍 Progress Update:", {
            currentTime: `${time.toFixed(2)}s`,
            duration: `${dur.toFixed(2)}s`,
            percentage: `${((time / dur) * 100).toFixed(1)}%`,
          });
          onProgressUpdateRef.current(time, dur);
        }
      });

      player.on("ended", () => {
        const finalDuration = player.duration() || 0;
        console.log("🏁 Video ended!");
        console.log("✅ Calling onVideoEnd callback");
        onProgressUpdateRef.current(finalDuration, finalDuration);
        onVideoEndRef.current();
      });

      player.on("error", () => {
        const err = player.error();
        console.error("❌ ========== VIDEO ERROR ==========");
        console.error("Error Code:", err?.code);
        console.error("Error Message:", err?.message);
        console.error(
          "Error Type:",
          {
            1: "MEDIA_ERR_ABORTED",
            2: "MEDIA_ERR_NETWORK",
            3: "MEDIA_ERR_DECODE",
            4: "MEDIA_ERR_SRC_NOT_SUPPORTED",
          }[err?.code || 0]
        );
        console.error("===================================");
      });

      // 🎨 FIX: Ensure video fits properly on all screens (especially mobile)
      const videoTag = player.el()?.querySelector("video");
      if (videoTag) {
        (videoTag as HTMLVideoElement).style.objectFit = "contain";
        (videoTag as HTMLVideoElement).style.width = "100%";
        (videoTag as HTMLVideoElement).style.height = "100%";
        console.log("🎨 Applied object-fit: contain to video element");
      }

      console.log("🎬 ========== INITIALIZATION COMPLETE ==========");
    } else {
      // Update existing player (for prop changes)
      console.log("🔄 ========== UPDATING EXISTING PLAYER ==========");
      console.log("⚠️ WARNING: This will reload the video!");
      console.log("📹 New URL:", videoUrl);
      console.log("⏱️ New Start Position:", startPosition);

      const player = playerRef.current;
      const newVideoType = getVideoType(videoUrl);
      console.log("🎯 New Format:", newVideoType);

      player.src({ src: videoUrl, type: newVideoType });

      // ⚠️ IMPORTANT: After changing source, position will reset
      // We need to wait for loadedmetadata event to set position again
      // Position will be taken from startPositionRef.current
      console.log("⏳ Position will be set after metadata loads...");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, authToken, videoType, isHLS]); // Removed startPosition from deps - using ref instead!

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        console.log("🧹 Disposing video player...");
        player.dispose();
        playerRef.current = null;
        console.log("✅ Player disposed");
      }
    };
  }, []);

  // Periodic progress update (every 30 seconds)
  React.useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current && !playerRef.current.paused()) {
        const time = playerRef.current.currentTime() || 0;
        const dur = playerRef.current.duration() || 0;
        console.log("⏱️ 30s Progress Update:", {
          time: `${time.toFixed(2)}s`,
          duration: `${dur.toFixed(2)}s`,
        });
        onProgressUpdateRef.current(time, dur);
      }
    }, 30000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Handle Page Visibility API to preserve playback state across tab changes
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!playerRef.current) return;

      if (document.hidden) {
        // Tab is being hidden - save playback state
        const isPlaying = !playerRef.current.paused();
        wasPlayingBeforeHiddenRef.current = isPlaying;
        
        console.log("👁️ Tab hidden - Video was playing:", isPlaying);
        console.log("📍 Current position:", playerRef.current.currentTime());
        
        // Save progress when tab is hidden
        const time = playerRef.current.currentTime() || 0;
        const dur = playerRef.current.duration() || 0;
        onProgressUpdateRef.current(time, dur);
      } else {
        // Tab is becoming visible - restore playback state
        console.log("👁️ Tab visible - Restoring playback state");
        console.log("▶️ Was playing before hidden:", wasPlayingBeforeHiddenRef.current);
        
        // Resume playback if it was playing before tab was hidden
        const player = playerRef.current;
        if (wasPlayingBeforeHiddenRef.current && player) {
          if (player.paused()) {
            console.log("▶️ Auto-resuming playback");
            const playPromise = player.play();
            if (playPromise) {
              playPromise.catch((err) => {
                console.warn("⚠️ Could not auto-resume playback:", err);
              });
            }
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .video-js {
            width: 100% !important;
            height: 100% !important;
          }
          .video-js video {
            object-fit: contain !important;
            width: 100% !important;
            height: 100% !important;
          }
          .video-js .vjs-tech {
            object-fit: contain !important;
            width: 100% !important;
            height: 100% !important;
          }
        `,
        }}
      />

      <div data-vjs-player style={{ width: "100%", height: "100%" }}>
        <div ref={videoRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

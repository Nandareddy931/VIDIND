import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MoreVertical, Share2, Flag, Download } from "lucide-react";
import TopOverlay from "./TopOverlay";
import CenterControls from "./CenterControls";
import BottomControls from "./BottomControls";
import { supabase } from "@/integrations/supabase/client";

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  videoId?: string;
  userId?: string;
  onBack?: () => void;
}

export type QualityLevel = "auto" | "144p" | "360p" | "720p";

interface SavedProgress {
  videoId: string;
  userId: string;
  watchedTime: number;
  totalDuration: number;
  lastWatchedAt: string;
}

const VideoPlayer = ({
  src,
  poster,
  title = "Untitled Video",
  videoId,
  userId,
  onBack,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();
  const saveProgressInterval = useRef<NodeJS.Timeout>();

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);

  // Control states
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Quality and mode states
  const [quality, setQuality] = useState<QualityLevel>("auto");
  const [lowDataMode, setLowDataMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Gesture and interaction states
  const [lastTap, setLastTap] = useState(0);
  const [doubleClickSide, setDoubleClickSide] = useState<"left" | "right" | null>(null);
  const [resumeTime, setResumeTime] = useState<number | null>(null);
  const [showResume, setShowResume] = useState(false);

  // Mobile swipe states
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);

  // Network quality detection
  const networkQuality = useRef<QualityLevel>("auto");

  // ============ Initialization & Cleanup ============

  useEffect(() => {
    // Load saved progress from Supabase
    if (videoId && userId) {
      loadWatchProgress();
    }

    // Auto-detect network quality
    detectNetworkQuality();

    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
      if (saveProgressInterval.current) clearInterval(saveProgressInterval.current);
    };
  }, [videoId, userId]);

  // ============ Supabase Integration ============

  const loadWatchProgress = async () => {
    try {
      if (!videoId || !userId) return;
      
      // Note: watch_progress table will be available after running the Supabase migration
      // The table is created in: supabase/migrations/20260211_create_watch_progress_table.sql
      // If the table doesn't exist yet, this will fail silently
      
      // Temporarily disabled until migration is applied
      // const { data, error } = await (supabase as any)
      //   .from("watch_progress")
      //   .select("*")
      //   .eq("video_id", videoId)
      //   .eq("user_id", userId)
      //   .single();
      
      // if (error || !data) return;
      
      // const progress = data as SavedProgress;
      // if (progress.watchedTime > 0) {
      //   setResumeTime(progress.watchedTime);
      //   setShowResume(true);
      // }
    } catch (err) {
      console.error("Failed to load watch progress:", err);
    }
  };

  const saveWatchProgress = async () => {
    if (!videoId || !userId || !videoRef.current) return;

    try {
      // Note: watch_progress table will be available after running the Supabase migration
      // The table is created in: supabase/migrations/20260211_create_watch_progress_table.sql
      // If the table doesn't exist yet, this will fail silently
      
      // Temporarily disabled until migration is applied
      // await (supabase as any).from("watch_progress").upsert(
      //   {
      //     video_id: videoId,
      //     user_id: userId,
      //     watched_time: currentTime,
      //     total_duration: duration,
      //     last_watched_at: new Date().toISOString(),
      //   },
      //   { onConflict: "video_id,user_id" }
      // );
    } catch (err) {
      console.error("Failed to save watch progress:", err);
    }
  };

  // ============ Network & Quality Detection ============

  const detectNetworkQuality = useCallback(() => {
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      const effectiveType = connection?.effectiveType;

      switch (effectiveType) {
        case "4g":
          networkQuality.current = "720p";
          break;
        case "3g":
          networkQuality.current = "360p";
          break;
        case "2g":
          networkQuality.current = "144p";
          break;
        default:
          networkQuality.current = "auto";
      }

      if (quality === "auto") {
        setQuality(networkQuality.current);
      }
    }
  }, [quality]);

  // ============ Playback Control ============

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }

    setIsPlaying(!isPlaying);
    showControlsTemporarily();
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(time, duration));
      showControlsTemporarily();
    }
  }, [duration]);

  const skipTime = useCallback((seconds: number) => {
    seek(currentTime + seconds);
  }, [currentTime, seek]);

  const handleResumePlay = useCallback(() => {
    if (resumeTime !== null && videoRef.current) {
      videoRef.current.currentTime = resumeTime;
      setShowResume(false);
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [resumeTime]);

  // ============ Controls Visibility ============

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);

    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  const handleContainerInteraction = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // Don't hide controls if clicking on controls area
      if ((e.target as HTMLElement).closest(".video-controls")) {
        return;
      }
      showControlsTemporarily();
    },
    [showControlsTemporarily]
  );

  // ============ Gestures & Touch ============

  const handleTap = useCallback(
    (e: React.TouchEvent) => {
      const now = Date.now();
      const timeDiff = now - lastTap;

      if (timeDiff < 300) {
        // Double tap detected
        e.stopPropagation();
        const rect = containerRef.current?.getBoundingClientRect();
        const clickX = e.touches[0].clientX;
        const centerX = (rect?.left ?? 0) + (rect?.width ?? 0) / 2;

        if (clickX < centerX) {
          setDoubleClickSide("left");
          skipTime(-10);
        } else {
          setDoubleClickSide("right");
          skipTime(10);
        }

        setTimeout(() => setDoubleClickSide(null), 400);
      }

      setLastTap(now);
    },
    [lastTap, skipTime]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;

    // Swipe detection threshold
    const swipeThreshold = 50;

    // Vertical swipe (up = mini player)
    if (Math.abs(deltaY) > swipeThreshold && Math.abs(deltaX) < 50) {
      if (deltaY < 0) {
        setIsMiniPlayer(true);
      }
    }

    setTouchStart(null);
  };

  // ============ Volume & Mute ============

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  }, [isMuted]);

  // ============ Fullscreen ============

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  // ============ Video Events ============

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    setCurrentTime(videoRef.current.currentTime);

    // Auto-save progress every 5 seconds
    if (saveProgressInterval.current) clearInterval(saveProgressInterval.current);
    saveProgressInterval.current = setInterval(() => {
      saveWatchProgress();
    }, 5000);
  }, []);

  const handleProgress = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      setBuffered((bufferedEnd / video.duration) * 100);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleWaiting = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleEnded = useCallback(async () => {
    setIsPlaying(false);
    // Save final progress
    await saveWatchProgress();
  }, []);

  // ============ Keyboard Shortcuts ============

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      // Only handle when focused or in fullscreen
      if (!isFullscreen && document.activeElement !== document.body) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skipTime(-5);
          break;
        case "ArrowRight":
          e.preventDefault();
          skipTime(5);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "KeyJ":
          e.preventDefault();
          skipTime(-10);
          break;
        case "KeyL":
          e.preventDefault();
          skipTime(10);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, skipTime, handleVolumeChange, toggleFullscreen, toggleMute, isFullscreen, volume]);

  // ============ Render ============

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-[#0F0F0F] overflow-hidden transition-all duration-300 ${
        isMiniPlayer ? "aspect-video max-w-sm ml-auto mb-4 rounded-lg shadow-lg" : "aspect-video rounded-2xl"
      }`}
      onClick={(e) => {
        handleTap(e as any);
        handleContainerInteraction(e);
      }}
      onMouseMove={showControlsTemporarily}
      onTouchStart={(e) => {
        handleTouchStart(e);
        handleTap(e);
      }}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Video player"
    >
      {/* Resume Prompt */}
      <AnimatePresence>
        {showResume && resumeTime !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center max-w-sm mx-4">
              <p className="text-white mb-4">Resume from {formatTime(resumeTime)}?</p>
              <div className="flex gap-3">
                <button
                  onClick={handleResumePlay}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                  aria-label="Resume playback"
                >
                  Resume
                </button>
                <button
                  onClick={() => setShowResume(false)}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg font-semibold transition"
                  aria-label="Play from beginning"
                >
                  Start Over
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onEnded={handleEnded}
        className="w-full h-full object-contain"
        playsInline
        preload={lowDataMode ? "none" : "metadata"}
        aria-label={title}
      />

      {/* Loading Indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Container */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none"
          >
            {/* Top Overlay */}
            <TopOverlay
              title={title}
              onBack={onBack}
              onShowMore={() => setShowMoreMenu(!showMoreMenu)}
              showMoreMenu={showMoreMenu}
            />

            {/* More Menu */}
            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-16 right-4 bg-white/10 backdrop-blur-md rounded-xl overflow-hidden pointer-events-auto z-40"
                >
                  <button
                    className="w-full px-4 py-3 flex items-center gap-2 hover:bg-white/20 transition text-white text-sm"
                    aria-label="Share video"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button
                    className="w-full px-4 py-3 flex items-center gap-2 hover:bg-white/20 transition text-white text-sm"
                    aria-label="Save video offline"
                  >
                    <Download className="w-4 h-4" />
                    Save Offline
                  </button>
                  <button
                    className="w-full px-4 py-3 flex items-center gap-2 hover:bg-white/20 transition text-white text-sm"
                    aria-label="Report video"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Center Controls */}
            <div className="pointer-events-auto flex-1 flex items-center justify-center">
              <CenterControls
                isPlaying={isPlaying}
                onPlayPause={togglePlay}
                onSkipBack={() => skipTime(-10)}
                onSkipForward={() => skipTime(10)}
                doubleClickSide={doubleClickSide}
              />
            </div>

            {/* Bottom Controls */}
            <div className="pointer-events-auto video-controls">
              <BottomControls
                currentTime={currentTime}
                duration={duration}
                buffered={buffered}
                onSeek={seek}
                isMuted={isMuted}
                volume={volume}
                onMuteToggle={toggleMute}
                onVolumeChange={handleVolumeChange}
                quality={quality}
                onQualityChange={setQuality}
                lowDataMode={lowDataMode}
                onLowDataModeToggle={setLowDataMode}
                isFullscreen={isFullscreen}
                onFullscreenToggle={toggleFullscreen}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap Indicator for Double Tap */}
      <AnimatePresence>
        {doubleClickSide && (
          <motion.div
            key={`tap-${doubleClickSide}`}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className={`absolute top-1/2 -translate-y-1/2 ${
              doubleClickSide === "left" ? "left-8" : "right-8"
            } text-white/80 text-sm font-semibold pointer-events-none z-20`}
          >
            {doubleClickSide === "left" ? "⟨⟨ 10s" : "10s ⟩⟩"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Utility function exported for use in components
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export default VideoPlayer;

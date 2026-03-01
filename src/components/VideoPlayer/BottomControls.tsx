import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Wifi,
  WifiOff,
  Monitor,
} from "lucide-react";
import { formatTime, QualityLevel } from "./index";

interface BottomControlsProps {
  currentTime: number;
  duration: number;
  buffered: number;
  onSeek: (time: number) => void;
  isMuted: boolean;
  volume: number;
  onMuteToggle: () => void;
  onVolumeChange: (volume: number) => void;
  quality: QualityLevel;
  onQualityChange: (quality: QualityLevel) => void;
  lowDataMode: boolean;
  onLowDataModeToggle: (enabled: boolean) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
}

const BottomControls = ({
  currentTime,
  duration,
  buffered,
  onSeek,
  isMuted,
  volume,
  onMuteToggle,
  onVolumeChange,
  quality,
  onQualityChange,
  lowDataMode,
  onLowDataModeToggle,
  isFullscreen,
  onFullscreenToggle,
}: BottomControlsProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    onSeek(newTime);
  };

  const handleProgressMouseDown = () => {
    setIsDragging(true);
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;

    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(percent * duration, duration));

    onSeek(newTime);
  };

  const qualityOptions: QualityLevel[] = ["auto", "144p", "360p", "720p"];
  const qualityLabels: Record<QualityLevel, string> = {
    auto: "Auto",
    "144p": "144p",
    "360p": "360p",
    "720p": "720p",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-3 space-y-2 pointer-events-auto"
    >
      {/* Progress Bar */}
      <div
        ref={progressRef}
        onClick={handleProgressClick}
        onMouseDown={handleProgressMouseDown}
        onMouseUp={handleProgressMouseUp}
        onMouseMove={handleProgressMouseMove}
        onMouseLeave={handleProgressMouseUp}
        className="group relative h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-[height] duration-200"
        role="progressbar"
        aria-label="Seek bar"
        aria-valuenow={Math.floor(currentTime)}
        aria-valuemin={0}
        aria-valuemax={Math.floor(duration)}
      >
        {/* Buffered Progress */}
        <div
          className="absolute h-full bg-white/40 rounded-full transition-all duration-100"
          style={{ width: `${buffered}%` }}
        />

        {/* Played Progress */}
        <motion.div
          className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          style={{ width: `${(currentTime / duration) * 100}%` }}
          transition={{ type: "tween", duration: 0.1 }}
        />

        {/* Seek Handle */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${(currentTime / duration) * 100}% - 0.5rem)` }}
          animate={{ scale: isDragging ? 1.2 : 1 }}
        />

        {/* Hover Preview (future enhancement: show thumbnail) */}
        <motion.div
          className="absolute bottom-full mb-2 px-2 py-1 bg-white/90 text-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
          style={{ left: "var(--preview-position, 0)" }}
        >
          hover preview
        </motion.div>
      </div>

      {/* Time Display & Controls Row */}
      <div className="flex items-center justify-between gap-2 text-xs text-white/80">
        {/* Time Display */}
        <div className="flex gap-2 min-w-24 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span className="text-white/50">/</span>
          <span className="text-white/60">{formatTime(duration)}</span>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          {/* Quality Selector */}
          <div className="relative">
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors relative group"
              aria-label={`Quality: ${qualityLabels[quality]}`}
              aria-expanded={showQualityMenu}
              title="Quality settings"
            >
              <Monitor className="w-4 h-4 text-white group-hover:text-blue-400 transition-colors" />
              <span className="text-xs ml-1 inline-block min-w-[2rem]">{qualityLabels[quality]}</span>
            </button>

            <AnimatePresence>
              {showQualityMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full mb-2 bg-white/10 backdrop-blur-md rounded-lg overflow-hidden border border-white/20 z-50"
                >
                  {qualityOptions.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        onQualityChange(q);
                        setShowQualityMenu(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-xs transition-colors ${
                        quality === q
                          ? "bg-blue-600 text-white"
                          : "text-white/80 hover:bg-white/20"
                      }`}
                    >
                      {qualityLabels[q]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Low Data Mode Toggle */}
          <button
            onClick={() => onLowDataModeToggle(!lowDataMode)}
            className={`p-2 rounded-lg transition-colors ${
              lowDataMode
                ? "bg-yellow-600/50 text-yellow-200"
                : "hover:bg-white/20 text-white/80"
            }`}
            aria-label={`Low data mode: ${lowDataMode ? "on" : "off"}`}
            title="Toggle low data mode for rural/slow networks"
          >
            {lowDataMode ? (
              <WifiOff className="w-4 h-4" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Volume Control */}
          <div className="relative group">
            <button
              onClick={onMuteToggle}
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors group"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>

            <AnimatePresence>
              {showVolumeSlider && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                  className="absolute bottom-full mb-2 bg-white/10 backdrop-blur-md rounded-lg p-2 z-50"
                >
                  <div className="bg-white/20 rounded-full p-2 flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                      className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-blue-600"
                      aria-label="Volume"
                    />
                    <span className="text-xs text-white/80 min-w-[1.5rem]">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={onFullscreenToggle}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-white" />
            ) : (
              <Maximize className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BottomControls;

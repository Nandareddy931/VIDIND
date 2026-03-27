import React from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

interface CustomControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  progress: number;
  onSeek: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  currentTime: string;
  duration: string;
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  onFullscreen: () => void;
  showControls: boolean;
}

const CustomControls: React.FC<CustomControlsProps> = ({
  isPlaying,
  onPlayPause,
  progress,
  onSeek,
  currentTime,
  duration,
  volume,
  onVolumeChange,
  isMuted,
  onMuteToggle,
  onFullscreen,
  showControls
}) => {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 px-4 pb-4 pt-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 flex flex-col gap-2 rounded-b-2xl ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Progress Bar */}
      <div
        className="relative h-1.5 bg-white/20 rounded-full cursor-pointer overflow-hidden group/progress"
        onClick={onSeek}
      >
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"
          style={{ width: `${progress}%` }}
        />
        {/* Hover effect can be added here if needed */}
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between text-white mt-2">
        <div className="flex items-center gap-4">
          <button
            onClick={onPlayPause}
            className="hover:text-purple-400 transition-colors focus:outline-none"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
          </button>

          <div className="flex items-center gap-2 group/volume">
            <button onClick={onMuteToggle} className="hover:text-purple-400 transition-colors focus:outline-none">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={onVolumeChange}
              className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all duration-300 origin-left accent-purple-500 cursor-pointer h-1 bg-white/20 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>

          <div className="text-sm font-medium tracking-wide">
            {currentTime} <span className="text-white/50">/</span> {duration}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="hover:text-purple-400 transition-colors focus:outline-none">
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={onFullscreen}
            className="hover:text-purple-400 transition-colors focus:outline-none"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomControls;

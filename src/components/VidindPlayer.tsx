import React, { useEffect, useRef, useState, useCallback } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import Hls from 'hls.js';
import CustomControls from './CustomControls';
import Player from 'video.js/dist/types/player';

interface VidindPlayerProps {
  src: string;
  poster?: string;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds === 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const VidindPlayer: React.FC<VidindPlayerProps> = ({ src, poster }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize player
  useEffect(() => {
    if (!videoRef.current || !src) return;

    // Use HLS.js if supported natively, else rely on video.js
    if (Hls.isSupported() && src.includes('.m3u8')) {
      const hls = new Hls({
        maxBufferLength: 30, // Optimize buffering for smooth playback
        maxMaxBufferLength: 600,
        enableWorker: true
      });
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
    }

    const player = videojs(videoRef.current, {
      controls: false,
      preload: 'metadata',
      responsive: true,
      fluid: true,
      poster: poster,
      sources: [
        {
          src: src,
          type: src.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
        }
      ]
    });

    playerRef.current = player;

    // Event listeners
    player.on('play', () => setIsPlaying(true));
    player.on('pause', () => setIsPlaying(false));
    
    player.on('timeupdate', () => {
      const curr = player.currentTime() || 0;
      const dur = player.duration() || 0;
      setCurrentTime(formatTime(curr));
      if (dur > 0) setProgress((curr / dur) * 100);
    });

    player.on('loadedmetadata', () => {
      setDuration(formatTime(player.duration() || 0));
    });

    player.on('waiting', () => setIsBuffering(true));
    player.on('playing', () => setIsBuffering(false));
    player.on('canplay', () => setIsBuffering(false));

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [src, poster]);

  // Hide controls logic
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  }, [isPlaying]);

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  useEffect(() => {
    handleMouseMove();
  }, [isPlaying, handleMouseMove]);

  // Controls Actions
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playerRef.current.paused()) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!playerRef.current) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * (playerRef.current.duration() || 0);
    playerRef.current.currentTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    const val = parseFloat(e.target.value);
    setVolume(val);
    playerRef.current.volume(val);
    if (val === 0) {
      setIsMuted(true);
      playerRef.current.muted(true);
    } else {
      setIsMuted(false);
      playerRef.current.muted(false);
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    playerRef.current.muted(newMutedState);
    if (!newMutedState && volume === 0) {
      setVolume(1);
      playerRef.current.volume(1);
    }
  };

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Keyboard and Mobile specific behaviors
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playerRef.current) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        const t = playerRef.current.currentTime() || 0;
        playerRef.current.currentTime(Math.min(t + 5, playerRef.current.duration() || 0));
        handleMouseMove();
      } else if (e.code === 'ArrowLeft') {
        const t = playerRef.current.currentTime() || 0;
        playerRef.current.currentTime(Math.max(t - 5, 0));
        handleMouseMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMouseMove]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!playerRef.current || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const t = playerRef.current.currentTime() || 0;
    
    if (x > width / 2) {
      playerRef.current.currentTime(Math.min(t + 10, playerRef.current.duration() || 0));
    } else {
      playerRef.current.currentTime(Math.max(t - 10, 0));
    }
    handleMouseMove();
  };

  return (
    <div 
      ref={wrapperRef}
      className={`relative w-full h-full bg-[#0f0f0f] overflow-hidden group/player ${
        !showControls && isPlaying ? 'cursor-none' : 'cursor-default'
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleMouseMove}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleMouseMove}
    >
      <div data-vjs-player className="w-full h-full rounded-2xl overflow-hidden">
        <video 
          ref={videoRef} 
          className="video-js vjs-big-play-centered w-full h-full outline-none object-contain"
          playsInline
        />
      </div>

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <div className="w-12 h-12 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
        </div>
      )}

      {/* Center huge play button fade - optional enhancement, relying on CustomControls for now */}

      <CustomControls
        isPlaying={isPlaying}
        onPlayPause={togglePlay}
        progress={progress}
        onSeek={handleSeek}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onMuteToggle={toggleMute}
        onFullscreen={toggleFullscreen}
        showControls={showControls}
      />
    </div>
  );
};

export default VidindPlayer;

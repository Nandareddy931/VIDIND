/**
 * iTube Video Player Component
 * 
 * A production-ready, lightweight video player for web apps.
 * Optimized for low-data and rural internet users.
 * 
 * Features:
 * - Responsive mobile-first design
 * - Auto-hide controls after 3 seconds
 * - Double-tap seek (±10 seconds)
 * - Quality selector (Auto, 144p, 360p, 720p)
 * - Low data mode
 * - Watch progress saved to Supabase
 * - Resume playback from last position
 * - Keyboard shortcuts
 * - Full accessibility support
 * - Fullscreen support
 * - Touch gestures (swipe for mini-player)
 * - Adaptive bitrate streaming ready
 * 
 * @example
 * import VideoPlayer from '@/components/VideoPlayer';
 * 
 * function App() {
 *   return (
 *     <VideoPlayer
 *       src="https://example.com/video.mp4"
 *       title="My Video"
 *       videoId="video_123"
 *       userId="user_456"
 *       poster="https://example.com/thumbnail.jpg"
 *       onBack={() => history.back()}
 *     />
 *   );
 * }
 */

export { default } from "./VideoPlayer/index";
export type { VideoPlayerProps, QualityLevel } from "./VideoPlayer/index";

/**
 * iTube Video Player - Quick Reference & Cheat Sheet
 * 
 * Fast lookup for common tasks and API
 * 
 * USAGE EXAMPLES:
 * 
 * 1. MINIMAL (Just play a video)
 *    <VideoPlayer src="video.mp4" />
 * 
 * 2. STANDARD (With title and back button)
 *    <VideoPlayer
 *      src="video.mp4"
 *      title="Video Title"
 *      onBack={() => navigate('/')}
 *    />
 * 
 * 3. FULL FEATURED (With resume from Supabase)
 *    <VideoPlayer
 *      src="https://cdn.example.com/video.mp4"
 *      poster="https://cdn.example.com/thumb.jpg"
 *      title="Amazing Video Title"
 *      videoId="video_id_123"
 *      userId={user?.id}
 *      onBack={() => navigate('/')}
 *    />
 */

// ============================================================================
// IMPORT & USAGE
// ============================================================================

/*
Basic import:
  import VideoPlayer from '@/components/VideoPlayer';

With types:
  import VideoPlayer, { 
    VideoPlayerProps, 
    QualityLevel,
    formatTime 
  } from '@/components/VideoPlayer';
*/

// ============================================================================
// PROPS REFERENCE
// ============================================================================

/*
VideoPlayerProps {
  src: string;              // REQUIRED: "https://example.com/video.mp4"
  poster?: string;          // Optional: Thumbnail "https://example.com/thumb.jpg"
  title?: string;           // Optional: "My Video Title"
  videoId?: string;         // Optional: "video_123" (required for resume)
  userId?: string;          // Optional: "user_456" (required for resume)
  onBack?: () => void;      // Optional: Back button click handler
}
*/

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

/*
Key         Action
─────────────────────────────────────
Space       Play / Pause
J           Rewind 10 seconds
L           Forward 10 seconds
→           Forward 5 seconds
←           Backward 5 seconds
↑           Volume +10%
↓           Volume -10%
M           Mute / Unmute
F           Toggle Fullscreen
*/

// ============================================================================
// MOBILE GESTURES
// ============================================================================

/*
Gesture             Action
────────────────────────────────────────
Double tap left     Rewind 10 seconds
Double tap right    Forward 10 seconds
Swipe up            Enter mini-player
Single tap          Show/hide controls
*/

// ============================================================================
// QUALITY LEVELS
// ============================================================================

/*
type QualityLevel = 'auto' | '144p' | '360p' | '720p';

Quality   Bitrate      Network        Use Case
────────────────────────────────────────────────
auto      Adaptive     Detected       Recommended
144p      ~80 kbps     2G             Very slow
360p      ~400 kbps    3G             Slow
720p      ~2500 kbps   4G/Wifi        Fast
*/

// ============================================================================
// STYLING & CUSTOMIZATION
// ============================================================================

/*
Change theme colors in components:

// Primary color (currently blue-600)
// Find in BottomControls.tsx: bg-blue-600
// Replace with: bg-red-600, bg-green-600, etc.

// Background color (currently #0F0F0F)
// Find in VideoPlayer/index.tsx: bg-[#0F0F0F]
// Replace with your color

// Gradient overlays
// Find: from-black/80, via-black/20, to-black/40
// Adjust opacity values (0-100)
*/

// ============================================================================
// SUPABASE SETUP ONE-LINER
// ============================================================================

/*
SQL to run in Supabase:
Location: supabase/migrations/20260211_create_watch_progress_table.sql

Copy entire file and paste in Supabase SQL Editor, then click "Run"
*/

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

/*
.env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
*/

// ============================================================================
// COMMON TASKS
// ============================================================================

/*
TASK 1: Add video player to a page
1. Create new component (e.g., WatchPage.tsx)
2. Import VideoPlayer
3. Get user ID from auth
4. Get videoId from URL params
5. Pass to VideoPlayer with src and title
6. Done!

TASK 2: Load video metadata from database
1. Create interface for Video (id, title, src, poster)
2. Use useEffect to fetch from Supabase
3. While loading, show spinner
4. Pass to VideoPlayer

TASK 3: Track video analytics
1. Create analytics service
2. Add callbacks: onPlay, onPause, onSeek, onComplete
3. VideoPlayer doesn't have these yet - add to your page
4. Track events to analytics provider

TASK 4: Implement playlist
1. Create playlist state with array of videos
2. Show current video in player
3. Show next videos in sidebar/bottom
4. Click on video → update current
5. OnEnd → play next automatically

TASK 5: Add custom menu items
1. Edit TopOverlay.tsx
2. Find MoreMenu section
3. Add your <button>Custom Item</button>
4. Implement your logic
*/

// ============================================================================
// PERFORMANCE TIPS
// ============================================================================

/*
1. Use CDN for videos
   const videoUrl = `https://cdn.example.com/${videoId}/stream.mp4`;

2. Use optimized image for poster
   const posterUrl = `https://images.example.com/${videoId}/thumbnail.webp`;

3. Lazy load for off-screen players
   const VideoPlayer = lazy(() => import('@/components/VideoPlayer'));

4. Wrap in Suspense
   <Suspense fallback={<Spinner />}>
     <VideoPlayer {...props} />
   </Suspense>

5. Memoize if in list
   const MemoizedPlayer = memo(VideoPlayer);
*/

// ============================================================================
// DEBUGGING
// ============================================================================

/*
Check video element state
  console.log(videoRef.current?.currentTime);
  console.log(videoRef.current?.duration);
  console.log(videoRef.current?.played);
  console.log(videoRef.current?.buffered);

Check Supabase status
  const { data, error } = await supabase.from('watch_progress').select();

Check auth
  const { data: { user } } = await supabase.auth.getUser();

Check localStorage
  localStorage.getItem('supabase.auth.token');
*/

// ============================================================================
// COMMON ERRORS & FIXES
// ============================================================================

/*
ERROR: "Cannot find module"
FIX: Check import path, ensure src/components/VideoPlayer exists

ERROR: "Video won't play"
FIX: Check URL accessible, video format supported, CORS enabled

ERROR: "Progress not saving"
FIX: Check auth, RLS policies, user ID passed

ERROR: "Controls not hiding"
FIX: Check mouse/touch events, timeout being set

ERROR: "TypeScript errors"
FIX: Ensure @supabase/supabase-js, framer-motion installed
*/

// ============================================================================
// FILE LOCATIONS QUICK REF
// ============================================================================

/*
Component Folder:
  src/components/
  └── VideoPlayer/
      ├── index.tsx              ← Main logic (620 lines)
      ├── TopOverlay.tsx         ← Title bar (60 lines)
      ├── CenterControls.tsx     ← Play buttons (70 lines)
      ├── BottomControls.tsx     ← Controls (290 lines)
      ├── README.md              ← Full docs
      ├── EXAMPLES.tsx           ← 6 examples
      ├── INTEGRATION.tsx        ← Setup guide
      └── GETTING_STARTED.md     ← Quick start

Database:
  supabase/migrations/
  └── 20260211_create_watch_progress_table.sql

Types:
  VideoPlayerProps              ← in index.tsx
  QualityLevel                  ← in index.tsx
*/

// ============================================================================
// EXPORTS
// ============================================================================

/*
export default VideoPlayer;           // Main component
export type { VideoPlayerProps };     // Props interface
export type { QualityLevel };         // Quality type
export { formatTime };                // Time formatter utility

Usage:
import VideoPlayer, { 
  VideoPlayerProps, 
  QualityLevel,
  formatTime 
} from '@/components/VideoPlayer';
*/

// ============================================================================
// STATE MANAGEMENT REFERENCE
// ============================================================================

/*
In Redux/Zustand/Pinia, you might store:

{
  player: {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    quality: QualityLevel;
    lowDataMode: boolean;
    isFullscreen: boolean;
  },
  
  videoMetadata: {
    title: string;
    description: string;
    views: number;
    likes: number;
  }
}
*/

// ============================================================================
// TESTING SAMPLE
// ============================================================================

/*
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VideoPlayer from '@/components/VideoPlayer';

describe('VideoPlayer', () => {
  it('renders video element', () => {
    render(<VideoPlayer src="test.mp4" title="Test" />);
    const video = screen.getByRole('region');
    expect(video).toBeInTheDocument();
  });

  it('plays video on play button click', async () => {
    const user = userEvent.setup();
    render(<VideoPlayer src="test.mp4" title="Test" />);
    const playButton = screen.getByLabelText('Play');
    await user.click(playButton);
    // Assert playing state...
  });
});
*/

// ============================================================================
// NEXT STEPS
// ============================================================================

/*
After implementing:

1. [ ] Test on desktop browsers
2. [ ] Test on mobile devices
3. [ ] Test on slow networks
4. [ ] Test Low Data Mode
5. [ ] Test keyboard shortcuts
6. [ ] Test mobile gestures
7. [ ] Test accessibility
8. [ ] Run Lighthouse audit
9. [ ] Monitor Supabase queries
10. [ ] Set up analytics tracking
11. [ ] Configure CDN
12. [ ] Deploy to staging
13. [ ] Final QA testing
14. [ ] Deploy to production
15. [ ] Monitor errors
*/

// ============================================================================
// HELPFUL SNIPPETS
// ============================================================================

/*
Get current user:
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

Get video details:
  const getVideoDetails = async (videoId: string) => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();
    return data;
  };

Save custom event:
  const saveViewEvent = async (videoId: string, userId: string) => {
    await supabase.from('video_views').insert({
      video_id: videoId,
      user_id: userId,
      timestamp: new Date().toISOString(),
    });
  };

Format seconds to time:
  const formatSeconds = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

Get network quality:
  const detectNetworkQuality = () => {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      const effectiveType = conn?.effectiveType;
      return {
        '4g': 'excellent',
        '3g': 'good',
        '2g': 'poor',
      }[effectiveType] || 'unknown';
    }
    return 'unknown';
  };
*/

// ============================================================================
// LINKS & RESOURCES
// ============================================================================

/*
Official Docs:
  - React: https://react.dev
  - Supabase: https://supabase.com/docs
  - Tailwind: https://tailwindcss.com/docs
  - Framer: https://www.framer.com/motion/
  - Lucide: https://lucide.dev

Component Docs:
  - README.md: Full feature documentation
  - EXAMPLES.tsx: 6 code examples
  - INTEGRATION.tsx: Setup guide

Video Standards:
  - HTML5 Video: https://html.spec.whatwg.org/multipage/media.html
  - WebM Format: https://www.webmproject.org
  - MP4 Codec: https://en.wikipedia.org/wiki/H.264

Streaming:
  - HLS: https://developer.apple.com/streaming/
  - DASH: https://dashif.org/
  - WebRTC: https://webrtc.org

Hosting:
  - Supabase Storage: https://supabase.com/docs/guides/storage
  - AWS S3: https://aws.amazon.com/s3/
  - Cloudinary: https://cloudinary.com/
  - Bunny CDN: https://bunnycdn.com/
*/

export const CHEATSHEET_VERSION = '1.0.0';
export const CHEATSHEET_LAST_UPDATED = '2026-02-11';

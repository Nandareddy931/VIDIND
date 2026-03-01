# iTube Video Player - Integration Guide

Complete step-by-step guide to integrate the video player into your project.

## Step 1: Environment Setup

Add these environment variables to your `.env.local` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

**Note:** The Supabase client is already configured in `src/integrations/supabase/client.ts`

## Step 2: Database Setup

Run the migration in your Supabase SQL Editor:
- **Location:** `supabase/migrations/20260211_create_watch_progress_table.sql`

This creates:
- `watch_progress` table (stores user progress)
- RLS policies (secure user data)
- Triggers (auto-update timestamps)
- Indexes (optimize queries)

### Schema

```sql
CREATE TABLE watch_progress (
  id BIGINT PRIMARY KEY,
  video_id UUID NOT NULL,
  user_id UUID NOT NULL,
  watched_time FLOAT NOT NULL DEFAULT 0,
  total_duration FLOAT NOT NULL DEFAULT 0,
  last_watched_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Key Columns

- `id`: Primary key
- `video_id`: Video identifier
- `user_id`: User identifier
- `watched_time`: Current playback position (seconds)
- `total_duration`: Video length (seconds)
- `last_watched_at`: Last update timestamp
- `created_at`: Creation timestamp
- `updated_at`: Auto-updated timestamp

RLS is enabled so users can only access their own progress.

## Step 3: Basic Import

```tsx
import VideoPlayer from '@/components/VideoPlayer';
```

## Step 4: Minimal Usage

```tsx
import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import { supabase } from '@/integrations/supabase/client';

export function WatchPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  return (
    <VideoPlayer
      src="https://your-videos.com/video.mp4"
      title="Your Video Title"
      videoId="video_123"
      userId={user?.id}
    />
  );
}
```

## Step 5: Add to Page

Place the player in your page component:

```tsx
import { WatchPage } from '@/pages/Watch';

export default function App() {
  return <WatchPage />;
}
```

## Step 6: Handle Navigation

Add back button handler:

```tsx
import { useNavigate } from 'react-router-dom';

export function WatchPage() {
  const navigate = useNavigate();

  return (
    <VideoPlayer
      src={videoUrl}
      title={title}
      onBack={() => navigate('/')}
      videoId={videoId}
      userId={userId}
    />
  );
}
```

## Step 7: Enable Watch Progress

Uncomment the Supabase calls in `src/components/VideoPlayer/index.tsx` after running the migration:

1. Find `loadWatchProgress()` function (line ~94)
2. Find `saveWatchProgress()` function (line ~520)
3. Uncomment the calls to enable automatic progress tracking

## Step 8: Pass Video Metadata (Optional)

```tsx
<VideoPlayer
  src="https://videos.example.com/video.mp4"
  poster="https://images.example.com/thumbnail.jpg"
  title="Your Video"
  videoId="video_123"
  userId={user?.id}
  onBack={() => navigate('/')}
/>
```

## Step 9: Mobile Optimization

The player is fully responsive. On mobile it:
- Uses full-width layout
- Hides sidebar controls
- Optimizes touch gestures
- Adapts UI for small screens

## Step 10: Styling & Theming

The player uses these CSS custom properties you can override:

```css
:root {
  --video-bg: #0f0f0f;
  --control-bg: rgba(0, 0, 0, 0.7);
  --text-color: #fff;
  --accent-color: #3b82f6;
}
```

## Step 11: Features

The player includes:

✅ **Playback Control**
- Play/Pause
- Seek/Progress bar
- Skip ±10 seconds
- Speed control (0.5x to 2x)

✅ **Quality Selection**
- 720p, 1080p, 2K, 4K
- Auto-detection

✅ **Volume Control**
- Volume slider
- Mute/Unmute
- Remember volume preference

✅ **Fullscreen**
- Native fullscreen support
- Exit with Escape key

✅ **Mobile Gestures**
- Double-tap to skip ±10 seconds
- Swipe up for mini-player
- Pinch to zoom

✅ **Keyboard Shortcuts**
- Space: Play/Pause
- J/L: Skip ±10 seconds
- Arrow keys: Seek ±5s or volume
- M: Mute/Unmute
- F: Fullscreen

✅ **Accessibility**
- ARIA labels
- Keyboard navigation
- Screen reader support

✅ **Performance**
- Low-data mode toggle
- Adaptive bitrate streaming
- Network status detection

✅ **Watch Progress**
- Resume playback position
- Supabase integration (optional)

## Step 12: Debugging

Enable debug mode with:

```tsx
window.__videoPlayerDebug = true;
```

This logs all player events to console.

## Step 13: Production Deployment

Before deploying:

1. ✅ Run migration in Supabase
2. ✅ Add environment variables
3. ✅ Test on mobile devices
4. ✅ Verify video URLs are accessible
5. ✅ Test fullscreen on different browsers
6. ✅ Check keyboard shortcuts
7. ✅ Verify resume playback
8. ✅ Test low-data mode

## Step 14: Troubleshooting

**Video doesn't play:**
- Check video URL is correct and accessible
- Verify CORS headers on video server
- Check browser console for errors

**Controls not responsive:**
- Ensure JavaScript is enabled
- Check for console errors
- Verify Tailwind CSS is configured

**Progress not saving:**
- Check migration was run
- Verify Supabase auth is working
- Check browser console for API errors

**Fullscreen not working:**
- Not all browsers support fullscreen API
- Check security policy allows fullscreen
- Test in incognito mode

## Step 15: Advanced Features

### Custom Quality Levels

```tsx
const qualities = [
  { label: '720p', value: 720 },
  { label: '1080p', value: 1080 },
  { label: '2K', value: 1440 },
];

<VideoPlayer {...props} qualities={qualities} />
```

### Resume from Position

The player automatically loads the last watched position from Supabase (if configured).

### Event Callbacks

```tsx
<VideoPlayer
  onPlay={() => console.log('playing')}
  onPause={() => console.log('paused')}
  onEnd={() => console.log('ended')}
  onTimeUpdate={(time) => console.log('current:', time)}
/>
```

---

That's it! Your video player is integrated and ready for production.

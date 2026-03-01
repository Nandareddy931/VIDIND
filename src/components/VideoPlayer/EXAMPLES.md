# iTube Video Player - 6 Production-Ready Examples

Copy and adapt these examples for your pages.

## Example 1: Simple Watch Page

```tsx
import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export function WatchPageSimple() {
  const navigate = useNavigate();
  const videoId = 'video_123';
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  return (
    <div className="w-full bg-black min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <VideoPlayer
          src={`https://videos.example.com/${videoId}/stream.mp4`}
          poster={`https://videos.example.com/${videoId}/thumbnail.jpg`}
          title="Amazing Video Title"
          videoId={videoId}
          userId={user?.id}
          onBack={() => navigate('/')}
        />
        <div className="mt-8 text-white">
          <h1 className="text-3xl font-bold mb-4">Amazing Video Title</h1>
          <p className="text-gray-300">Video description and details...</p>
        </div>
      </div>
    </div>
  );
}
```

## Example 2: Advanced with Database Metadata

```tsx
export function WatchPageAdvanced() {
  const navigate = useNavigate();
  const videoId = 'video_123';
  const [video, setVideo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);

        const { data } = await supabase
          .from('videos')
          .select('*')
          .eq('id', videoId)
          .single();

        setVideo(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!video) return <div>Video not found</div>;

  return (
    <div className="w-full bg-black min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <VideoPlayer
          src={video.video_url}
          poster={video.thumbnail_url}
          title={video.title}
          videoId={videoId}
          userId={user?.id}
          onBack={() => navigate('/')}
        />
        <div className="mt-8 text-white space-y-4">
          <h1 className="text-3xl font-bold">{video.title}</h1>
          <p className="text-gray-400">{video.views.toLocaleString()} views</p>
          <p className="text-gray-300">{video.description}</p>
        </div>
      </div>
    </div>
  );
}
```

## Example 3: Mobile-Optimized Layout

```tsx
export function MobileOptimizedWatch() {
  const navigate = useNavigate();
  const videoId = 'video_123';
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  return (
    <div className="w-full bg-black min-h-screen">
      <VideoPlayer
        src={`https://videos.example.com/${videoId}/stream.mp4`}
        title="Video Title"
        videoId={videoId}
        userId={user?.id}
        onBack={() => navigate('/')}
      />
      <div className="px-4 py-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Video Title</h1>
        <p className="text-gray-300">Description...</p>
      </div>
    </div>
  );
}
```

## Example 4: Playlist Support

```tsx
export function PlaylistWatch() {
  const navigate = useNavigate();
  const playlistId = 'playlist_123';
  const [videos, setVideos] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const handleVideoEnd = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!videos[currentIndex]) return null;

  return (
    <div className="w-full bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <VideoPlayer
          src={videos[currentIndex].video_url}
          poster={videos[currentIndex].thumbnail_url}
          title={videos[currentIndex].title}
          videoId={videos[currentIndex].id}
          userId={user?.id}
          onBack={() => navigate('/')}
        />
      </div>
    </div>
  );
}
```

## Example 5: Live Streaming

```tsx
export function LiveStreamWatch() {
  const navigate = useNavigate();
  const streamId = 'stream_123';
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  return (
    <div className="w-full bg-black min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="relative">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-semibold">LIVE</span>
          </div>
          <VideoPlayer
            src={`https://live.example.com/${streamId}/stream.m3u8`}
            title="Live Stream"
            videoId={streamId}
            userId={user?.id}
            onBack={() => navigate('/')}
          />
        </div>
        <div className="mt-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Stream Title</h1>
          <p className="text-gray-300">👥 1,234 watching now</p>
        </div>
      </div>
    </div>
  );
}
```

## Example 6: Theater Mode

```tsx
export function TheaterModeWatch() {
  const navigate = useNavigate();
  const videoId = 'video_123';
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  return (
    <div className="w-full bg-black min-h-screen">
      <div className={isTheaterMode ? 'px-2 py-4' : 'max-w-6xl mx-auto px-4 py-6'}>
        <div className="mb-4 text-right">
          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            {isTheaterMode ? '📺 Exit Theater' : '🎭 Theater Mode'}
          </button>
        </div>

        <VideoPlayer
          src={`https://videos.example.com/${videoId}/stream.mp4`}
          title="Video in Theater Mode"
          videoId={videoId}
          userId={user?.id}
          onBack={() => navigate('/')}
        />

        {!isTheaterMode && (
          <div className="mt-8 text-white">
            <h1 className="text-3xl font-bold mb-4">Video Title</h1>
            <p className="text-gray-300">Video description...</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

All examples are ready to copy and adapt to your project!

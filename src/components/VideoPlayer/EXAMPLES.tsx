import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

/**
 * iTube Video Player - Usage Examples
 * 
 * DOCUMENTATION MOVED TO: EXAMPLES.md
 * 
 * See EXAMPLES.md for 6 production-ready usage examples
 * Examples have been moved from TypeScript to Markdown to avoid compilation conflicts
 */

export const EXAMPLES_DOCUMENTATION = {
  location: "See EXAMPLES.md for usage examples",
  hasMultipleExamples: true,
  total: 6
};

// ============================================================================
// EXAMPLE 2: Advanced Watch Page with Full Video Information
// ============================================================================

export function WatchPageAdvanced() {
  const router = useRouter();
  const videoId = router.params.videoId as string;
  const [video, setVideo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    loadData();
  }, []);

  if (!video) return null;

  return (
    <div className="w-full bg-black min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Video Player */}
        <VideoPlayer
          src={video.video_url}
          poster={video.thumbnail_url}
          title={video.title}
          videoId={videoId}
          userId={user?.id}
          onBack={() => router.navigate('/')}
        />

        {/* Video Info */}
        <div className="mt-8 text-white space-y-4">
          <h1 className="text-3xl font-bold">{video.title}</h1>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex gap-4">
              <span>{video.views.toLocaleString()} views</span>
              <span>
                {new Date(video.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                👍 Like
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                📤 Share
              </button>
            </div>
          </div>

          <p className="text-gray-300 text-lg">{video.description}</p>
        </div>

        {/* Comments Section (requires CommentSection component) */}
        <div className="mt-12 border-t border-white/10 pt-8">
          {/* <CommentSection videoId={videoId} /> */}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Responsive Mobile-First Layout with Mini Player
// ============================================================================

export function MobileOptimizedWatch() {
  const router = useRouter();
  const videoId = router.params.videoId as string;
  const isMobile = useMobile();
  const [userData, setUserData] = useState<any>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserData(user);
    };

    getCurrentUser();
  }, []);

  return (
    <div className="w-full bg-black min-h-screen">
      {/* Video Player - Full width on mobile */}
      <div className={isMobile ? 'w-full' : 'max-w-6xl mx-auto'}>
        <VideoPlayer
          src={`https://videos.example.com/${videoId}/stream.mp4`}
          poster={`https://videos.example.com/${videoId}/thumbnail.jpg`}
          title="Video Title"
          videoId={videoId}
          userId={userData?.id}
          onBack={() => router.navigate('/')}
        />
      </div>

      {/* Content - Two column on desktop, single column on mobile */}
      <div className={`${isMobile ? 'px-4' : 'max-w-6xl mx-auto px-4'} py-6`}>
        <div
          className={`grid ${
            isMobile ? 'grid-cols-1' : 'grid-cols-3'
          } gap-6`}
        >
          {/* Main content - 2 columns on desktop */}
          <div className={isMobile ? 'col-span-1' : 'col-span-2'}>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Video Title
            </h1>
            <p className="text-gray-300">Video description...</p>
          </div>

          {/* Sidebar with related videos - hidden on mobile */}
          {!isMobile && (
            <div className="col-span-1">
              <h2 className="text-xl font-bold text-white mb-4">
                Related Videos
              </h2>
              {/* Related videos grid */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Playlist with Auto-Play Next Video
// ============================================================================

interface PlaylistItem {
  id: string;
  title: string;
  duration: number;
  thumbnail_url: string;
  video_url: string;
}

export function PlaylistWatch() {
  const router = useRouter();
  const playlistId = router.params.playlistId as string;
  const currentIndex = parseInt(router.query.index as string) || 0;

  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<PlaylistItem | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loadPlaylist = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserData(user);

      const { data: playlistData, error } = await supabase
        .from('playlists')
        .select('videos')
        .eq('id', playlistId)
        .single();

      if (!error && playlistData) {
        setPlaylist(playlistData.videos);
        setCurrentVideo(playlistData.videos[currentIndex]);
      }
    };

    loadPlaylist();
  }, [playlistId, currentIndex]);

  const handleVideoEnd = () => {
    if (currentIndex < playlist.length - 1) {
      router.navigate(
        `/playlist/${playlistId}?index=${currentIndex + 1}`
      );
    }
  };

  const selectVideo = (index: number) => {
    router.navigate(`/playlist/${playlistId}?index=${index}`);
  };

  if (!currentVideo) return null;

  return (
    <div className="w-full bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player */}
          <div className="lg:col-span-2">
            <VideoPlayer
              src={currentVideo.video_url}
              poster={currentVideo.thumbnail_url}
              title={currentVideo.title}
              videoId={currentVideo.id}
              userId={userData?.id}
              onBack={() => router.navigate('/')}
            />

            <h1 className="text-2xl font-bold text-white mt-6">
              {currentVideo.title}
            </h1>
          </div>

          {/* Playlist */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-white mb-4">
              Playlist ({playlist.length})
            </h2>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {playlist.map((video, index) => (
                <button
                  key={video.id}
                  onClick={() => selectVideo(index)}
                  className={`w-full p-3 rounded-lg transition ${
                    index === currentIndex
                      ? 'bg-blue-600'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-white text-sm font-semibold truncate">
                      {index + 1}. {video.title}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {Math.floor(video.duration / 60)}:
                      {(video.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Live Stream View (Ready for modification)
// ============================================================================

export function LiveStreamWatch() {
  const router = useRouter();
  const streamId = router.params.streamId as string;
  const [userData, setUserData] = useState<any>(null);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserData(user);
    };

    getCurrentUser();

    // Simulate viewer count updates (replace with real-time subscription)
    const interval = setInterval(() => {
      setViewerCount((prev) => Math.max(50, prev + Math.random() * 20 - 10));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-black min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Live Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-sm font-semibold">LIVE</span>
        </div>

        {/* Video Player */}
        <VideoPlayer
          src={`https://live.example.com/${streamId}/stream.m3u8`}
          title="Live Stream"
          videoId={streamId}
          userId={userData?.id}
          onBack={() => router.navigate('/')}
        />

        {/* Stream Info */}
        <div className="mt-8 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Stream Title</h1>
              <p className="text-gray-300">
                👥 {Math.floor(viewerCount).toLocaleString()} watching now
              </p>
            </div>
            <button className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition">
              ❤️ Follow
            </button>
          </div>

          <p className="text-gray-300 text-lg">Stream description...</p>
        </div>

        {/* Live Chat (ready for integration) */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <h2 className="text-xl font-bold text-white mb-4">Live Chat</h2>
          {/* <LiveChat streamId={streamId} /> */}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Theater Mode / Cinema Mode
// ============================================================================

export function TheaterModeWatch() {
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const router = useRouter();
  const videoId = router.params.videoId as string;
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserData(user);
    };

    getCurrentUser();
  }, []);

  return (
    <div className={`w-full bg-black ${isTheaterMode ? 'min-h-screen' : ''}`}>
      <div
        className={`${
          isTheaterMode
            ? 'px-2 py-4'
            : 'max-w-6xl mx-auto px-4 py-6'
        }`}
      >
        {/* Theater Mode Toggle */}
        <div className="mb-4 text-right">
          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            {isTheaterMode ? '📺 Exit Theater' : '🎭 Theater Mode'}
          </button>
        </div>

        {/* Video Player */}
        <VideoPlayer
          src={`https://videos.example.com/${videoId}/stream.mp4`}
          poster={`https://videos.example.com/${videoId}/thumbnail.jpg`}
          title="Video in Theater Mode"
          videoId={videoId}
          userId={userData?.id}
          onBack={() => router.navigate('/')}
        />

        {/* Content below player (responsive) */}
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

// ============================================================================
// EXPORT all examples for reference
// ============================================================================

export const EXAMPLES = {
  Simple: WatchPageSimple,
  Advanced: WatchPageAdvanced,
  MobileOptimized: MobileOptimizedWatch,
  Playlist: PlaylistWatch,
  LiveStream: LiveStreamWatch,
  TheaterMode: TheaterModeWatch,
};

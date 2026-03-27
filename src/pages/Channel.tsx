import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import VideoCard from "@/components/VideoCard";
import SubscribeButton from "@/components/SubscribeButton";

const Channel = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"videos" | "about">("videos");

  useEffect(() => {
    if (!userId) return;
    fetchChannel();
  }, [userId]);

  const fetchChannel = async () => {
    setLoading(true);
    // Fetch profile
    const { data: prof } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(prof);

    // Fetch videos
    const { data: vids } = await supabase
      .from("videos")
      .select("*")
      .eq("user_id", userId!)
      .order("created_at", { ascending: false });
    setVideos(vids || []);

    // Subscriber count
    const { count } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("channel_id", userId!);
    setSubscriberCount(count || 0);

    setLoading(false);
  };

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  if (loading) {
    return (
      <Layout showSearch={false}>
        <div className="bg-[#0f0f0f] min-h-screen text-white">
          <div className="animate-pulse">
            <div className="h-32 sm:h-48 bg-white/5" />
            <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/10" />
                <div className="space-y-3 flex-1">
                  <div className="h-6 bg-white/10 rounded-full w-1/3" />
                  <div className="h-4 bg-white/10 rounded-full w-1/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const displayName = profile?.display_name || "Channel";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Layout showSearch={false} showBack={true}>
      <div className="bg-[#0f0f0f] min-h-screen w-full font-sans text-white pb-10">
        
        {/* Banner with smooth gradient overlay if no image */}
        <div className="h-32 sm:h-56 bg-gradient-to-br from-purple-900/40 via-blue-900/20 to-black overflow-hidden relative">
          {profile?.banner_url ? (
            <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover opacity-80" />
          ) : (
             <div className="w-full h-full absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-3xl" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
        </div>

        <div className="max-w-[1700px] mx-auto">
          {/* Channel Header Info */}
          <div className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-10 sm:-mt-12 relative z-10">
              
              {/* Premium Avatar */}
              <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[3px] shrink-0 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <div className="w-full h-full rounded-full bg-[#0f0f0f] flex items-center justify-center overflow-hidden border-2 border-black">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                      {initial}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 pt-2 sm:pt-0 sm:pb-2">
                <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight truncate">
                  {displayName}
                </h1>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base text-gray-400 mt-1 sm:mt-2">
                  <span className="font-medium text-gray-300">
                    @{displayName?.toLowerCase()?.replace(/\s+/g, "") || "user"}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span>{formatCount(subscriberCount || 0)} subscribers</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{videos?.length || 0} videos</span>
                </div>
                {profile?.bio && (
                  <p className="text-sm text-gray-300 mt-2 line-clamp-2 max-w-2xl leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* Subscribe Action */}
              <div className="mt-2 sm:mt-0 sm:pb-2 shrink-0">
                {userId && <SubscribeButton channelId={userId} className="w-full sm:w-auto px-8 py-2.5 text-base" />}
              </div>
            </div>
          </div>

          {/* Glowing Tabs Navigation */}
          <div className="mt-8 px-4 sm:px-6">
            <div className="flex gap-8 border-b border-white/10 relative">
              {(["videos", "about"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm sm:text-base font-semibold capitalize transition-all relative ${
                    activeTab === tab 
                      ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,1)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            {activeTab === "videos" ? (
              (!videos || videos.length === 0) ? (
                <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <p className="text-base text-gray-400">No videos uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {videos.map((video) => (
                    <VideoCard
                      key={video?.id}
                      id={video?.id}
                      title={video?.title}
                      thumbnailUrl={video?.thumbnail_url}
                      views={video?.views || 0}
                      createdAt={video?.created_at}
                      category={video?.category}
                      duration={video?.duration}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="max-w-3xl space-y-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    About
                  </h3>
                  <p className="text-base text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {profile?.bio || "This channel hasn't added a description yet."}
                  </p>
                  
                  <hr className="my-6 border-white/10" />
                  
                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-center justify-between">
                      <span>Joined</span>
                      <span className="text-white">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'long', day: 'numeric'
                        }) : "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Views</span>
                      <span className="text-white">
                         {formatCount(videos?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Channel;

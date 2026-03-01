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
        <div className="animate-pulse">
          <div className="h-28 bg-secondary" />
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-secondary" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-secondary rounded w-1/3" />
                <div className="h-3 bg-secondary rounded w-1/4" />
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
    <Layout showSearch={false}>
      {/* Banner */}
      <div className="h-28 sm:h-40 bg-gradient-to-br from-primary/30 via-secondary to-secondary overflow-hidden">
        {profile?.banner_url && (
          <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Channel info */}
      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shrink-0 -mt-8 relative z-10">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
            ) : (
              <span className="text-xl font-bold text-primary">{initial}</span>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-lg font-bold text-foreground truncate">{displayName}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>@{displayName.toLowerCase().replace(/\s+/g, "")}</span>
              <span>•</span>
              <span>{formatCount(subscriberCount)} subscribers</span>
              <span>•</span>
              <span>{videos.length} videos</span>
            </div>
            {profile?.bio && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Subscribe button */}
        {userId && (
          <div className="mt-3">
            <SubscribeButton channelId={userId} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-4">
        {(["videos", "about"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors relative ${
              activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {activeTab === "videos" ? (
          videos.length === 0 ? (
            <p className="text-center py-16 text-sm text-muted-foreground">No videos uploaded yet</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  id={video.id}
                  title={video.title}
                  thumbnailUrl={video.thumbnail_url}
                  views={video.views}
                  createdAt={video.created_at}
                  category={video.category}
                />
              ))}
            </div>
          )
        ) : (
          <div className="py-4 space-y-3 max-w-lg">
            <h3 className="text-sm font-bold text-foreground">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile?.bio || "This channel hasn't added a description yet."}
            </p>
            <div className="text-xs text-muted-foreground">
              Joined {new Date(profile?.created_at || "").toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Channel;

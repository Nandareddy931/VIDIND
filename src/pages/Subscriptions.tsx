import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import VideoCard from "@/components/VideoCard";
import { Users } from "lucide-react";

const Subscriptions = () => {
  const [user, setUser] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchSubscriptions();
    else setLoading(false);
  }, [user]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("channel_id")
      .eq("subscriber_id", user.id);

    if (subs && subs.length > 0) {
      const channelIds = subs.map((s) => s.channel_id);

      // Fetch profiles
      const { data: profiles } = await (supabase as any)
        .from("profiles")
        .select("*")
        .in("user_id", channelIds);
      setChannels(profiles || []);

      // Fetch recent videos from those channels
      const { data: vids } = await supabase
        .from("videos")
        .select("*")
        .in("user_id", channelIds)
        .order("created_at", { ascending: false })
        .limit(20);
      setVideos(vids || []);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <Layout showSearch={false}>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Your Subscriptions</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            Sign in to see videos from your favorite channels and creators.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSearch={false}>
      <div className="px-4 py-3">
        {/* Channel avatars row */}
        {channels.length > 0 && (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 mb-3 border-b border-border">
            {channels.map((ch) => (
              <Link to={`/channel/${ch.user_id}`} key={ch.user_id} className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                  {ch.avatar_url ? (
                    <img src={ch.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {(ch.display_name || "C").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground truncate w-16 text-center">
                  {ch.display_name || "Channel"}
                </span>
              </Link>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-secondary rounded-xl mb-2.5" />
                <div className="h-3.5 bg-secondary rounded w-3/4 mb-1.5" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">No videos from your subscriptions yet</p>
          </div>
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
                channelId={video.user_id}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Subscriptions;

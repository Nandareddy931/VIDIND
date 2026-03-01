import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import SubscribeButton from "@/components/SubscribeButton";
import { Share2, Eye } from "lucide-react";
import { toast } from "sonner";

const Watch = () => {
  const { id } = useParams();
  const [video, setVideo] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const { data } = await supabase.from("videos").select("*").eq("id", id).maybeSingle();
      setVideo(data);
      setLoading(false);
      if (data) {
        supabase.from("videos").update({ views: (data.views || 0) + 1 }).eq("id", id).then();
        // Fetch channel profile
        if (data.user_id) {
          const { data: prof } = await (supabase as any)
            .from("profiles")
            .select("*")
            .eq("user_id", data.user_id)
            .maybeSingle();
          setChannel(prof);
        }
        // Fetch suggestions: same category, excluding current
        try {
          let sugQuery = supabase.from("videos").select("*").neq("id", id).order("views", { ascending: false }).limit(12);
          if (data.category) {
            sugQuery = sugQuery.eq("category", data.category);
          }
          const { data: sug } = await (sugQuery as any);
          setSuggestions(sug || []);
        } catch (e) {
          console.error("Failed to load suggestions", e);
        }
      }
    };
    fetchData();
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.share({ title: video?.title, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    }
  };

  if (loading) {
    return (
      <Layout showHeader={false}>
        <div className="animate-pulse">
          <div className="aspect-video bg-secondary" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-secondary rounded w-3/4" />
            <div className="h-3 bg-secondary rounded w-1/2" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!video) {
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground">Video not found</div>
      </Layout>
    );
  }

  const channelName = channel?.display_name || "Channel";
  const channelInitial = channelName.charAt(0).toUpperCase();

  return (
    <Layout showHeader={false}>
      <VideoPlayer src={video.video_url} poster={video.thumbnail_url || undefined} />

      <div className="px-4 py-3 space-y-3">
        <h1 className="text-base font-bold text-foreground leading-snug">{video.title}</h1>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{video.views} views</span>
          <span>{new Date(video.created_at).toLocaleDateString()}</span>
        </div>

        {/* Channel info + Subscribe */}
        {video.user_id && (
          <div className="flex items-center gap-3 py-2">
            <Link to={`/channel/${video.user_id}`} className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                {channel?.avatar_url ? (
                  <img src={channel.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                ) : (
                  <span className="text-sm font-bold text-primary">{channelInitial}</span>
                )}
              </div>
              <span className="text-sm font-semibold text-foreground truncate">{channelName}</span>
            </Link>
            <SubscribeButton channelId={video.user_id} />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <LikeButton videoId={video.id} />
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-medium hover:bg-accent transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {video.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{video.description}</p>
        )}

        {/* Comments */}
        <div className="border-t border-border pt-4">
          <CommentSection videoId={video.id} />
        </div>
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Up next</h3>
            <div className="flex flex-col gap-3">
              {suggestions.map((v) => (
                <Link key={v.id} to={`/watch/${v.id}`} className="flex items-center gap-3">
                  <div className="w-36 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                    {v.thumbnail_url ? (
                      <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{v.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{v.views || 0} views • {new Date(v.created_at).toLocaleDateString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Watch;

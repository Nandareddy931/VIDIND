import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import SubscribeButton from "@/components/SubscribeButton";
import VideoCard from "@/components/VideoCard";
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
        // Fetch suggestions: same category preferred, excluding current
        try {
          const { data: sug } = await supabase
            .from("videos")
            .select("*")
            .neq("id", id)
            .order("views", { ascending: false })
            .limit(16);
            
          if (sug && data.category) {
             sug.sort((a, b) => {
                 if (a.category === data.category && b.category !== data.category) return -1;
                 if (a.category !== data.category && b.category === data.category) return 1;
                 return 0;
             });
          }
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
      <div className="flex flex-col lg:flex-row lg:px-6 lg:py-6 gap-6 w-full max-w-[1700px] mx-auto">
        
        {/* Main Content Area (Video + Info + Comments) */}
        <div className="flex-1 min-w-0">
          <div className="w-full lg:rounded-xl overflow-hidden bg-black aspect-video flex justify-center shadow-md">
            <div className="w-full h-full">
              <VideoPlayer src={video.video_url} poster={video.thumbnail_url || undefined} />
            </div>
          </div>

          <div className="space-y-4 w-full mt-4 px-4 lg:px-0">
            <h1 className="text-xl md:text-2xl font-bold text-foreground leading-snug">{video.title}</h1>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Channel info + Subscribe */}
              {video.user_id && (
                <div className="flex items-center gap-4">
                  <Link to={`/channel/${video.user_id}`} className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      {channel?.avatar_url ? (
                        <img src={channel.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                      ) : (
                        <span className="text-sm font-bold text-primary">{channelInitial}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-semibold text-foreground truncate">{channelName}</span>
                      <span className="text-xs text-muted-foreground truncate">Subscriber stats hidden</span>
                    </div>
                  </Link>
                  <div className="ml-2">
                    <SubscribeButton channelId={video.user_id} />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 items-center">
                <LikeButton videoId={video.id} />
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-accent transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Description Box */}
            <div className="bg-secondary/50 rounded-xl p-3 sm:p-4 hover:bg-secondary/80 transition-colors cursor-pointer mt-4">
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-foreground mb-1">
                <span>{video.views} views</span>
                <span>{new Date(video.created_at).toLocaleDateString()}</span>
                {video.category && (
                  <span className="text-muted-foreground hover:text-foreground transition-colors uppercase cursor-pointer">
                    #{video.category}
                  </span>
                )}
              </div>
              {video.description && (
                <p className="text-sm text-foreground whitespace-pre-wrap">{video.description}</p>
              )}
            </div>

            {/* Comments */}
            <div className="pt-4 pb-8">
              <CommentSection videoId={video.id} />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Suggestions */}
        {suggestions.length > 0 && (
          <div className="lg:w-[350px] xl:w-[400px] flex-shrink-0 px-4 lg:px-0 pb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Up next</h3>
            <div className="flex flex-col gap-3">
              {suggestions.map((v) => (
                <VideoCard
                  key={v.id}
                  id={v.id}
                  title={v.title}
                  thumbnailUrl={v.thumbnail_url}
                  views={v.views || 0}
                  createdAt={v.created_at}
                  category={v.category}
                  channelId={v.user_id}
                  duration={v.duration}
                  layout="list"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Watch;

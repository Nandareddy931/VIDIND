import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import VidindPlayer from "@/components/VidindPlayer";
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
  const [activeTab, setActiveTab] = useState<"comments" | "recommended">("comments");
  const [commentCount, setCommentCount] = useState(0);

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
        
        // Fetch comment count
        const { count } = await (supabase as any)
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("video_id", id);
        
        setCommentCount(count || 0);

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

  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const formatViews = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return `${n}`;
  };

  if (loading) {
    return (
      <Layout showHeader={false}>
        <div className="bg-[#0f0f0f] min-h-screen">
          <div className="animate-pulse">
            <div className="aspect-video bg-white/5" />
            <div className="p-4 space-y-3 lg:w-2/3">
              <div className="h-6 bg-white/10 rounded-full w-3/4 mb-4" />
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 bg-white/10 rounded-full" />
                <div className="h-4 bg-white/10 rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!video) {
    return (
      <Layout>
        <div className="text-center py-20 text-muted-foreground bg-[#0f0f0f] min-h-screen">Video not found</div>
      </Layout>
    );
  }

  const channelName = channel?.display_name || "Channel";
  const channelInitial = channelName.charAt(0).toUpperCase();

  return (
    <Layout showHeader={false} showBack={true}>
      <div className="bg-[#0f0f0f] min-h-screen w-full font-sans text-white">
        <div className="flex flex-col lg:flex-row lg:px-6 lg:py-6 gap-8 w-full max-w-[1700px] mx-auto">
          
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Video Player wrapper - Premium Glow Outline */}
            <div className="w-full sm:rounded-2xl overflow-hidden bg-black aspect-video flex justify-center relative border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)] z-10 transition-all duration-500">
              <div className="w-full h-full">
                <VidindPlayer src={video?.video_url} poster={video?.thumbnail_url || undefined} />
              </div>
            </div>

            {/* Video Info */}
            <div className="px-4 sm:px-0 mt-5 w-full">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug">
                {video?.title}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {formatViews(video?.views || 0)} views • {timeAgo(video?.created_at)}
              </p>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mt-4">
                {/* Channel & Stats Subtitle */}
                {video?.user_id && (
                  <Link to={`/channel/${video.user_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                        {channel?.avatar_url ? (
                          <img src={channel.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-sm font-bold text-purple-400">{channelInitial}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-semibold text-white truncate flex items-center gap-1">
                        {channelName}
                      </span>
                      <span className="text-xs text-gray-400 truncate hidden md:block">
                        Subscriber stats hidden
                      </span>
                    </div>
                  </Link>
                )}

                {/* Actions Row */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
                  {/* Like Button */}
                  <LikeButton videoId={video.id} />
                  
                  {/* Comment Button (focus tab on click) */}
                  <button 
                    onClick={() => setActiveTab("comments")}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-all shadow-lg backdrop-blur-md border border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {commentCount}
                  </button>

                  <SubscribeButton channelId={video.user_id} className="shrink-0" />

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-all shadow-lg backdrop-blur-md border border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] shrink-0"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Tab Section */}
            <div className="mt-8 px-4 sm:px-0 lg:hidden block">
              <div className="flex gap-6 border-b border-white/10 relative">
                {(["comments", "recommended"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-semibold capitalize transition-colors relative ${
                      activeTab === tab ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,1)]" />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pb-20">
                {activeTab === "comments" ? (
                  <CommentSection videoId={video?.id} />
                ) : (
                  <div className="flex flex-col gap-4">
                    {suggestions.map((v) => (
                      <VideoCard
                        key={v?.id}
                        id={v?.id}
                        title={v?.title}
                        thumbnailUrl={v?.thumbnail_url}
                        views={v?.views || 0}
                        createdAt={v?.created_at}
                        category={v?.category}
                        channelId={v?.user_id}
                        duration={v?.duration}
                        layout="list"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="hidden lg:block mt-8">
               <CommentSection videoId={video?.id} />
            </div>

          </div>

          {/* Desktop Right Sidebar: Suggestions */}
          <div className="hidden lg:block lg:w-[350px] xl:w-[400px] flex-shrink-0">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              Recommended
              <div className="h-[2px] flex-1 bg-gradient-to-r from-purple-500/50 to-transparent" />
            </h3>
            <div className="flex flex-col gap-4">
              {suggestions.map((v) => (
                <VideoCard
                  key={v?.id}
                  id={v?.id}
                  title={v?.title}
                  thumbnailUrl={v?.thumbnail_url}
                  views={v?.views || 0}
                  createdAt={v?.created_at}
                  category={v?.category}
                  channelId={v?.user_id}
                  duration={v?.duration}
                  layout="list"
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Watch;

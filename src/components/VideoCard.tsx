import { Link } from "react-router-dom";
import { Eye, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  views: number;
  createdAt: string;
  category?: string;
  channelId?: string | null;
  duration?: number | null;
  layout?: "grid" | "list";
}

const formatViews = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
};

const formatDuration = (seconds: number | null | undefined) => {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const VideoCard = ({ id, title, thumbnailUrl, views, createdAt, category, channelId, duration, layout = "grid" }: VideoCardProps) => {
  const [channelName, setChannelName] = useState<string | null>(null);
  const [channelAvatar, setChannelAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (channelId) {
      (supabase as any)
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", channelId)
        .maybeSingle()
        .then(({ data }: any) => {
          setChannelName(data?.display_name || null);
          setChannelAvatar(data?.avatar_url || null);
        });
    }
  }, [channelId]);

  const durationStr = formatDuration(duration);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group ${layout === "list" ? "flex gap-3" : ""}`}
    >
      {/* Thumbnail */}
      <Link to={`/watch/${id}`} className={`block shrink-0 ${layout === "list" ? "w-40 sm:w-44" : ""}`}>
        <div className="relative aspect-video sm:rounded-xl rounded-lg overflow-hidden bg-secondary">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <Eye className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
          {durationStr && (
            <span className="absolute bottom-1 right-1 px-1 py-0.5 text-[10px] font-medium bg-black/80 text-white rounded">
              {durationStr}
            </span>
          )}
        </div>
      </Link>

      {/* Info section */}
      <div className={`flex gap-3 px-3 sm:px-0 mt-2.5 ${layout === "list" ? "flex-1 mt-0" : ""}`}>
        {/* Channel avatar (hidden in list view) */}
        {layout === "grid" && (
          channelId ? (
            <Link to={`/channel/${channelId}`} className="shrink-0 mt-0.5">
              {channelAvatar ? (
                <img
                  src={channelAvatar}
                  alt={channelName || "Channel"}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary uppercase">
                    {(channelName || "C").charAt(0)}
                  </span>
                </div>
              )}
            </Link>
          ) : (
            <div className="w-9 h-9 shrink-0" />
          )
        )}

        {/* Title & metadata */}
        <div className="flex-1 min-w-0 pr-4 relative">
          <Link to={`/watch/${id}`}>
            <h3 className={`font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors ${layout === "list" ? "text-sm" : "text-sm"}`}>
              {title}
            </h3>
          </Link>
          <div className={`mt-0.5 flex ${layout === "list" ? "flex-col gap-0.5" : "flex-wrap items-center gap-x-1"}`}>
            {channelName && (
              <div className={`${layout === "list" ? "" : "flex items-center"}`}>
                <Link
                  to={`/channel/${channelId}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors line-clamp-1"
                >
                  {channelName}
                </Link>
                {layout === "grid" && <span className="text-xs text-muted-foreground ml-1">•</span>}
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {formatViews(views)} • {timeAgo(createdAt)}
            </span>
          </div>
          
          {/* Three-dot menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="absolute top-0 right-0 p-1 -mr-2 -mt-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-accent transition-all">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Save to Watch Later</DropdownMenuItem>
              <DropdownMenuItem>Add to playlist</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem>Not interested</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCard;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";

interface LikeButtonProps {
  videoId: string;
  className?: string;
}

import { useAuth } from "@/hooks/use-auth";

const LikeButton = ({ videoId, className = "" }: LikeButtonProps) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchLikes();
  }, [videoId, user]);

  const fetchLikes = async () => {
    try {
      // 1. Fetch current likes count from 'videos' table column 'likes'
      const { data: videoData } = await (supabase as any)
        .from("videos")
        .select("likes")
        .eq("id", videoId)
        .maybeSingle();

      setCount(videoData?.likes || 0);

      // 2. Fetch user's local liked state
      if (user) {
        const storedLikes = JSON.parse(localStorage.getItem(`liked_videos_${user.id}`) || "{}");
        setLiked(!!storedLikes[videoId]);
      }
    } catch (err) {
      console.error("Error fetching likes:", err);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast.error("Sign in to like");
      return;
    }
    
    // We update UI immediately (Optimistic Update)
    const storedLikes = JSON.parse(localStorage.getItem(`liked_videos_${user.id}`) || "{}");
    const isCurrentlyLiked = liked;
    
    let newCount = count;
    
    if (isCurrentlyLiked) {
      newCount = Math.max(0, count - 1);
      setLiked(false);
      delete storedLikes[videoId];
    } else {
      newCount = count + 1;
      setLiked(true);
      storedLikes[videoId] = true;
    }
    
    setCount(newCount);
    localStorage.setItem(`liked_videos_${user.id}`, JSON.stringify(storedLikes));

    try {
      // Update the 'likes' column in the 'videos' table directly:
      const { error: updateError } = await (supabase as any)
        .from("videos")
        .update({ likes: newCount })
        .eq("id", videoId);

      if (updateError) {
        console.error("Error updating likes count:", updateError.message);
      }
    } catch (error: any) {
      console.error("Unexpected error updating likes via RPC:", error);
    }
  };

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-lg backdrop-blur-md border border-white/10 ${
        liked
          ? "bg-purple-600/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] border-purple-500/30"
          : "bg-white/10 text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
      } ${className}`}
    >
      <ThumbsUp className={`w-4 h-4 ${liked ? "fill-purple-400 text-purple-400" : ""}`} />
      {count}
    </button>
  );
};

export default LikeButton;

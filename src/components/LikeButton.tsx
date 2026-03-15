import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";

interface LikeButtonProps {
  videoId: string;
}

const LikeButton = ({ videoId }: LikeButtonProps) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);

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
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-colors ${
        liked
          ? "bg-primary/15 text-primary"
          : "bg-secondary text-secondary-foreground hover:bg-accent"
      }`}
    >
      <ThumbsUp className={`w-4 h-4 ${liked ? "fill-primary" : ""}`} />
      {count}
    </button>
  );
};

export default LikeButton;

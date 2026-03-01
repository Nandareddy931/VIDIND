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
    const { count: total } = await (supabase as any)
      .from("video_likes")
      .select("*", { count: "exact", head: true })
      .eq("video_id", videoId);
    setCount(total || 0);

    if (user) {
      const { data } = await (supabase as any)
        .from("video_likes")
        .select("id")
        .eq("video_id", videoId)
        .eq("user_id", user.id)
        .maybeSingle();
      setLiked(!!data);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast.error("Sign in to like");
      return;
    }
    if (liked) {
      await (supabase as any)
        .from("video_likes")
        .delete()
        .eq("video_id", videoId)
        .eq("user_id", user.id);
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      await (supabase as any)
        .from("video_likes")
        .insert({ video_id: videoId, user_id: user.id });
      setLiked(true);
      setCount((c) => c + 1);
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

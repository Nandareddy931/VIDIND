import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile?: { display_name: string | null; avatar_url: string | null };
}

interface CommentSectionProps {
  videoId: string;
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const CommentSection = ({ videoId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    const { data } = await (supabase as any)
      .from("comments")
      .select("id, content, created_at, user_id")
      .eq("video_id", videoId)
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch profiles for comment authors
      const userIds = [...new Set(data.map((c: any) => c.user_id))];
      const { data: profiles } = await (supabase as any)
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      setComments(data.map((c: any) => ({ ...c, profile: profileMap.get(c.user_id) })));
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Sign in to comment");
      return;
    }
    if (!newComment.trim()) return;
    setLoading(true);
    const { error } = await (supabase as any).from("comments").insert({
      video_id: videoId,
      user_id: user.id,
      content: newComment.trim(),
    });
    if (error) {
      toast.error("Failed to post comment");
    } else {
      setNewComment("");
      fetchComments();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-foreground">{comments.length} Comments</h3>

      {/* Input */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-muted-foreground uppercase">
            {user?.email?.charAt(0) || "?"}
          </span>
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={user ? "Add a comment..." : "Sign in to comment"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={!user}
            className="w-full bg-transparent text-sm text-foreground border-b border-border py-2 pr-10 outline-none focus:border-primary placeholder:text-muted-foreground disabled:opacity-50"
          />
          {newComment.trim() && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
              {comment.profile?.avatar_url ? (
                <img src={comment.profile.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
              ) : (
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  {comment.profile?.display_name?.charAt(0) || "U"}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {comment.profile?.display_name || "User"}
                </span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(comment.created_at)}</span>
              </div>
              <p className="text-sm text-foreground/90 mt-0.5 leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;

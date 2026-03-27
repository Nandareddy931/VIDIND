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

import { useAuth } from "@/hooks/use-auth";

const CommentSection = ({ videoId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

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
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
        <span className="text-purple-400">{comments.length}</span> Comments
      </h3>

      {/* Input */}
      <div className="flex items-start gap-3 bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shrink-0 p-[2px]">
          <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white uppercase">
              {user?.email?.charAt(0) || "?"}
            </span>
          </div>
        </div>
        <div className="flex-1 relative">
          <textarea
            placeholder={user ? "Add a comment..." : "Sign in to comment"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={!user}
            rows={1}
            className="w-full bg-transparent text-sm text-white border-b border-white/20 py-2 pr-10 outline-none focus:border-purple-400 placeholder:text-gray-500 disabled:opacity-50 resize-none transition-colors"
          />
          {newComment.trim() && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="absolute right-0 bottom-2 p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-full transition-all"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-xl border border-white/5 transition-all shadow-sm">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
              {comment.profile?.avatar_url ? (
                <img src={comment.profile.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-sm font-bold text-gray-400 uppercase">
                  {comment.profile?.display_name?.charAt(0) || "U"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white truncate">
                  {comment.profile?.display_name || "User"}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(comment.created_at)}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              
              <div className="flex items-center gap-4 mt-3">
                 <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                 </button>
                 <button className="text-xs text-gray-500 hover:text-white transition-colors font-medium">
                    Reply
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;

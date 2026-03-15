import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import VideoCard from "@/components/VideoCard";

const Movies = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("videos")
        .select("*")
        .eq("category", "movies")
        .order("views", { ascending: false });
      setVideos(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <Layout title="Movies">
      <div className="px-4 py-3">
        <h2 className="text-lg font-bold text-foreground mb-3">Popular Movies</h2>
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-40 aspect-video bg-secondary rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3.5 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-20">No movies yet</p>
        ) : (
          <div className="space-y-3">
            {videos.map((video, idx) => (
              <a key={video.id} href={`/watch/${video.id}`} className="flex gap-3 group">
                <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-secondary shrink-0">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Thumb</div>
                  )}
                  <div className="absolute top-1 left-1 w-5 h-5 rounded bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1 py-0.5">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">{video.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{video.views} views</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Movies;

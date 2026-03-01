import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import VideoCard from "@/components/VideoCard";

const categories = ["All", "Trending", "Music", "Gaming", "Education", "Sports", "Comedy"];

const Index = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Sync active category from URL on mount / when location changes
    const params = new URLSearchParams(location.search);
    const cat = params.get("cat");
    if (cat) {
      const match = categories.find((c) => c.toLowerCase() === cat.toLowerCase());
      if (match) setActiveCategory(match);
      else setActiveCategory("All");
    } else {
      setActiveCategory((prev) => prev || "All");
    }
  }, [location.search]);

  useEffect(() => {
    fetchVideos();
  }, [activeCategory]);

  const fetchVideos = async () => {
    setLoading(true);
    let query = supabase.from("videos").select("*").order("created_at", { ascending: false });
    if (activeCategory !== "All") {
      query = query.eq("category", activeCategory.toLowerCase());
    }
    const { data } = await query;
    setVideos(data || []);
    setLoading(false);
  };

  const filtered = search
    ? videos.filter((v) => v.title.toLowerCase().includes(search.toLowerCase()))
    : videos;

  return (
    <Layout onSearch={setSearch} searchValue={search}>
      {/* Category chips */}
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar sticky top-14 z-30 bg-background">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              // update URL to reflect category
              if (cat === "All") {
                navigate("/", { replace: true });
              } else {
                navigate(`/?cat=${cat.toLowerCase()}`, { replace: true });
              }
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-foreground text-background"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="px-0 sm:px-4 md:px-6 lg:px-8 py-2">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-4 sm:gap-x-4 sm:gap-y-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-secondary rounded-xl mb-3" />
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-secondary rounded w-full mb-2" />
                    <div className="h-3 bg-secondary rounded w-3/4 mb-1.5" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">No videos yet. Be the first to upload!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-4 sm:gap-x-4 sm:gap-y-6">
            {filtered.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                title={video.title}
                thumbnailUrl={video.thumbnail_url}
                views={video.views}
                createdAt={video.created_at}
                category={video.category}
                channelId={video.user_id}
                duration={video.duration}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;

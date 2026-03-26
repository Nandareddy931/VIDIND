import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import VideoCard from "@/components/VideoCard";
import { Play, TrendingUp, BookOpen, Smile, Info } from "lucide-react";

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

  const trendingVideos = videos.filter(v => v.category === "trending").slice(0, 4);
  const learnVideos = videos.filter(v => ['education', 'learn'].includes(v.category?.toLowerCase())).slice(0, 4);
  const comedyVideos = videos.filter(v => v.category === "comedy").slice(0, 4);

  return (
    <Layout onSearch={setSearch} searchValue={search}>
      {/* Category chips */}
      <div className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar sticky top-[64px] z-30 bg-black/40 backdrop-blur-md border-b border-purple-900/30 shadow-sm">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              if (cat === "All") {
                navigate("/", { replace: true });
              } else {
                navigate(`/?cat=${cat.toLowerCase()}`, { replace: true });
              }
            }}
            className={`px-6 py-2.5 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-500 backdrop-blur-md border ${activeCategory === cat
                ? "bg-purple-600/90 text-white border-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.6)]"
                : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:-translate-y-0.5"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-6 sm:gap-x-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-white/10 rounded-xl mb-3" />
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-full mb-2" />
                    <div className="h-3 bg-white/10 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold mb-3 text-white">No videos found</h2>
            <p className="text-gray-400">Be the first to upload amazing content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 sm:gap-x-6">
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

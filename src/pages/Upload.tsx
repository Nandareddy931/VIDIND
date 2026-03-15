import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Upload as UploadIcon, Image, Film, Loader2 } from "lucide-react";
import { toast } from "sonner";

const categories = ["general", "trending", "movies", "music", "gaming", "education", "sports", "comedy"];

const UploadPage = () => {
  const navigate = useNavigate();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleThumbnailSelect = (file: File) => {
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setThumbnailPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!videoFile || !title.trim()) {
      toast.error("Please add a title and video file");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to upload videos");
      return;
    }

    setUploading(true);
    try {
      // Upload video
      const videoPath = `${user.id}/${Date.now()}-${videoFile.name}`;
      const { error: videoError } = await supabase.storage.from("videos").upload(videoPath, videoFile);
      if (videoError) throw videoError;
      const { data: videoUrlData } = supabase.storage.from("videos").getPublicUrl(videoPath);

      // Upload thumbnail
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbPath = `${user.id}/${Date.now()}-${thumbnailFile.name}`;
        const { error: thumbError } = await supabase.storage.from("thumbnails").upload(thumbPath, thumbnailFile);
        if (thumbError) throw thumbError;
        const { data: thumbUrlData } = supabase.storage.from("thumbnails").getPublicUrl(thumbPath);
        thumbnailUrl = thumbUrlData.publicUrl;
      }

      // Insert video record
      const { error: dbError } = await supabase.from("videos").insert({
        title: title.trim(),
        description: description.trim() || null,
        video_url: videoUrlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        user_id: user.id,
        category,
      });

      if (dbError) throw dbError;

      toast.success("Video uploaded successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout title="Upload">
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Video file picker */}
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
        <button
          onClick={() => videoInputRef.current?.click()}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 bg-secondary/50 hover:bg-secondary transition-colors"
        >
          {videoFile ? (
            <>
              <Film className="w-8 h-8 text-primary" />
              <span className="text-sm text-foreground font-medium">{videoFile.name}</span>
              <span className="text-xs text-muted-foreground">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</span>
            </>
          ) : (
            <>
              <UploadIcon className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tap to select video</span>
            </>
          )}
        </button>

        {/* Thumbnail picker */}
        <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleThumbnailSelect(e.target.files[0])} />
        <button
          onClick={() => thumbInputRef.current?.click()}
          className="w-full h-20 rounded-xl border border-dashed border-border flex items-center gap-3 px-4 bg-secondary/50 hover:bg-secondary transition-colors"
        >
          {thumbnailPreview ? (
            <img src={thumbnailPreview} alt="Thumbnail" className="w-14 h-14 rounded-lg object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-accent flex items-center justify-center">
              <Image className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <span className="text-sm text-muted-foreground">{thumbnailFile ? thumbnailFile.name : "Add thumbnail (optional)"}</span>
        </button>

        {/* Title */}
        <input
          type="text"
          placeholder="Video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-secondary text-foreground text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
        />

        {/* Description */}
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-secondary text-foreground text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground resize-none"
        />

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-secondary text-foreground text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
        >
          {categories.map((c) => (
            <option key={c} value={c} className="bg-card text-foreground capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={uploading || !videoFile || !title.trim()}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <UploadIcon className="w-4 h-4" />
              Upload Video
            </>
          )}
        </button>
      </div>
    </Layout>
  );
};

export default UploadPage;

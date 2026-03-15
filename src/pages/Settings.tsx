import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Camera, Save, Loader2, Lock, Bell, Palette, X, FileText, Eye, Trash2, Edit2, Grid3X3, ChevronRight, ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type SettingsCategory = "account" | "channel" | "privacy" | "notifications" | "appearance" | "videos";
type ViewMode = "list" | "detail";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  views: number;
  likes: number;
  created_at: string;
  duration: number;
  video_url: string;
}

const SettingsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("account");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Videos state
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editingSave, setEditingSave] = useState(false);
  const [videoViewMode, setVideoViewMode] = useState<"grid" | "list">("grid");

  // Settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    newSubscribers: true,
    comments: true,
  });
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile when user changes
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchVideos();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      // Fetch profile
      const { data } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || null);
      }

      // Fetch user role safely by testing common primary identifier columns one at a time.
      let roleRes: any = await (supabase as any)
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      // If 'id' returned no data (or threw an error if 'id' column doesn't exist), try 'user_id'
      if (roleRes.error || !roleRes.data) {
        const roleResAlt = await (supabase as any)
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (roleResAlt.data || roleResAlt.error) {
           roleRes = roleResAlt;
        }
      }
      
      console.log("Supabase Admin Role Check:", roleRes);

      if (roleRes && roleRes.data && roleRes.data.role) {
         setRole(roleRes.data.role);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
    setProfileLoading(false);
  };

  const fetchVideos = async () => {
    if (!user) return;
    setVideosLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("videos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load videos");
    }
    setVideosLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(`${publicUrl}?t=${Date.now()}`);
      toast.success("Avatar uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload avatar");
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const profileData = {
        user_id: user.id,
        display_name: displayName || null,
        bio: bio || null,
        avatar_url: avatarUrl?.split("?")[0] || null,
      };

      const { error } = await (supabase as any)
        .from("profiles")
        .upsert(profileData, { onConflict: "user_id" });

      if (error) throw error;
      toast.success("Profile saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success("Signed out successfully!");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const handleDeleteVideo = async (videoId: string, videoUrl: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    
    try {
      // Delete from database
      const { error } = await (supabase as any)
        .from("videos")
        .delete()
        .eq("id", videoId);

      if (error) throw error;

      // Try to delete from storage
      try {
        const path = videoUrl.split("/").pop();
        if (path) {
          await supabase.storage.from("videos").remove([path]);
        }
      } catch (storageError) {
        console.error("Storage delete error:", storageError);
      }

      setVideos(videos.filter(v => v.id !== videoId));
      toast.success("Video deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete video");
    }
  };

  const handleUpdateVideo = async () => {
    if (!editingVideo || !editTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    setEditingSave(true);
    try {
      const { error } = await (supabase as any)
        .from("videos")
        .update({
          title: editTitle,
          description: editDescription,
        })
        .eq("id", editingVideo.id);

      if (error) throw error;

      setVideos(
        videos.map(v =>
          v.id === editingVideo.id
            ? { ...v, title: editTitle, description: editDescription }
            : v
        )
      );
      setEditingVideo(null);
      toast.success("Video updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update video");
    } finally {
      setEditingSave(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const settingsMenu = [
    { id: "account" as SettingsCategory, label: "Account", description: "Email and password", icon: User },
    { id: "channel" as SettingsCategory, label: "Channel", description: "Channel name and avatar", icon: User },
    { id: "videos" as SettingsCategory, label: "Videos", description: "Manage your videos", icon: FileText },
    { id: "privacy" as SettingsCategory, label: "Privacy & Safety", description: "Control who sees your content", icon: Lock },
    { id: "notifications" as SettingsCategory, label: "Notifications", description: "Manage alerts and updates", icon: Bell },
    { id: "appearance" as SettingsCategory, label: "Appearance", description: "Change theme and colors", icon: Palette },
  ];

  const renderSettingsList = () => (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-3">
        {/* User info header */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Avatar" />
              ) : null}
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {(displayName || user?.email || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-foreground">{displayName || "Your Channel"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Settings menu items */}
        <div className="space-y-2">
          {settingsMenu.map(({ id, label, description, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveCategory(id);
                setViewMode("detail");
              }}
              className="w-full text-left bg-card rounded-xl border border-border p-4 hover:bg-accent/50 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">{label}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>
          ))}
          {role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="w-full text-left bg-card rounded-xl border border-border p-4 hover:bg-accent/50 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                    <Shield className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">Dashboard</p>
                    <p className="text-sm text-muted-foreground">Access the Admin Panel to manage platform settings</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Account</h2>
      
      {/* Account info */}
      <div className="bg-card rounded-lg border border-border p-4">
        <p className="text-sm font-medium text-muted-foreground mb-1">Email Address</p>
        <p className="text-foreground font-medium">{user?.email}</p>
      </div>

      {/* Change password */}
      <button className="w-full text-left p-4 bg-card rounded-lg border border-border hover:bg-accent/50 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Password</p>
            <p className="text-xs text-muted-foreground">Update your password</p>
          </div>
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
      </button>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full py-3 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );

  const renderChannelSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Channel</h2>

      {profileLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Avatar section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <p className="text-sm font-medium text-foreground mb-4">Channel Picture</p>
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="w-20 h-20">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="Avatar" />
                  ) : null}
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {(displayName || user?.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max 5 MB</p>
              </div>
            </div>
          </div>

          {/* Channel name */}
          <div className="bg-card rounded-lg border border-border p-6">
            <label className="text-sm font-medium text-foreground block mb-2">Channel Name</label>
            <input
              type="text"
              placeholder="Your channel name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="w-full bg-secondary text-foreground text-sm rounded-lg px-4 py-3 outline-none border border-border focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-2">{displayName.length}/50</p>
          </div>

          {/* Bio/Description */}
          <div className="bg-card rounded-lg border border-border p-6">
            <label className="text-sm font-medium text-foreground block mb-2">Description</label>
            <textarea
              placeholder="Tell viewers about your channel"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              rows={4}
              className="w-full bg-secondary text-foreground text-sm rounded-lg px-4 py-3 outline-none border border-border focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">{bio.length}/300</p>
          </div>

          {/* Save */}
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      )}
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Privacy & Safety</h2>

      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Private Account</p>
            <p className="text-xs text-muted-foreground">Your channel will not be visible to others</p>
          </div>
          <input type="checkbox" className="w-5 h-5 rounded" />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Allow Comments</p>
            <p className="text-xs text-muted-foreground">People can comment on your videos</p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Block Users</p>
            <p className="text-xs text-muted-foreground">Manage blocked users</p>
          </div>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Manage</button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Notifications</h2>

      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Email Notifications</p>
            <p className="text-xs text-muted-foreground">Get updates via email</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.emailNotifications}
            onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">New Subscribers</p>
            <p className="text-xs text-muted-foreground">Notify when someone subscribes</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.newSubscribers}
            onChange={(e) => setNotifications({ ...notifications, newSubscribers: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">New Comments</p>
            <p className="text-xs text-muted-foreground">Notify when someone comments</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.comments}
            onChange={(e) => setNotifications({ ...notifications, comments: e.target.checked })}
            className="w-5 h-5 rounded"
          />
        </div>
      </div>

      <button className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors">
        Save Notification Settings
      </button>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Appearance</h2>

      <div className="bg-card rounded-lg border border-border p-6">
        <p className="text-sm font-medium text-foreground mb-4">Theme</p>
        <div className="space-y-3">
          {["light", "dark", "system"].map((t) => (
            <label key={t} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="theme"
                value={t}
                checked={theme === t}
                onChange={(e) => setTheme(e.target.value as any)}
                className="w-4 h-4 rounded-full"
              />
              <span className="text-sm font-medium text-foreground capitalize">{t} Theme</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVideosSettings = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">Your Videos</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVideoViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              videoViewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-accent"
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setVideoViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              videoViewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-accent"
            }`}
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>
      </div>

      {editingVideo && (
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Edit Video</h3>
            <button
              onClick={() => setEditingVideo(null)}
              className="p-1.5 text-muted-foreground hover:bg-accent rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              maxLength={100}
              className="w-full bg-secondary text-foreground text-sm rounded-lg px-4 py-3 outline-none border border-border focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">{editTitle.length}/100</p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              maxLength={5000}
              rows={4}
              className="w-full bg-secondary text-foreground text-sm rounded-lg px-4 py-3 outline-none border border-border focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">{editDescription.length}/5000</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUpdateVideo}
              disabled={editingSave}
              className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {editingSave ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            <button
              onClick={() => setEditingVideo(null)}
              className="flex-1 py-2 rounded-lg bg-secondary text-foreground font-medium text-sm hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {videosLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No videos uploaded yet</p>
        </div>
      ) : (
        <div
          className={
            videoViewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }
        >
          {videos.map((video) => (
            <div
              key={video.id}
              className={`bg-card rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-colors ${
                videoViewMode === "list" ? "flex gap-4" : ""
              }`}
            >
              {/* Thumbnail */}
              <div
                className={`${
                  videoViewMode === "list"
                    ? "w-32 h-24 flex-shrink-0"
                    : "w-full aspect-video"
                } bg-secondary relative group cursor-pointer`}
              >
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className={`${videoViewMode === "list" ? "flex-1 py-3 px-4" : "p-4"} flex flex-col`}>
                <h3 className="font-semibold text-foreground line-clamp-2 text-sm sm:text-base">
                  {video.title}
                </h3>

                {videoViewMode === "list" && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {video.description}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground mt-2 flex-1">
                  <span>{formatDate(video.created_at)}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {video.views} views
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setEditingVideo(video);
                      setEditTitle(video.title);
                      setEditDescription(video.description || "");
                    }}
                    className="flex-1 py-2 px-3 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(video.id, video.video_url)}
                    className="flex-1 py-2 px-3 bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Layout title="Settings">
      {!user ? (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <User className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Sign In Required</h2>
            <p className="text-muted-foreground">Please sign in to access settings</p>
          </div>
        </div>
      ) : viewMode === "list" ? (
        // Settings List View
        <div className="min-h-screen bg-background flex flex-col">
          <div className="flex-1 py-6 px-4 sm:py-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-foreground mb-8">Settings</h1>
              {renderSettingsList()}
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t border-border bg-card py-6 px-4 sm:py-8 mt-8">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-sm text-muted-foreground">
                Developed by <span className="font-semibold text-foreground">SOMALA NANDA KISHORE REDDY</span>
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Settings Detail View
        <div className="min-h-screen bg-background flex flex-col">
          {/* Header with back button */}
          <div className="sticky top-0 z-40 bg-card border-b border-border">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
              <button
                onClick={() => setViewMode("list")}
                className="p-2 text-muted-foreground hover:bg-accent rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-foreground capitalize">
                {activeCategory === "videos" ? "Videos" : activeCategory.replace(/([A-Z])/g, " $1").trim()}
              </h2>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              {activeCategory === "account" && renderAccountSettings()}
              {activeCategory === "channel" && renderChannelSettings()}
              {activeCategory === "privacy" && renderPrivacySettings()}
              {activeCategory === "notifications" && renderNotificationSettings()}
              {activeCategory === "appearance" && renderAppearanceSettings()}
              {activeCategory === "videos" && renderVideosSettings()}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-card py-6 px-4 sm:py-8 mt-8">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-sm text-muted-foreground">
                Developed by <span className="font-semibold text-foreground">SOMALA NANDA KISHORE REDDY</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SettingsPage;

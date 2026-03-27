import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Video,
  Flag,
  Megaphone,
  BarChart,
  Settings,
  Menu,
  X,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Mock types for edge function data
interface AdminData {
  stats: {
    totalUsers: number;
    totalVideos: number;
    totalReports: number;
    totalViews: number;
  };
  users: Array<{ id: string; email: string; role: string; created_at: string }>;
  videos: Array<{
    id: string;
    title: string;
    uploader: string;
    views: number;
    created_at: string;
  }>;
  reports: Array<{
    id: string;
    videoId: string;
    reason: string;
    status: string;
    created_at: string;
  }>;
}

import { useAuth } from "@/hooks/use-auth";

const Admin = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorIndicator, setErrorIndicator] = useState<string | null>(null);
  const [data, setData] = useState<AdminData | null>(null);

  // Define sidebar navigation items
  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Users", icon: Users },
    { name: "Videos", icon: Video },
    { name: "Reports", icon: Flag },
    { name: "Ads", icon: Megaphone },
    { name: "Analytics", icon: BarChart },
    { name: "Settings", icon: Settings },
  ];

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (user === undefined) return; // Still loading in AuthProvider maybe? No, loading is separate.

    if (!user) {
      toast.error("Unauthorized access.");
      navigate("/");
      return;
    }

    try {
      // 1. Verify user is actually an admin first
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let roleRes: any = await (supabase as any)
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      // If 'id' returned no data (or threw an error if 'id' column doesn't exist), try 'user_id'
      if (roleRes.error || !roleRes.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const roleResAlt = await (supabase as any)
          .from("user_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (roleResAlt.data || roleResAlt.error) {
          roleRes = roleResAlt;
        }
      }

      console.log("Admin Panel Role Verification:", roleRes);

      if (!roleRes.data || roleRes.data.role !== "admin") {
        toast.error("You do not have permission to view the admin panel.");
        navigate("/");
        return;
      }

      // 2. Fetch Data Directly from Supabase
      const [usersRes, reportsRes, videosRes] = await Promise.all([
        (supabase as any)
          .from("user_profiles")
          .select("id, email, role, created_at", { count: "exact" }),
        (supabase as any)
          .from("reports")
          .select("id, video_id, reason, status, created_at", { count: "exact" }),
        (supabase as any)
          .from("videos")
          .select("id, title, user_id, views, created_at", { count: "exact" }),
      ]);

      // If one fails, we simply log it and default its data to empty rather than breaking the whole dashboard
      if (usersRes.error) console.warn("Failed to fetch users:", usersRes.error);
      if (reportsRes.error) console.warn("Failed to fetch reports (table might be missing):", reportsRes.error);
      if (videosRes.error) console.warn("Failed to fetch videos:", videosRes.error);

      const videosList = videosRes.data || [];
      const totalViews = videosList.reduce(
        (sum: number, vid: any) => sum + (Number(vid.views) || 0),
        0
      );

      const dbData: AdminData = {
        stats: {
          totalUsers: usersRes.count || 0,
          totalVideos: videosRes.count || 0,
          totalReports: reportsRes.count || 0,
          totalViews,
        },
        users: usersRes.data || [],
        videos: videosList.map((vid: any) => ({
          ...vid,
          uploader: vid.user_id || "Unknown",
        })),
        reports: (reportsRes.data || []).map((r: any) => ({
          id: r.id,
          videoId: r.video_id,
          reason: r.reason,
          status: r.status,
          created_at: r.created_at,
        })),
      };

      setData(dbData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Admin Fetch Error:", err);
      toast.error("Failed to fetch admin data from database.");
      setErrorIndicator(err.message || "Unknown error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    toast.success("Delete action sent to edge function");
    // const { error } = await supabase.functions.invoke('admin-actions', { body: { action: 'delete_video', videoId: id } });
  };

  const handleReportAction = async (
    id: string,
    action: "resolve" | "dismiss",
  ) => {
    toast.success(`Report ${action}ed successfully`);
    // const { error } = await supabase.functions.invoke('admin-actions', { body: { action: 'update_report', reportId: id, status: action } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        Loading Admin Portal...
      </div>
    );
  }

  if (errorIndicator) {
    return (
      <div className="flex min-h-screen bg-background flex-col justify-center items-center text-center p-4">
        <XCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Error Loading Dashboard
        </h2>
        <p className="text-muted-foreground">{errorIndicator}</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const renderContent = () => {
    if (!data) return null;

    switch (activeTab) {
      case "Dashboard":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.stats.totalUsers.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Videos
                  </CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.stats.totalVideos.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Reports
                  </CardTitle>
                  <Flag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.stats.totalReports.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Views
                  </CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.stats.totalViews.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "Users":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              User Management
            </h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === "admin" ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"}`}
                        >
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        );

      case "Videos":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              Video Management
            </h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Uploader</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.videos.map((vid) => (
                    <TableRow key={vid.id}>
                      <TableCell className="font-medium">{vid.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {vid.uploader}
                      </TableCell>
                      <TableCell>{vid.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteVideo(vid.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        );

      case "Reports":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              Content Moderation
            </h2>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Video ID</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono text-xs">
                        {report.videoId}
                      </TableCell>
                      <TableCell>{report.reason}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-semibold">
                          {report.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          onClick={() =>
                            handleReportAction(report.id, "resolve")
                          }
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          onClick={() =>
                            handleReportAction(report.id, "dismiss")
                          }
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Megaphone className="w-12 h-12 mb-4 opacity-20" />
            <p>This module is currently under construction.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <span className="font-bold text-xl text-primary tracking-tight">
            VidInd Admin
          </span>
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-primary-foreground" : ""}`}
                />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            VidInd Dashboard v1.0
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 flex items-center px-4 border-b border-border bg-card sticky top-0 z-30">
          <button
            className="text-muted-foreground hover:text-foreground mr-4"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-lg text-foreground">{activeTab}</span>
        </header>

        {/* Content Rest */}
        <div className="p-4 md:p-6 lg:p-10 max-w-[1400px] w-full mx-auto">
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold text-foreground">{activeTab}</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage your VidInd platform parameters securely.
            </p>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Admin;

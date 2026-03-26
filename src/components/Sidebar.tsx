import { useLocation, Link } from "react-router-dom";
import { Home, Film, Upload, Users, Settings, Flame, Music, Gamepad2, GraduationCap, Trophy, Laugh } from "lucide-react";
import { cn } from "@/lib/utils";

const mainItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Film, label: "Movies", path: "/movies" },
  { icon: Users, label: "Subscriptions", path: "/subscriptions" },
];

const exploreItems = [
  { icon: Flame, label: "Trending", path: "/?cat=trending" },
  { icon: Music, label: "Music", path: "/?cat=music" },
  { icon: Gamepad2, label: "Gaming", path: "/?cat=gaming" },
  { icon: GraduationCap, label: "Education", path: "/?cat=education" },
  { icon: Trophy, label: "Sports", path: "/?cat=sports" },
  { icon: Laugh, label: "Comedy", path: "/?cat=comedy" },
];

const bottomItems = [
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname + location.search === path || (path === "/" && location.pathname === "/" && !location.search);

  const NavItem = ({ icon: Icon, label, path }: { icon: any; label: string; path: string }) => (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border",
        isActive(path)
          ? "bg-purple-600/20 text-purple-300 border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.2)] pointer-events-none"
          : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:translate-x-1"
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );

  return (
    <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-[220px] flex-col z-20 bg-black/40 backdrop-blur-xl border-r border-purple-900/50 overflow-y-auto py-3 px-2">
      <div className="flex flex-col gap-0.5">
        {mainItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </div>

      <div className="my-3 h-px bg-purple-900/30" />

      <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Explore</p>
      <div className="flex flex-col gap-0.5">
        {exploreItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </div>

      <div className="mt-auto pt-3">
        <div className="h-px bg-purple-900/30 mb-3" />
        <div className="flex flex-col gap-0.5">
          {bottomItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

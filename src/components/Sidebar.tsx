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
        "flex items-center gap-5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
        isActive(path)
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{label}</span>
    </Link>
  );

  return (
    <aside className="hidden md:flex fixed left-0 top-14 bottom-0 w-[220px] flex-col z-20 bg-background border-r border-border overflow-y-auto py-3 px-2">
      <div className="flex flex-col gap-0.5">
        {mainItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </div>

      <div className="my-3 h-px bg-border" />

      <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Explore</p>
      <div className="flex flex-col gap-0.5">
        {exploreItems.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </div>

      <div className="mt-auto pt-3">
        <div className="h-px bg-border mb-3" />
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

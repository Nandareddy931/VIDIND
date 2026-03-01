import { ReactNode, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import { Search, Bell, User, X, Upload } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  onSearch?: (query: string) => void;
  searchValue?: string;
  showSearch?: boolean;
  hideSidebar?: boolean;
}

const Layout = ({ children, title, showHeader = true, onSearch, searchValue, showSearch = true, hideSidebar = false }: LayoutProps) => {
  const [user, setUser] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue || "");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setLocalSearch(searchValue || "");
  }, [searchValue]);

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    onSearch?.(val);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showHeader && (
        <header className="sticky top-0 z-40 glass-surface border-b border-border">
          <div className="flex items-center h-14 px-4 gap-3">
            {searchOpen ? (
              <div className="flex items-center flex-1 gap-2">
                <button onClick={() => { setSearchOpen(false); handleSearchChange(""); }} className="p-1.5 -ml-1">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
                <div className="relative flex-1 max-w-2xl">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search"
                    value={localSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full bg-secondary text-foreground text-sm rounded-full pl-4 pr-10 py-2 outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground border border-border"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ) : (
              <>
                {/* Logo */}
                <Link to="/" className="flex items-center shrink-0">
                  <img src= "logo.ico"
                  alt="VidInd Logo"
                  className="h-10 w-10 rounded-full object-cover" />
                </Link>

                {/* Desktop search bar - centered YouTube style */}
                {showSearch && (
                  <div className="hidden sm:flex flex-1 justify-center">
                    <div className="relative w-full max-w-xl">
                      <input
                        type="text"
                        placeholder="Search"
                        value={localSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full bg-background text-foreground text-sm rounded-full pl-4 pr-12 py-2 outline-none border border-border focus:border-primary/60 placeholder:text-muted-foreground"
                      />
                      <button className="absolute right-0 top-0 h-full px-4 bg-secondary rounded-r-full border border-l-0 border-border hover:bg-accent transition-colors">
                        <Search className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Right actions */}
                <div className="flex items-center gap-1 ml-auto">
                  {showSearch && (
                    <button onClick={() => setSearchOpen(true)} className="sm:hidden p-2 rounded-full hover:bg-accent transition-colors">
                      <Search className="w-5 h-5 text-foreground" />
                    </button>
                  )}
                  <Link to="/upload" className="hidden md:flex p-2 rounded-full hover:bg-accent transition-colors">
                    <Upload className="w-5 h-5 text-foreground" />
                  </Link>
                  <button className="p-2 rounded-full hover:bg-accent transition-colors relative">
                    <Bell className="w-5 h-5 text-foreground" />
                  </button>
                  <Link to={user ? "/settings" : "/signin"} className="ml-0.5">
                    {user ? (
                      <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                        <span className="text-xs font-bold text-primary uppercase">
                          {user.email?.charAt(0) || "U"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/60 hover:bg-primary/10 transition-colors">
                        <User className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-primary hidden sm:inline">Sign in</span>
                      </div>
                    )}
                  </Link>
                </div>
              </>
            )}
          </div>
        </header>
      )}

      <div className="flex flex-1">
        {!hideSidebar && <Sidebar />}
        <main className={`flex-1 min-w-0 safe-bottom md:pb-0 ${!hideSidebar ? "md:ml-[220px]" : ""}`}>
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default Layout;

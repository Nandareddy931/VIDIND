import { ReactNode, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import { Search, Bell, User, X, Upload, Sparkles } from "lucide-react";

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
    <div className="min-h-screen flex flex-col bg-transparent text-white">
      {showHeader && (
        <header className="sticky top-0 z-40 w-full bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(147,51,234,0.15)]">
          <div className="flex items-center h-16 px-4 md:px-8 gap-4">
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
                    className="w-full bg-black/60 text-white text-sm rounded-full pl-4 pr-10 py-2.5 outline-none focus:ring-1 focus:ring-purple-500/50 placeholder:text-gray-400 border border-purple-800/30"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ) : (
              <>
                {/* Logo */}
                <Link to="/" className="flex items-center shrink-0 gap-2">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 p-[1px]">
                    <img src="logo.ico" alt="VidInd Logo" className="h-full w-full rounded-full object-cover" />
                  </div>
                  <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 hidden sm:block drop-shadow-sm">
                    VidInd
                  </span>
                </Link>

                {/* Desktop search bar - centered YouTube style */}
                {showSearch && (
                  <div className="hidden sm:flex flex-1 justify-center">
                    <div className="relative w-full max-w-xl">
                      <input
                        type="text"
                        placeholder="Search for videos, creators, or topics"
                        value={localSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full bg-white/5 backdrop-blur-md text-white text-sm rounded-full pl-5 pr-14 py-2 outline-none border border-white/10 focus:border-purple-500/50 focus:bg-white/10 transition-all shadow-inner"
                      />
                      <button className="absolute right-0 top-0 h-full px-5 bg-white/5 rounded-r-full border border-l-0 border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center">
                        <Search className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Right actions */}
                <div className="flex items-center gap-2 md:gap-4 ml-auto">
                  {showSearch && (
                    <button onClick={() => setSearchOpen(true)} className="sm:hidden p-2 rounded-full hover:bg-white/10 transition-colors">
                      <Search className="w-5 h-5 text-gray-300" />
                    </button>
                  )}
                  
                  {/* Ask Pori Button */}
                  <button className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-white/20 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:-translate-y-0.5 transition-all">
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>Ask Pori</span>
                  </button>

                  <button className="p-2 rounded-full hover:bg-white/10 transition-colors relative">
                    <Bell className="w-5 h-5 text-gray-300" />
                  </button>
                  <Link to={user ? "/settings" : "/signin"} className="ml-0.5">
                    {user ? (
                      <div className="w-8 h-8 rounded-full bg-purple-600/20 border-2 border-purple-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-400 uppercase">
                          {user.email?.charAt(0) || "U"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/60 hover:bg-purple-500/10 transition-colors">
                        <User className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-medium text-purple-400 hidden sm:inline">Sign in</span>
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

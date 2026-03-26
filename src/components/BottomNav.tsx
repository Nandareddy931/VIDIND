import { useLocation, Link } from "react-router-dom";
import { Home, Film, Plus, Users, Settings } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Film, label: "Movies", path: "/movies" },
  { icon: Plus, label: "", path: "/upload", isUpload: true },
  { icon: Users, label: "Subs", path: "/subscriptions" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-t border-purple-900/50 md:hidden">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          if (item.isUpload) {
            return (
              <Link key={item.path} to={item.path} className="relative -mt-6">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30 border border-purple-400/20"
                >
                  <Plus className="w-7 h-7 text-white" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center gap-0.5 py-1 px-3 relative">
              <motion.div whileTap={{ scale: 0.85 }}>
                <item.icon
                  className={`w-5 h-5 transition-colors ${isActive ? "text-purple-400" : "text-gray-500"
                    }`}
                />
              </motion.div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-purple-400" : "text-gray-500"
                }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

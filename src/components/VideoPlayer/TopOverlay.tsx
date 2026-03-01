import { motion } from "framer-motion";
import { ChevronLeft, MoreVertical } from "lucide-react";

interface TopOverlayProps {
  title: string;
  onBack?: () => void;
  onShowMore: () => void;
  showMoreMenu: boolean;
}

const TopOverlay = ({ title, onBack, onShowMore, showMoreMenu }: TopOverlayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-3 pointer-events-auto"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="p-2 hover:bg-white/20 rounded-full transition-colors group"
        aria-label="Go back"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Scrolling Title */}
      <div className="flex-1 mx-4 overflow-hidden">
        <motion.div
          className="text-white font-semibold truncate text-center px-2"
          animate={{
            x: title.length > 40 ? [0, -1000, 0] : 0,
          }}
          transition={{
            duration: title.length > 40 ? 8 : 0,
            repeat: title.length > 40 ? Infinity : 0,
            ease: "linear",
          }}
          title={title}
        >
          {title}
        </motion.div>
      </div>

      {/* More Options Menu Button */}
      <button
        onClick={onShowMore}
        className={`p-2 rounded-full transition-all ${
          showMoreMenu ? "bg-white/30" : "hover:bg-white/20"
        }`}
        aria-label="More options"
        aria-expanded={showMoreMenu}
      >
        <MoreVertical className="w-6 h-6 text-white" />
      </button>
    </motion.div>
  );
};

export default TopOverlay;

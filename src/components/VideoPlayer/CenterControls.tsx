import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

interface CenterControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  doubleClickSide: "left" | "right" | null;
}

const CenterControls = ({
  isPlaying,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  doubleClickSide,
}: CenterControlsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-center justify-center gap-8 pointer-events-none"
    >
      {/* Rewind Button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onSkipBack();
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 text-white/70 hover:text-white transition-colors pointer-events-auto group"
        aria-label="Rewind 10 seconds"
      >
        <motion.div
          animate={doubleClickSide === "left" ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        >
          <SkipBack className="w-8 h-8 group-hover:drop-shadow-lg transition-all" />
        </motion.div>
      </motion.button>

      {/* Play/Pause Button - Large Center Button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onPlayPause();
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="pointer-events-auto relative"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        <motion.div
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-colors"
          animate={{ scale: isPlaying ? 1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{ scale: isPlaying ? 1 : 1.1 }}
            transition={{ duration: 0.2 }}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-white fill-white ml-0" />
            ) : (
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            )}
          </motion.div>
        </motion.div>
      </motion.button>

      {/* Forward Button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          onSkipForward();
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 text-white/70 hover:text-white transition-colors pointer-events-auto group"
        aria-label="Forward 10 seconds"
      >
        <motion.div
          animate={doubleClickSide === "right" ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        >
          <SkipForward className="w-8 h-8 group-hover:drop-shadow-lg transition-all" />
        </motion.div>
      </motion.button>
    </motion.div>
  );
};

export default CenterControls;

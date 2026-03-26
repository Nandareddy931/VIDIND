import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Share2, 
  Copy, 
  Twitter, 
  Facebook, 
  Send, 
  MessageCircle,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  videoId: string;
  onShare: () => void;
}

const ShareModal = ({ isOpen, onClose, videoTitle, videoId, onShare }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://vidind.vercel.app/watch/${videoId}`;
  const encodedTitle = encodeURIComponent(`Check out this video on VidInd: ${videoTitle}`);
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      onShare(); // Increment share count
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const platforms = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-6 h-6 text-[#25D366]" />,
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:bg-[#25D366]/10"
    },
    {
      name: "Telegram",
      icon: <Send className="w-6 h-6 text-[#0088cc]" />,
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:bg-[#0088cc]/10"
    },
    {
      name: "Twitter",
      icon: <Twitter className="w-6 h-6 text-[#1DA1F2]" />,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "hover:bg-[#1DA1F2]/10"
    },
    {
      name: "Facebook",
      icon: <Facebook className="w-6 h-6 text-[#1877F2]" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-[#1877F2]/10"
    }
  ];

  const handlePlatformShare = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    onShare(); // Increment share count
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Share</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-4">
          {/* Social Icons Grid */}
          <div className="flex justify-between items-center px-2">
            {platforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handlePlatformShare(platform.url)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${platform.color} group`}
              >
                <div className="transition-transform group-hover:scale-110">
                  {platform.icon}
                </div>
                <span className="text-xs font-medium text-muted-foreground">{platform.name}</span>
              </button>
            ))}
          </div>

          {/* Copy Link Section */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground ml-1">Copy link</span>
            <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-xl border border-border">
              <Input 
                value={shareUrl} 
                readOnly 
                className="bg-transparent border-none focus-visible:ring-0 text-sm h-9"
              />
              <Button 
                onClick={handleCopyLink}
                size="sm"
                className="rounded-lg px-4 h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : "Copy"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;

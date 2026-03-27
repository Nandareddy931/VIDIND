import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscribeButtonProps {
  channelId: string;
  className?: string;
}

import { useAuth } from "@/hooks/use-auth";

const SubscribeButton = ({ channelId, className = "" }: SubscribeButtonProps) => {
  const [subscribed, setSubscribed] = useState(false);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && channelId) {
      checkSubscription();
    }
  }, [user, channelId]);

  const checkSubscription = async () => {
    const { data } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("subscriber_id", user.id)
      .eq("channel_id", channelId)
      .maybeSingle();
    setSubscribed(!!data);
  };

  const toggle = async () => {
    if (!user) {
      toast.error("Sign in to subscribe");
      return;
    }
    if (user.id === channelId) return;
    setLoading(true);
    if (subscribed) {
      await supabase
        .from("subscriptions")
        .delete()
        .eq("subscriber_id", user.id)
        .eq("channel_id", channelId);
      setSubscribed(false);
    } else {
      await supabase
        .from("subscriptions")
        .insert({ subscriber_id: user.id, channel_id: channelId });
      setSubscribed(true);
    }
    setLoading(false);
  };

  if (user?.id === channelId) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg backdrop-blur-md border ${
        subscribed
          ? "bg-white/10 text-gray-300 hover:bg-white/20 border-white/10"
          : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 border-purple-500/50"
      } ${className}`}
    >
      {subscribed ? "Subscribed" : "Subscribe"}
    </button>
  );
};

export default SubscribeButton;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscribeButtonProps {
  channelId: string;
  className?: string;
}

const SubscribeButton = ({ channelId, className = "" }: SubscribeButtonProps) => {
  const [subscribed, setSubscribed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

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
      className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
        subscribed
          ? "bg-secondary text-secondary-foreground hover:bg-accent"
          : "bg-foreground text-background hover:opacity-90"
      } ${className}`}
    >
      {subscribed ? "Subscribed" : "Subscribe"}
    </button>
  );
};

export default SubscribeButton;

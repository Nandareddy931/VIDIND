import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in");
      navigate(-1);
    } catch (err: any) {
      toast.error(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success("Account created — you can now sign in");
      setMode("signin");
    } catch (err: any) {
      toast.error(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={mode === "signin" ? "Sign in" : "Create account"}>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">{mode === "signin" ? "Sign in" : "Create account"}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {mode === "signin"
              ? "Sign in with your email and password."
              : "Create an account using your email and a password."}
          </p>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background text-foreground rounded-lg px-3 py-2 mb-3 border border-border outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background text-foreground rounded-lg px-3 py-2 mb-3 border border-border outline-none"
          />

          {mode === "signin" ? (
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          ) : (
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          )}

          <div className="mt-4 text-center text-sm">
            {mode === "signin" ? (
              <>
                <span className="text-muted-foreground">Don't have an account?</span>{" "}
                <button className="text-primary font-medium" onClick={() => setMode("signup")}>Create account</button>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">Already have an account?</span>{" "}
                <button className="text-primary font-medium" onClick={() => setMode("signin")}>Sign in</button>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignInPage;

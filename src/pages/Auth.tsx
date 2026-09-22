import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.svg";
import {
  ArrowRight,
  Loader2,
  UserPlus,
  LogIn,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  const [mode, setMode] = useState<"menu" | "register" | "login">("menu");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await signIn("password", { username, password, flow: "signUp" });
      setSuccess("Account created! Welcome to the underworld.");
      setTimeout(() => navigate(redirect), 600);
    } catch (err) {
      console.error("Register error:", err);
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg.replace(/^[A-Z]+:?\s*/, "") || msg);
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await signIn("password", { username, password, flow: "signIn" });
      setSuccess("Welcome back!");
      setTimeout(() => navigate(redirect), 600);
    } catch (err) {
      console.error("Login error:", err);
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg.replace(/^[A-Z]+:?\s*/, "") || msg);
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (err) {
      console.error("Guest login error:", err);
      setError("Failed to sign in as guest");
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setError(null);
    setSuccess(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="flex items-center justify-center h-full flex-col">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <img
              src={logo}
              alt="Shadow Empire"
              width={80}
              height={80}
              className="rounded-xl mb-4 mx-auto cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate("/")}
            />
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 mb-2">
              SHADOW EMPIRE
            </h1>
            <p className="text-gray-400 text-sm">Rule the underworld. Own the streets.</p>
          </div>

          <Card className="min-w-[380px] border border-gray-700/50 bg-gray-900/90 backdrop-blur-xl shadow-2xl shadow-red-500/10">
            {mode === "menu" && (
              <>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-white">Enter the Game</CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose how to enter the streets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-6 text-lg"
                    onClick={() => { setMode("register"); resetForm(); }}
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Account
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-6 text-lg"
                    onClick={() => { setMode("login"); resetForm(); }}
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </Button>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-900 px-2 text-gray-500">Or</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 py-5"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    {isLoading ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Continue as Guest"
                    )}
                  </Button>
                </CardContent>
              </>
            )}

            {mode === "register" && (
              <>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-white flex items-center justify-center gap-2">
                    <UserPlus className="h-5 w-5 text-yellow-400" />
                    Create Account
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Choose your street name and password
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Username</label>
                      <Input
                        placeholder="Street name (3-20 chars)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-yellow-500"
                        disabled={isLoading}
                        required
                        minLength={3}
                        maxLength={20}
                      />
                      <p className="text-xs text-gray-500 mt-1">Letters, numbers, underscores only</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 4 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-yellow-500 pr-10"
                          disabled={isLoading}
                          required
                          minLength={4}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    {error && (
                      <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">{error}</p>
                    )}
                    {success && (
                      <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded p-2">{success}</p>
                    )}
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold"
                      disabled={isLoading || username.length < 3 || password.length < 4}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-4 w-4" />
                      )}
                      Create Account
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => { setMode("menu"); resetForm(); }}
                      disabled={isLoading}
                      className="text-gray-400 hover:text-white"
                    >
                      ← Back
                    </Button>
                  </CardFooter>
                </form>
              </>
            )}

            {mode === "login" && (
              <>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-white flex items-center justify-center gap-2">
                    <LogIn className="h-5 w-5 text-blue-400" />
                    Sign In
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Enter your credentials to return to the streets
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Username</label>
                      <Input
                        placeholder="Your street name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 pr-10"
                          disabled={isLoading}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    {error && (
                      <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">{error}</p>
                    )}
                    {success && (
                      <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded p-2">{success}</p>
                    )}
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold"
                      disabled={isLoading || username.length < 1 || password.length < 1}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogIn className="mr-2 h-4 w-4" />
                      )}
                      Sign In
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => { setMode("menu"); resetForm(); }}
                      disabled={isLoading}
                      className="text-gray-400 hover:text-white"
                    >
                      ← Back
                    </Button>
                  </CardFooter>
                </form>
              </>
            )}

            <div className="py-3 px-6 text-xs text-center text-gray-500 bg-gray-800/50 border-t border-gray-700/50 rounded-b-lg">
              Shadow Empire — Powered by{" "}
              <a
                href="https://freebuff.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-400 transition-colors"
              >
                freebuff.com
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}

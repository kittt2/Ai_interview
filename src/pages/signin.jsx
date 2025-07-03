import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { auth } from "../../firebase/client";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Chrome, Loader2 } from "lucide-react";

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onEmailLogin = async (data) => {
    setIsLoading(true);
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      console.log("User logged in:", userCredential.user);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error.message);
      // Better error messages
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    
    // Add additional scopes if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    // Configure for production
    provider.setCustomParameters({
      prompt: 'select_account',
      // Add your domain hint if needed
      // hd: 'yourdomain.com'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Google login successful:", result.user);
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error.message);
      if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup was blocked by your browser. Please allow popups and try again.");
      } else if (error.code === "auth/cancelled-popup-request") {
        setError("Multiple popup requests. Please try again.");
      } else {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-slate-900 border-slate-800 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Welcome back
            </CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert className="bg-red-950/50 border-red-900 text-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onEmailLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address"
                      }
                    })}
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    {...register("password", { 
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium  shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 transform cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in with Email"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-400">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={onGoogleLogin}
              disabled={googleLoading}
              className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white hover:border-gray-100/50 transition-all duration-300 cursor-pointer"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Chrome className="mr-2 h-4 w-4" />
                  Continue with Google
                </>
              )}
            </Button>

            <div className="text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="text-green-400 hover:text-green-700 transition-colors font-medium"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-slate-500">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="text-slate-400 hover:text-slate-300">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-slate-400 hover:text-slate-300">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
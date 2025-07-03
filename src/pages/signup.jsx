import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../../firebase/client";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff, Chrome, Loader2, User, Phone } from "lucide-react";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch("password");

  const callGenerateAPI = async (idToken) => {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ role: "Frontend Developer", techstack: "React, Firebase", type: "technical", amount: 5 }),
      });
      const json = await res.json();
      console.log("✅ API response:", json);
    } catch (err) {
      console.error("API error:", err.message);
    }
  };

  const onRegister = async (data) => {
    setIsLoading(true);
    setError("");
    try {
      const userCred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCred.user;
      await setDoc(doc(db, "users", user.uid), {
        fullName: data.fullName,
        email: user.email,
        createdAt: new Date(),
      });
      const token = await user.getIdToken();
      await callGenerateAPI(token);
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error.message);
      if (error.code === "auth/email-already-in-use") {
        setError("This email address is already registered. Please try logging in instead.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleRegister = async () => {
    setGoogleLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), {
        fullName: user.displayName ?? "",
        phone: "",
        email: user.email,
        createdAt: new Date(),
      });
      const token = await user.getIdToken();
      await callGenerateAPI(token);
      navigate("/");
    } catch (error) {
      console.error("Google sign-up error:", error.message);
      if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-up was cancelled. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup was blocked by your browser. Please allow popups and try again.");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        setError("An account already exists with this email. Please try signing in instead.");
      } else {
        setError("Google sign-up failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-900/95 border-gray-800/50 shadow-2xl shadow-black/50 backdrop-blur-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center border border-gray-700/50">
              <User className="w-6 h-6 text-violet-400" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">Join us today</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-300 text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="fullName"
                    {...register("fullName", { 
                      required: "Full name is required",
                      minLength: { value: 2, message: "Name must be at least 2 characters" }
                    })}
                    placeholder="Enter your full name"
                    className="pl-10 h-11 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all duration-300"
                  />
                </div>
                {errors.fullName && <p className="text-xs text-red-400">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Please enter a valid email address" }
                    })}
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-11 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all duration-300"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    {...register("password", { 
                      required: "Password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" },
                      pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: "Password must contain uppercase, lowercase, and number" }
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10 h-11 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-violet-400 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                {password && password.length > 0 && (
                  <div className="text-xs flex items-center gap-2">
                    <span className="text-gray-400">Strength:</span>
                    {password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password) ? (
                      <span className="text-green-400">Strong</span>
                    ) : password.length >= 6 ? (
                      <span className="text-yellow-400">Medium</span>
                    ) : (
                      <span className="text-red-400">Weak</span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300 text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    {...register("confirmPassword", { 
                      required: "Please confirm your password",
                      validate: value => value === password || "Passwords do not match"
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="pl-10 h-11 bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all duration-300"
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl  shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 transform cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-gray-800/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gray-900/95 px-3 text-gray-500">OR</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={onGoogleRegister}
              disabled={googleLoading}
              className="w-full h-11 bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50 hover:border-gray-200/50 hover:text-white rounded-xl transition-all duration-300 cursor-pointer"
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

            <div className="text-center text-sm text-gray-500 pt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 underline transition-colors duration-200">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-600">
          By creating an account, you agree to our{" "}
          <Link to="/" className="text-gray-500 hover:text-gray-400 underline transition-colors duration-200">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/" className="text-gray-500 hover:text-gray-400 underline transition-colors duration-200">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
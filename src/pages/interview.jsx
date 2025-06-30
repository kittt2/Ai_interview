import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Agent from "./Agent";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Clock, Play, Bot, Mic, Video, LogOut } from "lucide-react";

export default function Interview() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          setUser({
            id: firebaseUser.uid,
            name: userData.fullName || firebaseUser.displayName || "User"
          });
        } catch (error) {
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "User"
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/60 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <Skeleton className="h-16 w-16 rounded-full mx-auto bg-slate-700/50" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 mx-auto bg-slate-700/50" />
              <Skeleton className="h-3 w-24 mx-auto bg-slate-700/30" />
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Clock className="w-4 h-4 animate-spin" />
              <span className="text-sm">Initializing...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/60 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardContent className="p-8">
            <Alert className="bg-red-950/30 border-red-800/50 backdrop-blur-sm">
              <User className="h-5 w-5 text-red-400" />
              <AlertDescription className="text-red-300 text-center">
                Authentication required to proceed
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Simplified Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Interview</h1>
                <p className="text-sm text-slate-400">Technical Assessment</p>
              </div>
            </div>
            
            <Badge className="bg-emerald-900/50 text-emerald-300 border-emerald-700/50 backdrop-blur-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
              Live
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* AI Agent */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">AI Interviewer</span>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/50 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                  <Agent 
                    userid={user.id}
                    username={user.name}
                    type="generate"
                  />
                  {/* Subtle overlay for better integration */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Panel */}
          <div className="space-y-4">
            {/* User Profile */}
            <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/50 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <Avatar className="w-16 h-16 border-2 border-slate-600">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xl font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">{user.name}</h3>
                    <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700/50">
                      Candidate
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/50 shadow-xl">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Session Info</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Status</span>
                      <span className="text-sm text-emerald-400 font-medium">Ready</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Duration</span>
                      <span className="text-sm text-slate-300">45-60 min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Type</span>
                      <span className="text-sm text-slate-300">Technical</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card className="bg-slate-800/40 backdrop-blur-xl border-slate-700/50 shadow-xl">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Controls</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-slate-300 hover:text-white">
                      <Mic className="w-4 h-4" />
                      <span className="text-xs">Mic</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors text-slate-300 hover:text-white">
                      <Video className="w-4 h-4" />
                      <span className="text-xs">Video</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Clean Footer */}
      <div className="border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-xl mt-8">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Play className="w-4 h-4" />
                Start Interview
              </button>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>System Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Estimated 45-60 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
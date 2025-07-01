import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Agent from "./Agent";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Bot, Crown } from "lucide-react";

export default function Interview() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState("inactive");

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

  // AI speaking animation only when call is connected
  useEffect(() => {
    let interval;
    
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setIsAISpeaking(prev => !prev);
      }, 3000);
    } else {
      setIsAISpeaking(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  // Handle call status changes from Agent component
  const handleCallStatusChange = (status) => {
    setCallStatus(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto bg-gray-800/50" />
          <Skeleton className="h-4 w-32 mx-auto bg-gray-800/50" />
          <Skeleton className="h-4 w-24 mx-auto bg-gray-800/50" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Alert className="bg-red-500/10 border border-red-500/20 backdrop-blur-lg max-w-md shadow-2xl shadow-red-500/10">
          <User className="h-5 w-5 text-red-400" />
          <AlertDescription className="text-red-300 font-medium">
            Authentication required to proceed
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Main Content Container - matches navbar max-width and padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="relative">
              <Crown className="h-8 w-8 text-violet-400" />
              <div className="absolute inset-0 bg-violet-400/20 blur-xl rounded-full"></div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              AI Interview Session
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Connect with our AI interviewer for your assessment
          </p>
        </div>

        {/* Video Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* AI Agent Video */}
          <div className="relative bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 min-h-[320px] lg:min-h-[400px]">
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto transition-all duration-300 shadow-lg ${
                  isAISpeaking 
                    ? 'scale-110 shadow-violet-500/50 ring-4 ring-violet-400/30' 
                    : 'scale-100 shadow-violet-500/25'
                }`}>
                  <div className="text-white text-xl sm:text-2xl lg:text-3xl font-bold">AI</div>
                  
                  {/* Speaking animation rings */}
                  {isAISpeaking && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-violet-400/50 animate-ping"></div>
                      <div className="absolute inset-0 rounded-full border border-violet-300/30 animate-pulse"></div>
                    </>
                  )}
                </div>
                <h3 className="text-white text-lg lg:text-xl font-semibold mb-2">
                  AI Interviewer
                </h3>
                {isAISpeaking && (
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-violet-400 text-sm font-medium">Speaking</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-violet-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-violet-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-1 h-1 bg-violet-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Agent Name Badge */}
            <div className="absolute bottom-4 left-4 z-10">
              <div className={`bg-gray-900/80 backdrop-blur-lg rounded-xl px-4 py-2 flex items-center gap-3 border transition-all duration-300 ${
                isAISpeaking 
                  ? 'border-violet-500/50 bg-violet-900/20' 
                  : 'border-gray-700/50'
              }`}>
                <div className={`w-3 h-3 bg-violet-500 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isAISpeaking ? 'animate-pulse bg-violet-400' : ''
                }`}>
                  <Bot className="w-2 h-2 text-white" />
                </div>
                <span className="text-white text-sm font-medium">AI Agent</span>
                {isAISpeaking && (
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-violet-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-violet-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1 h-1 bg-violet-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Candidate Video */}
          <div className="relative bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 min-h-[320px] lg:min-h-[400px]">
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 mx-auto mb-4 border-4 border-gray-700/50 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-500 text-white text-xl sm:text-2xl lg:text-3xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-white text-lg lg:text-xl font-semibold">
                  {user.name}
                </h3>
                <p className="text-gray-400 text-sm mt-1">Candidate</p>
              </div>
            </div>
            
            {/* Candidate Name Badge */}
            <div className="absolute bottom-4 left-4 z-10">
              <div className="bg-gray-900/80 backdrop-blur-lg rounded-xl px-4 py-2 flex items-center gap-3 border border-gray-700/50">
                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="w-2 h-2 text-white" />
                </div>
                <span className="text-white text-sm font-medium">Candidate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call Controls Section */}
        <div className="flex justify-center items-center">
          <Agent
            userid={user.id}
            username={user.name}
            type="generate"
            onCallStatusChange={handleCallStatusChange}
          />
        </div>
      </div>
    </div>
  );
}
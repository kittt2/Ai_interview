import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Crown, User, Bot, Code, Hash, FileText } from "lucide-react";
import Agent from "./Agent";

export default function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callStatus, setCallStatus] = useState("inactive");
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchInterviewAndCurrentUser = async () => {
      try {
        const interviewDocRef = doc(db, "interviews", id);
        const interviewDocSnap = await getDoc(interviewDocRef);

        if (interviewDocSnap.exists()) {
          const interviewData = { id: interviewDocSnap.id, ...interviewDocSnap.data() };
          setInterview(interviewData);
        } else {
          console.log("Interview document not found!");
        }

        if (authUser) {
          const userDocRef = doc(db, "users", authUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setCurrentUser({ id: userDocSnap.id, ...userDocSnap.data() });
          } else {
            console.log("Current user document not found!");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewAndCurrentUser();
  }, [id, authUser]);

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

  const handleCallStatusChange = (status) => {
    setCallStatus(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-300 text-lg">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Interview Not Found</h2>
          <p className="text-gray-400">The interview you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => navigate(-1)} 
            className="bg-violet-600 hover:bg-violet-700 text-white border-0"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const username = currentUser?.fullName || authUser?.displayName || "Unknown User";

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Crown className="h-8 w-8 text-violet-400" />
                <div className="absolute inset-0 bg-violet-400/20 blur-xl rounded-full"></div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  {interview.role[0]?.toUpperCase()+interview.role?.slice(1)} Interview
                </h1>
                <p className="text-gray-400 text-lg mt-1">
                  Candidate: {username}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline"
              className="cursor-pointer bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white backdrop-blur-lg"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back
            </Button>
          </div>

          {/* Interview Details - Moved to Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
            <div className="flex items-center space-x-3 bg-gray-800/30 rounded-lg px-4 py-3">
              <Hash className="w-5 h-5 text-blue-400" />
              <div>
                <span className="text-gray-400 text-sm">Level</span>
                <p className="text-white font-medium">{interview.level}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-gray-800/30 rounded-lg px-4 py-3">
              <FileText className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-gray-400 text-sm">Type</span>
                <p className="text-white font-medium">{interview.type}</p>
              </div>
            </div>
            <div className="md:col-span-2 flex items-center space-x-3 bg-gray-800/30 rounded-lg px-4 py-3">
              <Code className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <span className="text-gray-400 text-sm">Tech Stack</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {interview.techstack?.slice(0, 4).map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-md bg-gray-700/50 text-gray-300 border border-gray-600/30"
                    >
                      {tech}
                    </span>
                  ))}
                  {interview.techstack?.length > 4 && (
                    <span className="px-2 py-1 text-xs rounded-md bg-gray-700/50 text-gray-400 border border-gray-600/30">
                      +{interview.techstack.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          <div className="relative bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 min-h-[320px] lg:min-h-[400px]">
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto transition-all duration-300 shadow-lg ${
                  isAISpeaking 
                    ? 'scale-110 shadow-violet-500/50 ring-4 ring-violet-400/30' 
                    : 'scale-100 shadow-violet-500/25'
                }`}>
                  <div className="text-white text-xl sm:text-2xl lg:text-3xl font-bold">AI</div>
                  
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

          <div className="relative bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 min-h-[320px] lg:min-h-[400px]">
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 mx-auto mb-4 border-4 border-gray-700/50 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-500 text-white text-xl sm:text-2xl lg:text-3xl font-bold">
                    {username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-white text-lg lg:text-xl font-semibold">
                  {username}
                </h3>
                <p className="text-gray-400 text-sm mt-1">Candidate</p>
              </div>
            </div>
            
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

        <div className=" flex justify-center items-center">
          <Agent 
            username={username} 
            userid={authUser?.uid || currentUser?.id}
            interviewid={id}
            questions={interview.questions}
            onCallStatusChange={handleCallStatusChange}
          />
        </div>
      </div>
    </div>
  );
}
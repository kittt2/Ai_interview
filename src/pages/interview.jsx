import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Agent from "./Agent";

export default function Interview({ 
  questions = [],
  interviewData = null
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          
          // Set user info
          setUser({
            id: firebaseUser.uid,
            name: userData.fullName || firebaseUser.displayName || "User",
            email: firebaseUser.email || ""
          });
        } catch (error) {
          console.error("Error getting user data:", error);
          // Fallback to basic Firebase user data
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
            email: firebaseUser.email || ""
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
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white text-xl">Please log in to start the interview</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* AI Panel */}
        <div className="bg-gray-800 rounded-lg relative flex items-center justify-center shadow-inner overflow-hidden">
          <Agent 
            userName="AI Interviewer" 
            userId={user.id}
            type={questions.length > 0 ? "custom" : "generate"}
            currentUser={user}
            questions={questions}
            interviewData={interviewData}
          />
        </div>

        {/* User Panel */}
        <div className="bg-gray-800 rounded-lg relative flex items-center justify-center shadow-inner overflow-hidden">
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-32 bg-blue-700 text-white text-5xl font-bold flex items-center justify-center rounded-full shadow">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-white text-lg font-semibold">{user.name}</div>
            <div className="text-gray-400 text-sm">{user.email}</div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="w-full bg-black/80 py-4 px-6 text-white text-center text-lg font-medium border-t border-gray-700">
        Click 'Start Interview' to begin
      </div>

      {/* Controls */}
      <div className="h-20 bg-[#1e1e1e] flex items-center justify-center space-x-6 border-t border-gray-700">
        <div className="text-gray-400 text-sm">
          Interview controls are handled by the AI panel above
        </div>
      </div>
    </div>
  );
}
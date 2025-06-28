import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Agent from "./Agent";

export default function Interview() {
  const [userName, setUserName] = useState("You");
  const [caption, setCaption] = useState("AI: Tell me about a time you overcame a challenge.");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        const name = snap.data()?.fullName || "User";
        setUserName(name);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="h-screen w-full bg-black flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* AI Panel */}
        <div className="bg-gray-800 rounded-lg relative flex items-center justify-center shadow-inner overflow-hidden">
          <Agent userName="AI" userId="user1" type="generate" />
        </div>

        {/* User Panel */}
        <div className="bg-gray-800 rounded-lg relative flex items-center justify-center shadow-inner overflow-hidden">
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-32 bg-blue-700 text-white text-5xl font-bold flex items-center justify-center rounded-full shadow">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="text-white text-lg font-semibold">{userName}</div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="w-full bg-black/80 py-4 px-6 text-white text-center text-lg font-medium border-t border-gray-700">
        {caption}
      </div>

      {/* Controls */}
      <div className="h-20 bg-[#1e1e1e] flex items-center justify-center space-x-6 border-t border-gray-700">
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold">
          End Call
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full text-lg">
          🎤
        </button>
        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full text-lg">
          🎥
        </button>
      </div>
    </div>
  );
}
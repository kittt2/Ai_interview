import React, { useState } from "react";

function Agent() {
  const [isCalling, setIsCalling] = useState(true); // call active state

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        {/* Speaking Avatar */}
        <div className="relative">
          {isCalling && (
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping" />
          )}
          <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${isCalling ? "border-blue-600" : "border-gray-500"} bg-blue-700 flex items-center justify-center text-white text-5xl font-bold z-10 relative shadow-lg`}>
            🤖
          </div>
        </div>

        <div className="text-white text-lg font-medium">
          {isCalling ? "AI is speaking..." : "AI idle"}
        </div>

        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setIsCalling(!isCalling)}
        >
          {isCalling ? "Stop Call Effect" : "Start Call Effect"}
        </button>
      </div>
    </div>
  );
}

export default Agent;
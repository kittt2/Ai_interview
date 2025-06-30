import { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";

const CallStatus = {
  INACTIVE: "inactive",
  CONNECTING: "connecting", 
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  ERROR: "error"
};

export default function Agent({ userid, username }) {
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  const [callMessage, setCallMessage] = useState("Ready to start call");
  const [vapi, setVapi] = useState(null);

  // Debug logging
  console.log('Agent props:', { userid, username });

  useEffect(() => {
    const vapiInstance = new Vapi("3784590e-e709-46e4-a2db-1b3eb1dea5cc");
    setVapi(vapiInstance);

    const onCallStart = () => {
      setCallStatus(CallStatus.CONNECTED);
      setCallMessage("Call started");
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.DISCONNECTED);
      setCallMessage("Call ended");
    };

    const onError = (error) => {
      console.error('VAPI Error:', error);
      setCallStatus(CallStatus.ERROR);
      setCallMessage("Error occurred");
    };

    vapiInstance.on('call-start', onCallStart);
    vapiInstance.on('call-end', onCallEnd);
    vapiInstance.on('error', onError);

    return () => {
      vapiInstance.off('call-start', onCallStart);
      vapiInstance.off('call-end', onCallEnd);
      vapiInstance.off('error', onError);
    };
  }, []);

  const handleCall = async () => {
    if (!vapi) {
      console.log('VAPI not initialized');
      return;
    }
    if (!userid) {
      console.log('No userid provided:', userid);
      return;
    }

    try {
      setCallStatus(CallStatus.CONNECTING);
      setCallMessage("Connecting...");

      // Method 1: Pass variables in the assistant object
      // await vapi.start({
      //   assistantId: "87020da9-5f71-4bef-8c6e-15c22f499c29",
      //   variableValues: {
      //     userid: userid,
      //     username: username
      //   }
      // });

      // Alternative Method 2: If the above doesn't work, try this format
      // await vapi.start({
      //   "87020da9-5f71-4bef-8c6e-15c22f499c29", 
      //     {
      //       userid: userid,
      //       username: username
      //     }
      // }
      // );
      await vapi.start(
        undefined,
        undefined,
        undefined,
        "87020da9-5f71-4bef-8c6e-15c22f499c29",
        {
          variableValues: {
            username: username,
            userid: userid,
          },
        }
      );

    } catch (err) {
      console.error('Call failed:', err);
      setCallStatus(CallStatus.ERROR);
      setCallMessage("Call failed");
    }
  };

  const handleDisconnect = () => {
    vapi?.stop();
  };

  const handleCallButtonClick = () => {
    callStatus === CallStatus.CONNECTED ? handleDisconnect() : handleCall();
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-2xl font-bold mb-2">Vapi Interview</h2>
      <p className="text-sm">Status: {callMessage}</p>
      
      {/* Debug info */}
      <div className="text-xs text-gray-400 mb-2">
        <p>UserID: {userid || 'Not provided'}</p>
        <p>Username: {username || 'Not provided'}</p>
        <p>VAPI initialized: {vapi ? 'Yes' : 'No'}</p>
      </div>

      <button
        onClick={handleCallButtonClick}
        disabled={!userid || callStatus === CallStatus.CONNECTING}
        className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded"
      >
        {callStatus === CallStatus.CONNECTED ? "End Call" : "Start Call"}
      </button>

      {callStatus === CallStatus.ERROR && (
        <p className="text-red-400 mt-2">Error during call. Please try again.</p>
      )}
      
      {!userid && (
        <p className="text-yellow-400 mt-2">Button disabled: No user ID provided</p>
      )}
    </div>
  );
}
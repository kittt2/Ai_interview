import { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import { interviewer } from "./interviewer";
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Settings } from "lucide-react";
import { Navigate } from "react-router-dom";

const CallStatus = {
  INACTIVE: "inactive",
  CONNECTING: "connecting", 
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  ERROR: "error",
  FINISHED: "finished"
};

export default function Agent({ userid, username, type, interviewid, questions, onCallStatusChange, feedbackId }) {
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  const [callMessage, setCallMessage] = useState("Ready to start call");
  const [vapi, setVapi] = useState(null);
  // Add message functionality from first code
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  // Add state to track if call was manually disconnected
  const [isManualDisconnect, setIsManualDisconnect] = useState(false);

  // Update call status and notify parent component
  const updateCallStatus = (status) => {
    setCallStatus(status);
    if (onCallStatusChange) {
      onCallStatusChange(status);
    }
  };

  useEffect(() => {
    const vapiInstance = new Vapi("3784590e-e709-46e4-a2db-1b3eb1dea5cc");
    setVapi(vapiInstance);

    const onCallStart = () => {
      updateCallStatus(CallStatus.CONNECTED);
      setCallMessage("Call started");
      setIsManualDisconnect(false); // Reset manual disconnect flag
    };

    const onCallEnd = () => {
      updateCallStatus(CallStatus.DISCONNECTED);
      setCallMessage("Call ended");
    };

    // Add message handling from first code
    const onMessage = (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    // Add speech handling from first code
    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error) => {
      console.error('VAPI Error:', error);
      updateCallStatus(CallStatus.ERROR);
      setCallMessage("Error occurred");
    };

    vapiInstance.on('call-start', onCallStart);
    vapiInstance.on('call-end', onCallEnd);
    vapiInstance.on('message', onMessage);
    vapiInstance.on('speech-start', onSpeechStart);
    vapiInstance.on('speech-end', onSpeechEnd);
    vapiInstance.on('error', onError);

    return () => {
      vapiInstance.off('call-start', onCallStart);
      vapiInstance.off('call-end', onCallEnd);
      vapiInstance.off('message', onMessage);
      vapiInstance.off('speech-start', onSpeechStart);
      vapiInstance.off('speech-end', onSpeechEnd);
      vapiInstance.off('error', onError);
    };
  }, []);

  // Add message tracking from first code
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  // Enhanced useEffect for handling call status changes with feedback functionality
  useEffect(() => {
    const handleGenerateFeedback = async (messages) => {
      console.log("handleGenerateFeedback");

      try {
        // You'll need to implement createFeedback function for your React app
        const { success, feedbackId: id } = await createFeedback({
          interviewId: interviewid,
          userId: userid,
          transcript: messages,
          feedbackId,
        });

        if (success && id) {
          // Navigate to feedback page - you'll need to implement navigation
          window.location.href = `/interview/${interviewid}/feedback`;
        } else {
          console.log("Error saving feedback");
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Error generating feedback:", error);
        window.location.href = "/";
      }
    };

    // Only redirect if call ended naturally (not manually disconnected)
    if (callStatus === CallStatus.DISCONNECTED && !isManualDisconnect) {
      if (type === 'generate') {
        Navigate("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewid, type, userid, isManualDisconnect]);

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
      updateCallStatus(CallStatus.CONNECTING);
      setCallMessage("Connecting...");

      if(type === 'generate') {
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
      } else {
        let formattedquestion = '';
        if(questions) {
          formattedquestion = questions.map((question) => `- ${question}`).join('\n');
        }
        
        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedquestion,
          }
        });
      }
    } catch (err) {
      console.error('Call failed:', err);
      updateCallStatus(CallStatus.ERROR);
      setCallMessage("Call failed");
    }
  };

  const handleDisconnect = () => {
    setIsManualDisconnect(true); // Set manual disconnect flag
    updateCallStatus(CallStatus.FINISHED);
    vapi?.stop();
  };

  const handleCallButtonClick = () => {
    callStatus === CallStatus.CONNECTED ? handleDisconnect() : handleCall();
  };

  const getStatusText = () => {
    switch (callStatus) {
      case CallStatus.CONNECTING:
        return "Connecting...";
      case CallStatus.CONNECTED:
        return "Connected";
      case CallStatus.DISCONNECTED:
        return "Disconnected";
      case CallStatus.ERROR:
        return "Error";
      case CallStatus.FINISHED:
        return "Finished";
      case CallStatus.INACTIVE:
      default:
        return "Ready";
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case CallStatus.CONNECTING:
        return "text-yellow-400";
      case CallStatus.CONNECTED:
        return "text-green-400";
      case CallStatus.DISCONNECTED:
        return "text-gray-400";
      case CallStatus.ERROR:
        return "text-red-400";
      case CallStatus.FINISHED:
        return "text-blue-400";
      case CallStatus.INACTIVE:
      default:
        return "text-blue-400";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Add transcript display from first code */}
      {messages.length > 0 && (
        <div className="w-full max-w-2xl bg-gray-700 rounded-lg p-4 mb-4">
          <div className="text-white">
            <p className="transition-opacity duration-500 opacity-100">
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <div className="bg-gray-800 rounded-full shadow-2xl border border-gray-600 px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Main Call Button */}
            <button
              onClick={handleCallButtonClick}
              disabled={!userid || callStatus === CallStatus.CONNECTING}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                callStatus === CallStatus.CONNECTED
                  ? 'bg-red-500 hover:bg-red-600'
                  : callStatus === CallStatus.CONNECTING
                  ? 'bg-yellow-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              } ${!userid ? 'bg-gray-500 cursor-not-allowed' : ''}`}
            >
              {callStatus === CallStatus.CONNECTING ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : callStatus === CallStatus.CONNECTED ? (
                <PhoneOff className="w-6 h-6 text-white" />
              ) : (
                <Phone className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Status Display */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                callStatus === CallStatus.CONNECTED ? 'bg-green-400 animate-pulse' :
                callStatus === CallStatus.CONNECTING ? 'bg-yellow-400 animate-pulse' :
                callStatus === CallStatus.ERROR ? 'bg-red-400' :
                callStatus === CallStatus.DISCONNECTED ? 'bg-gray-400' :
                callStatus === CallStatus.FINISHED ? 'bg-blue-400' :
                'bg-blue-400'
              }`} />
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
              {/* Add speaking indicator */}
              {isSpeaking && (
                <span className="text-xs text-green-400 animate-pulse ml-2">
                  Speaking...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {callStatus === CallStatus.ERROR && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
          Error during call. Please try again.
        </div>
      )}
      
      {!userid && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-yellow-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
          No user ID provided
        </div>
      )}
    </div>
  );
}
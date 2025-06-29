import { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import { useNavigate } from "react-router-dom";

const CallStatus = {
  INACTIVE: "inactive",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  ERROR: "error"
};

export default function Agent({ 
  userName = "AI Interviewer", 
  currentUser, 
  userId, 
  type = "generate",
  questions = [],
  interviewData = null
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  const [callMessage, setCallMessage] = useState("Ready to start call");
  const [vapi, setVapi] = useState(null);
  const [messages, setMessages] = useState([]);
  const [debugInfo, setDebugInfo] = useState({});
  
  const navigate = useNavigate();

  // Get the actual user ID - prioritize currentUser.id
  const actualUserId = currentUser?.id || userId;

  // Initialize VAPI instance
  useEffect(() => {
    const vapiInstance = new Vapi("3784590e-e709-46e4-a2db-1b3eb1dea5cc");
    setVapi(vapiInstance);

    // Event handlers
    const onCallStart = () => {
      setCallStatus(CallStatus.CONNECTED);
      setCallMessage("Call started");
      console.log("✅ Call started with user ID:", actualUserId);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.DISCONNECTED);
      setCallMessage("Call ended");
      console.log("📞 Call ended");
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error) => {
      console.error('❌ VAPI Error:', error);
      setCallStatus(CallStatus.ERROR);
      setCallMessage("Error occurred");
    };

    const onMessage = (message) => {
      console.log('📨 VAPI Message:', message);
      setMessages(prev => [...prev, message]);
      
      // Log API-related messages
      if (message.type === 'tool-calls' || message.type === 'function-call') {
        console.log('🔧 Tool call detected:', message);
      }
    };

    // Add event listeners
    vapiInstance.on('call-start', onCallStart);
    vapiInstance.on('call-end', onCallEnd);
    vapiInstance.on('error', onError);
    vapiInstance.on('message', onMessage);
    vapiInstance.on('speech-start', onSpeechStart);
    vapiInstance.on('speech-end', onSpeechEnd);

    // Cleanup function
    return () => {
      vapiInstance.off('call-end', onCallEnd);
      vapiInstance.off('call-start', onCallStart);
      vapiInstance.off('error', onError);
      vapiInstance.off('message', onMessage);
      vapiInstance.off('speech-start', onSpeechStart);
      vapiInstance.off('speech-end', onSpeechEnd);
    };
  }, [actualUserId]);

  // Handle navigation after call ends
  useEffect(() => {
    if (callStatus === CallStatus.DISCONNECTED) {
      // Optional: Navigate after a delay
      setTimeout(() => {
        // navigate('/');
      }, 2000);
    }
  }, [callStatus, navigate]);

  const handleCall = async () => {
    if (!vapi) {
      console.error('❌ VAPI instance not initialized');
      return;
    }

    // Check if we have user ID
    if (!actualUserId) {
      console.error('❌ No user ID available');
      setCallStatus(CallStatus.ERROR);
      setCallMessage("User not authenticated");
      return;
    }

    try {
      setCallStatus(CallStatus.CONNECTING);
      setCallMessage("Connecting...");

      const variableValues = {
        username: currentUser?.name || userName,
        userid: actualUserId, // This is the key field
        role: interviewData?.role || "Software Developer",
        type: interviewData?.type || "technical",
        level: interviewData?.level || "mid",
        techstack: interviewData?.techstack || "JavaScript",
        amount: String(interviewData?.amount || "5") // Ensure it's a string
      };

      console.log("🚀 Starting call with variable values:", variableValues);

      // Update debug info
      setDebugInfo({
        variableValues,
        timestamp: new Date().toISOString(),
        workflowId: "87020da9-5f71-4bef-8c6e-15c22f499c29"
      });

      if (type === "generate") {
        // Generate questions mode
        await vapi.start(
          null, // assistant (null for workflow)
          {
            variableValues: variableValues,
          },
          null, // assistant overrides
          "87020da9-5f71-4bef-8c6e-15c22f499c29" // workflow ID
        );
      } else {
        // Custom questions mode
        let formattedQuestions = "";
        if (questions && questions.length > 0) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        await vapi.start(
          null, // assistant (null for workflow)
          {
            variableValues: {
              questions: formattedQuestions,
              username: currentUser?.name || userName,
              userid: actualUserId,
            },
          },
          null, // assistant overrides
          "87020da9-5f71-4bef-8c6e-15c22f499c29" // workflow ID
        );
      }
    } catch (error) {
      console.error('❌ Error starting call:', error);
      setCallStatus(CallStatus.ERROR);
      setCallMessage("Failed to start call");
    }
  };

  const handleDisconnect = async () => {
    if (vapi) {
      try {
        vapi.stop();
        setCallStatus(CallStatus.DISCONNECTED);
        setCallMessage("Call disconnected");
      } catch (error) {
        console.error('❌ Error stopping call:', error);
      }
    }
  };

  const handleCallButtonClick = () => {
    if (callStatus === CallStatus.CONNECTED) {
      handleDisconnect();
    } else {
      handleCall();
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case CallStatus.CONNECTED:
        return isSpeaking ? "bg-green-400 animate-pulse" : "bg-green-600";
      case CallStatus.CONNECTING:
        return "bg-yellow-500 animate-pulse";
      case CallStatus.ERROR:
        return "bg-red-600";
      case CallStatus.DISCONNECTED:
        return "bg-gray-600";
      default:
        return "bg-blue-600";
    }
  };

  const getStatusIcon = () => {
    switch (callStatus) {
      case CallStatus.CONNECTED:
        return isSpeaking ? "🎤" : "📞";
      case CallStatus.CONNECTING:
        return "⏳";
      case CallStatus.ERROR:
        return "❌";
      case CallStatus.DISCONNECTED:
        return "📞";
      default:
        return "🤖";
    }
  };

  const getButtonText = () => {
    switch (callStatus) {
      case CallStatus.CONNECTED:
        return "End Call";
      case CallStatus.CONNECTING:
        return "Connecting...";
      case CallStatus.DISCONNECTED:
        return "Call Ended";
      case CallStatus.ERROR:
        return "Retry Call";
      default:
        return "Start Call";
    }
  };

  const latestMessage = messages[messages.length - 1]?.content || "";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <div className="text-center space-y-6">
        <div className={`w-32 h-32 ${getStatusColor()} rounded-full flex items-center justify-center shadow-lg transition-all duration-300 text-4xl`}>
          {getStatusIcon()}
        </div>

        <h1 className="text-2xl font-bold">{userName}</h1>
        <p className="text-gray-400">{callMessage}</p>

        {currentUser && (
          <div className="text-sm text-gray-500">
            Speaking with: {currentUser.name} (ID: {actualUserId})
          </div>
        )}

        {latestMessage && (
          <div className="text-sm text-gray-300 max-w-md mx-auto p-3 bg-gray-800 rounded-lg">
            <div className="font-semibold mb-1">Latest Message:</div>
            <div>{latestMessage}</div>
          </div>
        )}

        <button
          onClick={handleCallButtonClick}
          disabled={callStatus === CallStatus.CONNECTING || !actualUserId}
          className={`px-8 py-4 rounded-full font-semibold text-white transition-all duration-200 transform hover:scale-105 ${
            !actualUserId
              ? "bg-gray-600 cursor-not-allowed"
              : callStatus === CallStatus.CONNECTED
              ? "bg-red-600 hover:bg-red-700"
              : callStatus === CallStatus.CONNECTING
              ? "bg-gray-600 cursor-not-allowed"
              : callStatus === CallStatus.ERROR
              ? "bg-orange-600 hover:bg-orange-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {!actualUserId ? "User not authenticated" : getButtonText()}
        </button>

        {/* Enhanced Debug Info */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg text-xs text-left max-w-2xl">
          <div className="font-semibold mb-2">🔍 Debug Info:</div>
          <div className="grid grid-cols-2 gap-2">
            <div>Status: {callStatus}</div>
            <div>VAPI Ready: {vapi ? "✅" : "❌"}</div>
            <div>Is Speaking: {isSpeaking ? "✅" : "❌"}</div>
            <div>User ID: {actualUserId || "❌ Not found"}</div>
            <div>Current User: {currentUser ? "✅" : "❌"}</div>
            <div>Interview Data: {interviewData ? "✅" : "❌"}</div>
            <div>Type: {type}</div>
            <div>Questions: {questions.length}</div>
            <div>Messages: {messages.length}</div>
            <div>Workflow ID: 87020da9-5f71-4bef-8c6e-15c22f499c29</div>
          </div>
          
          {debugInfo.variableValues && (
            <div className="mt-4">
              <div className="font-semibold mb-2">📤 Last Sent Variables:</div>
              <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto">
{JSON.stringify(debugInfo.variableValues, null, 2)}
              </pre>
            </div>
          )}

          {messages.length > 0 && (
            <div className="mt-4">
              <div className="font-semibold mb-2">📨 Recent Messages:</div>
              <div className="max-h-32 overflow-y-auto bg-gray-900 p-2 rounded">
                {messages.slice(-3).map((msg, idx) => (
                  <div key={idx} className="text-xs mb-1">
                    <span className="text-blue-300">{msg.type}:</span> {JSON.stringify(msg).slice(0, 100)}...
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
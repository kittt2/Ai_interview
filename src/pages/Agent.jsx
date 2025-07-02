import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Vapi from "@vapi-ai/web";
import { interviewer } from "./interviewer";
import { Phone, PhoneOff, AlertTriangle } from "lucide-react";

const CallStatus = {
  INACTIVE: "inactive",
  CONNECTING: "connecting", 
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  ERROR: "error",
  FINISHED: "finished"
};

const API_BASE = "https://ai-interview-brown-xi.vercel.app";

export default function Agent({ userid, username, type, interviewid, questions, onCallStatusChange, feedbackId }) {
  const navigate = useNavigate();
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  const [callMessage, setCallMessage] = useState("Ready to start call");
  const [vapi, setVapi] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [feedbackGenerated, setFeedbackGenerated] = useState(false);
  const [feedbackReady, setFeedbackReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);

  const feedbackGeneratedRef = useRef(false);

  const updateCallStatus = (status) => {
    setCallStatus(status);
    if (onCallStatusChange) onCallStatusChange(status);
  };

  useEffect(() => {
    const vapiInstance = new Vapi("3784590e-e709-46e4-a2db-1b3eb1dea5cc");
    setVapi(vapiInstance);

    const onCallStart = () => {
      updateCallStatus(CallStatus.CONNECTED);
      setCallMessage("Call started");
      setErrorMessage("");
    };

    const onCallEnd = () => {
      updateCallStatus(CallStatus.DISCONNECTED);
      setCallMessage("Call ended");
    };

    const onMessage = (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    vapiInstance.on('call-start', onCallStart);
    vapiInstance.on('call-end', onCallEnd);
    vapiInstance.on('message', onMessage);
    vapiInstance.on('speech-start', () => setIsSpeaking(true));
    vapiInstance.on('speech-end', () => setIsSpeaking(false));
    vapiInstance.on('error', (error) => {
      console.error('VAPI Error:', error);
      updateCallStatus(CallStatus.ERROR);
      setErrorMessage("Call failed. Please check your connection and try again.");
    });

    return () => {
      vapiInstance.off('call-start', onCallStart);
      vapiInstance.off('call-end', onCallEnd);
      vapiInstance.off('message', onMessage);
      vapiInstance.off('speech-start', () => setIsSpeaking(true));
      vapiInstance.off('speech-end', () => setIsSpeaking(false));
      vapiInstance.off('error', () => {});
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  // Feedback generation effect - only when type is NOT "generate"
  useEffect(() => {
    // Skip feedback generation when type is "generate"
    if (type === "generate") return;
    
    // Only trigger when call has ended and we have messages
    if (callStatus !== CallStatus.DISCONNECTED || messages.length === 0) return;
    
    // Check if we should generate feedback
    const shouldGenerateFeedback = 
      userid &&
      interviewid &&
      !feedbackGeneratedRef.current;

    if (!shouldGenerateFeedback) return;

    const generateFeedback = async () => {
      try {
        console.log('Starting feedback generation...');
        console.log('Request data:', {
          interviewId: interviewid,
          userId: userid,
          transcript: messages,
          messagesCount: messages.length
        });
        
        setIsGeneratingFeedback(true);
        feedbackGeneratedRef.current = true;

        const requestBody = {
          interviewId: interviewid,
          userId: userid,
          transcript: messages,
        };

        console.log('Making request to:', `${API_BASE}/api/feedback`);
        
        const response = await fetch(`${API_BASE}/api/feedback`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(requestBody),
          mode: 'cors',
          credentials: 'omit'
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Feedback API response:', data);

        if (data.success) {
          setFeedbackGenerated(true);
          setFeedbackReady(true);
          console.log('Feedback generated successfully');
        } else {
          throw new Error(data.error || 'Failed to generate feedback');
        }
      } catch (error) {
        console.error('Error generating feedback:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        // More specific error messages
        let errorMessage = "Error generating feedback. ";
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          errorMessage += "Network connection failed. Please check your internet connection and try again.";
        } else if (error.message.includes('HTTP error')) {
          errorMessage += "Server error. Please try again later.";
        } else {
          errorMessage += "Please try again.";
        }
        
        setErrorMessage(errorMessage);
        feedbackGeneratedRef.current = false;
      } finally {
        setIsGeneratingFeedback(false);
      }
    };

    // Add a small delay to ensure all messages are captured
    const timeoutId = setTimeout(generateFeedback, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [callStatus, messages.length, type, userid, interviewid]);

  const handleCall = async () => {
    if (!vapi || !userid) {
      setErrorMessage("System error. Please refresh the page.");
      return;
    }

    try {
      updateCallStatus(CallStatus.CONNECTING);
      setErrorMessage("");
      
      // Reset feedback state for new call
      feedbackGeneratedRef.current = false;
      setFeedbackGenerated(false);
      setFeedbackReady(false);
      setMessages([]);

      if (type === 'generate') {
        await vapi.start(undefined, undefined, undefined, "87020da9-5f71-4bef-8c6e-15c22f499c29", {
          variableValues: { username, userid },
        });
      } else {
        const formattedQuestions = questions?.map((q) => `- ${q}`).join('\n') || "";
        await vapi.start(interviewer, { variableValues: { questions: formattedQuestions } });
      }
    } catch (err) {
      console.error('Call failed:', err);
      updateCallStatus(CallStatus.ERROR);
      setErrorMessage("Failed to start call.");
    }
  };

  const handleDisconnect = () => {
    updateCallStatus(CallStatus.DISCONNECTED);
    vapi?.stop();
  };

  const handleCallButtonClick = () => {
    callStatus === CallStatus.CONNECTED ? handleDisconnect() : handleCall();
  };

  // New function to handle viewing feedback
  const handleViewFeedback = async () => {
    if (!userid || !interviewid) {
      setErrorMessage("Missing user or interview information");
      return;
    }

    try {
      setIsFetchingFeedback(true);
      setErrorMessage("");

      console.log('Fetching feedback for:', { userId: userid, interviewId: interviewid });

      const response = await fetch(
        `${API_BASE}/api/getfeedback?userId=${encodeURIComponent(userid)}&interviewId=${encodeURIComponent(interviewid)}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json"
          },
          mode: 'cors',
          credentials: 'omit'
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Feedback fetched successfully:', data);

      if (data.success && data.feedback) {
        // Navigate to feedback page with the fetched feedback
        navigate(`/interview/${interviewid}/feedback`, { 
          state: { 
            feedback: data.feedback,
            interview: { role: "Interview" } // You might want to pass actual interview data
          }
        });
      } else {
        throw new Error('No feedback data received');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      
      let errorMessage = "Error loading feedback. ";
      if (error.message.includes('404') || error.message.includes('No feedback found')) {
        errorMessage = "No feedback found for this interview. Please complete the interview first.";
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage += "Network connection failed. Please check your internet connection.";
      } else {
        errorMessage += "Please try again.";
      }
      
      setErrorMessage(errorMessage);
    } finally {
      setIsFetchingFeedback(false);
    }
  };

  const getStatusText = () => {
    if (isGeneratingFeedback) return "Generating Feedback...";
    if (isFetchingFeedback) return "Loading Feedback...";
    switch (callStatus) {
      case CallStatus.CONNECTING: return "Connecting...";
      case CallStatus.CONNECTED: return "Connected";
      case CallStatus.DISCONNECTED: return "Disconnected";
      case CallStatus.ERROR: return "Error";
      case CallStatus.FINISHED: return "Finished";
      case CallStatus.INACTIVE:
      default: return "Ready";
    }
  };

  const getStatusColor = () => {
    if (isGeneratingFeedback || isFetchingFeedback) return "text-purple-400";
    switch (callStatus) {
      case CallStatus.CONNECTING: return "text-yellow-400";
      case CallStatus.CONNECTED: return "text-green-400";
      case CallStatus.DISCONNECTED: return "text-gray-400";
      case CallStatus.ERROR: return "text-red-400";
      case CallStatus.FINISHED: return "text-blue-400";
      default: return "text-blue-400";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {messages.length > 0 && (
        <div className="w-full max-w-2xl bg-gray-700 rounded-lg p-4 mb-4">
          <p className="text-white transition-opacity duration-500 opacity-100">
            {lastMessage}
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <div className="bg-gray-800 rounded-full shadow-2xl border border-gray-600 px-6 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCallButtonClick}
              disabled={!userid || callStatus === CallStatus.CONNECTING || isGeneratingFeedback || isFetchingFeedback}
              className={`cursor-pointer w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                callStatus === CallStatus.CONNECTED
                  ? 'bg-red-500 hover:bg-red-600'
                  : callStatus === CallStatus.CONNECTING || isGeneratingFeedback || isFetchingFeedback
                  ? 'bg-yellow-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              } ${!userid ? 'bg-gray-500 cursor-not-allowed' : ''}`}
            >
              {callStatus === CallStatus.CONNECTING || isGeneratingFeedback || isFetchingFeedback ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin " />
              ) : callStatus === CallStatus.CONNECTED ? (
                <PhoneOff className="w-6 h-6 text-white" />
              ) : (
                <Phone className="w-6 h-6 text-white" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                callStatus === CallStatus.CONNECTED ? 'bg-green-400 animate-pulse' :
                callStatus === CallStatus.CONNECTING || isGeneratingFeedback || isFetchingFeedback ? 'bg-yellow-400 animate-pulse' :
                callStatus === CallStatus.ERROR ? 'bg-red-400' :
                'bg-gray-400'
              }`} />
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
              {isSpeaking && (
                <span className="text-xs text-green-400 animate-pulse ml-2">Speaking...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {feedbackReady && type !== "generate" && (
        <button
          onClick={handleViewFeedback}
          disabled={isFetchingFeedback}
          className="cursor-pointer mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg shadow-md transition-colors flex items-center gap-2"
        >
          {isFetchingFeedback && (
            <div className="cursor-pointer w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          View Feedback
        </button>
      )}

      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="ml-2 text-white/80 hover:text-white text-lg leading-none">×</button>
          </div>
        </div>
      )}

      {!userid && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 bg-yellow-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg">
          No user ID provided
        </div>
      )}
    </div>
  );
}
import { useEffect, useState, useRef } from "react";
import { vapi } from "@vapi-ai/web"; // Assuming it's already initialized
import { interviewer } from "./interviewer";
import { createFeedback } from "../../api/feedback.js";

const CallStatus = {
  INACTIVE: "INACTIVE",
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  ERROR: "ERROR",
};

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}) => {
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const feedbackGeneratedRef = useRef(false);

  const updateCallStatus = (status) => setCallStatus(status);

  useEffect(() => {
    const onCallStart = () => {
      updateCallStatus(CallStatus.CONNECTED);
    };

    const onCallEnd = () => {
      updateCallStatus(CallStatus.DISCONNECTED);
    };

    const onMessage = (message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error) => {
      console.error("Call Error:", error);
      updateCallStatus(CallStatus.ERROR);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const generateFeedback = async () => {
      if (
        callStatus === CallStatus.DISCONNECTED &&
        !feedbackGeneratedRef.current &&
        type !== "generate"
      ) {
        feedbackGeneratedRef.current = true;
        const { success, feedbackId: id } = await createFeedback({
          interviewId,
          userId,
          transcript: messages,
          feedbackId,
        });

        if (success && id) {
          window.location.href = `/interview/${interviewId}/feedback`;
        } else {
          console.error("Error saving feedback");
          window.location.href = "/";
        }
      } else if (callStatus === CallStatus.DISCONNECTED && type === "generate") {
        window.location.href = "/";
      }
    };

    generateFeedback();
  }, [callStatus, messages, feedbackId, interviewId, type, userId]);

  const handleCall = async () => {
    updateCallStatus(CallStatus.CONNECTING);

    try {
      if (type === "generate") {
        await vapi.start(process.env.REACT_APP_VAPI_WORKFLOW_ID, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        let formattedQuestions = "";
        if (questions?.length > 0) {
          formattedQuestions = questions.map((q) => `- ${q}`).join("\n");
        }

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (err) {
      console.error("Call failed:", err);
      updateCallStatus(CallStatus.ERROR);
    }
  };

  const handleDisconnect = () => {
    updateCallStatus(CallStatus.DISCONNECTED);
    vapi.stop();
  };

  return (
    <div>
      <div className="call-view">
        {/* Interviewer */}
        <div className="card-interviewer">
          <div className="avatar">
            <img
              src="/ai-avatar.png"
              alt="ai"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User */}
        <div className="card-border">
          <div className="card-content">
            <img
              src="/user-avatar.png"
              alt="user"
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {/* Transcript */}
      {lastMessage && (
        <div className="transcript-border">
          <div className="transcript">
            <p className="animate-fadeIn">{lastMessage}</p>
          </div>
        </div>
      )}

      {/* Call/End Buttons */}
      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.CONNECTED ? (
          <button
            className="btn-call"
            onClick={handleCall}
            disabled={callStatus === CallStatus.CONNECTING}
          >
            <span className={`absolute animate-ping ${callStatus !== CallStatus.CONNECTING ? "hidden" : ""}`} />
            <span className="relative">
              {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.DISCONNECTED
                ? "Call"
                : "..."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </div>
  );
};

export default Agent;

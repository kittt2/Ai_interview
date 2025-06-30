import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Agent from "./Agent";

export default function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviewAndUser = async () => {
      try {
        // Fetch interview document
        const interviewDocRef = doc(db, "interviews", id);
        const interviewDocSnap = await getDoc(interviewDocRef);

        if (interviewDocSnap.exists()) {
          const interviewData = { id: interviewDocSnap.id, ...interviewDocSnap.data() };
          setInterview(interviewData);

          // Fetch user document using userid from interview
          if (interviewData.userid) {
            const userDocRef = doc(db, "users", interviewData.userid); // Adjust collection name if needed
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              setUser({ id: userDocSnap.id, ...userDocSnap.data() });
            } else {
              console.log("User document not found!");
              // Fallback: create a basic user object with just the ID
              setUser({ id: interviewData.userid, name: "Unknown User" });
            }
          }
        } else {
          console.log("Interview document not found!");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewAndUser();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-900 text-slate-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p>Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center px-6 text-white bg-slate-900">
        <p className="text-xl">Interview not found!</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 w-4 h-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{interview.role} Interview</h1>
            {user && (
              <p className="text-slate-400 mt-1">
                Candidate: {user.name || user.displayName || user.email || "Unknown"}
              </p>
            )}
          </div>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
        </div>

        <div className="bg-slate-800/40 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Details</h2>
            <p className="text-slate-400">
              Level: {interview.level} • Type: {interview.type}
            </p>
            {user && (
              <p className="text-slate-400 text-sm mt-1">
                User ID: {user.id}
              </p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {interview.techstack?.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-slate-700 text-sm text-white"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Interview Agent</h2>
            <Agent 
              username={user?.name || user?.displayName || user?.email || "Unknown User"} 
              userid={user?.id || interview.userid}
              interviewid={id}
              questions={interview.questions}
            />
          </div>

          {/* Questions Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Questions Preview</h2>
            {interview?.questions && interview?.questions.length > 0 ? (
              <div className="bg-slate-700/30 rounded-lg p-4">
                <p className="text-slate-400 text-sm mb-3">
                  {interview.questions.length} questions prepared
                </p>
                <ul className="space-y-2 text-slate-300">
                  {interview.questions.map((question, index) => (
                    <li key={index} className="text-sm">
                      <span className="text-blue-400 font-medium">Q{index + 1}:</span>{" "}
                      {typeof question === 'string' ? question : question.question || question}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-slate-400">No questions available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
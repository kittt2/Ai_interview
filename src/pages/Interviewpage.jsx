import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const docRef = doc(db, "interviews", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setInterview({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
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
          <h1 className="text-3xl font-bold">{interview.role} Interview</h1>
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
            <h2 className="text-xl font-semibold mb-2">Questions</h2>
            {interview?.questions && interview?.questions.length > 0 ? (
              <ul className="space-y-3 list-disc list-inside text-slate-300">
                {interview?.questions?.map((q, index) => (
                  <li key={index}>
                    <p className="font-medium">{q?.question}</p>
                    {q && <p className="text-sm mt-1 text-slate-400">{q}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">No questions added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

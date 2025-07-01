import { useEffect, useState } from "react";

const Feedback = ({
  interviewId,
  fetchInterviewById,
  fetchFeedbackByInterviewId,
  fetchCurrentUser
}) => {
  const [user, setUser] = useState(null);
  const [interview, setInterview] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await fetchCurrentUser();
      if (!interviewId || !currentUser) return;

      setUser(currentUser);

      const interviewData = await fetchInterviewById(interviewId);
      if (!interviewData) {
        alert("Interview not found.");
        return;
      }

      setInterview(interviewData);

      const feedbackData = await fetchFeedbackByInterviewId({
        interviewId: interviewId,
        userId: currentUser.id
      });

      setFeedback(feedbackData);
    };

    fetchData();
  }, [interviewId, fetchInterviewById, fetchFeedbackByInterviewId, fetchCurrentUser]);

  if (!user || !interview || !feedback) {
    return <div style={{ color: "white", padding: "2rem" }}>Loading feedback...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", color: "white" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Feedback on the Interview – {interview.role} Interview
      </h1>

      <div style={{ marginBottom: "1rem" }}>
        <p style={{ fontSize: "1.2rem", fontWeight: "500" }}>
          Overall Impression:{" "}
          <span style={{ color: "#60A5FA" }}>{feedback.totalScore}</span>/100
        </p>
        <p style={{ fontSize: "0.875rem", color: "#D1D5DB" }}>
          {feedback.createdAt
            ? new Date(feedback.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
              })
            : "N/A"}
        </p>
      </div>

      <p style={{ marginBottom: "2rem" }}>{feedback.finalAssessment}</p>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Breakdown of the Interview</h2>
        {feedback.categoryScores?.map((category, index) => (
          <div key={index} style={{ marginTop: "1rem" }}>
            <p style={{ fontWeight: "500" }}>
              {index + 1}. {category.name} ({category.score}/100)
            </p>
            <p style={{ fontSize: "0.9rem", color: "#9CA3AF" }}>{category.comment}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Strengths</h2>
        <ul style={{ paddingLeft: "1.5rem" }}>
          {feedback.strengths?.map((strength, index) => (
            <li key={index} style={{ fontSize: "0.95rem", marginTop: "0.5rem" }}>{strength}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Areas for Improvement</h2>
        <ul style={{ paddingLeft: "1.5rem" }}>
          {feedback.areasForImprovement?.map((area, index) => (
            <li key={index} style={{ fontSize: "0.95rem", marginTop: "0.5rem" }}>{area}</li>
          ))}
        </ul>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={() => window.location.href = "/dashboard"}
          style={{
            background: "#374151",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => window.location.href = `/interview/${interviewId}`}
          style={{
            background: "#2563EB",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Retake Interview
        </button>
      </div>
    </div>
  );
};

export default Feedback;
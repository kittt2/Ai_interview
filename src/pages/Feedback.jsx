import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

const Feedback = ({ interview: propInterview, feedback: propFeedback, onBackToDashboard, onRetakeInterview }) => {
  const { id } = useParams(); // This is the interview ID
  const location = useLocation();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState(propInterview || null);
  const [feedback, setFeedback] = useState(propFeedback || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If props are provided, use them
    if (propInterview && propFeedback) {
      setInterview(propInterview);
      setFeedback(propFeedback);
      return;
    }

    // Check if data was passed via navigation state
    if (location.state?.interview && location.state?.feedback) {
      setInterview(location.state.interview);
      setFeedback(location.state.feedback);
      return;
    }

    // If no data available, fetch it
    fetchData();
  }, [id, location.state, propInterview, propFeedback]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get userId from your auth context or localStorage
      const userId = localStorage.getItem('userId') || 'current-user-id';
      
      // Fetch both interview and feedback data
      const [interviewResponse, feedbackResponse] = await Promise.all([
        fetch(`${API_BASE}/api/getinterview?interviewId=${encodeURIComponent(id)}`),
        fetch(`${API_BASE}/api/getfeedback?userId=${encodeURIComponent(userId)}&interviewId=${encodeURIComponent(id)}`)
      ]);

      if (!interviewResponse.ok || !feedbackResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const interviewData = await interviewResponse.json();
      const feedbackData = await feedbackResponse.json();
      
      setInterview(interviewData);
      setFeedback(feedbackData.feedback || feedbackData); // Handle different response structures
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      navigate('/dashboard'); // Default navigation
    }
  };

  const handleRetakeInterview = () => {
    if (onRetakeInterview) {
      onRetakeInterview();
    } else {
      navigate(`/interview/${id}`); // Default navigation
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-blue-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-lg text-red-400 mb-4">Error: {error}</div>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!interview) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-lg text-red-400">Interview not found</div>
      </div>
    );
  }

  // Loading feedback state
  if (!feedback) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg text-blue-400">Loading feedback...</div>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-center">
        <h1 className="text-4xl font-semibold text-center">
          Feedback on the Interview -{" "}
          <span className="capitalize">{interview.role}</span> Interview
        </h1>
      </div>

      {/* Stats */}
      <div className="flex justify-center">
        <div className="flex gap-8">
          {/* Overall Impression */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 text-yellow-500" aria-hidden="true">⭐</div>
            <p className="text-lg">
              Overall Impression:{" "}
              <span 
                className="text-blue-400 font-bold text-xl"
                role="status"
                aria-label={`Overall score: ${feedback?.totalScore} out of 100`}
              >
                {feedback?.totalScore}
              </span>
              /100
            </p>
          </div>
          
          {/* Date */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 text-gray-600" aria-hidden="true">📅</div>
            <p className="text-lg">
              {formatDate(feedback?.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-600" />

      {/* Final Assessment */}
      {feedback?.finalAssessment && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-3 text-blue-400">Final Assessment</h2>
          <p className="text-gray-200 leading-relaxed">{feedback.finalAssessment}</p>
        </div>
      )}

      {/* Interview Breakdown */}
      {feedback?.categoryScores && feedback.categoryScores.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Breakdown of the Interview:</h2>
          <div className="space-y-4">
            {feedback.categoryScores.map((category, index) => (
              <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-white">
                    {index + 1}. {category.name}
                  </h3>
                  <span 
                    className="bg-blue-900 text-blue-300 px-3 py-1 rounded-full font-semibold"
                    role="status"
                    aria-label={`${category.name} score: ${category.score} out of 100`}
                  >
                    {category.score}/100
                  </span>
                </div>
                {category.comment && (
                  <p className="text-gray-300">{category.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {feedback?.strengths && feedback.strengths.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-green-400">Strengths</h3>
          <div className="bg-green-950 border border-green-800 rounded-lg p-4">
            <ul className="space-y-2" role="list">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-400 mt-1" aria-hidden="true">✓</span>
                  <span className="text-gray-200">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Areas for Improvement */}
      {feedback?.areasForImprovement && feedback.areasForImprovement.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-orange-400">Areas for Improvement</h3>
          <div className="bg-orange-950 border border-orange-800 rounded-lg p-4">
            <ul className="space-y-2" role="list">
              {feedback.areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1" aria-hidden="true">→</span>
                  <span className="text-gray-200">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          onClick={handleBackToDashboard}
          className="flex-1 bg-gray-800 border-2 border-blue-500 text-blue-400 py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label="Return to main dashboard"
        >
          Back to Dashboard
        </button>
        <button
          onClick={handleRetakeInterview}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label="Start a new interview session"
        >
          Retake Interview
        </button>
      </div>

      {/* Empty state handling */}
      {(!feedback?.categoryScores || feedback.categoryScores.length === 0) && 
       (!feedback?.strengths || feedback.strengths.length === 0) && 
       (!feedback?.areasForImprovement || feedback.areasForImprovement.length === 0) && 
       !feedback?.finalAssessment && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg">
            No detailed feedback available for this interview.
          </div>
        </div>
      )}
    </section>
  );
};

export default Feedback;
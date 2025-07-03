// Enhanced ModernFeedback Component with Navbar-Matching Colors
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Download,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowLeft,
  Crown,
  Loader2,
  Trophy,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_BASE = "https://ai-interview-brown-xi.vercel.app";

const ModernFeedback = ({ interview: propInterview, feedback: propFeedback }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(propInterview || null);
  const [feedback, setFeedback] = useState(propFeedback || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (propInterview && propFeedback) {
      setInterview(propInterview);
      setFeedback(propFeedback);
      return;
    }
    if (location.state?.interview && location.state?.feedback) {
      setInterview(location.state.interview);
      setFeedback(location.state.feedback);
      return;
    }
    if (id) fetchData();
  }, [id, location.state, propInterview, propFeedback]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = localStorage?.getItem('userId') || 'current-user-id';
      const [interviewResponse, feedbackResponse] = await Promise.all([
        fetch(`${API_BASE}/api/getinterview?interviewId=${encodeURIComponent(id)}`),
        fetch(`${API_BASE}/api/getfeedback?userId=${encodeURIComponent(userId)}&interviewId=${encodeURIComponent(id)}`)
      ]);
      if (!interviewResponse.ok || !feedbackResponse.ok) throw new Error('Failed to fetch data');
      const interviewData = await interviewResponse.json();
      const feedbackData = await feedbackResponse.json();
      setInterview(interviewData);
      setFeedback(feedbackData.feedback || feedbackData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      const reportContent = `INTERVIEW FEEDBACK REPORT\n\nInterview: ${interview?.role || 'N/A'}\nDate: ${formatDate(feedback?.createdAt)}\nOverall Score: ${feedback?.totalScore}/100\n\nFINAL ASSESSMENT\n${feedback?.finalAssessment || 'N/A'}\n\nCATEGORY BREAKDOWN\n${feedback?.categoryScores?.map(cat => `${cat.name}: ${cat.score}/100\n${cat.comment}\n`).join('\n') || 'N/A'}\n\nSTRENGTHS\n${feedback?.strengths?.map(s => `• ${s}`).join('\n') || 'N/A'}\n\nAREAS FOR IMPROVEMENT\n${feedback?.areasForImprovement?.map(a => `• ${a}`).join('\n') || 'N/A'}\n\nGenerated on: ${new Date().toLocaleString()}`;
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Interview_Feedback_${interview?.role?.replace(/\s+/g, '_') || 'Report'}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      setError('Failed to download report.');
    } finally {
      setIsDownloading(false);
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

  if (loading) return <div className="min-h-screen bg-slate-950 flex justify-center items-center text-slate-100">Loading...</div>;
  if (error) return <div className="min-h-screen bg-slate-950 flex justify-center items-center text-red-400">{error}</div>;
  if (!interview || !feedback) return <div className="min-h-screen bg-slate-950 flex justify-center items-center text-slate-400">No data available.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6 sm:px-6 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Interview Feedback
            </h1>
            <p className="text-slate-400 text-sm mt-1">{interview.role} – {formatDate(feedback.createdAt)}</p>
          </div>
          <Button onClick={handleDownloadReport} disabled={isDownloading} className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 transition-all duration-300 border-0">
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download
          </Button>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 shadow-xl shadow-slate-900/20">
          <CardHeader>
            <CardTitle className="text-slate-100">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              {feedback.totalScore}/100
            </div>
            <div className="mt-4 relative">
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-violet-500/50"
                  style={{ width: `${feedback.totalScore}%` }}
                ></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-600/20 rounded-full blur-sm"></div>
            </div>
          </CardContent>
        </Card>

        {feedback.finalAssessment && (
          <Card className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 shadow-xl shadow-slate-900/20">
            <CardHeader>
              <CardTitle className="text-slate-100">Final Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm lg:text-[1rem] text-slate-300 leading-relaxed whitespace-pre-line">{feedback.finalAssessment}</p>
            </CardContent>
          </Card>
        )}

        {feedback.categoryScores?.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-200">Category Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {feedback.categoryScores.map((cat, i) => (
                <Card key={i} className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 shadow-xl shadow-slate-900/20 hover:border-slate-600/60 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center text-slate-100">
                      <span>{cat.name}</span>
                      <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">{cat.score}/100</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${cat.score}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs lg:text-[0.90rem] mt-2 text-slate-300 whitespace-pre-line">{cat.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedback.strengths?.length > 0 && (
            <Card className="bg-slate-900/50 backdrop-blur-sm border border-emerald-500/30 shadow-xl shadow-emerald-900/10">
              <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-emerald-300">
                  {feedback.strengths.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}
          {feedback.areasForImprovement?.length > 0 && (
            <Card className="bg-slate-900/50 backdrop-blur-sm border border-amber-500/30 shadow-xl shadow-amber-900/10">
              <CardHeader>
                <CardTitle className="text-amber-400 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2 text-sm text-amber-300">
                  {feedback.areasForImprovement.slice(0, 3).map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="pt-4">
          <Button onClick={() => navigate('/')} className="w-full sm:w-auto bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-slate-100 font-semibold shadow-lg hover:shadow-slate-600/25 hover:scale-105 transition-all duration-200 border border-slate-600/50">
            <Home className="h-4 w-4 mr-2" /> Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModernFeedback;
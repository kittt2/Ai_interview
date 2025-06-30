import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase/client";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Code, Briefcase, Plus, Sparkles, CheckCircle2, Clock } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myInterviews, setMyInterviews] = useState([]);
  const [allInterviews, setAllInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const [users, setUsers] = useState({}); // Store user info by uid
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoadingInterviews(true);
        
        console.log("=== DEBUG: Starting to fetch interviews ===");
        console.log("Current user:", user?.uid);
        console.log("Database reference:", db);
        
        // Fetch all interviews from the 'interviews' collection
        const interviewsRef = collection(db, "interviews");
        console.log("Collection reference:", interviewsRef);
        
        const allInterviewsSnapshot = await getDocs(interviewsRef);
        console.log("Snapshot received, size:", allInterviewsSnapshot.size);
        console.log("Snapshot empty?", allInterviewsSnapshot.empty);
        
        if (allInterviewsSnapshot.empty) {
          console.log("No interviews found in the collection");
          setAllInterviews([]);
          setMyInterviews([]);
          return;
        }
        
        const allInterviewsList = [];
        allInterviewsSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`Interview ID: ${doc.id}`, data);
          allInterviewsList.push({
            id: doc.id,
            ...data,
          });
        });
        
        console.log("Total interviews fetched:", allInterviewsList.length);
        console.log("All interviews:", allInterviewsList);
        setAllInterviews(allInterviewsList);
        
        // Fetch user information for all interviews
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersMap = {};
        usersSnapshot.forEach(doc => {
          usersMap[doc.id] = doc.data();
        });
        setUsers(usersMap);
        console.log("Users fetched:", usersMap);
        
        // Filter user's interviews if user is logged in
        if (user && user.uid) {
          const userInterviews = allInterviewsList.filter(interview => {
            const match = interview.userid === user.uid;
            console.log(`Interview ${interview.id}: userid="${interview.userid}" vs current user="${user.uid}" => match: ${match}`);
            return match;
          });
          console.log("User's interviews:", userInterviews);
          setMyInterviews(userInterviews);
        } else {
          console.log("No user logged in, setting empty array for user interviews");
          setMyInterviews([]);
        }
        
      } catch (error) {
        console.error("=== ERROR fetching interviews ===");
        console.error("Error object:", error);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        
        // Set empty arrays on error
        setAllInterviews([]);
        setMyInterviews([]);
      } finally {
        setLoadingInterviews(false);
        console.log("=== DEBUG: Finished fetching interviews ===");
      }
    };

    // Only fetch when user loading is complete
    if (!loading) {
      console.log("User loading complete, fetching interviews...");
      fetchInterviews();
    } else {
      console.log("Still loading user authentication...");
    }
  }, [user, loading]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const InterviewCard = ({ interview, showCreator = false }) => {
    const creatorName = users[interview.userid]?.fullName || 'Unknown User';
    const creatorInitials = getInitials(creatorName);
    
    return (
      <Card 
        className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 text-white backdrop-blur-sm"
        onClick={() => navigate(`/interview/${interview.id}`)}
      >
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse"></div>
                <CardTitle className="text-xl font-bold text-white capitalize bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                  {interview.role} Interview
                </CardTitle>
              </div>
              <CardDescription className="text-slate-400 font-medium">
                {interview.level} Level • {interview.type} Questions
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              {interview.finalized ? (
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-500/10">
                  <Clock className="w-3 h-3 mr-1" />
                  Draft
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4">
          {/* Tech Stack */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Code className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-300 mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {interview.techstack?.map((tech, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs border-slate-600/50 text-slate-300 bg-slate-800/30 hover:bg-slate-700/50 transition-colors"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {/* Questions and Date Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <Briefcase className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">Questions</p>
                <p className="text-lg font-bold text-white">{interview.questions?.length || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <Calendar className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">Created</p>
                <p className="text-sm text-white font-medium">{formatDate(interview.createdAt)}</p>
              </div>
            </div>
          </div>
          
          {/* Creator Info */}
          {showCreator && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {creatorInitials}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">Created by</p>
                  <p className="text-sm text-white font-semibold">{creatorName}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="text-slate-300 font-medium">Loading your workspace...</div>
        </div>
      </div>
    );
  }

  // If user is not logged in, show welcome page
  if (!user) {
    return (
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
              IntelliHire
            </h1>
          </div>
          
          <p className="text-xl max-w-2xl mb-8 text-slate-300 leading-relaxed">
            Your AI-powered interview assistant. Practice, prepare, and perfect your skills with 
            <span className="text-blue-300 font-semibold"> smart feedback</span> and 
            <span className="text-purple-300 font-semibold"> real-time simulations</span>.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button 
                variant="outline" 
                className="px-8 py-3 border-2 border-slate-600 text-slate-200 hover:bg-slate-800 hover:border-slate-500 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/10 to-blue-500/10 blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            Welcome back, {user?.displayName || 'Developer'}! 👋
          </h1>
          <p className="text-xl text-slate-300">Ready to ace your next interview?</p>
        </div>

        {loadingInterviews ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="text-slate-300 font-medium">Loading interviews...</div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Debug Info - Styled as a modern info card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                Debug Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <p className="text-slate-400">User ID</p>
                  <p className="text-slate-200 font-mono text-xs">{user?.uid}</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <p className="text-slate-400">Total Interviews</p>
                  <p className="text-2xl font-bold text-blue-400">{allInterviews.length}</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <p className="text-slate-400">My Interviews</p>
                  <p className="text-2xl font-bold text-purple-400">{myInterviews.length}</p>
                </div>
              </div>
            </div>

            {/* My Interviews Section */}
            <section>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    My Interviews
                  </h2>
                  <p className="text-slate-400">Manage and track your interview preparations</p>
                </div>
                <Link to="/create-interview">
                  <Button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Interview
                  </Button>
                </Link>
              </div>
              
              {myInterviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {myInterviews.map(interview => (
                    <InterviewCard key={interview.id} interview={interview} />
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Ready to start your journey?</h3>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    Create your first interview session and begin practicing with AI-powered feedback
                  </p>
                  <Link to="/create-interview">
                    <Button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Interview
                    </Button>
                  </Link>
                </div>
              )}
            </section>

            {/* All Interviews Section */}
            <section>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-300 to-blue-300 bg-clip-text text-transparent">
                  Explore Community Interviews
                </h2>
                <p className="text-slate-400">Discover and practice with interviews created by other users</p>
              </div>
              
              {allInterviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {allInterviews.map(interview => (
                    <InterviewCard 
                      key={interview.id} 
                      interview={interview} 
                      showCreator={interview.userid !== user.uid}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Be a pioneer!</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    No interviews available yet. Create the first one and help build the community!
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
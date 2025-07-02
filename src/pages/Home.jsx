import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase/client";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Sparkles, Plus,Award,Brain,Target,Shield,Zap,TrendingUp } from "lucide-react";
import InterviewCard from "../pages/Interviewcard";
import Homepage from "./Hero";


export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myInterviews, setMyInterviews] = useState([]);
  const [allInterviews, setAllInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const [users, setUsers] = useState({});
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

        const interviewsRef = collection(db, "interviews");
        const allInterviewsSnapshot = await getDocs(interviewsRef);

        const allInterviewsList = [];
        allInterviewsSnapshot.forEach((doc) => {
          allInterviewsList.push({ id: doc.id, ...doc.data() });
        });
        setAllInterviews(allInterviewsList);

        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersMap = {};
        usersSnapshot.forEach((doc) => {
          usersMap[doc.id] = doc.data();
        });
        setUsers(usersMap);

        if (user?.uid) {
          const userInterviews = allInterviewsList.filter(
            (interview) => interview.userid === user.uid
          );
          setMyInterviews(userInterviews);
        } else {
          setMyInterviews([]);
        }
      } catch (error) {
        console.error("Error fetching interviews:", error);
        setAllInterviews([]);
        setMyInterviews([]);
      } finally {
        setLoadingInterviews(false);
      }
    };

    if (!loading) {
      fetchInterviews();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="text-slate-300 font-medium">Loading your workspace...</div>
        </div>
      </div>
    );
  }

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 text-white">
      
      <Homepage/>
      <div className="max-w-7xl mx-auto p-6 pt-14">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            Welcome back, {user?.displayName || "Developer"}! 👋
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
            {/* My Interviews */}
            <section>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    My Interviews
                  </h2>
                  <p className="text-slate-400">Manage and track your interview preparations</p>
                </div>
                <Link to="/interview">
                  <Button  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Interview
                  </Button>
                </Link>
              </div>

              {myInterviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {myInterviews.map((interview) => (
                    <InterviewCard
                      key={interview.id}
                      interview={interview}
                      showCreator={false}
                      creatorName={users[interview.userid]?.fullName}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border border-slate-700/50 rounded-2xl bg-slate-800/40">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Ready to start your journey?</h3>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    Create your first interview session and begin practicing with AI-powered feedback
                  </p>
                  <Link to="/interview">
                    <Button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Interview
                    </Button>
                  </Link>
                </div>
              )}
            </section>

            {/* All Interviews */}
            <section>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-300 to-blue-300 bg-clip-text text-transparent">
                  Explore Community Interviews
                </h2>
                <p className="text-slate-400">Discover and practice with interviews created by other users</p>
              </div>

              {allInterviews.length > 0 ? (
                <div  className=" grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {allInterviews.map((interview) => (
                    <InterviewCard
                      key={interview.id}
                      interview={interview}
                      showCreator={interview.userid !== user.uid}
                      creatorName={users[interview.userid]?.fullName}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border border-slate-700/50 rounded-2xl bg-slate-800/40">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Be a pioneer!</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    No interviews available yet. Create the account or login.
                  </p>
                </div>
              )}
            </section>

            <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
              Why Choose MockAI?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our AI-powered platform provides everything you need to ace your interviews
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-violet-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-500/30 transition-colors duration-300">
                <Brain className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100 group-hover:text-violet-300 transition-colors duration-300">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Get instant feedback on your answers, body language, and speech patterns with our advanced AI technology.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors duration-300">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100 group-hover:text-purple-300 transition-colors duration-300">
                Personalized Practice
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Practice with questions tailored to your industry, role, and experience level for maximum relevance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-indigo-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500/30 transition-colors duration-300">
                <Shield className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100 group-hover:text-indigo-300 transition-colors duration-300">
                Secure & Private
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Your practice sessions and data are completely secure with enterprise-grade encryption.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-colors duration-300">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100 group-hover:text-cyan-300 transition-colors duration-300">
                Real-time Feedback
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Receive instant suggestions and improvements during your practice sessions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-emerald-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors duration-300">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100 group-hover:text-emerald-300 transition-colors duration-300">
                Progress Tracking
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Monitor your improvement with detailed analytics and performance metrics.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-pink-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-500/30 transition-colors duration-300">
                <Award className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-100 group-hover:text-pink-300 transition-colors duration-300">
                Expert-Crafted Content
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Learn from questions and scenarios created by industry professionals and HR experts.
              </p>
            </div>
          </div>
        </div>
      </section>
          </div>
        )}
      </div>
      
      
    </div>
    

  );
}

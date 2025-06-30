import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase/client";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Sparkles, Plus } from "lucide-react";
import InterviewCard from "../pages/Interviewcard";

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

  if (!user) {
    return (
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
              IntelliHire
            </h1>
          </div>
          <p className="text-xl mb-8 text-slate-300">
            Your AI-powered interview assistant. Practice, prepare, and perfect your skills with{" "}
            <span className="text-blue-300 font-semibold">smart feedback</span> and{" "}
            <span className="text-purple-300 font-semibold">real-time simulations</span>.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login">
              <Button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" className="px-8 py-3 border-2 border-slate-600 text-slate-200 rounded-xl">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
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
                <Link to="/create-interview">
                  <Button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl">
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
                  <Link to="/create-interview">
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

import { useEffect, useState } from "react";
import { Brain, ArrowRight, Play } from "lucide-react";
import backgroundImage from "../assets/imageee.png";
import { useNavigate } from "react-router-dom";

export default function Homepage() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate=useNavigate()
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image (unchanged) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat lg:bg-right"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        {/* Optional color overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 via-transparent to-purple-600/30 animate-pulse" />
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-indigo-600/20 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Semi-transparent overlay for text contrast */}
      <div className="absolute inset-0 bg-black/50 lg:bg-gradient-to-r lg:from-black/70 lg:to-black/30" />

      {/* 💫 Background Pulse + Floating Lines + Space Dots */}
<div className="absolute inset-0 z-0 pointer-events-none">
  {/* Glowing Pulse Blobs */}
  <div className="absolute top-[20%] left-[10%] w-80 h-80 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
  <div className="absolute bottom-[20%] right-[15%] w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
  <div className="absolute top-[50%] left-[30%] w-60 h-60 bg-indigo-500/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "4s" }} />

  {/* 🌌 Floating Lines */}
  <div className="absolute top-1/4 left-0 w-px h-40 bg-violet-400/20 animate-floatLine delay-[0s]" />
  <div className="absolute top-1/3 left-1/3 w-px h-32 bg-purple-400/20 animate-floatLine delay-[2s]" />
  <div className="absolute top-2/3 left-1/2 w-px h-48 bg-indigo-400/20 animate-floatLine delay-[4s]" />

  {/* ✨ Twinkling Dots */}
  {Array.from({ length: 20 }).map((_, i) => (
    <div
      key={i}
      className="absolute w-1 h-1 rounded-full bg-white/20 animate-twinkle"
      style={{
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${i * 0.5}s`,
      }}
    />
  ))}
</div>


      {/* Content */}
      <div className="relative z-10 flex items-center justify-center lg:justify-start min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div
            className={`text-center lg:text-left max-w-4xl lg:max-w-2xl mx-auto lg:mx-0 py-16 transition-all duration-1000 transform ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            {/* Logo + Title */}
            <div className="flex items-center justify-center lg:justify-start mb-6 space-x-3">
              <div className="relative p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-lg">
                <Brain className="h-8 w-8 text-white" />
                <div className="absolute inset-0 bg-violet-400/20 blur-xl rounded-full animate-pulse" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                MockAI
              </h1>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-100 mb-6">
              AI Interview Mastery Platform
            </h2>

            <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0">
              Get real-time feedback and{" "}
              <span className="text-violet-400 font-medium">industry-specific scenarios</span> to ace your dream job interviews.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6">
              <button onClick={()=>navigate("/interview")} className="cursor-pointer bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 w-full sm:w-auto">
                <span>Start Your Journey</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button onClick={()=>navigate("/interview")} className="cursor-pointer bg-gray-900/50 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg border border-gray-700/50 hover:border-violet-500/50 hover:bg-gray-800/50 transition-all duration-300 flex items-center space-x-2 w-full sm:w-auto">
                <span>Take Interview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

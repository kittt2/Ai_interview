import { useEffect, useState } from "react";
import { Brain, ArrowRight, Play } from "lucide-react";
import backgroundImage from "../assets/imageee.png";
import { useNavigate } from "react-router-dom";

export default function Homepage() {
  const [ripples, setRipples] = useState([]);
  const navigate=useNavigate()

  useEffect(() => {
    const createRipple = () => {
      const newRipple = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
      };
      
      setRipples(prev => [...prev, newRipple]);
      
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 4000);
    };

    const interval = setInterval(createRipple, 2000);
    return () => {
      clearInterval(interval);
      setRipples([]);
    };
  }, []);

  useEffect(() => {
    return () => {
      setRipples([]);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat lg:bg-right"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 via-transparent to-purple-600/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-indigo-600/20" />
      </div>

      <div className="absolute inset-0 bg-black/50 lg:bg-gradient-to-r lg:from-black/70 lg:to-black/30" />

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] right-[15%] w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute top-[50%] left-[30%] w-60 h-60 bg-indigo-500/15 rounded-full blur-2xl" />


        
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute rounded-full border-2 border-violet-400/30"
            style={{
              left: `${ripple.x}%`,
              top: `${ripple.y}%`,
              width: '20px',
              height: '20px',
              transform: 'translate(-50%, -50%)',
              animation: 'ripple 4s ease-out forwards',
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
          }
        }
      `}</style>

      <div className="relative z-10 flex items-center justify-center lg:justify-start min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center lg:text-left max-w-4xl lg:max-w-2xl mx-auto lg:mx-0 py-16">
            <div className="flex items-center justify-center lg:justify-start mb-6 space-x-3">
              <div className="relative p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-lg">
                <Brain className="h-8 w-8 text-white" />
                <div className="absolute inset-0 bg-violet-400/20 blur-xl rounded-full" />
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

            <div className="flex flex-col  sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6">
              <button onClick={()=>navigate("/interview")} className="cursor-pointer bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white py-3 justify-center  sm:px-8 sm:py-4 rounded-xl font-semibold text-sm sm:text-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 w-full sm:w-auto">
                <span>Start Your Journey</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button onClick={()=>navigate("/interview")} className="cursor-pointer bg-gray-900/50 backdrop-blur-sm text-white py-3 justify-center sm:px-8 sm:py-4 rounded-xl font-semibold text-lg border border-gray-700/50 hover:border-violet-500/50 hover:bg-gray-800/50 transition-all duration-300 flex items-center space-x-2 w-full sm:w-auto">
                <span>Take Interview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
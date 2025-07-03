import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Crown } from "lucide-react";

export default function ErrorNotFound() {
  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl rounded-full"></div>
          <div className="relative bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 rounded-2xl p-8 shadow-2xl shadow-black/50">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Crown className="h-16 w-16 text-violet-400 animate-pulse" />
                <div className="absolute inset-0 bg-violet-400/20 blur-xl rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-8xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                404
              </h1>
              
              <h2 className="text-2xl font-semibold text-gray-100">
                Page Not Found
              </h2>
              
              <p className="text-gray-400 text-base leading-relaxed">
                The page you're looking for doesn't exist or has been moved. 
                Let's get you back on track.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                onClick={handleGoHome}
                className="cursor-pointer bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 transform hover:scale-105"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
              
              <Button 
                onClick={handleGoBack}
                variant="ghost"
                className="cursor-pointer text-gray-300 hover:text-violet-300 hover:bg-gray-800/50 border border-gray-700/50 hover:border-violet-500/50 px-6 py-3 rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="text-sm text-gray-500">
            Error Code: 404
          </div>
        </div>
      </div>
    </div>
  );
}
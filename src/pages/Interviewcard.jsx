// components/InterviewCard.jsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Code, Briefcase, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export default function InterviewCard({ interview, showCreator = false, creatorName = 'Unknown User' }) {
  const navigate = useNavigate();
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
}

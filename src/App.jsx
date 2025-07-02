import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Button } from "@/components/ui/button";
import LoginForm from "./pages/signin";
import RegisterForm from "./pages/signup";
import Home from "./pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./pages/Layout";
import Interview from "./pages/interview";
import InterviewDetail from "./pages/Interviewpage";
import Feedback from "./pages/Feedback";
import ProfilePage from "./pages/Profile";
import { Toaster } from "sonner";// ✅ Add this import

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/interview/:id" element={<InterviewDetail />} />
            <Route path="/interview/:id/feedback" element={<Feedback />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/register" element={<RegisterForm />} />
          </Route>
        </Routes>
      </Router>

      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;

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
import interview from "./pages/interview";
import Interview from "./pages/interview";
import InterviewDetail from "./pages/Interviewpage";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/interview" element={<Interview/>} />
            <Route path="/interview/:id" element={<InterviewDetail />} />
            <Route path="/register" element={<RegisterForm />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;

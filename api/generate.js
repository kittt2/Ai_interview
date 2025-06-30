import { getAuth } from "firebase-admin/auth"; // ✅ admin SDK
import { db } from '../firebase/admin.js';
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyCl7qLFk7RQRZudNY6WfygKZ3VjkKE__s8"
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // ✅ Step 1: Verify Firebase token
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) return res.status(401).json({ error: "Missing Firebase token" });

    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;

    console.log("🔥 Authenticated Firebase UID:", uid);

    // Step 2: Extract rest of the body
    const { role, level, type, techstack, amount } = req.body;

    // Step 3: Generate questions using Gemini
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
The job role is ${role || 'Software Developer'}.
The job experience level is ${level || 'mid'}.
The tech stack used in the job is: ${techstack || 'JavaScript'}.
The focus between behavioural and technical questions should lean towards: ${type || 'technical'}.
The amount of questions required is: ${amount || 5}.
Return like ["Question 1", "Question 2"] only.`
    });

    let parsedQuestions = [];
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (err) {
      parsedQuestions = questions.split('\n').filter(Boolean);
    }

    const interview = {
      role: role || "Software Developer",
      level: level || "mid",
      type: type || "technical",
      techstack: techstack ? techstack.split(',').map(t => t.trim()) : [],
      questions: parsedQuestions,
      userid: uid, // ✅ THIS is now 100% secure
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      finalized: true
    };

    const docRef = await db.collection("interviews").add(interview);
    const savedDoc = await docRef.get();

    res.status(200).json({
      success: true,
      interviewId: docRef.id,
      questions: parsedQuestions,
      uid,
      saved: savedDoc.data()
    });

  } catch (error) {
    console.error("❌ API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

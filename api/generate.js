import { db } from '../firebase/admin.js';
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.Googleaikey   // Use environment variable instead
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { role, level, type, techstack, amount, userid } = req.body;

  if (!userid) {
    return res.status(400).json({ success: false, error: "Missing 'userid' field in request body." });
  }

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare ${amount || 5} questions for a job interview.
The job role is ${role || "Software Developer"}.
The job experience level is ${level || "mid"}.
The tech stack used in the job is: ${techstack || "JavaScript"}.
The focus between behavioural and technical questions should lean towards: ${type || "technical"}.

Return ONLY a valid JSON array of strings, nothing else. No extra text, no formatting, just the array.
Example format: ["Question 1", "Question 2", "Question 3"]

The questions should be clear and professional, avoiding special characters like /, *, etc.`
    });

    // Clean the response and parse it
    let parsedQuestions;
    try {
      // Remove any extra characters and whitespace
      const cleanedQuestions = questions.trim().replace(/^[^[]*/, '').replace(/[^\]]*$/, '');
      parsedQuestions = JSON.parse(cleanedQuestions);
      
      // Validate that we got an array
      if (!Array.isArray(parsedQuestions)) {
        throw new Error("Response is not an array");
      }
    } catch (parseError) {
      console.error("❌ Failed to parse questions:", questions);
      // Fallback: try to extract questions manually
      const lines = questions.split('\n').filter(line => line.trim());
      parsedQuestions = lines.map(line => 
        line.replace(/^\d+\.?\s*/, '') // Remove numbering
            .replace(/^["']|["']$/g, '') // Remove quotes
            .trim()
      ).filter(q => q.length > 0);
    }

    const interview = {
      role: role || "Software Developer",
      level: level || "mid",
      type: type || "technical",
      techstack: techstack ? techstack.split(',').map(t => t.trim()) : [],
      questions: parsedQuestions,
      userid: userid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      finalized: true
    };

    const docRef = await db.collection("interviews").add(interview);
    const savedData = (await docRef.get()).data();

    return res.status(200).json({
      success: true,
      interviewId: docRef.id,
      questions: parsedQuestions, // Fixed: use the correct variable
      saved: savedData
    });

  } catch (error) {
    console.error("❌ API Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
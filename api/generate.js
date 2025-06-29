import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { db } from '../firebase/admin.js';

// Create Google AI instance
const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyCl7qLFk7RQRZudNY6WfygKZ3VjkKE__s8"
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("=== API REQUEST DEBUG ===");
  console.log("Full request body:", JSON.stringify(req.body, null, 2));
  console.log("Headers:", req.headers);

  // 🔧 Flatten variableValues into root of body
  if (req.body.variableValues && typeof req.body.variableValues === 'object') {
    Object.entries(req.body.variableValues).forEach(([key, value]) => {
      if (!req.body[key]) req.body[key] = value;
    });
  }

  // ✅ Destructure after flattening
  const { type, role, level, techstack, amount, userid } = req.body;

  // ✅ Normalize userId
  const possibleUserIds = [
    userid,
    req.body.userId,
    req.body.user_id,
    req.body.username
  ];
  const actualUserId = possibleUserIds.find(id => id && typeof id === 'string' && id.trim().length > 0);

  console.log("Resolved user ID:", actualUserId);

  // ❌ Validate
  if (!actualUserId) {
    console.error("❌ USER ID VALIDATION FAILED");
    return res.status(400).json({
      success: false,
      error: "User ID is required",
      debug: {
        receivedFields: Object.keys(req.body),
        bodyContent: req.body
      }
    });
  }

  console.log("✅ User ID validation passed:", actualUserId);

  try {
    // 🎯 Prompt for question generation
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
The job role is ${role || 'Software Developer'}.
The job experience level is ${level || 'mid'}.
The tech stack used in the job is: ${techstack || 'JavaScript'}.
The focus between behavioural and technical questions should lean towards: ${type || 'technical'}.
The amount of questions required is: ${amount || 5}.
Please return only the questions, without any additional text.
The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
Return the questions formatted like this:
["Question 1", "Question 2", "Question 3"]
Thank you! <3`
    });

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
    } catch (parseError) {
      console.error("⚠️ Error parsing questions, fallback to manual split:", parseError);
      parsedQuestions = questions.split('\n').filter(q => q.trim().length > 0);
    }

    // 🎯 Prepare interview object
    const interview = {
      role: role || "Software Developer",
      type: type || "technical",
      level: level || "mid",
      techstack: techstack ? techstack.split(",").map(tech => tech.trim()) : [],
      questions: parsedQuestions,
      userid: actualUserId,
      finalized: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log("=== SAVING TO FIREBASE ===");
    console.log("Interview object:", JSON.stringify(interview, null, 2));

    // 💾 Save to Firestore
    const docRef = await db.collection("interviews").add(interview);
    console.log("✅ Interview saved with ID:", docRef.id);

    // ✅ Verify saved data
    const savedDoc = await docRef.get();
    const savedData = savedDoc.data();

    res.status(200).json({
      success: true,
      interviewId: docRef.id,
      questions: parsedQuestions,
      userid: actualUserId,
      debug: {
        savedUserId: savedData.userid,
        originalRequestBody: req.body
      }
    });

  } catch (error) {
    console.error("❌ Error generating interview:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: "Failed to generate or save interview"
    });
  }
}

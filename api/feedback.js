import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google'; // ✅ Correct import
import { feedbackSchema } from '../../src/pages/interviewer.js'; // ✅ Adjust path if needed
import { db } from '../../firebase/admin.js'; // ✅ Adjust path if needed

const google = createGoogleGenerativeAI({
  apiKey: process.env.Googleaikey, // ✅ Use secure env variable
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { interviewId, userId, transcript, feedbackId } = req.body;

    if (!interviewId || !userId || !transcript) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const formattedTranscript = transcript
      .map(sentence => `- ${sentence.role}: ${sentence.content}\n`)
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        
        Transcript:
        ${formattedTranscript}
        
        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
      `,
      system: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories.",
    });

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set(feedback);

    return res.status(200).json({
      success: true,
      feedbackId: feedbackRef.id,
      feedback,
    });

  } catch (error) {
    console.error("Error creating feedback:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

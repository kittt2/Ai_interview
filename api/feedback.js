// pages/api/feedback/create.js
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { feedbackSchema } from '../src/pages/interviewer.js';
import { db } from '../firebase/admin.js'; // Your Firebase config

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
      system: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;
    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return res.status(200).json({ 
      success: true, 
      feedbackId: feedbackRef.id,
      feedback: feedback 
    });

  } catch (error) {
    console.error("Error creating feedback:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}




// export default async function handler(req, res) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const { id } = req.query;

//     if (!id) {
//       return res.status(400).json({ error: 'Missing interview ID' });
//     }

//     const interview = await db.collection("interviews").doc(id).get();
    
//     if (!interview.exists) {
//       return res.status(404).json({ error: 'Interview not found' });
//     }

//     const interviewData = { id: interview.id, ...interview.data() };

//     return res.status(200).json({ success: true, interview: interviewData });

//   } catch (error) {
//     console.error("Error getting interview:", error);
//     return res.status(500).json({ 
//       success: false, 
//       error: error.message 
//     });
//   }
// }
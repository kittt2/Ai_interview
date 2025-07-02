import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { feedbackSchema } from '../src/pages/interviewer.js';
import { db } from '../firebase/admin.js';

const google = createGoogleGenerativeAI({
  apiKey: process.env.Googleaikey,
});

// Vercel's official CORS wrapper function
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Alternative for specific origins:
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return await fn(req, res);
};

// Your main handler function
const handler = async (req, res) => {
  // Only allow POST requests for the main functionality
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST', 'OPTIONS']
    });
  }

  try {
    const { interviewId, userId, transcript, feedbackId } = req.body;

    // Validate required fields
    if (!interviewId || !userId || !transcript) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['interviewId', 'userId', 'transcript']
      });
    }

    // Validate transcript format
    if (!Array.isArray(transcript) || transcript.length === 0) {
      return res.status(400).json({ 
        error: 'Transcript must be a non-empty array' 
      });
    }

    console.log('Processing feedback for:', { interviewId, userId, transcriptLength: transcript.length });

    // Format transcript for AI analysis
    const formattedTranscript = transcript
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    console.log('Formatted transcript preview:', formattedTranscript.substring(0, 200) + '...');

    // Generate feedback using AI
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        
        Interview Transcript:
        ${formattedTranscript}
        
        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural Fit**: Alignment with company values and job role.
        - **Confidence and Clarity**: Confidence in responses, engagement, and clarity.
        
        Provide specific examples from the transcript to support your scores and recommendations.
      `,
      system: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories with specific examples and actionable feedback.",
    });

    console.log('AI feedback generated successfully');

    // Prepare feedback object
    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
      transcriptLength: transcript.length,
    };

    // Save to database
    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set(feedback);

    console.log('Feedback saved to database with ID:', feedbackRef.id);

    return res.status(200).json({
      success: true,
      feedbackId: feedbackRef.id,
      feedback,
      message: 'Feedback generated and saved successfully'
    });

  } catch (error) {
    console.error("Error creating feedback:", error);
    
    // Return more specific error information
    return res.status(500).json({
      success: false,
      error: error.message,
      type: error.name,
      timestamp: new Date().toISOString()
    });
  }
};

// Export the handler wrapped with CORS - THIS IS THE MAIN EXPORT
// This replaces your original "export default async function handler(req, res)"
export default allowCors(handler);
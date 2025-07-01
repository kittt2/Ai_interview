
// pages/api/feedback/create.js
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { feedbackSchema } from '../src/pages/interviewer.js';
import { db } from '../firebase/admin.js'; // Your Firebase config


const google = createGoogleGenerativeAI({
  apiKey: process.env.Googleaikey   // Use environment variable instead
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { interviewId, userId } = req.query;

    if (!interviewId || !userId) {
      return res.status(400).json({ error: 'Missing interviewId or userId' });
    }

    const querySnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    const feedbackDoc = querySnapshot.docs[0];
    const feedback = { id: feedbackDoc.id, ...feedbackDoc.data() };

    return res.status(200).json({ success: true, feedback });

  } catch (error) {
    console.error("Error getting feedback:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

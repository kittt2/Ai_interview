import { db } from '../firebase/admin.js'; // Adjust path as needed

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

// Main handler function
const handler = async (req, res) => {
  // Allow both GET and POST methods for flexibility
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['GET', 'POST', 'OPTIONS']
    });
  }

  try {
    // Get parameters from query (GET) or body (POST)
    const { interviewId, userId } = req.method === 'GET' ? req.query : req.body;

    // Validate required parameters
    if (!interviewId || !userId) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['interviewId', 'userId'],
        received: { interviewId: !!interviewId, userId: !!userId }
      });
    }

    console.log('Fetching feedback for:', { interviewId, userId });

    // Query the database for feedback
    const querySnapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return res.status(404).json({ 
        success: false,
        error: 'Feedback not found',
        details: 'No feedback found for the provided interviewId and userId'
      });
    }

    // Get the feedback document
    const feedbackDoc = querySnapshot.docs[0];
    const feedback = { 
      id: feedbackDoc.id, 
      ...feedbackDoc.data() 
    };

    console.log('Feedback retrieved successfully:', feedbackDoc.id);

    return res.status(200).json({ 
      success: true, 
      feedback,
      message: 'Feedback retrieved successfully'
    });

  } catch (error) {
    console.error("Error getting feedback:", error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      type: error.name,
      timestamp: new Date().toISOString()
    });
  }
};

// Export the handler wrapped with CORS
export default allowCors(handler);
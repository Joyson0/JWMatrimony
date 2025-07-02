const sdk = require('node-appwrite');

module.exports = async ({ req, res, log, error }) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.json({}, 200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Appwrite-Project, X-Appwrite-Key'
    });
  }

  try {
    // Get the authorization header (user's session JWT)
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      error('Missing or invalid authorization header');
      return res.json({ error: 'Missing or invalid authorization header' }, 401, {
        'Access-Control-Allow-Origin': '*'
      });
    }

    const sessionToken = authHeader.replace('Bearer ', '');

    // Initialize Appwrite client for user verification
    const userClient = new sdk.Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setJWT(sessionToken);

    const userAccount = new sdk.Account(userClient);

    // Verify the user's session and get user ID
    let currentUser;
    try {
      currentUser = await userAccount.get();
      log(`Verified user session for: ${currentUser.$id}`);
    } catch (err) {
      error('Failed to verify user session: ' + err.message);
      return res.json({ error: 'Invalid session or user not authenticated' }, 401, {
        'Access-Control-Allow-Origin': '*'
      });
    }

    const userId = currentUser.$id;

    // Initialize Appwrite client with server permissions
    const serverClient = new sdk.Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_FUNCTION_API_KEY);

    const users = new sdk.Users(serverClient);

    log(`Attempting to delete user: ${userId}`);

    // Delete the user using server permissions
    await users.delete(userId);

    log(`User ${userId} deleted successfully`);

    return res.json({
      success: true,
      message: 'User account deleted successfully',
      userId: userId
    }, 200, {
      'Access-Control-Allow-Origin': '*'
    });

  } catch (err) {
    error('Error deleting user: ' + err.message);
    
    return res.json({
      error: 'Failed to delete user account',
      details: err.message
    }, 500, {
      'Access-Control-Allow-Origin': '*'
    });
  }
};
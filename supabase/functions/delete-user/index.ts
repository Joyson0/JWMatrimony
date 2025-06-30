import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client, Users, Account } from "npm:appwrite@13.0.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const sessionToken = authHeader.replace('Bearer ', '')

    // Initialize Appwrite client with server credentials
    const client = new Client()
      .setEndpoint(Deno.env.get('APPWRITE_ENDPOINT') || '')
      .setProject(Deno.env.get('APPWRITE_PROJECT_ID') || '')
      .setKey(Deno.env.get('APPWRITE_API_KEY') || '') // Server API key

    const users = new Users(client)
    const account = new Account(client.setJWT(sessionToken)) // Use user's session

    // Verify the user's session and get user ID
    let currentUser
    try {
      currentUser = await account.get()
    } catch (error) {
      console.error('Failed to verify user session:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid session or user not authenticated' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const userId = currentUser.$id

    console.log(`Attempting to delete user: ${userId}`)

    // Delete the user using server permissions
    await users.delete(userId)

    console.log(`User ${userId} deleted successfully`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User account deleted successfully',
        userId: userId
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error deleting user:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to delete user account',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
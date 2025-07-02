import json
import os
from appwrite.client import Client
from appwrite.services.account import Account
from appwrite.services.users import Users
from appwrite.exception import AppwriteException

def main(context):
    """
    Appwrite Function to block user accounts
    
    This function:
    1. Validates the user's session
    2. Uses server permissions to block the user account
    3. Returns success/error response with CORS headers
    """
    
    # CORS headers for all responses
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Appwrite-Project, X-Appwrite-Key'
    }
    
    # Handle CORS preflight requests
    if context.req.method == 'OPTIONS':
        return context.res.json({}, 200, cors_headers)
    
    try:
        # Get the authorization header (user's session JWT)
        auth_header = context.req.headers.get('authorization') or context.req.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            context.error('Missing or invalid authorization header')
            return context.res.json(
                {'error': 'Missing or invalid authorization header'}, 
                401, 
                cors_headers
            )
        
        session_token = auth_header.replace('Bearer ', '')
        
        # Initialize Appwrite client for user verification
        user_client = Client()
        user_client.set_endpoint(os.environ.get('APPWRITE_FUNCTION_ENDPOINT', ''))
        user_client.set_project(os.environ.get('APPWRITE_FUNCTION_PROJECT_ID', ''))
        user_client.set_jwt(session_token)
        
        user_account = Account(user_client)
        
        # Verify the user's session and get user ID
        try:
            current_user = user_account.get()
            context.log(f"Verified user session for: {current_user['$id']}")
        except AppwriteException as e:
            context.error(f'Failed to verify user session: {str(e)}')
            return context.res.json(
                {'error': 'Invalid session or user not authenticated'}, 
                401, 
                cors_headers
            )
        
        user_id = current_user['$id']
        
        # Initialize Appwrite client with server permissions
        server_client = Client()
        server_client.set_endpoint(os.environ.get('APPWRITE_FUNCTION_ENDPOINT', ''))
        server_client.set_project(os.environ.get('APPWRITE_FUNCTION_PROJECT_ID', ''))
        server_client.set_key(os.environ.get('APPWRITE_FUNCTION_API_KEY', ''))
        
        users_service = Users(server_client)
        
        context.log(f"Attempting to block user: {user_id}")
        
        # Block the user using server permissions (set status to false)
        users_service.update_status(user_id, False)
        
        context.log(f"User {user_id} blocked successfully")
        
        return context.res.json({
            'success': True,
            'message': 'User account blocked successfully',
            'userId': user_id,
            'action': 'blocked'
        }, 200, cors_headers)
        
    except AppwriteException as e:
        context.error(f'Appwrite error blocking user: {str(e)}')
        return context.res.json({
            'error': 'Failed to block user account',
            'details': str(e)
        }, 500, cors_headers)
        
    except Exception as e:
        context.error(f'Unexpected error blocking user: {str(e)}')
        return context.res.json({
            'error': 'Failed to block user account',
            'details': str(e)
        }, 500, cors_headers)
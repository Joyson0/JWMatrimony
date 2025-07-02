import json
import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage
from appwrite.services.users import Users
from appwrite.exception import AppwriteException

def main(context):
    """
    Appwrite Function triggered by user update events
    
    This function is triggered when a user's status is updated to false (blocked).
    It automatically cleans up all user data including:
    - Profile documents from database
    - Photos from storage
    - User account deletion
    """
    
    try:
        # Parse the event data
        event_data = context.req.body
        if isinstance(event_data, str):
            event_data = json.loads(event_data)
        
        context.log(f"Received event data: {json.dumps(event_data, indent=2)}")
        
        # Check if this is a user status update event
        if not event_data.get('events'):
            context.log("No events found in payload")
            return context.res.text("No events to process")
        
        # Look for user update events
        user_update_events = [
            event for event in event_data['events'] 
            if 'users.' in event and 'update' in event
        ]
        
        if not user_update_events:
            context.log("No user update events found")
            return context.res.text("No user update events to process")
        
        # Get user data from the event
        user_data = event_data.get('data', {})
        user_id = user_data.get('$id')
        user_status = user_data.get('status')
        
        if not user_id:
            context.log("No user ID found in event data")
            return context.res.text("No user ID found")
        
        # Only process if user status is false (blocked)
        if user_status is not False:
            context.log(f"User {user_id} status is {user_status}, not blocked. Skipping cleanup.")
            return context.res.text("User not blocked, no cleanup needed")
        
        context.log(f"Processing cleanup for blocked user: {user_id}")
        
        # Initialize Appwrite client with server permissions
        client = Client()
        client.set_endpoint(os.environ.get('APPWRITE_FUNCTION_ENDPOINT', ''))
        client.set_project(os.environ.get('APPWRITE_FUNCTION_PROJECT_ID', ''))
        client.set_key(os.environ.get('APPWRITE_FUNCTION_API_KEY', ''))
        
        databases_service = Databases(client)
        storage_service = Storage(client)
        users_service = Users(client)
        
        # Get environment variables
        database_id = os.environ.get('APPWRITE_DATABASE_ID')
        profiles_collection_id = os.environ.get('APPWRITE_COLLECTION_ID_PROFILES')
        bucket_id = os.environ.get('APPWRITE_BUCKET_ID')
        
        if not all([database_id, profiles_collection_id, bucket_id]):
            context.error("Missing required environment variables")
            return context.res.text("Configuration error")
        
        # Step 1: Find and delete user profile from database
        try:
            context.log(f"Looking for profile documents for user: {user_id}")
            
            # List profiles for this user
            from appwrite.query import Query
            profiles = databases_service.list_documents(
                database_id,
                profiles_collection_id,
                [Query.equal('userId', user_id)]
            )
            
            if profiles['documents']:
                profile = profiles['documents'][0]
                profile_id = profile['$id']
                
                context.log(f"Found profile document: {profile_id}")
                
                # Step 2: Delete photos from storage
                photo_ids_to_delete = []
                
                # Add profile picture if exists
                if profile.get('profilePicFileId'):
                    photo_ids_to_delete.append(profile['profilePicFileId'])
                
                # Add additional photos if exist
                additional_photos = profile.get('additionalPhotos', [])
                if isinstance(additional_photos, list):
                    photo_ids_to_delete.extend(additional_photos)
                elif isinstance(additional_photos, str):
                    try:
                        parsed_photos = json.loads(additional_photos)
                        if isinstance(parsed_photos, list):
                            photo_ids_to_delete.extend(parsed_photos)
                    except json.JSONDecodeError:
                        context.log("Failed to parse additional photos JSON")
                
                # Delete photos from storage
                for photo_id in photo_ids_to_delete:
                    if photo_id:
                        try:
                            storage_service.delete_file(bucket_id, photo_id)
                            context.log(f"Deleted photo: {photo_id}")
                        except AppwriteException as e:
                            context.log(f"Failed to delete photo {photo_id}: {str(e)}")
                
                # Step 3: Delete profile document
                databases_service.delete_document(database_id, profiles_collection_id, profile_id)
                context.log(f"Deleted profile document: {profile_id}")
                
            else:
                context.log(f"No profile found for user: {user_id}")
        
        except AppwriteException as e:
            context.error(f"Error cleaning up profile data: {str(e)}")
        
        # Step 4: Delete user account
        try:
            users_service.delete(user_id)
            context.log(f"Deleted user account: {user_id}")
        except AppwriteException as e:
            context.error(f"Error deleting user account: {str(e)}")
        
        context.log(f"Cleanup completed for user: {user_id}")
        
        return context.res.json({
            'success': True,
            'message': f'User {user_id} and all associated data cleaned up successfully',
            'userId': user_id
        })
        
    except Exception as e:
        context.error(f'Unexpected error during cleanup: {str(e)}')
        return context.res.json({
            'error': 'Failed to cleanup user data',
            'details': str(e)
        }, 500)
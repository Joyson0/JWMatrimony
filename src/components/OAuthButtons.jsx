import React from "react";
import { FaApple, FaFacebook, FaGoogle, FaMicrosoft } from "react-icons/fa";
import { account } from "../lib/appwrite";
import { OAuthProvider } from "appwrite";
import { useNavigate } from 'react-router-dom'

const buttonStyle =
  "flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100 transition";

const OAuthButtons = () => {
  const navigate = useNavigate()
  const successUrl = `${window.location.origin}/auth/callback`
  const failureUrl = `${window.location.origin}/auth`
  
  const handleOAuthLogin = async (provider) => {
    try {
      await account.createOAuth2Session(provider, successUrl, failureUrl)
    }
    catch (error) {
      console.log('OAuth initiation failed:', error)
      alert('Could not start OAuth. Please try again or check console for details.');
    }
};

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto mt-10">
      <button
        onClick={() => handleOAuthLogin(OAuthProvider.Google)}
        className={`${buttonStyle} text-red-600 border-red-300`}
      >
        <FaGoogle /> Continue with Google
      </button>

      <button
        onClick={() => handleOAuthLogin(OAuthProvider.Facebook)}
        className={`${buttonStyle} text-blue-600 border-blue-300`}
      >
        <FaFacebook /> Continue with Facebook
      </button>

      <button
        onClick={() => handleOAuthLogin(OAuthProvider.Apple)}
        className={`${buttonStyle} text-black border-gray-300`}
      >
        <FaApple /> Continue with Apple
      </button>

      <button
        onClick={() => handleOAuthLogin(OAuthProvider.Microsoft)}
        className={`${buttonStyle} text-blue-800 border-blue-400`}
      >
        <FaMicrosoft /> Continue with Microsoft
      </button>
    </div>
  );
};

export default OAuthButtons;
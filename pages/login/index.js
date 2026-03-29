import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { user, handleGoogleSignIn, generateSession, signingIn, error } = useAuth();
  const [sessionError, setSessionError] = useState(null);
  const isSignInButtonPressedRef = useRef(false);

  useEffect(() => {
    if (!user || isSignInButtonPressedRef.current) return;
    (async () => {
      const result = await generateSession(user);
      if (!result.ok && result.error) setSessionError(result.error);
    })();
  }, [user, generateSession]);

  if (user && !isSignInButtonPressedRef.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          {sessionError ? (
            <>
              <p className="text-lg font-semibold text-gray-900 mb-2">Session Error</p>
              <p className="text-sm text-red-600 mb-4">{sessionError}</p>
              <button
                onClick={() => { setSessionError(null); generateSession(user); }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Retry
              </button>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
              <p className="text-sm text-gray-600">Redirecting...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sign In - Velnara</title>
        <meta name="description" content="Sign in to Velnara - Your Local Medicine Marketplace" />
      </Head>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white px-4">
        {/* Mesh gradient blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-300/70 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-200/60 blur-3xl" />
        <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] rounded-full bg-violet-200/50 blur-3xl" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4 shadow-lg shadow-purple-200">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Velnara</h1>
            <p className="mt-2 text-gray-500">Your Local Medicine Marketplace</p>
          </div>

          {/* Sign In Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Sign in</h2>
            <p className="text-sm text-gray-500 mb-6">
              Sign in with your Google account to get started
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
                {error.includes("not authorized") && (
                  <p className="mt-1 text-xs text-red-600">
                    Contact admin to request access.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => {
                isSignInButtonPressedRef.current = true;
                handleGoogleSignIn();
              }}
              disabled={signingIn}
              className="w-full h-12 rounded-xl bg-white px-4 py-2 font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {signingIn ? (
                <>
                  <div className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <p className="mt-6 text-center text-xs text-gray-400">
              By signing in, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

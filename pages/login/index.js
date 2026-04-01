import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag, Store, Shield, Clock, MapPin, Pill, CheckCircle, Truck } from "lucide-react";

export default function LoginPage() {
  const { user, handleGoogleSignIn, generateSession, signingIn, error } = useAuth();
  const [sessionError, setSessionError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
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

  const handleSignIn = (role) => {
    setSelectedRole(role);
    isSignInButtonPressedRef.current = true;
    handleGoogleSignIn();
  };

  return (
    <>
      <Head>
        <title>Sign In - Sanjeevani</title>
        <meta name="description" content="Sign in to Sanjeevani - Your Local Medicine Marketplace" />
      </Head>
      <div className="min-h-screen flex bg-white">
        {/* Left side - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-violet-800 p-12 flex-col justify-between relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white/5" />
          <div className="absolute bottom-[-30%] left-[-20%] w-[600px] h-[600px] rounded-full bg-white/5" />
          
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Sanjeevani</span>
            </div>

            {/* Tagline */}
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Get medicines delivered<br />from nearby pharmacies
            </h1>
            <p className="text-purple-200 text-lg mb-12">
              Search, compare, and order from local shops within minutes.
            </p>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Local Pharmacies</h3>
                  <p className="text-purple-200 text-sm">Connect with trusted pharmacies within 5km of your location</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Quick Response</h3>
                  <p className="text-purple-200 text-sm">Shops respond instantly with availability and pricing</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Fast Delivery</h3>
                  <p className="text-purple-200 text-sm">Get medicines delivered to your doorstep</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="relative z-10 flex items-center gap-6 text-purple-200 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Verified Pharmacies</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Genuine Medicines</span>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 relative bg-gradient-to-br from-purple-50 via-white to-violet-50 lg:bg-none lg:bg-white">
          {/* Mobile decorative elements */}
          <div className="lg:hidden absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-600 to-purple-500 rounded-b-[3rem]" />
          <div className="lg:hidden absolute top-24 left-4 right-4 h-20 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-2xl blur-2xl" />

          <div className="w-full max-w-md relative z-10">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8 pt-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-4 shadow-xl shadow-purple-300/30 border border-purple-100">
                <Pill className="w-10 h-10 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Sanjeevani</h1>
              <p className="text-gray-500 mt-1 text-sm">Your Local Medicine Marketplace</p>
              
              {/* Mobile feature pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  <MapPin className="w-3 h-3" /> Local Shops
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <Truck className="w-3 h-3" /> Fast Delivery
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              </div>
            </div>

            {/* Desktop welcome */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-500">Sign in to continue to Sanjeevani</p>
            </div>

            {/* Sign In Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Sign in</h3>
              <p className="text-sm text-gray-500 mb-6">
                Choose how you want to use Sanjeevani
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

              <div className="space-y-3">
                {/* User Login */}
                <button
                  onClick={() => handleSignIn("user")}
                  disabled={signingIn}
                  className="w-full h-16 rounded-xl bg-purple-600 px-4 py-2 font-medium text-white shadow-lg shadow-purple-200 hover:bg-purple-700 hover:shadow-purple-300 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {signingIn && selectedRole === "user" ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1">
                        <span className="block text-sm font-semibold">Continue as Customer</span>
                        <span className="block text-xs text-purple-200">Search & order medicines</span>
                      </div>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Shop Login */}
                <button
                  onClick={() => handleSignIn("shop")}
                  disabled={signingIn}
                  className="w-full h-16 rounded-xl bg-white px-4 py-2 font-medium text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {signingIn && selectedRole === "shop" ? (
                    <>
                      <div className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-left flex-1">
                        <span className="block text-sm font-semibold">Continue as Shop</span>
                        <span className="block text-xs text-gray-400">Manage orders & inventory</span>
                      </div>
                    </>
                  )}
                </button>
              </div>

              <p className="mt-6 text-center text-xs text-gray-400">
                Both options use Google Sign-In for security.<br />
                Your role is assigned by the admin.
              </p>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-8">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

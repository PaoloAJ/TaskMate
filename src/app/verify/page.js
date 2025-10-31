"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import Navbar from "../components/Navbar";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: verificationCode,
      });

      console.log("Verification successful!", { isSignUpComplete, nextStep });

      // Redirect to sign in page after successful verification
      router.push("/signin?verified=true");
    } catch (err) {
      console.error("Verification error:", err);

      if (err.name === "CodeMismatchException") {
        setError("Invalid verification code. Please try again.");
      } else if (err.name === "ExpiredCodeException") {
        setError("Verification code expired. Please request a new code.");
      } else if (err.name === "LimitExceededException") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError("");
    setResendMessage("");

    try {
      await resendSignUpCode({
        username: email,
      });

      setResendMessage("Verification code sent! Check your email.");
    } catch (err) {
      console.error("Resend error:", err);
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar variant="auth" />
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-purple-800">
              Verify Your Email
            </h2>
            <p className="mt-2 text-sm text-purple-600">
              We sent a verification code to
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">{email}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form noValidate className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {resendMessage && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-600">{resendMessage}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Verification Code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  autoComplete="one-time-code"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify Email"
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Didn't receive the code?
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  type="button"
                  className="text-purple-600 hover:text-purple-500 font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Resend Code"}
                </button>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <button
              onClick={() => router.push("/signup")}
              type="button"
              className="text-purple-600 hover:text-purple-500 transition-colors duration-200"
            >
              Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

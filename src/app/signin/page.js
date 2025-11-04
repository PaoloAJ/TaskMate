"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Amplify } from "aws-amplify";
import { signIn } from "aws-amplify/auth";
import { useAuth } from "@/lib/auth-context";
import outputs from "../../../amplify_outputs.json";
import Navbar from "../components/Navbar";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Configure Amplify on component mount
  useEffect(() => {
    Amplify.configure(outputs, { ssr: true });

    // Check if user just verified their email
    if (searchParams.get("verified") === "true") {
      setSuccessMessage("Email verified! Please sign in.");
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const { isSignedIn, nextStep } = await signIn({
        username: formData.email,
        password: formData.password,
      });

      console.log("Sign in successful!", { isSignedIn, nextStep });

      if (isSignedIn) {
        // Refresh auth context before redirecting
        await refreshAuth();
        // Redirect to dashboard or home page
        router.push("/dashboard");
      } else if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
        // User needs to verify email
        setErrors({ general: "Please verify your email first." });
        setTimeout(() => {
          router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Sign in error:", error);

      // Handle specific Amplify errors
      if (error.name === "NotAuthorizedException") {
        setErrors({ general: "Incorrect email or password." });
      } else if (error.name === "UserNotConfirmedException") {
        setErrors({ general: "Please verify your email first." });
        setTimeout(() => {
          router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
        }, 2000);
      } else if (error.name === "UserNotFoundException") {
        setErrors({ general: "No account found with this email." });
      } else if (error.name === "TooManyRequestsException") {
        setErrors({ general: "Too many attempts. Please try again later." });
      } else {
        setErrors({
          general: error.message || "Failed to sign in. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar variant="auth" />
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-purple-800">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-purple-600">
              Sign in to your TaskMate account
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form noValidate className="space-y-6" onSubmit={handleSubmit}>
              {successMessage && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-600">{successMessage}</p>
                </div>
              )}

              {errors.general && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  className="text-sm text-purple-600 hover:text-purple-500 font-medium transition-colors duration-200"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push("/signup")}
                  type="button"
                  className="text-purple-600 hover:text-purple-500 font-medium transition-colors duration-200"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
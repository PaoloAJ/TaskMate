"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserAttributes, fetchUserAttributes } from "aws-amplify/auth";
import { useAuth } from "@/lib/auth-context";
import Navbar from "../components/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    school: "",
    interests: ["", "", ""],
    bio: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [attributes, setAttributes] = useState(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  // Load existing user attributes
  useEffect(() => {
    const loadAttributes = async () => {
      try {
        const attrs = await fetchUserAttributes();
        setAttributes(attrs);
      } catch (error) {
        console.error("Failed to fetch user attributes:", error);
      }
    };
    if (isAuthenticated) loadAttributes();
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleInterestChange = (index, value) => {
    const updated = [...formData.interests];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, interests: updated }));
  };

  const validateForm = () => {
    const newErrors = {};
    const { username, school, interests, bio } = formData;

    // Username validation
    if (!username.trim()) newErrors.username = "Username is required.";
    else if (username.length < 3 || username.length > 15)
      newErrors.username = "Must be 3–15 characters.";

    // School validation (required)
    if (!school.trim()) newErrors.school = "School is required.";

    // Interests validation
    interests.forEach((item, i) => {
      if (item.length > 15)
        newErrors[`interest${i}`] = "Interest must be ≤15 chars.";
    });

    // Bio validation (required)
    if (!bio.trim()) newErrors.bio = "Bio is required.";
    else if (bio.length > 100) newErrors.bio = "Bio must be ≤100 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await updateUserAttributes({
        userAttributes: {
          nickname: formData.username,
          "custom:school": formData.school,
          "custom:interests": JSON.stringify(formData.interests),
          "custom:bio": formData.bio,
        },
      });

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ general: "Failed to update profile. Try again." });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar variant="dashboard" />

      <div className="flex flex-col items-center px-8 py-12 w-full">
        {/* Big Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mb-8 text-center">
          Finish Setting Up Your Profile!
        </h1>

        {/* Success/Error Messages */}
        {success && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 mb-4 text-center">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {errors.general && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 mb-4 text-center">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-all ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* School */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="Enter your school"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-all ${
                errors.school ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.school && (
              <p className="mt-1 text-sm text-red-600">{errors.school}</p>
            )}
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests (up to 3)
            </label>
            <div className="space-y-2">
              {formData.interests.map((interest, i) => (
                <input
                  key={i}
                  type="text"
                  value={interest}
                  onChange={(e) => handleInterestChange(i, e.target.value)}
                  placeholder={`Interest ${i + 1}`}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-all ${
                    errors[`interest${i}`] ? "border-red-500" : "border-gray-300"
                  }`}
                />
              ))}
            </div>
            {Object.keys(errors)
              .filter((k) => k.startsWith("interest"))
              .map((k) => (
                <p key={k} className="mt-1 text-sm text-red-600">
                  {errors[k]}
                </p>
              ))}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio <span className="text-red-500">*</span>
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about yourself"
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-all ${
                errors.bio ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import { useAuth } from "@/lib/auth-context";
import Navbar from "../components/Navbar";
import fallbackInterests from "@/lib/interests.json";

const client = generateClient({
  authMode: "userPool",
});

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    interests: ["", "", ""],
    bio: "",
    school: "",
  });

  const [profileId, setProfileId] = useState(null); // Store profile ID if exists
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [universities, setUniversities] = useState([]);
  const [universityInput, setUniversityInput] = useState("");
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
  const [availableInterests, setAvailableInterests] = useState(null);
  const [interestInputs, setInterestInputs] = useState(["", "", ""]);
  const [showInterestDropdown, setShowInterestDropdown] = useState([
    false,
    false,
    false,
  ]);
  // Note: Authentication is now handled by middleware.js
  // No need for client-side redirect - middleware protects this route

  // Load existing user profile from database
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.userId) return;

      try {
        // Query for existing profile
        const { data: profiles } = await client.models.UserProfile.list({
          filter: {
            id: {
              eq: user.userId,
            },
          },
        });

        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          setProfileId(profile.id);
          setFormData({
            username: profile.username || "",
            interests: profile.interests || ["", "", ""],
            bio: profile.bio || "",
            school: profile.school || "",
          });
          setUniversityInput(profile.school || "");
          setInterestInputs(profile.interests || ["", "", ""]);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    if (isAuthenticated && user) loadUserProfile();
  }, [isAuthenticated, user]);

  // Load universities list from the JSON file using fetch
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const response = await fetch("/us_universities_names_only.json"); // Adjust the path based on your setup
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        console.error("Failed to load universities:", error);
      }
    };
    loadUniversities();
  }, []);

  // Load interests list from the JSON file using fetch
  useEffect(() => {
    const loadInterests = async () => {
      try {
        const base = window?.location?.origin || "";
        const response = await fetch(`${base}/interests.json`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setAvailableInterests(data);
      } catch (error) {
        console.error("Failed to load interests:", error);
        // Use local fallback bundled with the app so selects always populate
        setAvailableInterests(fallbackInterests || []);
      }
    };
    loadInterests();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Interest input updated as user types (typeahead)
  const handleInterestInputChange = (index, value) => {
    const inputs = [...interestInputs];
    inputs[index] = value;
    setInterestInputs(inputs);
    setShowInterestDropdown((prev) => {
      const copy = [...prev];
      copy[index] = true;
      return copy;
    });
    setErrors((prev) => ({ ...prev, [`interest${index}`]: "" }));
  };

  // User selects an interest from dropdown
  const handleInterestSelect = (index, value) => {
    // Prevent duplicates
    if (
      value &&
      formData.interests.includes(value) &&
      formData.interests[index] !== value
    ) {
      setErrors((prev) => ({
        ...prev,
        [`interest${index}`]: "Already selected.",
      }));
      return;
    }

    const updated = [...formData.interests];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, interests: updated }));

    const inputs = [...interestInputs];
    inputs[index] = value;
    setInterestInputs(inputs);

    setShowInterestDropdown((prev) => {
      const copy = [...prev];
      copy[index] = false;
      return copy;
    });

    setErrors((prev) => ({ ...prev, [`interest${index}`]: "" }));
  };

  const handleUniversityInputChange = (e) => {
    const value = e.target.value;
    setUniversityInput(value);
    setShowUniversityDropdown(true);
  };

  const handleUniversitySelect = (university) => {
    setFormData((prev) => ({ ...prev, school: university }));
    setUniversityInput(university);
    setShowUniversityDropdown(false);
    setErrors((prev) => ({ ...prev, school: "" }));
  };

  const filteredUniversities = universities.filter((uni) =>
    uni.toLowerCase().includes(universityInput.toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {};
    const { username, interests, bio, school } = formData;

    // username validation
    if (!username.trim()) newErrors.username = "Username is required.";
    else if (username.length < 3 || username.length > 50)
      newErrors.username = "Must be 3–50 characters.";

    // Interests validation (optional) - filter out empty strings
    const validInterests = interests.filter((i) => i.trim() !== "");
    validInterests.forEach((item, i) => {
      if (item && item.length > 50)
        newErrors[`interest${i}`] = "Interest must be ≤50 chars.";
    });

    // Bio validation (required)
    if (!bio.trim()) newErrors.bio = "Bio is required.";
    else if (bio.length > 200) newErrors.bio = "Bio must be ≤200 characters.";

    // School validation (required)
    if (!school.trim()) newErrors.school = "Please select a university.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log("Form submitted!", { formData, user, profileId });

    try {
      // Filter out empty interests
      const validInterests = formData.interests.filter((i) => i.trim() !== "");

      const profileData = {
        id: profileId || user.userId,
        username: formData.username,
        bio: formData.bio,
        interests: validInterests,
        school: formData.school,
      };

      console.log("Saving profile data:", profileData);

      let result;
      if (profileId) {
        // Update existing profile
        console.log("Updating existing profile...");
        result = await client.models.UserProfile.update(profileData);
      } else {
        // Create new profile
        console.log("Creating new profile...");
        result = await client.models.UserProfile.create(profileData);
        setProfileId(user.userId);
      }

      console.log("Save result:", result);

      setSuccess("Profile updated successfully!");

      // Redirect to findbuddy after 1 second
      setTimeout(() => {
        router.push("/findbuddy");
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setErrors({
        general: `Failed to update profile: ${error.message || "Try again."}`,
      });
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
        <h1 className="text-4xl md:text-5xl font-bold text-purple-800 mb-8 text-center">
          Finish Setting Up Your Profile!
        </h1>

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
              placeholder="Enter your username"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-all ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* University Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select University <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="school"
                value={universityInput}
                onChange={handleUniversityInputChange}
                onFocus={() => setShowUniversityDropdown(true)}
                onBlur={() => setShowUniversityDropdown(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setShowUniversityDropdown(false);
                }}
                placeholder="Type to search universities..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-all ${
                  errors.school ? "border-red-500" : "border-gray-300"
                }`}
              />
              {showUniversityDropdown && filteredUniversities.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {filteredUniversities.map((university, index) => (
                    <div
                      key={index}
                      onMouseDown={() => handleUniversitySelect(university)}
                      className="px-4 py-2 hover:bg-purple-100 cursor-pointer transition"
                    >
                      {university}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.school && (
              <p className="mt-1 text-sm text-red-600">{errors.school}</p>
            )}
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests (Up to 3)
            </label>
            <div className="space-y-2">
              {formData.interests.map((interest, i) => {
                const inputValue = interestInputs[i] || "";
                const filtered =
                  availableInterests === null
                    ? []
                    : availableInterests.filter((opt) =>
                        opt.toLowerCase().includes(inputValue.toLowerCase())
                      );

                // Remove any options that are already selected in another slot
                const visibleOptions = filtered.filter(
                  (opt) =>
                    opt === formData.interests[i] ||
                    !formData.interests.includes(opt)
                );

                return (
                  <div key={i} className="relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) =>
                        handleInterestInputChange(i, e.target.value)
                      }
                      onFocus={() =>
                        setShowInterestDropdown((prev) => {
                          const copy = [...prev];
                          copy[i] = true;
                          return copy;
                        })
                      }
                      onBlur={() =>
                        setShowInterestDropdown((prev) => {
                          const copy = [...prev];
                          copy[i] = false;
                          return copy;
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Escape")
                          setShowInterestDropdown((prev) => {
                            const copy = [...prev];
                            copy[i] = false;
                            return copy;
                          });
                      }}
                      placeholder={`Interest ${i + 1} (optional)`}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-all ${
                        errors[`interest${i}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />

                    {showInterestDropdown[i] && (
                      <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                        {availableInterests === null ? (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            Loading interests...
                          </div>
                        ) : visibleOptions.length === 0 ? (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            No matching interests
                          </div>
                        ) : (
                          visibleOptions.map((opt, idx) => (
                            <div
                              key={idx}
                              onMouseDown={() => handleInterestSelect(i, opt)}
                              className="px-4 py-2 hover:bg-purple-100 cursor-pointer transition"
                            >
                              {opt}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
              Bio (Up to 200 characters) <span className="text-red-500">*</span>
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
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

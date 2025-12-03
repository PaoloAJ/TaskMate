"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { updatePassword } from "aws-amplify/auth";
import { getUrl } from "aws-amplify/storage";
import { useAuth } from "@/lib/auth-context";
import Navbar from "../components/Navbar";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import fallbackInterests from "@/lib/interests.json";

const client = generateClient({
  authMode: "userPool",
});

export default function Page() {
  const { user, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    university: "",
    interests: ["", "", ""],
    bio: "",
  });

  const [profileId, setProfileId] = useState(null);
  const [availableInterests, setAvailableInterests] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [pfpKey, setPfpKey] = useState(null);

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  // Load user profile from DynamoDB
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.userId) {
        setProfileLoading(false);
        return;
      }

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
          setPfpKey(profile.pfp_key || null);

          // Load profile picture from S3 if exists
          if (profile.pfp_key) {
            try {
              const urlResult = await getUrl({ path: profile.pfp_key });
              setProfilePicUrl(urlResult.url.toString());
            } catch (err) {
              console.warn("Failed to load profile picture:", err);
            }
          }

          // Get email from Cognito user attributes
          const attrs = user?.attributes || user;
          const email = attrs?.email || attrs?.Email || "";

          setFormData({
            username: profile.username || "",
            university: profile.school || "",
            interests: profile.interests || ["", "", ""],
            bio: profile.bio || "",
          });
        } else {
          // No profile yet, just populate from Cognito
          const attrs = user?.attributes || user;
          setFormData((prev) => ({
            ...prev,
            username:
              attrs?.preferred_username ||
              attrs?.username ||
              attrs?.nickname ||
              "",
          }));
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setErrors({ general: "Failed to load profile data" });
      } finally {
        setProfileLoading(false);
      }
    };

    if (!isLoading && user) {
      loadUserProfile();
    }
  }, [isLoading, user]);

  useEffect(() => {
    // try fetch from public, fallback to bundled
    const loadInterests = async () => {
      try {
        const base =
          typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(`${base}/interests.json`);
        if (!res.ok) throw new Error("no");
        const data = await res.json();
        setAvailableInterests(data);
      } catch (e) {
        setAvailableInterests(fallbackInterests || []);
      }
    };

    const loadUniversities = async () => {
      try {
        const base =
          typeof window !== "undefined" ? window.location.origin : "";
        const res = await fetch(`${base}/us_universities_names_only.json`);
        if (!res.ok) throw new Error("no");
        const data = await res.json();
        setUniversities(data);
      } catch (e) {
        setUniversities([]);
      }
    };

    loadInterests();
    loadUniversities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleInterestChange = (index, value) => {
    const updated = [...formData.interests];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, interests: updated }));
    setErrors((p) => ({ ...p, [`interest${index}`]: "" }));
  };

  const handleProfilePictureUpload = async (newPfpKey) => {
    try {
      // Update the profile with new pfp_key
      const profileData = {
        id: profileId || user.userId,
        pfp_key: newPfpKey,
      };

      let result;
      if (profileId) {
        result = await client.models.UserProfile.update(profileData);
      } else {
        // If no profile exists yet, create minimal profile
        result = await client.models.UserProfile.create({
          ...profileData,
          username: formData.username || user.userId,
          bio: "",
          school: "",
        });
        setProfileId(user.userId);
      }

      // Update local state
      setPfpKey(newPfpKey);

      // Load the new image URL
      const urlResult = await getUrl({ path: newPfpKey });
      setProfilePicUrl(urlResult.url.toString());

      setSuccess("Profile picture updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to update profile picture:", error);
      setErrors({ general: "Failed to save profile picture" });
    }
  };

  const validateAndSave = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.university.trim())
      newErrors.university = "University required";
    if (!formData.bio.trim()) newErrors.bio = "Bio required";
    else if (formData.bio.length > 200)
      newErrors.bio = "Bio too long (max 200 chars)";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // Filter out empty interests
      const validInterests = formData.interests.filter((i) => i.trim() !== "");

      const profileData = {
        id: profileId || user.userId,
        username: formData.username,
        bio: formData.bio,
        interests: validInterests,
        school: formData.university,
      };

      let result;
      if (profileId) {
        // Update existing profile
        result = await client.models.UserProfile.update(profileData);
      } else {
        // Create new profile
        result = await client.models.UserProfile.create(profileData);
        setProfileId(user.userId);
      }

      console.log("Profile saved:", result);
      setSuccess("Profile saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrors({
        general: `Failed to save profile: ${error.message || "Try again."}`,
      });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!passwords.current) {
      return setErrors({ password: "Current password required" });
    }
    if (!passwords.next) {
      return setErrors({ password: "New password required" });
    }
    if (passwords.next.length < 8) {
      return setErrors({
        password: "New password must be at least 8 characters",
      });
    }
    if (passwords.next !== passwords.confirm) {
      return setErrors({ password: "Passwords do not match" });
    }

    try {
      await updatePassword({
        oldPassword: passwords.current,
        newPassword: passwords.next,
      });

      setPasswords({ current: "", next: "", confirm: "" });
      setSuccess("Password changed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      let errorMessage = "Failed to change password";

      if (error.name === "NotAuthorizedException") {
        errorMessage = "Current password is incorrect";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ password: errorMessage });
    }
  };

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar variant="default" />

      <div className="flex-1 px-8 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
          {/* Left: summary card */}
          <div className="col-span-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex flex-col items-center">
                {profilePicUrl ? (
                  <ProfilePictureUpload
                    userId={user?.userId}
                    currentPfpKey={pfpKey}
                    onUploadSuccess={handleProfilePictureUpload}
                    initialPreview={profilePicUrl}
                  />
                ) : (
                  <ProfilePictureUpload
                    userId={user?.userId}
                    currentPfpKey={pfpKey}
                    onUploadSuccess={handleProfilePictureUpload}
                  />
                )}
                <div className="text-lg font-semibold mt-4">
                  {formData.username}
                </div>
                <div className="mt-4 text-sm text-gray-600 text-center">
                  University: {formData.university || "Not set"}
                </div>
                <div className="mt-4 text-sm text-gray-700 text-center">
                  {formData.bio}
                </div>
              </div>
            </div>
          </div>

          {/* Right: editable form */}
          <div className="col-span-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>

              {success && (
                <div className="mb-4 p-2 bg-green-50 text-green-700 rounded">
                  {success}
                </div>
              )}
              {errors.general && (
                <div className="mb-4 p-2 bg-red-50 text-red-700 rounded">
                  {errors.general}
                </div>
              )}

              <form onSubmit={validateAndSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    readOnly
                    className="w-full mt-1 px-3 py-2 border rounded bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    University
                  </label>
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 border rounded"
                  >
                    <option value="">Select a university</option>
                    {universities.map((u, idx) => (
                      <option key={idx} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  {errors.university && (
                    <div className="text-sm text-red-600">
                      {errors.university}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Interests (up to 3)
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {formData.interests.map((it, i) => (
                      <select
                        key={i}
                        value={it}
                        onChange={(e) =>
                          handleInterestChange(i, e.target.value)
                        }
                        className="px-2 py-2 border rounded"
                      >
                        <option value="">None</option>
                        {availableInterests &&
                          availableInterests.map((opt, idx) => (
                            <option
                              key={idx}
                              value={opt}
                              disabled={
                                formData.interests.includes(opt) &&
                                formData.interests[i] !== opt
                              }
                            >
                              {opt}
                            </option>
                          ))}
                      </select>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full mt-1 px-3 py-2 border rounded"
                  />
                  {errors.bio && (
                    <div className="text-sm text-red-600">{errors.bio}</div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                  >
                    Save Changes
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords((p) => ({ ...p, current: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={passwords.next}
                    onChange={(e) =>
                      setPasswords((p) => ({ ...p, next: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords((p) => ({ ...p, confirm: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                  {errors.password && (
                    <div className="text-sm text-red-600">
                      {errors.password}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

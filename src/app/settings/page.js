"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Navbar from "../components/Navbar";
import fallbackInterests from "@/lib/interests.json";

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

  const [availableInterests, setAvailableInterests] = useState(null);
  const [universities, setUniversities] = useState([]);

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // try fetch from public, fallback to bundled
    const loadInterests = async () => {
      try {
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        const res = await fetch(`${base}/interests.json`);
        if (!res.ok) throw new Error('no');
        const data = await res.json();
        setAvailableInterests(data);
      } catch (e) {
        setAvailableInterests(fallbackInterests || []);
      }
    };

    const loadUniversities = async () => {
      try {
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        const res = await fetch(`${base}/us_universities_names_only.json`);
        if (!res.ok) throw new Error('no');
        const data = await res.json();
        setUniversities(data);
      } catch (e) {
        setUniversities([]);
      }
    };

    loadInterests();
    loadUniversities();
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      // populate fields from user object if available
      const attrs = user?.attributes || user;
      setFormData((prev) => ({
        ...prev,
        name: attrs?.name || attrs?.given_name || "",
        email: attrs?.email || attrs?.Email || "",
        username: attrs?.preferred_username || attrs?.username || attrs?.nickname || "",
        university: attrs?.['custom:university'] || attrs?.university || "",
        bio: attrs?.['custom:bio'] || "",
        interests: attrs?.['custom:interests'] ? JSON.parse(attrs['custom:interests']) : prev.interests,
      }));
    }
  }, [isLoading, user]);

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

  const validateAndSave = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name required';
    if (!formData.username.trim()) newErrors.username = 'Username required';
    if (formData.bio.length > 300) newErrors.bio = 'Bio too long';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // TODO: call updateUserAttributes or API; for now show success
    setSuccess('Profile saved');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!passwords.current) return setErrors({ password: 'Current password required' });
    if (passwords.next !== passwords.confirm) return setErrors({ password: 'Passwords do not match' });
    // TODO: call change password API
    setPasswords({ current: '', next: '', confirm: '' });
    setSuccess('Password changed');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar variant="default" />

      <div className="flex-1 px-8 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
          {/* Left: summary card */}
          <div className="col-span-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-gray-300 mb-4 flex items-center justify-center text-white text-xl font-bold">{(formData.name || 'U').charAt(0)}</div>
                <div className="text-lg font-semibold">{formData.name || 'Your Name'}</div>
                <div className="text-sm text-gray-500">{formData.email}</div>
                <div className="mt-4 text-sm text-gray-600 text-center">Username: {formData.username}</div>
                <div className="mt-4 text-sm text-gray-600 text-center">University: {formData.university || 'Not set'}</div>
                <div className="mt-4 text-sm text-gray-700 text-center">{formData.bio}</div>
              </div>
            </div>
          </div>

          {/* Right: editable form */}
          <div className="col-span-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>

              {success && <div className="mb-4 p-2 bg-green-50 text-green-700 rounded">{success}</div>}

              <form onSubmit={validateAndSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded" />
                  {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input value={formData.email} readOnly className="w-full mt-1 px-3 py-2 border rounded bg-gray-50" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input name="username" value={formData.username} readOnly className="w-full mt-1 px-3 py-2 border rounded bg-gray-50" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">University</label>
                  <select name="university" value={formData.university} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded">
                    <option value="">Select a university</option>
                    {universities.map((u, idx) => <option key={idx} value={u}>{u}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Interests (up to 3)</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {formData.interests.map((it, i) => (
                      <select key={i} value={it} onChange={(e) => handleInterestChange(i, e.target.value)} className="px-2 py-2 border rounded">
                        <option value="">None</option>
                        {availableInterests && availableInterests.map((opt, idx) => (
                          <option key={idx} value={opt} disabled={formData.interests.includes(opt) && formData.interests[i] !== opt}>{opt}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} className="w-full mt-1 px-3 py-2 border rounded" />
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Save Changes</button>
                </div>
              </form>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <input type="password" placeholder="Current password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} className="w-full px-3 py-2 border rounded" />
                  <input type="password" placeholder="New password" value={passwords.next} onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))} className="w-full px-3 py-2 border rounded" />
                  <input type="password" placeholder="Confirm new password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} className="w-full px-3 py-2 border rounded" />
                  {errors.password && <div className="text-sm text-red-600">{errors.password}</div>}
                  <div className="flex justify-end">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Change Password</button>
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

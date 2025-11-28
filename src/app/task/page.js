"use client";

import Navbar from "../components/Navbar";
import React, { useEffect, useState, useRef } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuth } from "@/lib/auth-context";
import { uploadData, getUrl } from "aws-amplify/storage";

const client = generateClient({
  authMode: "userPool",
});

export default function TaskPage() {
  const { user } = useAuth();
  const [userTask, setUserTask] = useState("");
  const [userTaskId, setUserTaskId] = useState(null);
  const [buddyTask, setBuddyTask] = useState("");
  const [buddyTaskId, setBuddyTaskId] = useState(null);
  const [buddyTaskProof, setBuddyTaskProof] = useState(null);
  const [buddyId, setBuddyId] = useState(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofPreview, setProofPreview] = useState(null);
  const [isApprovingTask, setIsApprovingTask] = useState(false);
  const fileInputRef = useRef(null);

  const getUserProfile = async () => {
    if (!user?.userId) return null;

    try {
      const { data: profile, errors } = await client.models.UserProfile.get({
        id: user.userId,
      });

      if (errors) {
        console.error("Errors fetching user profile:", errors);
        return null;
      }

      return profile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const getTasks = async () => {
    if (!user?.userId) return;

    try {
      const { data: tasks, errors } = await client.models.Tasks.list({
        filter: { reciever_id: { eq: user.userId } },
      });

      if (errors) {
        console.error("Errors fetching tasks:", errors);
        return;
      }

      if (!tasks || tasks.length === 0) {
        console.log("No tasks found for the user.");
        return;
      }

      const task = tasks[0];

      // If there's a proof image, get its URL
      if (task.img_proof) {
        try {
          const urlResult = await getUrl({ path: task.img_proof });
          task.img_proof_url = urlResult.url.toString();
        } catch (error) {
          console.error("Error fetching proof image URL:", error);
        }
      }

      return task;
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const deleteTask = async () => {
    if (!userTaskId) return;

    setIsDeletingTask(true);
    try {
      const { errors } = await client.models.Tasks.delete({
        id: userTaskId,
      });

      if (errors) {
        console.error("Errors deleting task:", errors);
        return;
      }

      setUserTask("");
      setUserTaskId(null);
      setProofPreview(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userTaskId) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setIsUploadingProof(true);
    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setProofPreview(previewUrl);

      // Upload to S3
      const timestamp = Date.now();
      const path = `task-proofs/${user.userId}/proof-${timestamp}.${file.name.split(".").pop()}`;

      await uploadData({
        path,
        data: file,
        options: {
          contentType: file.type,
        },
      }).result;

      // Update task with proof image path
      const { errors } = await client.models.Tasks.update({
        id: userTaskId,
        img_proof: path,
      });

      if (errors) {
        console.error("Errors updating task with proof:", errors);
        return;
      }

      console.log("Proof uploaded successfully");
    } catch (error) {
      console.error("Error uploading proof:", error);
      alert("Failed to upload proof");
      setProofPreview(null);
    } finally {
      setIsUploadingProof(false);
    }
  };

  const approveTask = async () => {
    if (!buddyTaskId) return;

    setIsApprovingTask(true);
    try {
      const { errors } = await client.models.Tasks.delete({
        id: buddyTaskId,
      });

      if (errors) {
        console.error("Errors approving task:", errors);
        return;
      }

      setBuddyTask("");
      setBuddyTaskId(null);
      setBuddyTaskProof(null);
    } catch (error) {
      console.error("Error approving task:", error);
    } finally {
      setIsApprovingTask(false);
    }
  };

  const declineTask = async () => {
    if (!buddyTaskId) return;

    setIsApprovingTask(true);
    try {
      // Remove the proof image but keep the task
      const { errors } = await client.models.Tasks.update({
        id: buddyTaskId,
        img_proof: null,
      });

      if (errors) {
        console.error("Errors declining task:", errors);
        return;
      }

      setBuddyTaskProof(null);
    } catch (error) {
      console.error("Error declining task:", error);
    } finally {
      setIsApprovingTask(false);
    }
  };

  const getBuddyTask = async (buddyId) => {
    if (!buddyId) return null;

    try {
      const { data: tasks, errors } = await client.models.Tasks.list({
        filter: { reciever_id: { eq: buddyId } },
      });

      if (errors) {
        console.error("Errors fetching buddy tasks:", errors);
        return null;
      }

      if (!tasks || tasks.length === 0) {
        return null;
      }

      const task = tasks[0];

      // If there's a proof image, get its URL
      if (task.img_proof) {
        try {
          const urlResult = await getUrl({ path: task.img_proof });
          task.img_proof_url = urlResult.url.toString();
        } catch (error) {
          console.error("Error fetching proof image URL:", error);
        }
      }

      return task;
    } catch (error) {
      console.error("Error fetching buddy tasks:", error);
      return null;
    }
  };

  const createTaskForBuddy = async () => {
    if (!buddyId || !newTaskText.trim()) return;

    setIsCreatingTask(true);
    try {
      const { data: newTask, errors } = await client.models.Tasks.create({
        task: newTaskText,
        sender_id: user.userId,
        reciever_id: buddyId,
        time: new Date().toISOString(),
      });

      if (errors) {
        console.error("Errors creating task:", errors);
        return;
      }

      setBuddyTask(newTask.task);
      setNewTaskText("");
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsCreatingTask(false);
    }
  };

  useEffect(() => {
    const fetchTask = async () => {
      if (!user?.userId) return;

      const taskData = await getTasks();
      if (taskData) {
        setUserTask(taskData.task);
        setUserTaskId(taskData.id);
        if (taskData.img_proof_url) {
          setProofPreview(taskData.img_proof_url);
        }
      }
    };

    fetchTask();
  }, [user?.userId]);

  useEffect(() => {
    const fetchBuddyData = async () => {
      if (!user?.userId) return;

      const profile = await getUserProfile();
      if (profile?.buddy_id) {
        setBuddyId(profile.buddy_id);
        const task = await getBuddyTask(profile.buddy_id);
        if (task) {
          setBuddyTask(task.task);
          setBuddyTaskId(task.id);
          if (task.img_proof_url) {
            setBuddyTaskProof(task.img_proof_url);
          }
        }
      }
    };

    fetchBuddyData();
  }, [user?.userId]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex-1 px-8 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
          {/* Task Content */}
          <div className="col-span-6">
            <div className="border rounded-lg bg-white p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Your Task
              </h3>
              <div>
                {userTask ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">{userTask}</p>
                    <button
                      onClick={deleteTask}
                      disabled={isDeletingTask}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {isDeletingTask ? "Rejecting..." : "Reject Task"}
                    </button>

                    {/* Photo Submission Box */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-md font-semibold text-gray-700 mb-3">
                        Submit Proof of Completion
                      </h4>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      {proofPreview ? (
                        <div className="space-y-3">
                          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                            <img
                              src={proofPreview}
                              alt="Proof preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm text-green-600 flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Proof submitted! Waiting for buddy approval.
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingProof}
                          className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 disabled:opacity-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {isUploadingProof
                            ? "Uploading..."
                            : "Upload Photo Proof"}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No task assigned.</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-span-6">
            <div className="border rounded-lg bg-white p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Buddy's Task
              </h3>
              {buddyTask ? (
                <div className="space-y-4">
                  <p className="text-gray-600">{buddyTask}</p>

                  {/* Buddy's Task Photo Proof */}
                  {buddyTaskProof && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-md font-semibold text-gray-700 mb-3">
                        Proof Submitted
                      </h4>
                      <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300 mb-4">
                        <img
                          src={buddyTaskProof}
                          alt="Task proof"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Approve/Decline Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={approveTask}
                          disabled={isApprovingTask}
                          className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {isApprovingTask ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={declineTask}
                          disabled={isApprovingTask}
                          className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {isApprovingTask ? "Declining..." : "Decline"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-500 text-sm mb-3">
                    No task assigned to your buddy yet. Create one!
                  </p>
                  <textarea
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Enter a task for your buddy..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="4"
                  />
                  <button
                    onClick={createTaskForBuddy}
                    disabled={isCreatingTask || !newTaskText.trim()}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCreatingTask ? "Creating..." : "Create Task"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

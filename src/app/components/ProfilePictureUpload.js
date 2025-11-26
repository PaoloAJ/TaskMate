"use client";

import { useState, useRef } from "react";
import { uploadData, getUrl, remove } from "aws-amplify/storage";
import { useProfilePicture } from "@/lib/profile-picture-context";

export default function ProfilePictureUpload({ userId, currentPfpKey, onUploadSuccess, initialPreview }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(initialPreview || null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const { updateProfilePicture } = useProfilePicture();

  const processImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for circular crop and optimization
          const canvas = document.createElement("canvas");
          const size = 400; // Output size
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");

          // Calculate dimensions for center crop
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          // Create circular clipping path
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();

          // Draw image centered and cropped
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

          // Convert to blob with optimization
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to create image blob"));
              }
            },
            "image/jpeg",
            0.85 // Quality for optimization
          );
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      // Process image (crop and optimize)
      const processedBlob = await processImage(file);

      // Create preview
      const previewUrl = URL.createObjectURL(processedBlob);
      setPreview(previewUrl);

      // Delete old profile picture if exists
      if (currentPfpKey) {
        try {
          await remove({ path: currentPfpKey });
        } catch (err) {
          console.warn("Failed to delete old profile picture:", err);
        }
      }

      // Upload to S3
      const timestamp = Date.now();
      const path = `profile-pictures/${userId}/avatar-${timestamp}.jpg`;

      const result = await uploadData({
        path,
        data: processedBlob,
        options: {
          contentType: "image/jpeg",
        },
      }).result;

      // Get the URL for optimistic update
      const urlResult = await getUrl({ path });

      // Update context for immediate navbar refresh
      updateProfilePicture(urlResult.url.toString(), path);

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(path);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="relative group"
      >
        <div className="h-24 w-24 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span className="text-white text-xl font-bold">
              {uploading ? "..." : "+"}
            </span>
          )}
        </div>

        <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {uploading ? "Uploading..." : "Change"}
          </span>
        </div>
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Click to upload (max 5MB)
      </div>
    </div>
  );
}

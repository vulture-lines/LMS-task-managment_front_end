"use client";

import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { CreateForumPost, UploadFile } from "../service/api";

export function NewForumPostForm({ onSubmit, onCancel, onRefresh }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await UploadFile(formData);
      setImageUrl(res.data.fileUrl);
      setPreviewUrl(res.data.fileUrl);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate title and description
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }

    // Create payload
    const payload = {
      title: title.trim(),
      content: description.trim(),
      files: imageUrl ? [imageUrl] : [],
      approved: false, // New posts require approval
    };

    try {
      setLoading(true);
      const newPost = await CreateForumPost(payload);
      setError(null);

      // Reset form
      setTitle("");
      setDescription("");
      setImageUrl(null);
      setPreviewUrl(null);

      // Trigger callbacks
      if (onSubmit) {
        onSubmit(newPost);
      }
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  // Handle form cancellation
  const handleCancel = () => {
    // Reset form
    setTitle("");
    setDescription("");
    setImageUrl(null);
    setPreviewUrl(null);
    setError(null);

    // Trigger parent's cancel action
    if (onCancel) {
      onCancel();
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setImageUrl(null);
    setPreviewUrl(null);
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <h2 className="text-lg font-semibold">Create a new post</h2>

        {/* Error Display */}
        {error && (
          <div className="p-2 bg-red-100 text-red-600 text-sm">{error}</div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="What's your question or topic?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
            aria-label="Post title"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            placeholder="Provide details about your question or topic..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[8rem] focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={loading}
            aria-label="Post description"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Image (optional)
          </label>
          {previewUrl ? (
            <div className="relative w-full h-48 rounded-md overflow-hidden border">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={loading}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImagePlus className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    Click to upload an image
                  </p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                  aria-label="Upload an image"
                />
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !title.trim() || !description.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
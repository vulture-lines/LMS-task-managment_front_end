"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  MessageSquare,
  Share2,
  Send,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Heart,
  ImagePlus,
  X,
} from "lucide-react";
import {
  GetAllForumPosts,
  AddForumReply,
  UpdateForumPost,
  DeleteForumPost,
  LikeForumPost,
  UpdateForumReply,
  DeleteForumReply,
  CreateForumPost,
  UploadFile,
  ToggleForumPostApproval,
} from "../../service/api";

// NewForumPostForm component
const NewForumPostForm = ({ onSubmit, onCancel, onRefresh }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError(err || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) return;

    const payload = {
      title,
      content: description,
      files: imageUrl ? [imageUrl] : [],
      approved: false, // New posts require approval
    };

    try {
      setLoading(true);
      const newPost = await CreateForumPost(payload);
      setError(null);
      setTitle("");
      setDescription("");
      setImageUrl(null);
      setPreviewUrl(null);
      if (onSubmit) {
        onSubmit(newPost);
      }
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      setError(err || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setImageUrl(null);
    setPreviewUrl(null);
    setError(null);
    if (onCancel) {
      onCancel();
    }
  };

  const removeImage = () => {
    setImageUrl(null);
    setPreviewUrl(null);
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <h2 className="text-lg font-semibold">Create a new post</h2>
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
};

// ForumPostCard component
const ForumPostCard = ({ post, currentUser, onUpdate, onDelete, onRefresh }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState({
    title: post.title,
    content: post.content,
    tags: post.tags.join(", "),
  });
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editedReplyContent, setEditedReplyContent] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isApproved, setIsApproved] = useState(post.approved || false);

  useEffect(() => {
    if (currentUser._id !== post.user._id && currentUser.role !== "Admin") {
      console.log(`Edit/Delete hidden: currentUser._id=${currentUser._id}, post.user._id=${post.user._id}`);
    }
  }, [currentUser._id, post.user._id, currentUser.role]);

  const canEditOrDelete = currentUser._id === post.user._id || currentUser.role === "Admin";
  const canApprove = currentUser.role === "Admin";

  const handleLike = async () => {
    try {
      const updatedPost = {
        ...post,
        likes: post.likes.includes(currentUser._id)
          ? post.likes.filter((id) => id !== currentUser._id)
          : [...post.likes, currentUser._id],
      };
      onUpdate(updatedPost); // Optimistic update
      await LikeForumPost(post._id);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      setError(err || "Failed to like post");
      onUpdate(post); // Revert on error
    }
  };

  const handleShare = () => {
    const baseUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5173";
    navigator.clipboard.writeText(`${baseUrl}/admin/forum/${post._id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await AddForumReply(post._id, { message: newComment, files: [] });
      setNewComment("");
      setShowComments(true);
      setSuccess("Reply added successfully");
      setTimeout(() => setSuccess(null), 2000);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      setError(err || "Failed to add reply");
    }
  };

  const handleEdit = async () => {
    if (isEditing) {
      try {
        const tagsArray = editedPost.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
        const updatedPost = await UpdateForumPost(post._id, {
          title: editedPost.title,
          content: editedPost.content,
          files: post.files,
          tags: tagsArray,
          postType: post.postType,
          visibility: post.visibility,
          pinned: post.pinned,
          approved: post.approved, // Preserve approval status
        });
        setIsEditing(false);
        setSuccess("Post updated successfully");
        setTimeout(() => setSuccess(null), 2000);
        onUpdate(updatedPost);
        if (onRefresh) {
          await onRefresh();
        }
      } catch (err) {
        setError(err || "Failed to update post");
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await DeleteForumPost(post._id);
        onDelete(post._id);
        setSuccess("Post deleted successfully");
        setTimeout(() => setSuccess(null), 2000);
        if (onRefresh) {
          await onRefresh();
        }
      } catch (err) {
        setError(err || "Failed to delete post");
      }
    }
  };

  const handleToggleApproval = async () => {
    const newApprovalState = !isApproved;
    try {
      const updatedPost = await ToggleForumPostApproval(post._id, newApprovalState);
      setIsApproved(newApprovalState);
      setSuccess(`Post ${newApprovalState ? "approved" : "unapproved"} successfully`);
      setTimeout(() => setSuccess(null), 2000);
      onUpdate(updatedPost.post);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      setError(err || "Failed to update approval status");
      setTimeout(() => setError(null), 2000);
    }
  };

  const handleEditReply = async (replyId, currentMessage) => {
    if (editingReplyId === replyId) {
      try {
        await UpdateForumReply(post._id, replyId, {
          message: editedReplyContent,
          files: [],
        });
        setEditingReplyId(null);
        setEditedReplyContent("");
        setSuccess("Reply updated successfully");
        setTimeout(() => setSuccess(null), 2000);
        if (onRefresh) {
          await onRefresh();
        }
      } catch (err) {
        setError(err || "Failed to update reply");
      }
    } else {
      setEditingReplyId(replyId);
      setEditedReplyContent(currentMessage);
    }
  };

  const handleCancelEditReply = () => {
    setEditingReplyId(null);
    setEditedReplyContent("");
  };

  const handleDeleteReply = async (replyId) => {
    if (window.confirm("Are you sure you want to delete this reply?")) {
      try {
        await DeleteForumReply(post._id, replyId);
        setSuccess("Reply deleted successfully");
        setTimeout(() => setSuccess(null), 2000);
        if (onRefresh) {
          await onRefresh();
        }
      } catch (err) {
        setError(err || "Failed to delete reply");
      }
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 flex items-start gap-4">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleLike}
            className={`p-1 rounded-full hover:bg-gray-100 ${
              post.likes.includes(currentUser._id) ? "text-red-500" : "text-gray-600"
            }`}
            aria-label={post.likes.includes(currentUser._id) ? "Unlike post" : "Like post"}
          >
            <Heart className="h-5 w-5" />
          </button>
          <span className="font-medium text-sm">{post.likes.length}</span>
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-500 flex items-center gap-2 mb-1">
            <span>Posted by u/{post.user.username}</span>•
            <span>{new Date(post.createdAt).toLocaleString()}</span>
            {canApprove && (
              <span
                className={`ml-2 text-sm ${
                  isApproved ? "text-green-600" : "text-red-600"
                }`}
              >
                {isApproved ? "Approved" : "Pending Approval"}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold">{post.title}</h3>
          <div className="flex gap-2 mt-1">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-200 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 pt-0 ml-12">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editedPost.title}
              onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
              placeholder="Post title"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
              aria-label="Edit post title"
            />
            <textarea
              value={editedPost.content}
              onChange={(e) => setEditedPost({ ...editedPost, content: e.target.value })}
              placeholder="Post content"
              className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
              aria-label="Edit post content"
            />
            <input
              type="text"
              value={editedPost.tags}
              onChange={(e) => setEditedPost({ ...editedPost, tags: e.target.value })}
              placeholder="Tags (comma-separated)"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
              aria-label="Edit post tags"
            />
          </div>
        ) : (
          <p className="mb-4 text-gray-800">{post.content}</p>
        )}
        {post.files?.length > 0 && (
          <div className="relative w-full h-64 mb-4 rounded-md overflow-hidden">
            <img
              src={post.files[0] || "/placeholder.svg"}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </div>
      <div className="p-4 pt-0 ml-12 text-sm">
        {error && <p className="text-red-600 mb-2">{error}</p>}
        {success && <p className="text-green-600 mb-2">{success}</p>}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            aria-label={showComments ? "Hide comments" : "Show comments"}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.replies.length} Comments</span>
            {showComments ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            aria-label={copied ? "Link copied" : "Share post"}
          >
            <Share2 className="h-4 w-4" />
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>
          {canEditOrDelete && (
            <>
              <button
                onClick={handleEdit}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                aria-label={isEditing ? "Save post edits" : "Edit post"}
              >
                <Edit className="h-4 w-4" />
                <span>{isEditing ? "Save" : "Edit"}</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-gray-600 hover:text-red-600"
                aria-label="Delete post"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </>
          )}
          {canApprove && (
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                className={`relative inline-flex items-center w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${
                  isApproved ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out transform ${
                    isApproved ? "translate-x-5" : "translate-x-0"
                  }`}
                />
                <input
                  type="checkbox"
                  checked={isApproved}
                  onChange={handleToggleApproval}
                  className="hidden"
                  aria-label={`Toggle approval for post ${post.title}`}
                  aria-checked={isApproved}
                />
              </div>
              <span
                className={`${
                  isApproved ? "text-green-600" : "text-gray-600"
                } text-sm`}
              >
                {isApproved ? "Approved" : "Pending"}
              </span>
            </label>
          )}
        </div>
        {showComments && (
          <div className="mt-4 space-y-4">
            <div className="flex gap-2 items-start">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold text-white">
                {currentUser?.username?.slice(0, 2).toUpperCase() || "AD"}
              </div>
              <div className="flex-1 flex gap-2">
                <textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full min-h-[2.5rem] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                  aria-label="Add a comment"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  aria-label="Submit comment"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3 pl-10">
              {post.replies.map((reply) => (
                <div key={reply._id} className="text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>u/{reply.user.username || "Unknown"}</span>•
                    <span>{new Date(reply.createdAt).toLocaleString()}</span>
                    {(currentUser._id === reply.user._id || currentUser.role === "Admin") && (
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => handleEditReply(reply._id, reply.message)}
                          className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                          aria-label={editingReplyId === reply._id ? "Save reply edit" : "Edit reply"}
                        >
                          <Edit className="h-4 w-4" />
                          <span>{editingReplyId === reply._id ? "Save" : "Edit"}</span>
                        </button>
                        {editingReplyId === reply._id && (
                          <button
                            onClick={handleCancelEditReply}
                            className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
                            aria-label="Cancel reply edit"
                          >
                            <X className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReply(reply._id)}
                          className="flex items-center gap-1 text-gray-600 hover:text-red-600"
                          aria-label="Delete reply"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                  {editingReplyId === reply._id ? (
                    <textarea
                      value={editedReplyContent}
                      onChange={(e) => setEditedReplyContent(e.target.value)}
                      className="w-full min-h-[2.5rem] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                      aria-label="Edit reply content"
                    />
                  ) : (
                    <p>{reply.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// AdminForumPage component
const AdminForumPage = () => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // Filter by approval status
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const currentUser = { _id: "680373b6c9e849266316e9da", username: "admin", role: "Admin" }; // TODO: Replace with auth context

  const refreshPosts = async () => {
    try {
      const fetchedPosts = await GetAllForumPosts();
      setPosts(fetchedPosts);
      setError(null);
    } catch (err) {
      setError(err || "Failed to fetch posts");
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter((post) => post._id !== postId));
  };

  const handlePostCreate = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowCreateForm(false);
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter =
        filter === "all" ||
        (filter === "approved" && post.approved) ||
        (filter === "unapproved" && !post.approved);
      return matchesSearch && matchesFilter;
    });
  }, [posts, searchQuery, filter]);

  return (
    <div className="container mx-auto py-6 max-w-4xl px-4">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Admin DevForum</h1>
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts or tags..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search posts or tags"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Filter posts by approval status"
              >
                <option value="all">All Posts</option>
                <option value="approved">Approved</option>
                <option value="unapproved">Pending Approval</option>
              </select>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                aria-label={showCreateForm ? "Hide create post form" : "Show create post form"}
              >
                {showCreateForm ? "Hide Form" : "Create Post"}
              </button>
            </div>
          </div>
        </header>
        {showCreateForm && (
          <NewForumPostForm
            onSubmit={handlePostCreate}
            onCancel={handleFormCancel}
            onRefresh={refreshPosts}
          />
        )}
        {error && <p className="text-red-600">{error}</p>}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <p className="text-gray-500">No posts found.</p>
          ) : (
            filteredPosts.map((post) => (
              <ForumPostCard
                key={post._id}
                post={post}
                currentUser={currentUser}
                onUpdate={handlePostUpdate}
                onDelete={handlePostDelete}
                onRefresh={refreshPosts}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminForumPage;
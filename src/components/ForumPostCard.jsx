"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  MessageSquare,
  Share2,
  Send,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
} from "lucide-react";
import { ForumCommentItem } from "./ForumCommentItem";
import {
  LikeForumPost,
  AddForumReply,
  UpdateForumPost,
  DeleteForumPost,
  GetForumPostById,
} from "../service/api";

export function ForumPostCard({ post, currentUser }) {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(post.upvotes || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch comments when showComments is toggled
  useEffect(() => {
    if (showComments) {
      const fetchComments = async () => {
        try {
          setLoading(true);
          const postData = await GetForumPostById(post._id);
          setComments(postData.replies || []);
        } catch (err) {
          setError(err.message || "Failed to fetch comments");
        } finally {
          setLoading(false);
        }
      };
      fetchComments();
    }
  }, [showComments, post._id]);

  const handleUpvote = async () => {
    try {
      setLoading(true);
      const newUpvoteState = !upvoted;
      const response = await LikeForumPost(post._id);
      setUpvotes(response.upvotes || (upvoted ? upvotes - 1 : upvotes + 1));
      setUpvoted(newUpvoteState);
      setDownvoted(false);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to upvote post");
    } finally {
      setLoading(false);
    }
  };

  const handleDownvote = async () => {
    try {
      setLoading(true);
      const newDownvoteState = !downvoted;
      const response = await LikeForumPost(post._id); // Adjust if separate downvote API exists
      setUpvotes(response.upvotes || (downvoted ? upvotes + 1 : upvotes - 1));
      setDownvoted(newDownvoteState);
      setUpvoted(false);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to downvote post");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `https://devforum.example.com/post/${post._id}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const replyData = {
        message: newComment,
        user: currentUser?.id || "anonymous",
      };
      const response = await AddForumReply(post._id, replyData);
      const newCommentData = {
        _id: response._id,
        message: newComment,
        user: { username: currentUser?.username || "Anonymous" },
        upvotes: 0,
        timePosted: "Just now",
      };
      setComments([newCommentData, ...comments]);
      setNewComment("");
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (isEditing) {
      try {
        setLoading(true);
        const updatedPost = {
          title: post.title,
          content: editedContent,
          files: post.files || [],
        };
        await UpdateForumPost(post._id, updatedPost);
        post.content = editedContent;
        setIsEditing(false);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to update post");
      } finally {
        setLoading(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        setLoading(true);
        await DeleteForumPost(post._id);
        setIsDeleted(true);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to delete post");
      } finally {
        setLoading(false);
      }
    }
  };

  if (isDeleted) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Error Display */}
      {error && (
        <div className="p-2 bg-red-100 text-red-600 text-sm">{error}</div>
      )}

      {/* Header */}
      <div className="p-4 flex items-start gap-4">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleUpvote}
            disabled={loading}
            className={`p-1 rounded-full hover:bg-gray-100 ${
              upvoted ? "text-orange-500" : "text-gray-600"
            } ${loading ? "opacity-50" : ""}`}
          >
            <ArrowUpCircle className="h-5 w-5" />
          </button>
          <span className="font-medium text-sm">{upvotes}</span>
          <button
            onClick={handleDownvote}
            disabled={loading}
            className={`p-1 rounded-full hover:bg-gray-100 ${
              downvoted ? "text-green-500" : "text-gray-600"
            } ${loading ? "opacity-50" : ""}`}
          >
            <ArrowDownCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1">
          <div className="text-sm text-gray-500 flex items-center gap-2 mb-1">
            <span>Posted by u/{post.user?.username || "Anonymous"}</span>•
            <span>{post.timePosted || "Unknown time"}</span>
          </div>
          <h3 className="text-lg font-semibold">{post.title}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-0 ml-12">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
            disabled={loading}
          />
        ) : (
          <p className="mb-4 text-gray-800">{post.content}</p>
        )}
        {post.files?.length > 0 && (
          <div className="relative w-full h-64 mb-4 rounded-md overflow-hidden">
            <img
              src={post.files[0] || "/placeholder.svg"}
              alt={post.title}
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 pt-0 ml-12 text-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{comments.length} Comments</span>
            {showComments ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            <Share2 className="h-4 w-4" />
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            <Edit className="h-4 w-4" />
            <span>{isEditing ? "Save" : "Edit"}</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-gray-600 hover:text-red-600"
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-4 space-y-4">
            <div className="flex gap-2 items-start">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold text-white">
                {currentUser?.username?.slice(0, 2).toUpperCase() || "CU"}
              </div>
              <div className="flex-1 flex gap-2">
                <textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full min-h-[2.5rem] p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                  disabled={loading}
                />
                <button
                  onClick={handleAddComment}
                  disabled={loading || !newComment.trim()}
                  className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 pl-10">
              {loading ? (
                <p className="text-gray-500">Loading comments...</p>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <ForumCommentItem
                    key={comment._id}
                    comment={{
                      id: comment._id,
                      author: comment.user?.username || "Anonymous",
                      content: comment.message || comment.content || "",
                      upvotes: comment.upvotes || 0,
                      timePosted: comment.timePosted || "Unknown",
                    }}
                  />
                ))
              ) : (
                <p className="text-gray-500">No comments yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
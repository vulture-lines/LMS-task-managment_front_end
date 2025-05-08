"use client";

import { useState } from "react";
import { ArrowUpCircle, ArrowDownCircle, Reply } from "lucide-react";

export function ForumCommentItem({ comment }) {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(comment.upvotes);

  const handleUpvote = () => {
    if (upvoted) {
      setUpvotes(upvotes - 1);
      setUpvoted(false);
    } else {
      setUpvotes(downvoted ? upvotes + 2 : upvotes + 1);
      setUpvoted(true);
      setDownvoted(false);
    }
  };

  const handleDownvote = () => {
    if (downvoted) {
      setUpvotes(upvotes + 1);
      setDownvoted(false);
    } else {
      setUpvotes(upvoted ? upvotes - 2 : upvotes - 1);
      setDownvoted(true);
      setUpvoted(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Avatar Replacement */}
      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold text-white">
        {comment.author.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{comment.author}</span>
          <span className="text-xs text-gray-500">{comment.timePosted}</span>
        </div>

        <p className="mt-1 text-sm text-gray-800">{comment.content}</p>

        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleUpvote}
            className={`h-6 w-6 rounded-full flex items-center justify-center hover:bg-gray-100 ${
              upvoted ? "text-orange-500" : "text-gray-600"
            }`}
          >
            <ArrowUpCircle className="h-3 w-3" />
          </button>
          <span className="text-xs font-medium">{upvotes}</span>
          <button
            onClick={handleDownvote}
            className={`h-6 w-6 rounded-full flex items-center justify-center hover:bg-gray-100 ${
              downvoted ? "text-green-500" : "text-gray-600"
            }`}
          >
            <ArrowDownCircle className="h-3 w-3" />
          </button>
          <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100">
            <Reply className="h-3 w-3" />
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}

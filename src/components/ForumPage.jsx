

"use client";

import { useEffect, useState } from "react";


import { Search } from "lucide-react";
import { NewForumPostForm } from "./NewForumPostForm";
import { ForumPostCard } from "./ForumPostCard";
import { CreateForumPost, GetAllForumPosts } from "../service/api";



export default function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  const fetchAllPost = async () => {
    try {
      const Posts = await GetAllForumPosts();
      setPosts(Posts);
      console.log(Posts);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllPost();
  }, []);

  const handleNewPost = async (post) => {
 
    const payload = {
      title: post.title,
      content: post.description,
      files: post.imageUrl,
    };
    const res = await CreateForumPost(payload);
    console.log(res);

    // setPosts([newPost, ...posts]);
    setShowNewPostForm(false);
  };
  console.log(posts);

  return (
    <div className="container mx-auto py-6 max-w-4xl px-4">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">DevForum</h1>
            <button
              onClick={() => setShowNewPostForm(!showNewPostForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
            >
              {showNewPostForm ? "Cancel" : "Create Post"}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </header>

        {/* New Post Form */}
        {showNewPostForm && (
          <div className="mb-6">
            <NewForumPostForm
              onSubmit={handleNewPost}
              onCancel={() => setShowNewPostForm(false)}
            />
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <ForumPostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}

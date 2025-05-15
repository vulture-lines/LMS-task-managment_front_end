import { useState, useEffect, useRef } from "react";
import { GetAllUsers, GetConversationMessages, SendMessage } from "../../service/api";
import PageHeader from "../../components/PageHeader";

function ChatSystem() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const Token = JSON.parse(localStorage.getItem("loginData"));

  // Default profile picture URL
  const defaultProfilePic = "https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!Token?.token) {
      window.location.href = "/login";
    }
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await GetAllUsers();
        setUsers(response.data || response);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch messages for selected user
  const fetchMessages = async (userId) => {
    setIsLoading(true);
    try {
      const response = await GetConversationMessages(userId);
      setMessages(response);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user selection
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchMessages(user._id);
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setIsLoading(true);
    try {
      const response = await SendMessage({
        receiver: selectedUser._id,
        text: newMessage,
      });
      setMessages([...messages, response.data]);
      setNewMessage("");
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle closing the chat
  const handleCloseChat = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  return (
    <>
      <PageHeader title="Chats" />
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4 mx-4">
          {error}
        </div>
      )}
      {isLoading && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg mb-4 mx-4">
          Loading...
        </div>
      )}

      <div className="flex flex-col md:flex-row pinterest h-[calc(100vh-120px)] mx-4">
        {/* User List (Sidebar) */}
        <div className="w-full md:w-1/4 bg-white rounded-lg shadow border border-gray-300 mb-4 md:mb-0 md:mr-4">
          <div className="p-4 border-b bg-gray-100">
            <h2 className="text-lg font-medium">Users</h2>
          </div>
          <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  className={`p-3 rounded-md cursor-pointer mb-2 flex items-center ${
                    selectedUser?._id === user._id ? "bg-green-100" : "hover:bg-gray-100"
                  }`}
                >
                  <img
                    src={user.profilePicture || defaultProfilePic}
                    alt={`${user.username}'s profile`}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{user.username}</span>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-600">No users available</div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="w-full md:w-3/4 bg-white rounded-lg shadow border border-gray-300">
          {selectedUser ? (
            <>
              <div className="p-4 border-b bg-gray-100 flex justify-between items-center">
                <div className="flex items-center">
                  <img
                    src={selectedUser.profilePicture || defaultProfilePic}
                    alt={`${selectedUser.username}'s profile`}
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  <h2 className="text-lg font-medium">Chat with {selectedUser.username}</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-600 hover:text-gray-800 md:hidden"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCloseChat}
                    className="text-gray-600 hover:text-gray-800"
                    title="Close chat"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4 h-[calc(100vh-280px)] overflow-y-auto">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`mb-4 flex ${
                        msg.sender._id === Token?.user?._id ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="flex items-start">
                        {msg.sender._id !== Token?.user?._id && (
                          <img
                            src={msg.sender.profilePicture || defaultProfilePic}
                            alt={`${msg.sender.username}'s profile`}
                            className="w-8 h-8 rounded-full mr-2 mt-1 object-cover"
                          />
                        )}
                        <div
                          className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                            msg.sender._id === Token?.user?._id
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className="text-xs mt-1 opacity-75">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-600">No messages yet</div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-md p-2 mr-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-400"
                    disabled={isLoading}
                  >
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">
              Select a user to start chatting
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ChatSystem;
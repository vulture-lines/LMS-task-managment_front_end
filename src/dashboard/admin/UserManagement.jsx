import { useState } from "react";
import { GetAllUsers, UpdateUserById, UpdateUserApproval, DeleteUserById } from "../../service/api";
import { useLoaderData } from "react-router";
import PageHeader from "../../components/PageHeader";

// Toggle Switch Component
function ToggleSwitch({ isApproved, userId, onToggle }) {
  const handleToggle = () => {
    onToggle(userId, !isApproved);
  };

  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={isApproved}
        onChange={handleToggle}
        className="sr-only peer"
      />
      <div
        className={`relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}
      ></div>
    </label>
  );
}

function UserManagement() {
  const initialUsers = useLoaderData();
  const [users, setUsers] = useState(initialUsers);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUserData, setEditedUserData] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Handle toggle approval
  const handleToggleApproval = async (userId, newApprovalStatus) => {
    setIsLoading(true);
    try {
      await UpdateUserApproval(userId, newApprovalStatus);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isApproved: newApprovalStatus } : user
        )
      );
      setError(null);
    } catch (error) {
      setError(error);
      // Revert state on failure
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, isApproved: !newApprovalStatus } : user
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing
  const handleEdit = (userId) => {
    const user = users.find((u) => u._id === userId);
    setEditingUserId(userId);
    setEditedUserData({ ...user });
    setShowUserDetails(true);
    setError(null);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Save edited data
  const handleSave = async (userId) => {
    // Basic validation
    if (!editedUserData.username || !editedUserData.email) {
      setError("Username and email are required");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(editedUserData.email)) {
      setError("Invalid email format");
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await UpdateUserById(userId, editedUserData);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, ...updatedUser } : user
        )
      );
      setEditingUserId(null);
      setEditedUserData({});
      setShowUserDetails(false);
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingUserId(null);
    setEditedUserData({});
    setShowUserDetails(false);
    setError(null);
  };

  // Delete user with confirmation
  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setIsLoading(true);
      try {
        await DeleteUserById(userId);
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
        setError(null);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <PageHeader title={showUserDetails ? "User Details" : "User Management"} />
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
          {error}
        </div>
      )}
      {isLoading && (
        <div className="p-4 bg-blue-100 text-blue-700 rounded-lg mb-4">
          Processing...
        </div>
      )}

      {showUserDetails ? (
        // User details edit form
        <div className="p-4">
          <div className="bg-white rounded-lg shadow border border-gray-300 max-w-3xl mx-auto">
            <div className="p-4 border-b bg-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">User Details</h2>
                <div className="flex">
                  <button
                    onClick={() => handleSave(editingUserId)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md mr-2 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-6">
                {/* First Name */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                  <label className="font-medium text-gray-700">First Name:</label>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="firstName"
                      value={editedUserData.firstName || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                  <label className="font-medium text-gray-700">Last Name:</label>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="lastName"
                      value={editedUserData.lastName || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Username */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                  <label className="font-medium text-gray-700">Username:</label>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="username"
                      value={editedUserData.username || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Email */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                  <label className="font-medium text-gray-700">Email:</label>
                  <div className="md:col-span-2">
                    <input
                      type="email"
                      name="email"
                      value={editedUserData.email || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Date of Birth */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                  <label className="font-medium text-gray-700">Date of Birth:</label>
                  <div className="md:col-span-2">
                    <input
                      type="date"
                      name="dob"
                      value={editedUserData.dob || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Gender */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                  <label className="font-medium text-gray-700">Gender:</label>
                  <div className="md:col-span-2">
                    <select
                      name="gender"
                      value={editedUserData.gender || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                      disabled={isLoading}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                {/* Educational Qualification */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                  <label className="font-medium text-gray-700">Educational Qualification:</label>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="education"
                      value={editedUserData.education || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Mobile No */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                  <label className="font-medium text-gray-700">Mobile No:</label>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="mobile"
                      value={editedUserData.mobile || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Degree Name */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                  <label className="font-medium text-gray-700">Degree Name:</label>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="degree"
                      value={editedUserData.degree || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Present Address */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                  <label className="font-medium text-gray-700">Present Address:</label>
                  <div className="md:col-span-2">
                    <textarea
                      name="address"
                      value={editedUserData.address || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                      rows="2"
                      disabled={isLoading}
                    ></textarea>
                  </div>
                </div>
                
                {/* Role */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                  <label className="font-medium text-gray-700">Role:</label>
                  <div className="md:col-span-2">
                    <select
                      name="role"
                      value={editedUserData.role || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                      disabled={isLoading}
                    >
                      <option value="">Select Role</option>
                      <option value="User">Student</option>
                      <option value="Admin">Mentor</option>
                    </select>
                  </div>
                </div>
                
                {/* Is Approved */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                  <label className="font-medium text-gray-700">Is Approved:</label>
                  <div className="md:col-span-2 flex items-center">
                    <ToggleSwitch
                      isApproved={editedUserData.isApproved || false}
                      userId={editingUserId}
                      onToggle={(id, value) => setEditedUserData(prev => ({ ...prev, isApproved: value }))}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          {/* Card-based view for small screens */}
          <div className="block md:hidden">
            {users.length > 0 ? (
              users.map((user, index) => (
                <div key={user._id} className="mb-4 bg-white rounded-lg shadow border border-gray-300">
                  <div className="p-4 border-b flex justify-between items-center">
                    <span className="font-medium">{index + 1}. {user.username}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user._id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                        disabled={isLoading}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                        disabled={isLoading}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M9 7v12m6-12v12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span className="text-gray-700">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date of Birth:</span>
                      <span className="text-gray-700">{user.dob}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Gender:</span>
                      <span className="text-gray-700">{user.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Role:</span>
                      <span className="text-gray-700">{user.role}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Approved:</span>
                      <ToggleSwitch
                        isApproved={user.isApproved}
                        userId={user._id}
                        onToggle={handleToggleApproval}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 bg-white rounded-lg shadow border border-gray-300">
                No Users
              </div>
            )}
          </div>

          {/* Table view for medium screens and above */}
          <div className="hidden md:block">
            <div className="w-full overflow-x-auto rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300 bg-white text-sm">
                <thead className="sticky">
                  <tr>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">S.No</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Username</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Email</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Date of Birth</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Gender</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Role</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Approved</th>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.dob}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.gender}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <ToggleSwitch
                            isApproved={user.isApproved}
                            userId={user._id}
                            onToggle={handleToggleApproval}
                            disabled={isLoading}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                          <button
                            onClick={() => handleEdit(user._id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                            disabled={isLoading}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                            disabled={isLoading}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M9 7v12m6-12v12"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center">
                        No Users
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserManagement;
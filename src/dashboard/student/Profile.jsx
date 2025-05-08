import React, { useState, useEffect } from 'react';
import { baseUrl1 } from '../../service/api';

const API_URL = baseUrl1;

function Profile() {
  const [state, setState] = useState({
    profile: {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      gender: '',
      dob: '',
      education: '',
      qualification: '',
      maritalStatus: '',
      ministry: '',
      experience: '',
      theological: '',
      salvation: '',
      signature: '',
      educationCert: ''
    },
    loading: true,
    error: null,
    isEditing: false,
    formData: null
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const userInfo = JSON.parse(localStorage.getItem('loginData')) || {};
      const token = userInfo.token;
      const userId = userInfo.user?._id;

      // Log token and userId for debugging
      console.log('Fetching user data with:', { token, userId });

      if (!token || !userId) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'User authentication information not found. Please log in again.'
        }));
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error response:', errorData); // Log error details
          if (response.status === 403) {
            localStorage.removeItem('loginData');
            window.location.href = '/login';
            throw new Error('Access forbidden. Your session may have expired. Redirecting to login.');
          }
          if (response.status === 404) {
            localStorage.removeItem('loginData');
            window.location.href = '/login';
            throw new Error('User profile not found. Redirecting to login.');
          }
          throw new Error(errorData.message || `Failed to fetch profile data (Status: ${response.status})`);
        }

        const data = await response.json();
        setState((prev) => ({
          ...prev,
          profile: {
            username: data.username || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            gender: data.gender || '',
            dob: data.dob || '',
            education: data.education || '',
            qualification: data.qualification || '',
            maritalStatus: data.maritalStatus || '',
            ministry: data.ministry || '',
            experience: data.experience || '',
            theological: data.theological || '',
            salvation: data.salvation || '',
            signature: data.signature || '',
            educationCert: data.educationCert || ''
          },
          loading: false
        }));
      } catch (err) {
        console.error('Fetch error:', err.message); // Log fetch errors
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message || 'An unexpected error occurred'
        }));
      }
    };

    fetchUserData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleEditClick = () => {
    setState((prev) => ({
      ...prev,
      isEditing: true,
      formData: { ...prev.profile }
    }));
  };

  const handleCancelClick = () => {
    setState((prev) => ({
      ...prev,
      isEditing: false,
      formData: null
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userInfo = JSON.parse(localStorage.getItem('loginData')) || {};
    const token = userInfo.token;
    const userId = userInfo.user?._id;

    if (!token || !userId) {
      setState((prev) => ({
        ...prev,
        error: 'User authentication information not found',
        isEditing: false
      }));
      return;
    }

    const requiredFields = ['username', 'email'];
    for (const field of requiredFields) {
      if (!state.formData[field]) {
        setState((prev) => ({
          ...prev,
          error: `Please fill in the ${field} field`
        }));
        return;
      }
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state.formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          localStorage.removeItem('loginData');
          window.location.href = '/login';
          throw new Error('Access forbidden. Please log in again.');
        }
        throw new Error(errorData.message || `Failed to update profile (Status: ${response.status})`);
      }

      const updatedData = await response.json();
      setState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...updatedData
        },
        isEditing: false,
        formData: null,
        error: null
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err.message || 'Failed to update profile'
      }));
    }
  };

  const { profile, loading, error, isEditing, formData } = state;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !isEditing) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              {/* Ensure valid viewBox; fallback to "0 0 20 20" if needed */}
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error.includes('not found') || error.includes('forbidden') ? (
                  <>
                    {error} <a href="/login" className="underline">Log in again</a> or contact support.
                  </>
                ) : (
                  error
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="relative mb-16">
        <div className="h-32 bg-gradient-to-r from-blue-700 to-purple-600 rounded-lg shadow-md"></div>
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div
            className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center"
            aria-label={`Profile picture for ${profile.firstName} ${profile.lastName}`}
          >
            <span className="text-3xl font-bold text-blue-600">
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative text-center mt-8 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{profile.username}</h1>
        <p className="text-gray-600">{profile.email}</p>
        {!isEditing && (
          <button
            onClick={handleEditClick}
            className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">General Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <label className="text-sm font-medium text-gray-500">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="col-span-2 text-sm text-gray-900 border rounded-md p-2"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="text-sm font-medium text-gray-500">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="col-span-2 text-sm text-gray-900 border rounded-md p-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="text-sm font-medium text-gray-500">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="col-span-2 text-sm text-gray-900 border rounded-md p-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="text-sm font-medium text-gray-500">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="col-span-2 text-sm text-gray-900 border rounded-md p-2"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="col-span-2 text-sm text-gray-900 border rounded-md p-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="col-span-2 text-sm text-gray-900 border rounded-md p-2"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Other Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="col-span-2 text-sm text-gray-900 border rounded-md p-2"
                   pattern="^[6789]\d{9}$"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="text-sm font-medium text-gray-500">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="col-span-2 text-sm text-gray-900 border rounded-md p-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="text-sm font-medium text-gray-500">Education</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="col-span-2 text-sm text-gray-900 border rounded-md p-2"
                />
              </div>
              {/* <div className="grid grid-cols-3 gap-4">
                <label className="text-sm font-medium text-gray-500">Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="col-span-2 text-sm text-gray-900 border rounded-md p-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="text-sm font-medium text-gray-500">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className="col-span-2 text-sm text-gray-900 border rounded-md p-2"
                >
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="text-sm font-medium text-gray-500">Ministry</label>
                <input
                  type="text"
                  name="ministry"
                  value={formData.ministry}
                  onChange={handleInputChange}
                  className="col-span-2 text-sm text-gray-900 border rounded-md p-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label className="text-sm font-medium text-gray-500">Theological</label>
                <input
                  type="text"
                  name="theological"
                  value={formData.theological}
                  onChange={handleInputChange}
                  className="col-span-2 text-sm text-gray-900 border rounded-md p-2"
                />
              </div> */}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancelClick}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Save
            </button>
          </div>

          {error && (
            <div className="col-span-1 md:col-span-2 bg-red-50 border-l-4 border-red-500 p-4" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">General Information</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-sm font-medium text-gray-500">Username</p>
                  <p className="col-span-2 text-sm text-gray-900">{profile.username || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-sm font-medium text-gray-500">First Name</p>
                  <p className="col-span-2 text-sm text-gray-900">{profile.firstName || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-sm font-medium text-gray-500">Last Name</p>
                  <p className="col-span-2 text-sm text-gray-900">{profile.lastName || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="col-span-2 text-sm text-gray-900">{profile.email || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="col-span-2 text-sm text-gray-900">{formatDate(profile.dob)}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="col-span-2 text-sm text-gray-900">{profile.gender || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Other Information</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="col-span-2 text-sm text-gray-900">{profile.phone || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="col-span-2 text-sm text-gray-900">{profile.address || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-sm font-medium text-gray-500">Education</p>
                  <p className="col-span-2 text-sm text-gray-900">{profile.education || 'Not provided'}</p>
                </div>
                {/* <div className="grid grid-cols-3 gap-4">
                  <p className="text-sm font-medium text-gray-500">Qualification</p>
                  <p className="col-span-2 text-sm text-gray-900">{profile.qualification || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-sm font-medium text-gray-500">Marital Status</p>
                  <p className="col-span-2 text-sm text-gray-900">{profile.maritalStatus || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-sm font-medium text-gray-500">Ministry</p>
                  <p className="col-span-2 text-sm text-gray-900">{profile.ministry || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-sm font-medium text-gray-500">Theological</p>
                  <p className="col-span-2 text-sm text-gray-900">{profile.theological || 'Not provided'}</p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
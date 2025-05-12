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
    formData: null,
    formErrors: {}
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const userInfo = JSON.parse(localStorage.getItem('loginData')) || {};
      const token = userInfo.token;
      const userId = userInfo.user?._id;

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
          if (response.status === 403 || response.status === 404) {
            localStorage.removeItem('loginData');
            window.location.href = '/login';
            throw new Error('Session expired or profile not found. Redirecting to login.');
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

  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!/^[a-zA-Z0-9_]*$/.test(value)) {
          return 'Username can only contain letters, numbers, and underscores';
        }
        return value ? '' : 'Username is required';
      case 'firstName':
        if (!value) {
          return 'First Name is required';
        }
        if (!/^[a-zA-Z\s]*$/.test(value)) {
          return 'Only letters and spaces are allowed (no numbers or special characters)';
        }
        return '';
      case 'lastName':
        if (!value) {
          return 'Last Name is required';
        }
        if (!/^[a-zA-Z\s]*$/.test(value)) {
          return 'Only letters and spaces are allowed (no numbers or special characters)';
        }
        return '';
      case 'email':
        if (!value) {
          return 'Email is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'gender':
        return value ? '' : 'Gender is required';
      case 'phone':
        if (!value) {
          return 'Phone number is required';
        }
        if (!/^[6789]\d{9}$/.test(value)) {
          return 'Mobile number must be 10 digits and start with 6, 7, 8, or 9';
        }
        return '';
      case 'dob':
        if (!value) {
          return 'Date of birth is not mandatory but recommended';
        }
        const selectedDate = new Date(value);
        const today = new Date();
        if (selectedDate > today) {
          return 'Future dates are not allowed';
        }
        return '';
      case 'education':
        if (!/^\d*$/.test(value)) {
          return 'Only numbers are allowed (e.g., years of education)';
        }
        return '';
      default:
        return '';
    }
  };

  const handleEditClick = () => {
    setState((prev) => ({
      ...prev,
      isEditing: true,
      formData: { ...prev.profile },
      formErrors: {}
    }));
  };

  const handleCancelClick = () => {
    setState((prev) => ({
      ...prev,
      isEditing: false,
      formData: null,
      formErrors: {}
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value
      },
      formErrors: {
        ...prev.formErrors,
        [name]: error
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

    const requiredFields = ['username', 'firstName', 'lastName', 'email', 'gender', 'phone'];
    const newErrors = {};
    let hasErrors = false;

    // Validate required fields
    requiredFields.forEach((field) => {
      const error = validateField(field, state.formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    // Validate non-required fields
    ['dob', 'education'].forEach((field) => {
      const error = validateField(field, state.formData[field]);
      if (error && field !== 'dob') {
        newErrors[field] = error;
        hasErrors = true;
      } else if (error) {
        newErrors[field] = error; // Non-blocking for dob
      }
    });

    if (hasErrors) {
      setState((prev) => ({
        ...prev,
        formErrors: newErrors
      }));
      return;
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
        formErrors: {},
        error: null
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err.message || 'Failed to update profile'
      }));
    }
  };

  const { profile, loading, error, isEditing, formData, formErrors } = state;

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
            aria-label={`Profile picture for ${profile.firstName}`}
          >
            <span className="text-3xl font-bold text-blue-600">
              {profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U'}
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
                <label htmlFor="username" className="text-sm font-medium text-gray-500">Username <span className="text-red-500">*</span></label>
                <div className="col-span-2">
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full text-sm text-gray-900 border rounded-md p-2"
                    required
                  />
                  {formErrors.username && <p className="text-sm text-red-500 mt-1">{formErrors.username}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label htmlFor="firstName" className="text-sm font-medium text-gray-500">First Name <span className="text-red-500">*</span></label>
                <div className="col-span-2">
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full text-sm text-gray-900 border rounded-md p-2"
                    required
                  />
                  {formErrors.firstName && <p className="text-sm text-red-500 mt-1">{formErrors.firstName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label htmlFor="lastName" className="text-sm font-medium text-gray-500">Last Name <span className="text-red-500">*</span></label>
                <div className="col-span-2">
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full text-sm text-gray-900 border rounded-md p-2"
                    required
                  />
                  {formErrors.lastName && <p className="text-sm text-red-500 mt-1">{formErrors.lastName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label htmlFor="email" className="text-sm font-medium text-gray-500">Email <span className="text-red-500">*</span></label>
                <div className="col-span-2">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full text-sm text-gray-900 border rounded-md p-2"
                    required
                  />
                  {formErrors.email && <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label htmlFor="dob" className="text-sm font-medium text-gray-500">Date of Birth</label>
                <div className="col-span-2">
                  <input
                    id="dob"
                    type="date"
                    name="dob"
                    value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                    onChange={handleInputChange}
                    className="w-full text-sm text-gray-900 border rounded-md p-2"
                  />
                  {formErrors.dob && <p className="text-sm text-yellow-500 mt-1">{formErrors.dob}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label htmlFor="gender" className="text-sm font-medium text-gray-500">Gender <span className="text-red-500">*</span></label>
                <div className="col-span-2">
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full text-sm text-gray-900 border rounded-md p-2"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.gender && <p className="text-sm text-red-500 mt-1">{formErrors.gender}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Other Information</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <label htmlFor="phone" className="text-sm font-medium text-gray-500">Phone <span className="text-red-500">*</span></label>
                <div className="col-span-2">
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full text-sm text-gray-900 border rounded-md p-2"
                    required
                    pattern="[6789][0-9]{9}"
                  />
                  {formErrors.phone && <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label htmlFor="address" className="text-sm font-medium text-gray-500">Address</label>
                <div className="col-span-2">
                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full text-sm text-gray-900 border rounded-md p-2"
                  />
                  {formErrors.address && <p className="text-sm text-red-500 mt-1">{formErrors.address}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <label htmlFor="education" className="text-sm font-medium text-gray-500">Education (Years)</label>
                <div className="col-span-2">
                  <input
                    id="education"
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="w-full text-sm text-gray-900 border rounded-md p-2"
                  />
                  {formErrors.education && <p className="text-sm text-red-500 mt-1">{formErrors.education}</p>}
                </div>
              </div>
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
            <div className="col-span-1 md:col-span-2 bg-red-50 border-l-4 border-red-500 p-4" role="alert" aria-live="polite">
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
                  <p className="text-sm font-medium text-gray-500">Education (Years)</p>
                  <p className="col-span-2 text-sm text-gray-900">{profile.education || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
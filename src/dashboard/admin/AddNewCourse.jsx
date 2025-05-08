import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import { Edit, Trash } from "lucide-react";
import NewLesson from "./NewLesson";
import NoLesson from "../../assets/no-lesson-illustration.svg";
import { convertToCourseFormData } from "../../hook/CourseFunction";
import { AddNewCourseApi, GetCourseById, UploadFile } from "../../service/api";

const UserInfo = JSON.parse(localStorage.getItem("loginData"));

const AddNewCourse = () => {
  const [currentWhatYouGet, setCurrentWhatYouGet] = useState({
    title: "",
    description: "",
    updateIndex: null,
  });
  const [currentWhoIsThisFor, setCurrentWhoIsThisFor] = useState({
    text: "",
    updateIndex: null,
  });

  const handleInputChange = (section, type, value) => {
    setError(null);
    if (section === "whatYouGet") {
      setCurrentWhatYouGet({ ...currentWhatYouGet, [type]: value });
    } else if (section === "whoIsThisFor") {
      setCurrentWhoIsThisFor({ ...currentWhoIsThisFor, text: value });
    }
  };

  const addNewItem = (section) => {
    if (
      section === "whatYouGet" &&
      currentWhatYouGet.title &&
      currentWhatYouGet.description
    ) {
      const newItems = [...courseData.whatYouGet];
      if (currentWhatYouGet.updateIndex === null) {
        newItems.push({ ...currentWhatYouGet, updateIndex: newItems.length });
      } else {
        newItems[currentWhatYouGet.updateIndex] = { ...currentWhatYouGet };
      }
      setCourseData({ ...courseData, whatYouGet: newItems });
      setCurrentWhatYouGet({ title: "", description: "", updateIndex: null });
    } else if (section === "whoIsThisFor" && currentWhoIsThisFor.text) {
      const newItems = [...courseData.whoIsThisFor];
      if (currentWhoIsThisFor.updateIndex === null) {
        newItems.push({ ...currentWhoIsThisFor, updateIndex: newItems.length });
      } else {
        newItems[currentWhoIsThisFor.updateIndex] = { ...currentWhoIsThisFor };
      }
      setCourseData({ ...courseData, whoIsThisFor: newItems });
      setCurrentWhoIsThisFor({ text: "", updateIndex: null });
    }
  };

  const removeItem = (section, index) => {
    const newItems = [...courseData[section]];
    newItems.splice(index, 1);
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      updateIndex: idx,
    }));
    setCourseData({ ...courseData, [section]: updatedItems });
  };

  const setEditValues1 = (section, item, index) => {
    if (section === "whatYouGet") {
      setCurrentWhatYouGet({ ...item, updateIndex: index });
    } else if (section === "whoIsThisFor") {
      setCurrentWhoIsThisFor({ ...item, updateIndex: index });
    }
  };

  const { courseId } = useParams();
  const [courseContentDetailsData, setCourseContentDetailsData] = useState({});
  const [fetchError, setFetchError] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(false); // New state for thumbnail upload loading
  const [error, setError] = useState(null);
  const [popupOpen, setPopupOpen] = useState({ open: false, data: null });
  const [currentOverview, setCurrentOverview] = useState({
    heading: "",
    content: "",
    updateIndex: null,
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null); // New state for image preview

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    price: "",
    thumbnail: null,
    overviewPoints: [],
    lessons: [],
    whatYouGet: [],
    whoIsThisFor: [],
  });

  useEffect(() => {
    if (popupOpen.open) window.scrollTo(0, 0);
  }, [popupOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetCourseById(courseId);
        setCourseContentDetailsData(response.data);
        // Populate courseData for editing
        setCourseData({
          title: response.data.title || "",
          description: response.data.description || "",
          price: response.data.price || "",
          thumbnail: response.data.thumbnail || null,
          lessons: response.data.lessons || [],
          whatYouGet: response.data.whatYouGet || [],
          whoIsThisFor: response.data.whoIsThisFor || [],
          overviewPoints: response.data.overviewPoints || [],
        });
        setThumbnailPreview(response.data.thumbnail || null); // Set initial preview
        setIsLoading(false);
        setFetchError(false);
      } catch (err) {
        console.error("Error fetching course details:", err);
        setIsLoading(false);
        setFetchError(true);
      }
    };

    if (courseId) fetchData();
  }, [courseId]);

  const validateCourse = () => {
    if (!courseData.title.trim()) return "Course title is required";
    if (!courseData.description.trim()) return "Course description is required";
    const numericPrice = parseFloat(courseData.price);
    if (isNaN(numericPrice) || numericPrice <= 0)
      return "Valid price is required";
    if (courseData.lessons.length === 0)
      return "At least one lesson is required";
    if (!courseData.thumbnail) return "Course thumbnail is required";
    return null;
  };

  const handledirectInput = (type, value) => {
    setError(null);
    setCourseData({
      ...courseData,
      [type]: type === "price" ? parseFloat(value) || "" : value,
    });
  };

  const handleOverviewInput = (type, value) => {
    setError(null);
    setCurrentOverview({ ...currentOverview, [type]: value });
  };

  const addNewOverview = () => {
    if (currentOverview.heading && currentOverview.content) {
      const newOverview = [...courseData.overviewPoints];
      if (currentOverview.updateIndex === null) {
        newOverview.push({
          heading: currentOverview.heading,
          content: currentOverview.content,
          updateIndex: newOverview.length,
        });
      } else {
        newOverview[currentOverview.updateIndex] = {
          heading: currentOverview.heading,
          content: currentOverview.content,
          updateIndex: currentOverview.updateIndex,
        };
      }
      setCourseData({ ...courseData, overviewPoints: newOverview });
      setCurrentOverview({
        heading: "",
        content: "",
        updateIndex: null,
      });
    }
  };

  const handleRemoveOverview = (index) => {
    const newOverviews = [...courseData.overviewPoints];
    newOverviews.splice(index, 1);
    const updatedOverviews = newOverviews.map((overview, idx) => ({
      ...overview,
      updateIndex: idx,
    }));
    setCourseData({ ...courseData, overviewPoints: updatedOverviews });
  };

  const setEditValues = (overview, index) => {
    setCurrentOverview({
      heading: overview.heading,
      content: overview.content,
      updateIndex: index,
    });
  };

  const addLessontoCourse = (lesson) => {
    const newLessons = [...courseData.lessons];
    if (lesson.updateIndex === null) {
      newLessons.push({
        ...lesson,
        updateIndex: newLessons.length,
      });
    } else {
      newLessons[lesson.updateIndex] = lesson;
    }
    setCourseData({ ...courseData, lessons: newLessons });
    setPopupOpen({ open: false, data: null });
  };

  const removeLessonFromCourse = (lesson) => {
    const newLessons = [...courseData.lessons];
    newLessons.splice(lesson.updateIndex, 1);
    const updatedLessons = newLessons.map((lesson, idx) => ({
      ...lesson,
      updateIndex: idx,
    }));
    setCourseData({ ...courseData, lessons: updatedLessons });
    setPopupOpen({ open: false, data: null });
  };

  const HandleThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (e.g., JPG, PNG).");
      return;
    }

    // Set preview immediately
    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
    setThumbnailLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await UploadFile(formData);
      if (res?.data?.fileUrl) {
        setCourseData({ ...courseData, thumbnail: res.data.fileUrl });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      setError("Failed to upload thumbnail. Please try again.");
      setThumbnailPreview(null); // Reset preview on failure
      setCourseData({ ...courseData, thumbnail: null });
      console.error("Thumbnail upload failed:", error);
    } finally {
      setThumbnailLoading(false);
      URL.revokeObjectURL(previewUrl); // Clean up preview URL
    }
  };

  const uploadCourse = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const validationError = validateCourse();
      if (validationError) {
        setError(validationError);
        return;
      }

      const response = await AddNewCourseApi(courseData);

      if (response.data?.newCourse) {
        navigate("/admin");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      setError(
        error.response?.data?.details ||
          error.response?.data?.message ||
          error.message ||
          "Failed to create course. Please try again."
      );
      console.error("Error creating course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold">Create New Course</h3>
          <p className="text-gray-600">Create new course and let's publish</p>
        </div>

        {error && <div className="text-red-500 my-2">{error}</div>}

        <div className="flex space-x-4">
          <div
            className="bg-red-100 text-red-700 px-4 py-2 rounded cursor-pointer"
            onClick={() => navigate("/admin/courses")}
          >
            Cancel
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={uploadCourse}
            disabled={isLoading || thumbnailLoading}
          >
            {isLoading ? "Saving..." : "Save Course"}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Form */}
        <form className="w-full md:w-2/3 space-y-6">
          {/* Title */}
          <div>
            <p className="mb-1">Enter course Name</p>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-4 py-2"
              value={courseData.title}
              onChange={(e) => handledirectInput("title", e.target.value)}
              placeholder="Course Title"
            />
          </div>

          {/* Description */}
          <div>
            <p className="mb-1">Describe course</p>
            <textarea
              className="w-full border border-gray-300 rounded px-4 py-2"
              value={courseData.description}
              onChange={(e) => handledirectInput("description", e.target.value)}
              placeholder="Course Description"
            />
          </div>

          {/* Price & Thumbnail */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="mb-1">Enter course price</p>
              <input
                type="number"
                className="w-full border border-gray-300 rounded px-4 py-2"
                value={courseData.price || ""}
                placeholder="₹"
                onChange={(e) => handledirectInput("price", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <p className="mb-1">Upload course thumbnail</p>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={HandleThumbnail}
                  className="w-full border border-gray-300 rounded px-4 py-2 file:bg-green-600 file:text-white file:border-none file:px-4 file:py-2 file:rounded"
                  disabled={thumbnailLoading}
                />
                {thumbnailLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded">
                    <svg
                      className="animate-spin h-5 w-5 text-green-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}
              </div>
              {/* Thumbnail Preview */}
              {thumbnailPreview && (
                <div className="mt-4">
                  <p className="mb-1 text-sm text-gray-600">Thumbnail Preview</p>
                  <div className="relative w-40 h-40 rounded-md overflow-hidden">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                    {thumbnailLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                        <svg
                          className="animate-spin h-5 w-5 text-green-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Right Side Lesson Form */}
        <form className="w-full md:w-1/2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">List The Lessons</h3>
            <div
              className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer"
              onClick={() => setPopupOpen({ open: true, data: null })}
            >
              Add new lesson
            </div>
          </div>

          <div className="space-y-4 overflow-auto">
            {courseData.lessons.length > 0 ? (
              courseData.lessons.map((lesson, index) => (
                <div
                  key={index}
                  className="border p-4 rounded cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    setPopupOpen({
                      open: true,
                      data: { ...lesson, updateIndex: index },
                    })
                  }
                >
                  <h1 className="text-lg font-semibold">Lesson {index + 1}</h1>
                  <h3 className="text-md font-medium">{lesson.title}</h3>
                  <ul className="list-disc pl-5 mt-2 overflow-auto h-[500px]">
                    {lesson.sublessons?.map((sublesson, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        {sublesson.title} —{" "}
                        <span className="italic">
                          duration: {sublesson.duration}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="flex justify-center">
                <img
                  src={NoLesson}
                  alt="no-lesson"
                  className="inset-0 object-fill"
                />
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Pop-up component rendering if needed */}
      {popupOpen.open && (
        <NewLesson
          addLesson={addLessontoCourse}
          editData={popupOpen.data}
          cancel={() => setPopupOpen({ open: false, data: null })}
          removeThisLesson={removeLessonFromCourse}
        />
      )}
    </div>
  );
};

export default AddNewCourse;
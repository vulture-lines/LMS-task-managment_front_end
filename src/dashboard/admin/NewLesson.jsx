import { ArrowLeft, BookOpen, Clipboard, Edit, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { findFileType } from "../../hook/CourseFunction";
import { UploadFileWithType } from "../../service/api";
import AddTest from "./AddTest";

const NewLesson = ({ addLesson, cancel, editData, removeThisLesson }) => {
  const [openTest, setOpenTest] = useState({ open: false, data: null });
  const [errors, setErrors] = useState({});
  const [uploadingFile, setUploadingFile] = useState(false);

  const [currentLesson, setCurrentLesson] = useState({
    title: "",
    sublessons: [],
    updateIndex: null,
  });

  const [currentSublesson, setCurrentSublesson] = useState({
    title: "",
    duration: "",
    updateIndex: null,
    test: null,
    file: {
      url: "",
      type: "",
    },
  });

  const [sublessonFile, setSublessonFile] = useState(null);

  useEffect(() => {
    if (editData) {
      const sanitizedSublessons = editData.sublessons.map((sublesson) => ({
        ...sublesson,
        file: sublesson.file || { url: "", type: "" },
      }));
      setCurrentLesson({ ...editData, sublessons: sanitizedSublessons });
    }
  }, [editData]);

  const handleAddFile = (file) => {
    if (!file) return;
    const filetype = findFileType(file);
    setSublessonFile(file);
    setCurrentSublesson({ ...currentSublesson, file: { url: "", type: filetype } });
    setErrors((prev) => ({ ...prev, file: null }));
  };

  const handleSubLessonsInput = (type, value) => {
    setCurrentSublesson({ ...currentSublesson, [type]: value });
    setErrors((prev) => ({ ...prev, [type]: null }));
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await UploadFileWithType(formData);
      if (res.error) throw new Error(res.error);
      return res.data;
    } catch (error) {
      throw new Error(`Failed to upload: ${error.message}`);
    }
  };

  const addSublessons = async () => {
    try {
      setUploadingFile(true);
      setErrors({});

      if (!currentSublesson.title) {
        setErrors((prev) => ({ ...prev, title: "Title is required" }));
        return;
      }
      if (!currentSublesson.duration) {
        setErrors((prev) => ({ ...prev, duration: "Duration is required" }));
        return;
      }
      if (!sublessonFile && !currentSublesson.file.url) {
        setErrors((prev) => ({ ...prev, file: "File is required" }));
        return;
      }

      const newLessons = [...currentLesson.sublessons];

      if (sublessonFile) {
        const link = await uploadFile(sublessonFile);
        const sublessonData = {
          ...currentSublesson,
          file: {
            url: link.fileUrl,
            type: link.fileType,
          },
        };

        if (currentSublesson.updateIndex === null) {
          newLessons.push(sublessonData);
        } else {
          newLessons[currentSublesson.updateIndex] = sublessonData;
        }
      } else {
        newLessons[currentSublesson.updateIndex] = {
          ...currentSublesson,
          file: currentSublesson.file || { url: "", type: "" },
        };
      }

      setCurrentLesson({ ...currentLesson, sublessons: newLessons });
      setSublessonFile(null);
      setCurrentSublesson({
        title: "",
        duration: "",
        updateIndex: null,
        file: { url: "", type: "" },
        test: null,
      });
    } catch (error) {
      setErrors((prev) => ({ ...prev, file: error.message }));
    } finally {
      setUploadingFile(false);
    }
  };

  const validateAndUpdateLesson = () => {
    setErrors({});
    if (!currentLesson.title) {
      setErrors((prev) => ({ ...prev, lessonTitle: "Lesson title is required" }));
      return;
    }
    if (currentLesson.sublessons.length === 0) {
      setErrors((prev) => ({ ...prev, sublessons: "At least one sublesson is required" }));
      return;
    }
    addLesson(currentLesson);
  };

  const setEditSublesson = (chapter, index) => {
    setCurrentSublesson({ ...chapter, updateIndex: index });
    setSublessonFile(null);
  };

  const handleRemoveSublesson = (index) => {
    const newsubLessons = [...currentLesson.sublessons];
    newsubLessons.splice(index, 1);
    setCurrentLesson({ ...currentLesson, sublessons: newsubLessons });
  };

  const handleDelete = () => {
    const confirm = window.confirm(
      "Confirm to delete this lesson, all sublessons will be deleted"
    );
    if (confirm && editData) {
      removeThisLesson(editData);
      cancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-6">
      <div className="bg-white max-w-4xl w-full rounded-lg shadow-lg p-6 flex flex-col overflow-y-auto max-h-screen">
        {openTest.open && (
          <AddTest
            testId={currentSublesson?.test}
            addTest={(data) =>
              setCurrentSublesson({ ...currentSublesson, test: data })
            }
            closeTest={() => setOpenTest({ open: false })}
          />
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div onClick={cancel} className="cursor-pointer">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-800" />
          </div>
          <div className="flex gap-3">
            {editData && (
              <button
                className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center gap-2"
                onClick={handleDelete}
              >
                <Trash className="w-5 h-5" />
                Delete Lesson
              </button>
            )}
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              onClick={validateAndUpdateLesson}
            >
              {editData?.updateIndex != null ? "Update Course" : "Add to Course"}
            </button>
          </div>
        </div>

        {/* Lesson Title Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-green-600" />
            <h3 className="text-xl font-bold">Create New Lesson</h3>
          </div>
          <div>
            <label htmlFor="lesson-title" className="mb-1 block text-sm font-medium">
              Lesson Title
            </label>
            <input
              id="lesson-title"
              type="text"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-green-500"
              value={currentLesson.title || ""}
              onChange={(e) =>
                setCurrentLesson({ ...currentLesson, title: e.target.value })
              }
              placeholder="Enter lesson title"
              aria-invalid={!!errors.lessonTitle}
              aria-describedby={errors.lessonTitle ? "lesson-title-error" : undefined}
            />
            {errors.lessonTitle && (
              <p id="lesson-title-error" className="text-red-500 text-sm mt-1">
                {errors.lessonTitle}
              </p>
            )}
          </div>
          <button
            className="mt-3 flex items-center gap-2 bg-gray-100 p-3 rounded hover:bg-gray-200 w-full text-left"
            onClick={() => setOpenTest({ open: true, data: currentLesson.test })}
          >
            <Clipboard className="w-5 h-5 text-gray-600" />
            <p className="text-sm text-gray-700">
              {currentLesson.test ? "Test - click to update" : "No tests have been created for this lesson"}
            </p>
          </button>
        </div>

        {/* Sublesson Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="sublesson-title" className="mb-1 block text-sm font-medium">
              Sublesson Title
            </label>
            <input
              id="sublesson-title"
              type="text"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-green-500"
              value={currentSublesson.title}
              onChange={(e) => handleSubLessonsInput("title", e.target.value)}
              placeholder="Enter sublesson title"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "sublesson-title-error" : undefined}
            />
            {errors.title && (
              <p id="sublesson-title-error" className="text-red-500 text-sm mt-1">
                {errors.title}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="sublesson-duration" className="mb-1 block text-sm font-medium">
              Duration
            </label>
            <input
              id="sublesson-duration"
              type="text"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-green-500"
              value={currentSublesson.duration}
              onChange={(e) => handleSubLessonsInput("duration", e.target.value)}
              placeholder="e.g., 10 min"
              aria-invalid={!!errors.duration}
              aria-describedby={errors.duration ? "sublesson-duration-error" : undefined}
            />
            {errors.duration && (
              <p id="sublesson-duration-error" className="text-red-500 text-sm mt-1">
                {errors.duration}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="sublesson-file" className="mb-1 block text-sm font-medium">
              Upload Media
            </label>
            <div className="relative w-full border border-dashed border-gray-400 p-3 rounded bg-gray-50">
              <p className="text-sm text-gray-600 truncate">
                {sublessonFile?.name || currentSublesson.file.url || "Upload video, audio, PDF, or PowerPoint"}
              </p>
              <input
                id="sublesson-file"
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="video/*,audio/*,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={(e) => handleAddFile(e.target.files[0])}
                disabled={uploadingFile}
                aria-describedby={errors.file ? "sublesson-file-error" : undefined}
              />
              {uploadingFile && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded">
                  <svg
                    className="animate-spin h-5 w-5 text-green-600"
                    xmlns="http://www.w3/2000/svg"
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
            {errors.file && (
              <p id="sublesson-file-error" className="text-red-500 text-sm mt-1">
                {errors.file}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <button
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              onClick={addSublessons}
              disabled={uploadingFile}
            >
              {uploadingFile ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3/2000/svg"
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
                  Uploading...
                </>
              ) : (
                "Add Sublesson"
              )}
            </button>
          </div>
        </div>

        {/* Sublessons List */}
        <div className="mb-6">
          {errors.sublessons && (
            <p className="text-red-500 text-sm mb-2">{errors.sublessons}</p>
          )}
          {currentLesson.sublessons.length > 0 ? (
            currentLesson.sublessons.map((sublesson, index) => (
              <div
                key={index}
                className={`border rounded p-4 mb-4 ${
                  currentSublesson.updateIndex === index ? "bg-gray-100" : ""
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Sublesson Title</p>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-4 py-2 mt-1 bg-gray-50"
                      value={sublesson.title}
                      readOnly
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-4 py-2 mt-1 bg-gray-50"
                      value={sublesson.duration}
                      readOnly
                    />
                  </div>
                  <div className="col-span-2 mt-2">
                    <p className="text-sm font-medium">Media</p>
                    {sublesson.file && sublesson.file.url ? (
                      <a
                        href={sublesson.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        Open {sublesson.file.type}
                      </a>
                    ) : (
                      <p className="text-gray-500">No file uploaded</p>
                    )}
                  </div>
                  <div className="col-span-2 mt-2">
                    <p className="text-sm font-medium">Test</p>
                    {sublesson.test ? (
                      <p className="text-blue-600">
                        Test: {sublesson.test.title || "Test Added"}
                      </p>
                    ) : (
                      <p className="text-gray-500">No test added</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleRemoveSublesson(index)}
                    className="p-1 text-red-600 hover:text-red-800"
                    aria-label="Delete sublesson"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEditSublesson(sublesson, index)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    aria-label="Edit sublesson"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No sublessons added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewLesson;
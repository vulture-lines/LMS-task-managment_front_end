import React, { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  BookCheck,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useParams } from "react-router";
import {
  GetCourseProgress,
  CourseProgressPost,
  GetCourseById,
  SubmitAnswers,
} from "../../service/api";

const UserInfo = JSON.parse(localStorage.getItem("loginData"));

function CourseContent() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentContent, setCurrentContent] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentSubLessonIndex, setCurrentSubLessonIndex] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isPdfMaximized, setIsPdfMaximized] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [marks, setMarks] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        if (!id) {
          throw new Error("Course ID is required");
        }

        // Check for authentication
        if (!UserInfo?.token) {
          throw new Error("Please log in to access this course");
        }

        const courseData = await GetCourseById(id);
        if (!courseData) {
          throw new Error("Course not found");
        }

        // Normalize course data
        const normalizedData = {
          _id: courseData._id,
          title: courseData.title || "Untitled Course",
          thumbnail: courseData.thumbnail || "",
          description: courseData.description || "",
          lessons: courseData.lessons?.map((lesson) => ({
            title: lesson.title || "Untitled Lesson",
            sublessons: lesson.sublessons?.map((sub) => ({
              title: sub.title || "Untitled Sublesson",
              file: sub.file
                ? {
                    url: sub.file.url,
                    type: sub.file.type.includes("pdf")
                      ? "pdf"
                      : sub.file.type.includes("video")
                      ? "video"
                      : sub.file.type.includes("audio")
                      ? "audio"
                      : sub.file.type,
                  }
                : undefined,
              test: sub.test
                ? { questions: sub.test.questions || [] }
                : { questions: [] },
            })) || [],
          })) || [],
        };

        setCourse(normalizedData);
        if (normalizedData?.lessons?.[0]?.sublessons?.[0]) {
          handleContentSelect(normalizedData.lessons[0].sublessons[0], 0, 0);
        } else {
          setError("No content available for this course");
        }
      } catch (err) {
        setError(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  useEffect(() => {
    const fetchCourseProgress = async () => {
      try {
        const res = await GetCourseProgress({
          userId: UserInfo.user._id,
          courseId: id,
        });
        const completed = new Set();
        const progressData = res.progress;
        progressData.completedLessons.forEach((lesson) => {
          lesson.sublessons?.forEach((subLesson) => {
            if (subLesson.isCompleted) {
              completed.add(
                `${lesson.lessonIndex}-${subLesson.sublessonIndex}`
              );
            }
          });
        });
        setCompletedExercises(completed);
      } catch (error) {
        console.error("Failed to fetch course progress:", error);
      }
    };
    if (UserInfo?.user?._id && id) {
      fetchCourseProgress();
    }
  }, [id]);

  const handleContentSelect = (content, lessonIndex, subLessonIndex) => {
    if (!content) return;
    const contentData = {
      ...content,
      lessonNo: lessonIndex + 1,
      exerciseNo: subLessonIndex + 1,
      type: content.test?.questions?.length > 0 ? "test" : content.file?.type || "unknown",
    };
    setCurrentContent(contentData);
    setCurrentLessonIndex(lessonIndex);
    setCurrentSubLessonIndex(subLessonIndex);
    setActiveAccordion(lessonIndex);
    setAnswers({});
    setSubmitted(false);
    setIsPdfMaximized(false);
    setCurrentQuestionIndex(0);
    setMarks(0);
  };

  const handleAnswerChange = (questionIndex, option) => {
    if (!submitted) {
      setAnswers((prev) => ({ ...prev, [questionIndex]: option }));
      // Automatically move to next question or stay on last
      if (questionIndex < currentContent.test.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentContent.test.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleTestSubmit = async () => {
    setSubmitted(true);
    let calculatedMarks = 0;
    const answerPayload = currentContent.test.questions.map((q, i) => {
      const isCorrect = answers[i] === q.answer;
      if (isCorrect) {
        calculatedMarks += 1; // 1 mark per correct answer
      }
      return {
        question: q.question,
        selected: answers[i] || "",
        correct: q.answer,
      };
    });
    setMarks(calculatedMarks);

    // Submit answers to the API
    try {
      await SubmitAnswers({
        courseId: course._id,
        sublessonIndex: currentSubLessonIndex,
        payload: {
          answers: answerPayload,
          sublessonTitle: currentContent.title,
        },
      });
    } catch (error) {
      console.error("Failed to submit answers to API:", error);
    }

    // Store test result in localStorage
    const testResult = {
      courseId: course._id,
      courseTitle: course.title,
      sublessonTitle: currentContent.title,
      marks: calculatedMarks,
      totalMarks: currentContent.test.questions.length,
      timestamp: new Date().toISOString(),
    };

    const existingResults = JSON.parse(localStorage.getItem("testResults") || "[]");
    existingResults.push(testResult);
    localStorage.setItem("testResults", JSON.stringify(existingResults));

    // Mark as completed if all answers are correct
    if (calculatedMarks === currentContent.test.questions.length) {
      await markAsCompleted();
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.error("Video play error:", err);
      });
    }
  };

  const togglePdfMaximize = () => {
    setIsPdfMaximized((prev) => !prev);
  };

  const renderContent = () => {
    if (!currentContent) {
      return (
        <div className="flex items-center justify-center h-full">
          <p>Select a lesson to begin</p>
        </div>
      );
    }

    if (currentContent.type === "test") {
      if (!currentContent.test.questions?.length) {
        return (
          <div className="flex items-center justify-center h-full">
            <p>No test questions available</p>
          </div>
        );
      }

      const currentQuestion = currentContent.test.questions[currentQuestionIndex];
      const isFirstQuestion = currentQuestionIndex === 0;
      const isLastQuestion = currentQuestionIndex === currentContent.test.questions.length - 1;
      const totalQuestions = currentContent.test.questions.length;

      return (
        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-6">{currentContent.title}</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">
                Question {currentQuestionIndex + 1} of {totalQuestions}:{" "}
                {currentQuestion.question}
              </h3>
              <ul className="space-y-2">
                {currentQuestion.options?.map((opt, j) => (
                  <li key={j} className="flex items-center">
                    <input
                      type="radio"
                      id={`q${currentQuestionIndex}-opt${j}`}
                      name={`question-${currentQuestionIndex}`}
                      className="mr-2"
                      checked={answers[currentQuestionIndex] === opt}
                      onChange={() => handleAnswerChange(currentQuestionIndex, opt)}
                      disabled={submitted}
                    />
                    <label
                      htmlFor={`q${currentQuestionIndex}-opt${j}`}
                      className={`flex-1 ${
                        submitted
                          ? opt === answers[currentQuestionIndex] &&
                            answers[currentQuestionIndex] === currentQuestion.answer
                            ? "text-green-600 font-semibold"
                            : answers[currentQuestionIndex] === opt
                            ? "text-red-600"
                            : ""
                          : ""
                      }`}
                    >
                      {opt}
                    </label>
                    {submitted &&
                      opt === answers[currentQuestionIndex] &&
                      answers[currentQuestionIndex] === currentQuestion.answer && (
                        <span className="ml-2 text-green-600">✓ Correct</span>
                      )}
                    {submitted &&
                      answers[currentQuestionIndex] === opt &&
                      answers[currentQuestionIndex] !== currentQuestion.answer && (
                        <span className="ml-2 text-red-600">✗ Incorrect</span>
                      )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            {!isFirstQuestion && !submitted && (
              <button
                onClick={handlePreviousQuestion}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Previous
              </button>
            )}
            {!isLastQuestion && !submitted && (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            )}
            {isLastQuestion && !submitted && (
              <button
                onClick={handleTestSubmit}
                disabled={Object.keys(answers).length !== totalQuestions}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                Submit Test
              </button>
            )}
            {submitted && (
              <div className="text-lg font-semibold">
                Marks: {marks} / {totalQuestions}
              </div>
            )}
            {submitted && (
              <button
                onClick={() => {
                  setSubmitted(false);
                  setAnswers({});
                  setCurrentQuestionIndex(0);
                  setMarks(0);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      );
    }

    if (currentContent.type === "video") {
      if (!currentContent.file?.url) {
        return (
          <div className="flex items-center justify-center h-full">
            <p>Video content unavailable</p>
          </div>
        );
      }
      return (
        <div className="w-full h-full relative flex flex-col">
          <video
            ref={videoRef}
            controls
            className="w-full h-full rounded-md"
            onClick={handleVideoClick}
            onEnded={() => markAsCompleted()}
          >
            <source src={currentContent.file.url} type="video/mp4" />
            Your browser doesn't support videos
          </video>
          {videoRef.current?.readyState < 2 && videoRef.current?.networkState === 2 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <p className="text-white">Loading video...</p>
            </div>
          )}
        </div>
      );
    }

    if (currentContent.type === "audio") {
      if (!currentContent.file?.url) {
        return (
          <div className="flex items-center justify-center h-full">
            <p>Audio content unavailable</p>
          </div>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center h-full relative">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover rounded-md"
          />
          <audio
            controls
            className="w-full absolute bottom-0 bg-white p-2"
            onEnded={() => markAsCompleted()}
          >
            <source src={currentContent.file.url} type="audio/mpeg" />
            Your browser doesn't support audio
          </audio>
        </div>
      );
    }

    if (currentContent.type === "pdf") {
      if (!currentContent.file?.url) {
        return (
          <div className="flex items-center justify-center h-full">
            <p>PDF content unavailable</p>
          </div>
        );
      }
      return (
        <div
          className={`flex flex-col ${
            isPdfMaximized ? "fixed inset-0 z-50 bg-white" : "h-full"
          }`}
        >
          <div className="flex justify-between items-center p-2">
            <button
              onClick={() => markAsCompleted()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Mark as Complete
            </button>
            <button
              onClick={togglePdfMaximize}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              {isPdfMaximized ? (
                <>
                  <Minimize2 className="h-5 w-5" /> Minimize
                </>
              ) : (
                <>
                  <Maximize2 className="h-5 w-5" /> Maximize
                </>
              )}
            </button>
          </div>
          <iframe
            src={`${currentContent.file.url}#toolbar=0`}
            title="PDF Viewer"
            className={`w-full ${
              isPdfMaximized ? "h-[calc(100vh-4rem)]" : "h-full"
            } rounded-md`}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <p>Unsupported content type: {currentContent.type}</p>
      </div>
    );
  };

  const markAsCompleted = async () => {
    const exerciseKey = `${currentLessonIndex}-${currentSubLessonIndex}`;
    setCompletedExercises((prev) => new Set([...prev, exerciseKey]));
    const payload = {
      lessonIndex: currentLessonIndex,
      sublessonIndex: currentSubLessonIndex,
    };
    try {
      await CourseProgressPost({
        userId: UserInfo.user._id,
        courseId: id,
        payload: payload,
      });
    } catch (error) {
      console.error("Failed to update course progress:", error);
    }
  };

  const calculateProgress = () => {
    if (!course?.lessons) return 0;
    const totalExercises = course.lessons.reduce(
      (total, lesson) => total + (lesson.sublessons?.length || 0),
      0
    );
    return totalExercises > 0
      ? Math.round((completedExercises.size / totalExercises) * 100)
      : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading course content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          onClick={() => (window.location.href = "/student/course")}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Go to Course List
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No course data available</p>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] bg-gray-200 gap-4 p-2 sm:p-4 lg:grid lg:grid-cols-4 lg:gap-6 lg:p-6">
      <div className="flex flex-col gap-4 lg:col-span-1 lg:h-full">
        <div className="p-4 bg-white shadow-sm rounded-lg flex flex-col gap-2">
          <button
            className="flex items-center gap-2 text-green-800 font-semibold text-sm mb-2"
            onClick={() => (window.location.href = "/student/course")}
          >
            <ArrowLeft className="h-4 w-4" />
            Courses
          </button>
          <div className="h-40 sm:h-30 lg:h-48">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="bg-green-50 object-cover object-center w-full h-full rounded-md shadow-sm"
            />
          </div>
          <h2 className="text-sm sm:text-base lg:text-lg font-semibold">{course.title}</h2>
          <div className="flex flex-col gap-2 items-end w-full">
            <p className="text-xs lg:text-sm">{progress}% Completed</p>
            <div className="h-3 bg-green-300 relative w-full rounded-full overflow-hidden">
              <div
                className="absolute bg-green-700 left-0 h-full transition-transform duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-sm rounded-lg flex flex-col flex-1 overflow-hidden">
          <h3 className="text-sm sm:text-base lg:text-lg uppercase font-semibold p-4">
            Contents
          </h3>
          <div className="overflow-y-auto max-h-[50vh] sm:max-h-[60vh] lg:max-h-[calc(100vh-20rem)] flex-1">
            {course.lessons?.map((lesson, lessonIndex) => {
              const isLessonCompleted = lesson.sublessons?.every(
                (_, subLessonIndex) =>
                  completedExercises.has(`${lessonIndex}-${subLessonIndex}`)
              );
              return (
                <div key={lessonIndex} className="shadow-sm rounded mb-2 bg-white mx-2">
                  <button
                    onClick={() =>
                      setActiveAccordion(
                        activeAccordion === lessonIndex ? null : lessonIndex
                      )
                    }
                    className={`w-full flex justify-between items-center p-3 px-4 gap-2 text-left text-sm font-medium hover:bg-green-100 focus:outline-none ${
                      isLessonCompleted
                        ? "bg-green-200 text-green-800 border border-green-300"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm lg:text-base font-semibold leading-6">
                      {isLessonCompleted ? (
                        <BookCheck className="h-5 w-5" />
                      ) : (
                        <BookOpen className="h-5 w-5" />
                      )}
                      {lesson.title}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        activeAccordion === lessonIndex ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-max-height duration-300 text-sm font-medium leading-6 tracking-wider text-gray-700 ${
                      activeAccordion === lessonIndex ? "max-h-full" : "max-h-0"
                    }`}
                  >
                    {lesson.sublessons?.map((subLesson, subLessonIndex) => {
                      const isCompleted = completedExercises.has(
                        `${lessonIndex}-${subLessonIndex}`
                      );
                      return (
                        <button
                          key={subLessonIndex}
                          onClick={() =>
                            handleContentSelect(
                              subLesson,
                              lessonIndex,
                              subLessonIndex
                            )
                          }
                          className={`p-3 px-4 flex w-full text-xs sm:text-sm lg:text-base font-semibold items-center gap-2 hover:bg-green-200 ${
                            isCompleted ? "bg-green-100 text-green-800" : ""
                          } ${
                            currentLessonIndex === lessonIndex &&
                            currentSubLessonIndex === subLessonIndex
                              ? "bg-blue-100 text-blue-600"
                              : ""
                          }`}
                        >
                          {isCompleted ? (
                            <Check />
                          ) : subLesson.test?.questions?.length > 0 ? (
                            <BookCheck />
                          ) : (
                            <PlayCircle />
                          )}
                          {subLesson.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-white shadow-sm rounded-lg flex flex-col gap-4 h-auto lg:col-span-3 lg:h-full">
        <div className="flex justify-between items-center p-2 sm:p-4">
          <h2 className="text-sm sm:text-base lg:text-lg font-semibold">
            {currentContent?.title || course.title || "Course"}
            {currentContent && (
              <span className="text-gray-500 ml-2">
                {currentContent.lessonNo}.{currentContent.exerciseNo}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-green-500 hover:text-white rounded-full"
              onClick={handlePrevious}
              disabled={currentLessonIndex === 0 && currentSubLessonIndex === 0}
            >
              <ChevronLeft />
            </button>
            <button
              className="p-2 hover:bg-green-500 hover:text-white rounded-full"
              onClick={handleNext}
              disabled={isLastContent()}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
        <div className="w-full aspect-video rounded-md overflow-hidden bg-gray-100 relative lg:h-[calc(100%-4rem)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );

  function handlePrevious() {
    if (currentSubLessonIndex > 0) {
      const newIndex = currentSubLessonIndex - 1;
      handleContentSelect(
        course.lessons[currentLessonIndex].sublessons[newIndex],
        currentLessonIndex,
        newIndex
      );
    } else if (currentLessonIndex > 0) {
      const newLessonIndex = currentLessonIndex - 1;
      const prevLesson = course.lessons[newLessonIndex];
      const newSubIndex = prevLesson.sublessons.length - 1;
      handleContentSelect(
        prevLesson.sublessons[newSubIndex],
        newLessonIndex,
        newSubIndex
      );
    }
  }

  function handleNext() {
    const currentLesson = course.lessons[currentLessonIndex];
    if (currentSubLessonIndex < currentLesson.sublessons.length - 1) {
      const newIndex = currentSubLessonIndex + 1;
      handleContentSelect(
        currentLesson.sublessons[newIndex],
        currentLessonIndex,
        newIndex
      );
    } else if (currentLessonIndex < course.lessons.length - 1) {
      const newLessonIndex = currentLessonIndex + 1;
      handleContentSelect(
        course.lessons[newLessonIndex].sublessons[0],
        newLessonIndex,
        0
      );
    }
  }

  function isLastContent() {
    return (
      currentLessonIndex === course.lessons.length - 1 &&
      currentSubLessonIndex ===
        course.lessons[currentLessonIndex].sublessons.length - 1
    );
  }
}

export default CourseContent;
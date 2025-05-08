import React, { useEffect, useState } from "react";

const AddTest = ({ testId, closeTest, addTest }) => {
  const initialState = {
    question: "",
    correctAnswer: null,
    options: [],
    questionNumber: null,
    updateIndex: null,
  };

  const [currentTest, setCurrentTest] = useState({
    title: "testing Exam",
    timeLimit: 11,
    questions: [],
  });

  const [currentQuestion, setCurrentQuestion] = useState(initialState);
  const [dropDown, setDropDown] = useState(false);
  const [duration, setDuration] = useState({ hours: 0, minutes: 0 });

  useEffect(() => {
    if (testId) {
      setCurrentTest(testId);
    }
  }, [testId]);

  const handleChoiceSelect = (index, value) => {
    setDropDown(false);
    setCurrentQuestion({
      ...currentQuestion,
      correctAnswer: currentQuestion?.options[index],
    });
  };

  const handleChoiceInput = (index, value) => {
    const newChoices = [...currentQuestion.options];
    newChoices[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newChoices });
  };

  const handleNext = () => {
    const updatedtest = [...currentTest.questions];
    if (currentQuestion.updateIndex === null) {
      updatedtest?.push(currentQuestion);
      setCurrentTest({ ...currentTest, questions: updatedtest });
      setCurrentQuestion(initialState);
    } else if (
      currentQuestion.updateIndex + 1 ===
      currentTest?.questions?.length
    ) {
      updatedtest[currentQuestion.updateIndex] = currentQuestion;
      setCurrentTest({ ...currentTest, questions: updatedtest });
      setCurrentQuestion(initialState);
    } else {
      updatedtest[currentQuestion.updateIndex] = currentQuestion;
      setCurrentTest({ ...currentTest, questions: updatedtest });
      setCurrentQuestion(
        currentTest?.questions?.[currentQuestion.updateIndex + 1]
      );
    }
  };

  const checkquestionMatch = (index) => {
    if (
      currentQuestion?.updateIndex === index ||
      currentTest?.questions?.indexOf(currentQuestion) === index
    )
      return "#8949ff";
    return "transparent";
  };

  const questionValidation = () => {
    if (
      currentQuestion?.question?.length > 5 &&
      currentQuestion?.correctAnswer &&
      currentQuestion?.options?.length === 4
    )
      return true;
    return false;
  };

  const handleAddTest = async () => {
    if (testId?.length > 5) {
      try {
        addTest(currentTest);
        closeTest();
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        addTest(currentTest);
        closeTest();
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (duration?.hours !== 0 || duration?.minutes !== 0) {
      const totalSeconds = duration?.hours * 60 * 60 + duration?.minutes * 60;
      if (totalSeconds !== undefined) {
        setCurrentTest((currentTest) => {
          return { ...currentTest, timeLimit: totalSeconds };
        });
      }
    }
  }, [duration]);

  console.log(currentTest);

  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-y-auto bg-white z-10 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Lesson Title</p>
              <input
                type="text"
                value={currentTest?.title}
                className="mt-1 w-full md:w-96 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onChange={(e) =>
                  setCurrentTest({
                    ...currentTest,
                    title: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Set Duration</p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={duration?.hours}
                  onChange={(e) =>
                    setDuration({ ...duration, hours: e.target.value })
                  }
                  className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p>Hours</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={duration?.minutes}
                  onChange={(e) =>
                    setDuration({ ...duration, minutes: e.target.value })
                  }
                  className="w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p>Minutes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {currentTest?.questions?.map((test, index) => (
            <div
              key={index}
              className={`w-10 h-10 flex items-center justify-center border rounded cursor-pointer ${
                checkquestionMatch(index) !== "transparent"
                  ? "bg-purple-200"
                  : "bg-white"
              }`}
              onClick={() => setCurrentQuestion({ ...test, updateIndex: index })}
            >
              <p
                className={`font-medium ${
                  checkquestionMatch(index) === "transparent"
                    ? "text-purple-600"
                    : "text-gray-800"
                }`}
              >
                {index + 1}
              </p>
            </div>
          ))}
          <div
            className={`w-10 h-10 flex items-center justify-center border rounded cursor-pointer ${
              checkquestionMatch(null) !== "transparent"
                ? "bg-purple-200"
                : "bg-white"
            }`}
            onClick={() => setCurrentQuestion(initialState)}
          >
            <p
              className={`font-medium ${
                checkquestionMatch(null) === "transparent"
                  ? "text-purple-600"
                  : "text-gray-800"
              }`}
            >
              {currentTest?.questions?.length + 1}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-1">Question</p>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={currentQuestion?.question}
            onChange={(e) =>
              setCurrentQuestion({
                ...currentQuestion,
                question: e.target.value,
              })
            }
          />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">Choices</p>
            <div className="relative">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Select Answer
              </p>
              <div
                className="border border-gray-300 px-3 py-2 rounded cursor-pointer bg-white flex items-center justify-between"
                onClick={() => setDropDown(true)}
              >
                <span className={currentQuestion?.correctAnswer ? "text-gray-800" : "text-gray-400"}>
                  {currentQuestion?.correctAnswer || "Select correct answer"}
                </span>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform ${dropDown ? 'transform rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {dropDown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg py-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`px-4 py-2 hover:bg-purple-50 cursor-pointer transition-colors ${
                        currentQuestion?.correctAnswer === currentQuestion?.options[i] 
                          ? "bg-purple-100 text-purple-800" 
                          : "text-gray-700"
                      }`}
                      onClick={() => handleChoiceSelect(i, currentQuestion?.options[i])}
                    >
                      {currentQuestion?.options[i] || `Choice ${i + 1}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {[0, 1, 2, 3].map((index) => (
            <div className="mb-3" key={index}>
              <p className="text-sm text-gray-600 mb-1">Choice {index + 1}</p>
              <input
                type="text"
                placeholder={`Enter choice ${index + 1}`}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={currentQuestion?.options[index] || ""}
                onChange={(e) => handleChoiceInput(index, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-4 pb-6">
          <button
            className="bg-gray-400 hover:bg-gray-600 text-white px-5 py-2 rounded"
            onClick={() => closeTest()}
          >
            Cancel
          </button>
          <button
            className={`text-white px-5 py-2 rounded ${
              !questionValidation()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
            onClick={() => handleNext()}
            disabled={!questionValidation()}
          >
            Save and Next
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded"
            onClick={() => handleAddTest()}
          >
            Add to Lesson
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTest;
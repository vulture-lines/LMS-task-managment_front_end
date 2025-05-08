import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { getTodos, addTodo, toggleTodo, deleteTodo } from "../service/api";  // Import API methods

const TodoWidget = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  // Fetch todos with filters
  const fetchTodos = async () => {
    try {
      const params = {};
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterDate) params.date = filterDate;

      const todosData = await getTodos(params);
      setTodos(todosData);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
    }
  };
  useEffect(() => {
    fetchTodos();
  }, [filterStatus, filterDate]);
  
  
useEffect(() => {
  const fetchTodos = async () => {
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      console.error("Error loading todos:", err.response?.data || err.message);
    }
  };

  fetchTodos();
}, []);

  // Add new todo
  const handleAddTodo = async () => {
    if (input.trim() === "") return;
    try {
      const newTodo = await addTodo(input);
      setTodos([newTodo, ...todos]);
      setInput(""); // Clear input field
    } catch (err) {
      console.error("Failed to add todo:", err);
    }
  };

  // Toggle todo completion
  const handleToggleComplete = async (id) => {
    try {
      const updatedTodo = await toggleTodo(id);
      setTodos(todos.map((todo) => (todo._id === id ? updatedTodo : todo)));
    } catch (err) {
      console.error("Failed to toggle todo:", err);
    }
  };

  // Delete todo
  const handleDeleteTodo = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  };

  return (
    <div className="w-full max-w-[350px] bg-white rounded-xl shadow p-6 text-sm">
      <h2 className="text-base font-semibold mb-6 text-gray-800">To-Do List</h2>

      <div className="flex flex-row gap-4 mb-4">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none"
          placeholder="What needs to be done?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
        />
        <button
          onClick={handleAddTodo}
          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
        >
          <Plus />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6 justify-between">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-full px-3 py-2"
        >
          <option value="all">All Tasks</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
        </select>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border border-gray-300 rounded-full px-3 py-2"
        />
      </div>

      {todos.length === 0 ? (
        <p className="text-gray-500 text-center">No tasks match the filter.</p>
      ) : (
        <ul className=" max-h-80 overflow-y-auto pr-1">
          {todos.map((todo) => (
            <li
              key={todo._id}
              className={`flex justify-between items-center p-2 border-b border-neutral-400 ${
                todo.completed ? "bg-green-50" : "bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo._id)}
                  className="mt-1"
                />
                <div>
                  <p
                    className={`${
                      todo.completed
                        ? "line-through text-gray-400"
                        : "text-gray-800"
                    } font-medium text-base`}
                  >
                    {todo.text}
                  </p>
                  <span className="text-xs text-gray-500">
                  Date: {dayjs(todo.date).format("ddd MMM DD YYYY HH:mm:ss [GMT]Z (z)")}
                    {/* Date: {todo.date} */}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteTodo(todo._id)}
                className="text-red-500 hover:text-red-700 text-lg"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoWidget;

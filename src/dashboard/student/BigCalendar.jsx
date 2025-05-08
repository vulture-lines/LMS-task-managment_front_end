import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  CreateCalendarEvent,
  GetAllCalendarEvents,
  DeleteCalendarEventById,
} from "../../service/api";

const localizer = momentLocalizer(moment);
const colors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

function BigCalendar() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", start: "", end: "" });
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState(null);

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await GetAllCalendarEvents();
        const formattedEvents = response.map((event) => ({
          id: event._id,
          title: event.title,
          start: new Date(event.startDate),
          end: new Date(event.endDate),
          color: colors[Math.floor(Math.random() * colors.length)],
        }));
        setEvents(formattedEvents);
        setError(null);
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError("Authentication failed. Please log in again.");
          // Optionally redirect to login
          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        } else {
          setError(err.message || "Failed to load events. Please try again.");
        }
        console.error("Fetch events error:", err);
      }
    };
    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) {
      setError("Please fill all fields before adding an event.");
      return;
    }

    const startDate = new Date(newEvent.start);
    const endDate = new Date(newEvent.end);

    if (startDate >= endDate) {
      setError("End date must be after start date.");
      return;
    }

    try {
      const eventData = {
        title: newEvent.title,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      };

      const response = await CreateCalendarEvent(eventData);
      const newEventObj = {
        id: response.event._id,
        title: response.event.title,
        start: new Date(response.event.startDate),
        end: new Date(response.event.endDate),
        color: colors[Math.floor(Math.random() * colors.length)],
      };

      setEvents([...events, newEventObj]);
      setShowModal(false);
      setNewEvent({ title: "", start: "", end: "" });
      setError(null);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(err.message || "Failed to create event.");
      }
      console.error("Create event error:", err);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete || !eventToDelete.id) return;

    try {
      await DeleteCalendarEventById(eventToDelete.id);
      const updatedEvents = events.filter(
        (event) => event.id !== eventToDelete.id
      );
      setEvents(updatedEvents);
      setShowDeleteConfirmation(false);
      setEventToDelete(null);
      setError(null);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(err.message || "Failed to delete event.");
      }
      console.error("Delete event error:", err);
    }
  };

  const handleShowDeleteConfirmation = (event) => {
    setEventToDelete(event);
    setShowDeleteConfirmation(true);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleNavigate = (date) => {
    setCurrentDate(date);
  };

  const getDateRange = () => {
    let start, end;
    if (currentView === "month") {
      start = moment(currentDate).startOf("month");
      end = moment(currentDate).endOf("month");
    } else if (currentView === "week") {
      start = moment(currentDate).startOf("week");
      end = moment(currentDate).endOf("week");
    } else if (currentView === "day") {
      start = moment(currentDate);
      end = moment(currentDate);
    } else if (currentView === "agenda") {
      start = moment(currentDate);
      end = moment(currentDate).add(30, "days");
    }
    return `${start.format("DD/MM/YYYY")} – ${end.format("DD/MM/YYYY")}`;
  };

  return (
    <div className="react-big-calendar p-4 lg:p-8">
      <style>
        {`
          .rbc-toolbar {
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .rbc-toolbar button {
            padding: 6px 12px;
            margin: 0 4px;
            border-radius: 4px;
            border: 1px solid #ccc;
            background-color: #fff;
            cursor: pointer;
            font-size: 14px;
          }
          .rbc-toolbar button:hover {
            background-color: #f0f0f0;
          }
          .rbc-toolbar .rbc-btn-group button.rbc-active {
            background-color: #10B981;
            color: white;
            border-color: #10B981;
          }
          .rbc-toolbar button:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
          }
          .rbc-agenda-view table {
            width: 100%;
            border-collapse: collapse;
          }
          .rbc-agenda-view .rbc-agenda-table th,
          .rbc-agenda-view .rbc-agenda-table td {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: left;
          }
          .rbc-agenda-view .rbc-agenda-table th {
            background-color: #f4f4f4;
            font-weight: bold;
          }
        `}
      </style>
      <div className="main-calendar">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-semibold">Calendar</h5>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Add Event
          </button>
        </div>
        {error && (
          <div className="text-red-600 mb-4" role="alert">
            {error}
          </div>
        )}
        <div className="w-full h-full">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["month", "week", "day", "agenda"]}
            view={currentView}
            onView={handleViewChange}
            date={currentDate}
            onNavigate={handleNavigate}
            style={{ height: "77vh", width: "100%" }}
            onSelectEvent={handleShowDeleteConfirmation}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.color,
                borderRadius: "4px",
                color: "white",
                border: "none",
              },
            })}
            components={{
              toolbar: ({ onNavigate, onView, date }) => (
                <div className="rbc-toolbar">
                  <div className="rbc-btn-group">
                    <button onClick={() => onNavigate("TODAY")}>Today</button>
                    <button onClick={() => onNavigate("PREV")}>Back</button>
                    <button onClick={() => onNavigate("NEXT")}>Next</button>
                  </div>
                  <span className="rbc-toolbar-label">{getDateRange()}</span>
                  <div className="rbc-btn-group">
                    <button
                      className={currentView === "month" ? "rbc-active" : ""}
                      onClick={() => onView("month")}
                    >
                      Month
                    </button>
                    <button
                      className={currentView === "week" ? "rbc-active" : ""}
                      onClick={() => onView("week")}
                    >
                      Week
                    </button>
                    <button
                      className={currentView === "day" ? "rbc-active" : ""}
                      onClick={() => onView("day")}
                    >
                      Day
                    </button>
                    <button
                      className={currentView === "agenda" ? "rbc-active" : ""}
                      onClick={() => onView("agenda")}
                    >
                      Agenda
                    </button>
                  </div>
                </div>
              ),
            }}
          />
        </div>

        {/* Add Event Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-event-title"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 id="add-event-title" className="text-lg font-semibold mb-4">
                Add Event
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newEvent.start}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, start: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={newEvent.end}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, end: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                  onClick={() => {
                    setShowModal(false);
                    setNewEvent({ title: "", start: "", end: "" });
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  onClick={handleAddEvent}
                >
                  Save Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-event-title"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h2
                id="delete-event-title"
                className="text-lg font-semibold mb-4"
              >
                Delete Event
              </h2>
              <p>Are you sure you want to delete this event?</p>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                  onClick={() => {
                    setShowDeleteConfirmation(false);
                    setEventToDelete(null);
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  onClick={handleDeleteEvent}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BigCalendar;
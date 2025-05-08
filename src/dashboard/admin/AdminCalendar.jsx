import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  CreateCalendarEvent,
  GetAllCalendarEvents,
  UpdateCalendarEventById,
  DeleteCalendarEventById,
} from "../../service/api";

const localizer = momentLocalizer(moment);
const colors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

function BigCalendar() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: "", start: "", end: "" });
  const [editEvent, setEditEvent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date()); // New state for current date

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await GetAllCalendarEvents();
        console.log("Fetched events:", response);
        const formattedEvents = response.map((event) => {
          const start = new Date(event.startDate);
          const end = new Date(event.endDate);
          console.log(`Event ${event._id}: start=${start}, end=${end}`);
          return {
            id: event._id,
            title: event.title,
            start,
            end,
            color: colors[Math.floor(Math.random() * colors.length)],
          };
        });
        setEvents(formattedEvents);
      } catch (err) {
        setError(err.message || "Failed to fetch events");
        console.error("Error fetching events:", err);
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
        startDate: moment(startDate).format("YYYY-MM-DD"),
        endDate: moment(endDate).format("YYYY-MM-DD"),
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
      setShowAddModal(false);
      setNewEvent({ title: "", start: "", end: "" });
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to create event");
    }
  };

  const handleEditEvent = async () => {
    if (!editEvent.title || !editEvent.start || !editEvent.end) {
      setError("Please fill all fields before updating the event.");
      return;
    }

    const startDate = new Date(editEvent.start);
    const endDate = new Date(editEvent.end);

    if (startDate >= endDate) {
      setError("End date must be after start date.");
      return;
    }

    try {
      const eventData = {
        title: editEvent.title,
        startDate: moment(startDate).format("YYYY-MM-DD"),
        endDate: moment(endDate).format("YYYY-MM-DD"),
      };
      const response = await UpdateCalendarEventById(editEvent.id, eventData);
      const updatedEvent = {
        id: response.event._id,
        title: response.event.title,
        start: new Date(response.event.startDate),
        end: new Date(response.event.endDate),
        color: events.find((e) => e.id === editEvent.id)?.color,
      };
      setEvents(
        events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
      );
      setShowEditModal(false);
      setEditEvent(null);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to update event");
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete || !eventToDelete.id) return;

    try {
      await DeleteCalendarEventById(eventToDelete.id);
      setEvents(events.filter((event) => event.id !== eventToDelete.id));
      setShowDeleteConfirmation(false);
      setEventToDelete(null);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to delete event");
    }
  };

  const handleSelectEvent = (event) => {
    setEditEvent({
      id: event.id,
      title: event.title,
      start: moment(event.start).format("YYYY-MM-DDTHH:mm"),
      end: moment(event.end).format("YYYY-MM-DDTHH:mm"),
    });
    setShowEditModal(true);
  };

  const handleViewChange = (view) => {
    console.log("View changed to:", view);
    setCurrentView(view);
  };

  const handleNavigate = (date, view, action) => {
    console.log("Navigated:", { date, view, action });
    setCurrentDate(date); // Update the current date based on navigation
  };

  return (
    <div className="react-big-calendar p-4 lg:p-8">
      <style>
        {`
          .react-big-calendar {
            font-family: Arial, sans-serif;
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

          .rbc-agenda-view .rbc-agenda-table td {
            vertical-align: middle;
          }

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
        `}
      </style>
      <div className="main-calendar">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-semibold">Calendar</h5>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Add Event
          </button>
        </div>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
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
            defaultView="month"
            view={currentView}
            onView={handleViewChange}
            onNavigate={handleNavigate}
            date={currentDate} // Bind the current date to the calendar
            style={{ height: "77vh", width: "100%" }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.color,
                borderRadius: "4px",
                color: "white",
                border: "none",
              },
            })}
          />
        </div>

        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Add Event</h2>
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
                    setShowAddModal(false);
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

        {/* Edit Event Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Edit Event</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={editEvent.title}
                    onChange={(e) =>
                      setEditEvent({ ...editEvent, title: e.target.value })
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
                    value={editEvent.start}
                    onChange={(e) =>
                      setEditEvent({ ...editEvent, start: e.target.value })
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
                    value={editEvent.end}
                    onChange={(e) =>
                      setEditEvent({ ...editEvent, end: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditEvent(null);
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  onClick={() => {
                    setShowEditModal(false);
                    setEventToDelete(editEvent);
                    setShowDeleteConfirmation(true);
                  }}
                BALB>
                  Delete
                </button>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  onClick={handleEditEvent}
                >
                  Update Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4">Delete Event</h2>
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
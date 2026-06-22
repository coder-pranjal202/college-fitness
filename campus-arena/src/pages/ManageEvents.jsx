import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getMyEvents, deleteEvent } from "../services/eventService";
import { Calendar, MapPin, Users, Trash2, Edit3, Plus } from "lucide-react";

export default function ManageEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function init() {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser?.uid));
      const userData = userDoc.data();

      if (!userData || (userData.role !== "organizer" && userData.role !== "admin")) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      setIsAuthorized(true);
      const myEvents = await getMyEvents(auth.currentUser.uid);
      setEvents(myEvents);
      setLoading(false);
    }

    if (auth.currentUser) init();
    else navigate("/login");
  }, [navigate]);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    setDeletingId(eventId);
    try {
      await deleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      alert("Event deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to delete event.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-red-500/30 rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">Only organizers can access this page.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-emerald-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">🏟️ My Events</h1>
            <p className="text-gray-400 mt-1">
              {events.length} event{events.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/create-event")}
              className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
            >
              <Plus size={20} /> Create Event
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="border border-gray-600 hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition"
            >
              ← Dashboard
            </button>
          </div>
        </div>

        {/* Events */}
        {events.length === 0 ? (
          <div className="bg-white/10 rounded-2xl p-12 text-center border border-white/10">
            <p className="text-6xl mb-4">📭</p>
            <p className="text-xl text-gray-300">No events created yet.</p>
            <p className="text-gray-400 mt-2 mb-6">Create your first sports event!</p>
            <button
              onClick={() => navigate("/create-event")}
              className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold transition"
            >
              + Create Event
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:scale-[1.02] transition"
              >
                {event.posterUrl && (
                  <div className="h-32 -mx-6 -mt-6 mb-4 overflow-hidden">
                    <img
                      src={event.posterUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>
                )}
                <h3 className="text-2xl font-bold text-green-400 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  Sport: {event.sport}
                </p>
                <p className="text-gray-300 line-clamp-2 mb-4">
                  {event.description || "No description."}
                </p>

                <div className="space-y-2 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{event.date}{event.time ? ` at ${event.time}` : ""}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{event.maxParticipants || "Unlimited"} participants</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                  <button
                    onClick={() => navigate(`/edit-event/${event.id}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed px-4 py-2 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm"
                  >
                    {deletingId === event.id ? "..." : <><Trash2 size={16} /> Delete</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
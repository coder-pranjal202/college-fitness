import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { getMyEvents } from "../services/eventService";
import { getEventRegistrations } from "../services/registrationService";
import { Users, Plus, ArrowLeft, UserX, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#eab308", "#a855f7", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [registrations, setRegistrations] = useState({});
  const [removingId, setRemovingId] = useState(null);

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

      // Load registrations for all events in parallel
      const regMap = {};
      await Promise.all(
        myEvents.map(async (event) => {
          const regs = await getEventRegistrations(event.id);
          regMap[event.id] = regs;
        })
      );
      setRegistrations(regMap);
      setLoading(false);
    }

    if (auth.currentUser) init();
    else navigate("/login");
  }, [navigate]);

  const toggleExpand = async (eventId) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(eventId);
    }
  };

  const handleRemoveParticipant = async (registrationId, eventId) => {
    if (!window.confirm("Remove this participant from the event?")) return;

    setRemovingId(registrationId);
    try {
      await deleteDoc(doc(db, "registrations", registrationId));
      setRegistrations((prev) => ({
        ...prev,
        [eventId]: prev[eventId].filter((r) => r.id !== registrationId),
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to remove participant.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-page flex items-center justify-center">
        <p className="theme-text-primary text-lg animate-pulse">Loading organizer dashboard...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen theme-page flex items-center justify-center px-4">
        <div className="max-w-md w-full theme-card border-red-500/30 rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-3xl font-bold theme-text-primary mb-4">Access Denied</h2>
          <p className="theme-text-secondary mb-6">Only organizers can access this page.</p>
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

  const totalRegistrations = Object.values(registrations).reduce(
    (sum, regs) => sum + regs.length,
    0
  );

  // Chart data: registrations per event
  const barChartData = events.map((event) => ({
    name: event.title?.slice(0, 12) || "Event",
    registrations: (registrations[event.id] || []).length,
    max: event.maxParticipants || 0,
  }));

  // Pie chart: registrations by sport
  const sportCounts = {};
  events.forEach((event) => {
    const sport = event.sport || "Other";
    if (!sportCounts[sport]) sportCounts[sport] = 0;
    sportCounts[sport] += (registrations[event.id] || []).length;
  });
  const pieData = Object.entries(sportCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen theme-page">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold theme-text-primary">📊 Organizer Dashboard</h1>
            <p className="theme-text-muted mt-1">
              {events.length} event{events.length !== 1 ? "s" : ""} • {totalRegistrations} total registration{totalRegistrations !== 1 ? "s" : ""}
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
              className="border border-gray-600 hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
            >
              <ArrowLeft size={20} /> Dashboard
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <div className="theme-stat-card rounded-2xl p-5">
            <p className="text-3xl font-bold text-green-400">{events.length}</p>
            <p className="theme-text-muted text-sm mt-1">My Events</p>
          </div>
          <div className="theme-stat-card rounded-2xl p-5">
            <p className="text-3xl font-bold text-blue-400">{totalRegistrations}</p>
            <p className="theme-text-muted text-sm mt-1">Total Registrations</p>
          </div>
          <div className="theme-stat-card rounded-2xl p-5">
            <p className="text-3xl font-bold text-yellow-400">
              {events.filter((e) => {
                const regs = registrations[e.id] || [];
                return e.maxParticipants ? regs.length >= e.maxParticipants : false;
              }).length}
            </p>
            <p className="theme-text-muted text-sm mt-1">Events Full</p>
          </div>
          <div className="theme-stat-card rounded-2xl p-5">
            <p className="text-3xl font-bold text-purple-400">
              {events.filter((e) => {
                const regs = registrations[e.id] || [];
                return regs.length === 0;
              }).length}
            </p>
            <p className="theme-text-muted text-sm mt-1">No Registrations</p>
          </div>
        </div>

        {/* Analytics Charts */}
        {events.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Bar Chart */}
            <div className="theme-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={20} className="text-green-400" />
                <h3 className="text-lg font-bold theme-text-primary">Registrations per Event</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="registrations" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="theme-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-blue-400" />
                <h3 className="text-lg font-bold theme-text-primary">Registrations by Sport</h3>
              </div>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "12px" }}
                      labelStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center py-10">No registration data yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Events */}
        {events.length === 0 ? (
          <div className="theme-card-inner rounded-2xl p-12 text-center">
            <p className="text-6xl mb-4">📭</p>
            <p className="text-xl theme-text-secondary">No events created yet.</p>
            <p className="theme-text-muted mt-2 mb-6">Create your first event to see registrations here.</p>
            <button
              onClick={() => navigate("/create-event")}
              className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold transition"
            >
              + Create Event
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const regs = registrations[event.id] || [];
              const isFull = event.maxParticipants && regs.length >= event.maxParticipants;
              const isExpanded = expandedEvent === event.id;

              return (
                <div
                  key={event.id}
                  className="theme-card rounded-2xl overflow-hidden shadow-xl"
                >
                  {/* Event Header */}
                  <div
                    onClick={() => toggleExpand(event.id)}
                    className="p-6 cursor-pointer hover:bg-white/5 transition flex flex-wrap justify-between items-center gap-4"
                  >
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-green-400">{event.title}</h3>
                      <p className="theme-text-muted text-sm mt-1">
                        {event.sport} • {event.date}{event.time ? ` at ${event.time}` : ""} • {event.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isFull ? "text-red-400" : "text-blue-400"}`}>
                          {regs.length}{event.maxParticipants ? `/${event.maxParticipants}` : ""}
                        </p>
                        <p className="theme-text-muted">Registered</p>
                      </div>
                      <div className="theme-text-muted">
                        <Users size={24} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Registrations */}
                  {isExpanded && (
                    <div className="theme-separator border-t p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold theme-text-primary">
                          Participants ({regs.length})
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/event/${event.id}`)}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
                          >
                            View Event
                          </button>
                          <button
                            onClick={() => navigate(`/edit-event/${event.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => navigate(`/manage-scores/${event.id}`)}
                            className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1"
                          >
                            <TrendingUp size={16} /> Scores
                          </button>
                        </div>
                      </div>

                      {regs.length === 0 ? (
                        <p className="theme-text-muted theme-card-inner rounded-xl p-4">
                          No one has registered for this event yet.
                        </p>
                      ) : (
                        <>
                          {/* Desktop Table */}
                          <div className="hidden md:block theme-card-inner rounded-xl overflow-hidden">
                            <table className="w-full">
                              <thead>
                                <tr className="theme-table-header text-left theme-text-muted text-sm">
                                  <th className="p-3 font-medium">#</th>
                                  <th className="p-3 font-medium">Name</th>
                                  <th className="p-3 font-medium hidden lg:table-cell">User ID</th>
                                  <th className="p-3 font-medium text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {regs.map((reg, index) => (
                                  <tr
                                    key={reg.id}
                                    className="theme-table-row"
                                  >
                                    <td className="p-3 theme-text-muted">{index + 1}</td>
                                    <td className="p-3 font-medium theme-text-primary">{reg.userName || "Anonymous"}</td>
                                    <td className="p-3 theme-text-muted text-sm hidden lg:table-cell">{reg.userId?.slice(0, 12)}...</td>
                                    <td className="p-3 text-right">
                                      <button
                                        onClick={() => handleRemoveParticipant(reg.id, event.id)}
                                        disabled={removingId === reg.id}
                                        className="bg-red-600/50 hover:bg-red-600 disabled:bg-red-800/50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1 ml-auto"
                                      >
                                        {removingId === reg.id ? "..." : <><UserX size={14} /> Remove</>}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Cards */}
                          <div className="md:hidden space-y-2">
                            {regs.map((reg, index) => (
                              <div key={reg.id} className="theme-card-inner rounded-xl p-3 flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm theme-text-primary truncate">{reg.userName || "Anonymous"}</p>
                                  <p className="text-xs theme-text-muted truncate">#{index + 1}</p>
                                </div>
                                <button
                                  onClick={() => handleRemoveParticipant(reg.id, event.id)}
                                  disabled={removingId === reg.id}
                                  className="bg-red-600/50 hover:bg-red-600 disabled:bg-red-800/50 px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 flex-shrink-0"
                                >
                                  {removingId === reg.id ? "..." : <><UserX size={12} /> Remove</>}
                                </button>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="theme-card-inner rounded-xl p-3 text-center">
                          <p className="text-xl font-bold text-blue-400">{regs.length}</p>
                          <p className="theme-text-muted text-xs">Registered</p>
                        </div>
                        <div className="theme-card-inner rounded-xl p-3 text-center">
                          <p className="text-xl font-bold text-green-400">
                            {event.maxParticipants ? event.maxParticipants - regs.length : "∞"}
                          </p>
                          <p className="theme-text-muted text-xs">Spots Left</p>
                        </div>
                        <div className="theme-card-inner rounded-xl p-3 text-center">
                          <p className="text-xl font-bold text-yellow-400">
                            {event.maxParticipants
                              ? Math.round((regs.length / event.maxParticipants) * 100)
                              : 0}%
                          </p>
                          <p className="theme-text-muted text-xs">Filled</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState, useMemo } from "react";
import { auth } from "../services/firebase";
import { getUserData } from "../services/getUser";
import { logoutUser } from "../services/authService";
import { getEvents } from "../services/eventService";
import { getMyRegistrations } from "../services/registrationService";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import EventCard from "../components/EventCard";
import EventSearch from "../components/EventSearch";
import EventCalendar from "../components/EventCalendar";
import SportTag from "../components/SportTag";
import { CardSkeleton } from "../components/Skeleton";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      try {
        const userData = await getUserData(auth.currentUser.uid);
        setUser(userData);

        const eventData = await getEvents();
        setEvents(eventData);

        const registrations = await getMyRegistrations(auth.currentUser.uid);
        setMyRegistrations(registrations);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique sports for filter dropdown
  const sports = useMemo(() => {
    const sportSet = new Set(events.map((e) => e.sport).filter(Boolean));
    return [...sportSet].sort();
  }, [events]);

  // Filtered events based on search + filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          event.title?.toLowerCase().includes(term) ||
          event.sport?.toLowerCase().includes(term) ||
          event.location?.toLowerCase().includes(term) ||
          event.description?.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }
      if (sportFilter && event.sport !== sportFilter) return false;
      if (dateFilter && event.date !== dateFilter) return false;
      return true;
    });
  }, [events, searchTerm, sportFilter, dateFilter]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen theme-page">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="theme-card rounded-3xl p-6 sm:p-8 mb-10">
              <div className="h-8 bg-white/10 rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-white/10 rounded w-1/3 mt-3 animate-pulse" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen theme-page">
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* Welcome Card */}
          <div className="theme-card rounded-3xl p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold theme-text-primary">
              Welcome Back,
              <span className="text-green-400">
                {" "}
                {user?.name || "Student"}
              </span>{" "}
              👋
            </h1>

            <p className="mt-3 text-lg theme-text-secondary">
              Department: {user?.department || "Not Available"}
            </p>

            {user?.module && (
              <p className="theme-text-muted mt-1">
                {user.module} • {user.semester || "N/A"} Semester
              </p>
            )}

            <p className="theme-text-muted mt-2">
              Stay active, participate in events and make your campus proud.
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <div className="theme-stat-card rounded-2xl p-6 shadow-lg hover:scale-105 transition">
              <h2 className="text-4xl font-bold text-green-400">
                {events.length}
              </h2>
              <p className="theme-text-secondary mt-2">
                Total Events
              </p>
            </div>

            <div className="theme-stat-card rounded-2xl p-6 shadow-lg hover:scale-105 transition">
              <h2 className="text-4xl font-bold text-green-400">
                {myRegistrations.length}
              </h2>
              <p className="theme-text-secondary mt-2">
                Registered Events
              </p>
            </div>

            <div className="theme-stat-card rounded-2xl p-6 shadow-lg hover:scale-105 transition">
              <h2 className="text-4xl font-bold text-green-400">
                {sports.length}
              </h2>
              <p className="theme-text-secondary mt-2">
                Sports Categories
              </p>
            </div>
          </div>

          {/* Calendar + Events Section */}
          <div className="mt-10">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Calendar (sidebar on large screens) */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <EventCalendar events={events} />
              </div>

              {/* Events (main content) */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold theme-text-primary">
                    🏆 Upcoming Sports Events
                  </h2>
                  {events.length > 0 && filteredEvents.length !== events.length && (
                    <span className="text-sm theme-text-muted">
                      {filteredEvents.length} of {events.length} events
                    </span>
                  )}
                </div>

                {/* Search & Filters */}
                <div className="mb-8">
                  <EventSearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    sportFilter={sportFilter}
                    setSportFilter={setSportFilter}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    sports={sports}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                  />

                  {/* Sport tag quick filters */}
                  {!showFilters && sports.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={() => setSportFilter("")}
                        className={`text-xs px-2 py-1 rounded-full font-semibold transition border ${
                          !sportFilter
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-white/10 text-gray-400 border-white/10 hover:bg-white/20"
                        }`}
                      >
                        All
                      </button>
                      {sports.slice(0, 8).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSportFilter(sportFilter === s ? "" : s)}
                        >
                          <SportTag sport={s} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {filteredEvents.length === 0 ? (
                  <div className="theme-card-inner rounded-xl p-8 text-center">
                    {events.length > 0 ? (
                      <>
                        <p className="text-4xl mb-4">🔍</p>
                        <p className="text-xl theme-text-secondary">No events match your search.</p>
                        <p className="theme-text-muted mt-2">Try adjusting your filters.</p>
                      </>
                    ) : (
                      <>
                        <p className="text-4xl mb-4">📭</p>
                        <p className="text-xl theme-text-secondary">No events available.</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-8">
                    {filteredEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Registered Events */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold theme-text-primary mb-6">
              📌 My Registered Events
            </h2>

            {myRegistrations.length === 0 ? (
              <div className="theme-card-inner rounded-xl p-8 text-center">
                <p className="theme-text-secondary">You haven't registered for any events yet.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {myRegistrations.map((registration) => {
                  const event = events.find(
                    (e) => e.id === registration.eventId
                  );

                  if (!event) return null;

                  return (
                    <div
                      key={registration.id}
                      className="theme-card border border-green-500/30 rounded-2xl p-6 shadow-lg hover:scale-105 transition"
                    >
                      <h3 className="text-2xl font-bold text-green-400">
                        {event.title}
                      </h3>

                      <p className="mt-3 theme-text-secondary">
                        📅 {event.date}
                      </p>

                      <p className="theme-text-secondary">
                        📍 {event.location}
                      </p>

                      <span className="inline-block mt-4 bg-green-500 text-white px-4 py-2 rounded-full">
                        ✅ Registered
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mt-12">
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin/requests")}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
              >
                📋 Organizer Requests
              </button>
            )}

            <button
              onClick={() => navigate(user?.role === "organizer" ? "/organizer-dashboard" : "/request-organizer")}
              className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold transition"
            >
              {user?.role === "organizer" ? "📊 Organizer Dashboard" : "Become Organizer"}
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-xl font-semibold transition"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
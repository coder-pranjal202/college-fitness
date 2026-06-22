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
import { Calendar, Trophy, Users, Target, ArrowRight, Zap, Award } from "lucide-react";

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Welcome Card */}
          <div className="relative overflow-hidden theme-card rounded-3xl p-6 sm:p-8 lg:p-10">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold text-emerald-500 mb-2">
                    👋 Welcome back
                  </p>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black theme-text-primary">
                    {user?.name || "Student"}
                  </h1>
                  <p className="theme-text-secondary mt-2 text-lg">
                    {user?.department || "Department not set"}
                  </p>
                  {user?.module && (
                    <p className="theme-text-muted mt-1">
                      {user.module} • {user.semester || "N/A"} Semester
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(user?.role === "organizer" ? "/organizer-dashboard" : "/request-organizer")}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    {user?.role === "organizer" ? "Organizer Dashboard" : "Become Organizer"}
                  </button>
                  
                  {user?.role === "admin" && (
                    <button
                      onClick={() => navigate("/admin/requests")}
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/25 flex items-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      Organizer Requests
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
            <div className="theme-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-emerald-500">{events.length}</p>
                  <p className="theme-text-secondary text-sm mt-1">Total Events</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </div>

            <div className="theme-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-blue-500">{myRegistrations.length}</p>
                  <p className="theme-text-secondary text-sm mt-1">Registered</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="theme-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-purple-500">{sports.length}</p>
                  <p className="theme-text-secondary text-sm mt-1">Sports</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="theme-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-orange-500">
                    {events.filter(e => e.date === new Date().toISOString().split('T')[0]).length}
                  </p>
                  <p className="theme-text-secondary text-sm mt-1">Today</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Events + Calendar */}
          <div className="mt-10">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Events (main content) */}
              <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black theme-text-primary">
                      🏆 Upcoming Events
                    </h2>
                    <p className="theme-text-muted text-sm mt-1">
                      Discover and join exciting sports events
                    </p>
                  </div>
                  {events.length > 0 && filteredEvents.length !== events.length && (
                    <span className="theme-text-muted text-sm bg-white/10 px-3 py-1 rounded-full">
                      {filteredEvents.length} of {events.length}
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
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={() => setSportFilter("")}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                          !sportFilter
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                            : "theme-card theme-text-muted hover:theme-text-primary hover:bg-emerald-500/10"
                        }`}
                      >
                        All Sports
                      </button>
                      {sports.slice(0, 6).map((s) => (
                        <button key={s} onClick={() => setSportFilter(sportFilter === s ? "" : s)}>
                          <SportTag sport={s} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Events Grid */}
                {filteredEvents.length === 0 ? (
                  <div className="theme-card-inner rounded-2xl p-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold theme-text-primary mb-2">
                      {events.length > 0 ? "No events match your search" : "No events available"}
                    </h3>
                    <p className="theme-text-muted">
                      {events.length > 0 
                        ? "Try adjusting your filters or search terms." 
                        : "Check back later for upcoming events."}
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </div>

              {/* Calendar (sidebar) */}
              <div className="lg:col-span-1">
                <EventCalendar events={events} />
              </div>
            </div>
          </div>

          {/* Registered Events Section */}
          {myRegistrations.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black theme-text-primary">
                    📌 My Registrations
                  </h2>
                  <p className="theme-text-muted text-sm mt-1">
                    Events you've signed up for
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {myRegistrations.map((registration) => {
                  const event = events.find((e) => e.id === registration.eventId);
                  if (!event) return null;

                  return (
                    <div
                      key={registration.id}
                      className="theme-card rounded-2xl p-5 border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold theme-text-primary">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap gap-3 mt-2 theme-text-secondary text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {event.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-semibold">
                          ✓ Registered
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="flex justify-center mt-12">
            <button
              onClick={handleLogout}
              className="theme-card px-6 py-3 rounded-xl font-semibold theme-text-secondary hover:text-red-500 hover:border-red-500/30 transition-all duration-300 flex items-center gap-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}